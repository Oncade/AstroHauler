import Phaser from 'phaser';
import Player from '../objects/Player';
import Salvage from '../objects/Salvage';
import ParentShip from '../objects/ParentShip';
import Tether from '../objects/Tether';
import { EventBus } from '../EventBus';
import {
    GameConfig,
    ControlKeys,
    SalvageConfig,
    getRandomSalvageMass,
    getRandomSalvageTexture,
    ParentShipConfig,
    BackgroundConfig,
    TetherConfig,
    TouchControlsConfig,
    DeviceDetection,
    PlayerConfig
} from '../config/GameConfig';

export default class GameScene extends Phaser.Scene {
    private player!: Player;
    private parentShip!: ParentShip;
    private salvageGroup!: Phaser.Physics.Arcade.Group;
    private activeTether: Tether | null = null;
    private depositZone!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;

    private scoreText!: Phaser.GameObjects.Text;
    private score: number = 0;

    private keys: { [key: string]: Phaser.Input.Keyboard.Key } = {};
    
    // Touch controls
    private joystick!: { outer: Phaser.GameObjects.Image; inner: Phaser.GameObjects.Image; };
    private tetherButton!: Phaser.GameObjects.Image;
    private isTouching: boolean = false;
    private touchThrust: boolean = false;
    private targetRotation: number = 0; // Target rotation angle for the ship
    private isTouchDevice: boolean = false;
    private joystickAngle: number = 0;
    private joystickDistance: number = 0;
    private touchDirectionIndicator!: Phaser.GameObjects.Graphics;

    constructor() {
        super('GameScene');
    }

    create() {
        console.log('GameScene create');
        const { width, height } = this.scale;

        // Check if this is a touch device
        this.isTouchDevice = DeviceDetection.isTouchDevice();
        console.log(`Touch device detected: ${this.isTouchDevice}`);

        // Reset score on scene start
        this.score = 0;

        // Set world bounds (adjust size if needed)
        const worldWidth = width * 1.5;
        const worldHeight = height * 1.5;
        this.physics.world.setBounds(0, 0, worldWidth, worldHeight); // Larger world

        // Add Background FIRST
        this.add.tileSprite(0, 0, worldWidth, worldHeight, BackgroundConfig.textureKey)
            .setOrigin(0, 0)
            .setScrollFactor(0); // Keep fixed relative to camera

        // Create Player
        this.player = new Player(this, width * 0.5, height * 0.5); // Start near center

        // Create Parent Ship
        this.parentShip = new ParentShip(this, ParentShipConfig.spawnX, ParentShipConfig.spawnY);

        // Create a separate physics body for the deposit zone
        this.createDepositZoneCollider();

        // Create Salvage Group
        this.salvageGroup = this.physics.add.group({
            classType: Salvage,
            runChildUpdate: false // Salvage update logic is mainly driven by tether/physics
        });

        // Spawn initial salvage items
        for (let i = 0; i < SalvageConfig.spawnCount; i++) {
            const x = Phaser.Math.Between(50, worldWidth - 50);
            const y = Phaser.Math.Between(50, worldHeight - 50);
            const mass = getRandomSalvageMass();
            const textureKey = getRandomSalvageTexture();
            const salvageItem = new Salvage(this, x, y, mass, textureKey);
            this.salvageGroup.add(salvageItem, true);
        }

        // Setup Input Controls - Ensure keyboard plugin is ready
        if (this.input.keyboard) {
            this.keys = this.input.keyboard.addKeys({
                thrust: ControlKeys.thrust,
                left: ControlKeys.rotateLeft,
                right: ControlKeys.rotateRight,
                tether: ControlKeys.tether
            }) as { [key: string]: Phaser.Input.Keyboard.Key };
        } else {
            console.error("Keyboard plugin not available!");
            // this.keys remains {} which is safe
        }

        // Setup Touch Controls if on a touch device
        if (this.isTouchDevice) {
            this.createTouchControls();
        }

        // Setup Collisions
        this.physics.add.collider(this.player, this.salvageGroup); // Player bounces off salvage
        this.physics.add.collider(this.salvageGroup, this.salvageGroup); // Salvage bounces off each other
        this.physics.add.collider(this.salvageGroup, this.parentShip); // Salvage bounces off parent ship (static)
        // Note: Player does *not* collide with Parent Ship by default, can add if needed
        // this.physics.add.collider(this.player, this.parentShip);
        
        // Overlap for Salvage Deposit - now using the deposit zone physics body
        this.physics.add.overlap(
            this.depositZone,
            this.salvageGroup,
            this.handleSalvageDeposit,
            this.checkDepositEligibility, // Process callback to check if tethered - now checks only overlap
            this
        );

        // UI Elements
        this.scoreText = this.add.text(16, 16, 'Score: 0', {
            fontSize: '32px',
            color: '#fff',
            // fixedWidth: 300 // Optional for alignment
        }).setScrollFactor(0); // Keep UI fixed on screen

        // Update Phaser score text after reset
        this.scoreText.setText('Score: ' + this.score);

        const exitButton = this.add.text(width - 200, 100, '[ Exit ]', {
            fontSize: '24px',
            color: '#ff0000',
            backgroundColor: '#555555',
            padding: { left: 10, right: 10, top: 5, bottom: 5 }
        })
        .setOrigin(1, 0)
        .setInteractive()
        .setScrollFactor(0); // Keep UI fixed

        exitButton.on('pointerdown', () => {
            this.scene.start('MainMenuScene');
        });
        exitButton.on('pointerover', () => exitButton.setStyle({ backgroundColor: '#ff0000', color: '#000' }));
        exitButton.on('pointerout', () => exitButton.setStyle({ backgroundColor: '#555555', color: '#ff0000' }));

        // Camera setup
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

        // Emit the ready event for React bridge
        EventBus.emit('current-scene-ready', this);

        // Update all salvage objects to check for deposit zone overlap
        this.events.on('update', () => {
            // Check untethered salvage for direct deposit
            this.salvageGroup.getChildren().forEach(child => {
                const salvage = child as Salvage;
                if (salvage.active) {
                    this.checkForDirectDeposit(salvage);
                }
            });
            
            // If we have an active tether, also check its salvage
            if (this.activeTether) {
                const tetheredSalvage = this.activeTether.getAttachedSalvage();
                if (tetheredSalvage.active) {
                    this.checkForDirectDeposit(tetheredSalvage);
                }
            }
        });
    }

    createTouchControls() {
        const { width, height } = this.scale;
        
        // Calculate positions based on config, handling negative values as offsets from edges
        const joystickX = TouchControlsConfig.joystickPosition.x >= 0 
            ? TouchControlsConfig.joystickPosition.x 
            : width + TouchControlsConfig.joystickPosition.x;
            
        const joystickY = TouchControlsConfig.joystickPosition.y >= 0 
            ? TouchControlsConfig.joystickPosition.y 
            : height + TouchControlsConfig.joystickPosition.y;
            
        const buttonX = TouchControlsConfig.tetherButtonPosition.x >= 0 
            ? TouchControlsConfig.tetherButtonPosition.x 
            : width + TouchControlsConfig.tetherButtonPosition.x;
            
        const buttonY = TouchControlsConfig.tetherButtonPosition.y >= 0 
            ? TouchControlsConfig.tetherButtonPosition.y 
            : height + TouchControlsConfig.tetherButtonPosition.y;
        
        // Create virtual joystick with configured sizes
        this.joystick = {
            outer: this.add.image(joystickX, joystickY, 'joystick-outer')
                .setScrollFactor(0)
                .setAlpha(TouchControlsConfig.opacity)
                .setDepth(1000)
                .setScale(TouchControlsConfig.joystickSize / 100),  // Scale based on config size
            inner: this.add.image(joystickX, joystickY, 'joystick-inner')
                .setScrollFactor(0)
                .setAlpha(TouchControlsConfig.opacity + 0.1)  // Slightly more visible
                .setDepth(1001)
                .setScale(TouchControlsConfig.joystickSize * 0.6 / 100)  // Smaller inner stick
        };
        
        // Create direction indicator for visualizing thrust direction
        this.touchDirectionIndicator = this.add.graphics()
            .setScrollFactor(0)
            .setDepth(999);
        
        // Create tether button with configured size
        this.tetherButton = this.add.image(buttonX, buttonY, 'tether-button')
            .setScrollFactor(0)
            .setAlpha(TouchControlsConfig.opacity)
            .setDepth(1000)
            .setScale(TouchControlsConfig.buttonSize / 100)
            .setInteractive() // Revert to simple interaction without custom hit area
            .setTint(TouchControlsConfig.colors.normal);
            
        // Tether button events
        this.tetherButton.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            // Don't stop propagation as it might be interfering with touch events
            
            if (this.activeTether) {
                // If already tethered, release the tether
                this.activeTether.destroy();
                this.activeTether = null;
                console.log('Scene: Tether released by touch.');
                this.tetherButton.setTint(TouchControlsConfig.colors.normal);
            } else {
                // If not tethered, try to attach to nearest salvage
                this.attemptTetherAttach();
                if (this.activeTether) {
                    this.tetherButton.setTint(TouchControlsConfig.colors.active);
                }
            }
        });
        
        // Track the joystick pointer ID to handle multiple simultaneous touches
        let joystickPointerId: number | null = null;
        
        // Setup joystick input - handle multiple simultaneous touches
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            // Only process if it's near the joystick area and we're not already tracking a joystick pointer
            const distToJoystick = Phaser.Math.Distance.Between(
                pointer.x, pointer.y, 
                this.joystick.outer.x, this.joystick.outer.y
            );
            
            if (distToJoystick < TouchControlsConfig.joystickHitArea && joystickPointerId === null) {
                // Start tracking this pointer for joystick movement
                joystickPointerId = pointer.id;
                this.isTouching = true;
                this.updateJoystick(pointer);
            }
        });
        
        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            // Only update if this is the pointer we're tracking for the joystick
            if (this.isTouching && pointer.isDown && pointer.id === joystickPointerId) {
                this.updateJoystick(pointer);
            }
        });
        
        // Handle both pointer up and pointer cancel events
        const handlePointerRelease = (pointer: Phaser.Input.Pointer) => {
            // Only reset if this is the pointer we're tracking for the joystick
            if (pointer.id === joystickPointerId) {
                this.resetJoystick();
                this.isTouching = false;
                this.touchThrust = false;
                joystickPointerId = null;
                // Clear the direction indicator
                this.touchDirectionIndicator.clear();
            }
        };
        
        this.input.on('pointerup', handlePointerRelease);
        this.input.on('pointercancel', handlePointerRelease);
    }
    
    updateJoystick(pointer: Phaser.Input.Pointer) {
        const joystickCenterX = this.joystick.outer.x;
        const joystickCenterY = this.joystick.outer.y;
        
        // Calculate distance from center
        const dx = pointer.x - joystickCenterX;
        const dy = pointer.y - joystickCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = TouchControlsConfig.joystickSize * 0.5; // Maximum joystick movement
        
        if (distance > TouchControlsConfig.joystickDeadZone) { // Use configured dead zone
            // Calculate angle
            const angle = Math.atan2(dy, dx);
            
            // Normalize position to max distance
            const limitedDistance = Math.min(distance, maxDistance);
            const normalizedX = Math.cos(angle) * limitedDistance;
            const normalizedY = Math.sin(angle) * limitedDistance;
            
            // Update inner joystick position
            this.joystick.inner.x = joystickCenterX + normalizedX;
            this.joystick.inner.y = joystickCenterY + normalizedY;
            
            // Store the joystick angle and distance for thrust calculations
            this.joystickAngle = angle;
            this.joystickDistance = limitedDistance / maxDistance; // Normalized 0-1
            
            // Set the target rotation for the ship (convert to match ship's coordinate system)
            // Phaser uses a different angle system than standard math:
            // 0 is to the right, PI/2 is down, PI is left, 3*PI/2 is up
            // The ship sprite faces up at rotation 0, so we adjust by PI/2
            this.targetRotation = angle + Math.PI/2;
            
            // Draw direction indicator
            this.updateDirectionIndicator();
            
            // Always enable thrust when joystick is active
            this.touchThrust = true;
        } else {
            // Center position - no input
            this.resetJoystick();
        }
    }
    
    updateDirectionIndicator() {
        // Clear previous drawing
        this.touchDirectionIndicator.clear();
        
        // Don't draw if not actively using joystick
        if (!this.isTouching || !this.touchThrust) return;
        
        // Calculate direction line endpoints
        const startX = this.joystick.outer.x;
        const startY = this.joystick.outer.y;
        const length = TouchControlsConfig.joystickSize * 0.8; // Line length
        const endX = startX + Math.cos(this.joystickAngle) * length;
        const endY = startY + Math.sin(this.joystickAngle) * length;
        
        // Draw arrow to show thrust direction using config settings
        this.touchDirectionIndicator.lineStyle(
            TouchControlsConfig.directionIndicator.lineWidth, 
            TouchControlsConfig.directionIndicator.color, 
            TouchControlsConfig.directionIndicator.alpha
        );
        this.touchDirectionIndicator.beginPath();
        this.touchDirectionIndicator.moveTo(startX, startY);
        this.touchDirectionIndicator.lineTo(endX, endY);
        
        // Draw arrowhead
        const arrowLength = TouchControlsConfig.directionIndicator.arrowSize;
        const arrowAngle = Math.PI / 6; // 30 degrees
        
        const arrowLeftX = endX - arrowLength * Math.cos(this.joystickAngle + arrowAngle);
        const arrowLeftY = endY - arrowLength * Math.sin(this.joystickAngle + arrowAngle);
        
        const arrowRightX = endX - arrowLength * Math.cos(this.joystickAngle - arrowAngle);
        const arrowRightY = endY - arrowLength * Math.sin(this.joystickAngle - arrowAngle);
        
        this.touchDirectionIndicator.moveTo(endX, endY);
        this.touchDirectionIndicator.lineTo(arrowLeftX, arrowLeftY);
        this.touchDirectionIndicator.moveTo(endX, endY);
        this.touchDirectionIndicator.lineTo(arrowRightX, arrowRightY);
        
        this.touchDirectionIndicator.strokePath();
    }
    
    resetJoystick() {
        if (this.joystick) {
            this.joystick.inner.x = this.joystick.outer.x;
            this.joystick.inner.y = this.joystick.outer.y;
        }
        this.touchThrust = false;
        this.joystickAngle = 0;
        this.joystickDistance = 0;
        
        // Clear the direction indicator
        if (this.touchDirectionIndicator) {
            this.touchDirectionIndicator.clear();
        }
    }

    update(time: number, delta: number) {
        // --- Handle Input ---
        // Handle rotation differently for keyboard vs. touch
        if (this.isTouchDevice && this.isTouching && this.touchThrust) {
            // Touch controls - rotate ship to face the direction of joystick movement
            this.rotateShipTowards(this.targetRotation, delta);
        } else {
            // Keyboard Controls for rotation
            if (this.keys.left?.isDown) {
                this.player.moveLeft();
            } else if (this.keys.right?.isDown) {
                this.player.moveRight();
            } else {
                this.player.stopRotation();
            }
        }

        // Handle thrust input differently for keyboard vs. touch
        if (this.keys.thrust?.isDown) {
            // Keyboard thrust - always in the direction the ship is facing
            this.player.thrust();
        } else if (this.touchThrust && this.isTouching) {
            // Touch thrust - apply in the direction of the joystick angle
            // Since the ship will rotate to match this direction, we can just use thrust()
            // Use the intensity of the joystick movement to modulate thrust force
            this.player.thrustWithForce(this.joystickDistance * PlayerConfig.thrustForce);
        }

        // --- Handle Tether Key Press ---
        if (Phaser.Input.Keyboard.JustDown(this.keys.tether)) {
            if (this.activeTether) {
                // If already tethered, release the tether
                this.activeTether.destroy();
                this.activeTether = null;
                console.log('Scene: Tether released by key press.');
                // Update tether button visual if it exists
                if (this.tetherButton) {
                    this.tetherButton.setTint(TouchControlsConfig.colors.normal);
                }
            } else {
                // If not tethered, try to attach to nearest salvage
                this.attemptTetherAttach();
                // Update tether button visual if tether attached
                if (this.activeTether && this.tetherButton) {
                    this.tetherButton.setTint(TouchControlsConfig.colors.active);
                }
            }
        }

        // --- Update Tether --- (Only if active)
        if (this.activeTether) {
            // Reset acceleration before applying tether forces each frame
            if (this.player.body instanceof Phaser.Physics.Arcade.Body) {
                this.player.body.setAcceleration(0, 0);
            }
            const tetheredSalvage = this.activeTether.getAttachedSalvage();
            if (tetheredSalvage.body instanceof Phaser.Physics.Arcade.Body) {
                tetheredSalvage.body.setAcceleration(0, 0);
            }

            this.activeTether.update(delta);
        }

        // --- Game Over Condition ---
        if (this.score >= 100) { // Simple game over condition: score reaches 100
            console.log('Game Over condition met. Starting GameOverScene.');
            if (this.activeTether) { // Clean up tether before changing scene
                this.activeTether.destroy();
                this.activeTether = null;
            }
            this.scene.start('GameOverScene', { score: this.score });
        }
    }
    
    // Helper method to smoothly rotate the ship towards a target angle
    rotateShipTowards(targetAngle: number, delta: number) {
        if (!this.player) return;
        
        // Normalize both angles to 0-2π for comparison
        const currentAngle = Phaser.Math.Wrap(this.player.rotation, 0, Math.PI * 2);
        targetAngle = Phaser.Math.Wrap(targetAngle, 0, Math.PI * 2);
        
        // Find the shortest rotation direction (clockwise or counterclockwise)
        let angleDiff = targetAngle - currentAngle;
        
        // Adjust for shortest path (handle wrap-around)
        if (angleDiff > Math.PI) {
            angleDiff -= Math.PI * 2;
        } else if (angleDiff < -Math.PI) {
            angleDiff += Math.PI * 2;
        }
        
        // Calculate rotation speed based on joystick distance
        // Further from center = faster rotation
        const rotationSpeed = PlayerConfig.angularVelocity * this.joystickDistance;
        
        // Convert delta to seconds for consistent motion
        const dt = delta / 1000;
        
        // Calculate maximum angle change this frame
        const maxRotation = rotationSpeed * dt;
        
        // Apply rotation based on the direction and limited by max speed
        if (Math.abs(angleDiff) < maxRotation) {
            // We can reach the target this frame
            this.player.setRotation(targetAngle);
            this.player.setAngularVelocity(0);
        } else if (angleDiff > 0) {
            // Rotate clockwise
            this.player.setAngularVelocity(rotationSpeed);
        } else {
            // Rotate counterclockwise
            this.player.setAngularVelocity(-rotationSpeed);
        }
    }

    // --- Tether Attachment Logic ---
    attemptTetherAttach() {
        // Filter active, untethered salvage items that have Arcade bodies
        const eligibleSalvage = this.salvageGroup.getChildren().filter(obj => {
            const salvage = obj as Salvage; // Cast needed for accessing properties
            return salvage.active &&
                   !salvage.isTethered &&
                   salvage.body instanceof Phaser.Physics.Arcade.Body; // Ensure body exists
        });

        if (eligibleSalvage.length === 0) {
            console.log('Scene: No eligible salvage (active, untethered, with body) found.');
            return;
        }

        // Use physics.closest to find the nearest eligible salvage game object
        // Note: physics.closest requires Game Objects or Sprites, not just bodies
        const closestGameObject = this.physics.closest(this.player, eligibleSalvage);

        if (!closestGameObject) {
             console.log('Scene: physics.closest returned null.');
             return; // Should not happen if eligibleSalvage is not empty, but good practice
        }

        // Cast the result back to Salvage
        const closestSalvage = closestGameObject as Salvage;

        // Check distance
        const distanceSq = Phaser.Math.Distance.Squared(this.player.x, this.player.y, closestSalvage.x, closestSalvage.y);
        const maxDistanceSq = TetherConfig.maxAttachDistance * TetherConfig.maxAttachDistance;

        if (distanceSq <= maxDistanceSq) {
            // Ensure bodies exist and reset acceleration before tethering
            // Player body check
            if (this.player.body instanceof Phaser.Physics.Arcade.Body) {
                this.player.body.setAcceleration(0, 0);
            } else {
                 console.warn('Scene: Player body missing during tether attempt.');
                 return; // Cannot tether without player body
            }

            // Salvage body check (already checked in filter, but double-check for safety)
            if (closestSalvage.body instanceof Phaser.Physics.Arcade.Body) {
                closestSalvage.body.setAcceleration(0, 0);
                this.activeTether = new Tether(this, this.player, closestSalvage);
                console.log('Scene: Tether initiated by key press to nearest salvage.');
            } else {
                // This case should ideally not be reached due to the filter
                console.warn('Scene: Closest salvage is missing Arcade Body despite filter.');
            }
        } else {
            console.log('Scene: Nearest eligible salvage is out of range.');
            // Optional: Play a failure sound/effect
        }
    }

    // Create a physics collider for the deposit zone
    createDepositZoneCollider() {
        // Get the deposit zone position from the parent ship
        const depositZonePos = this.parentShip.getDepositZonePosition();
        const radius = ParentShipConfig.depositZoneRadius || 120;

        // Create an invisible sprite to act as the deposit zone collider
        this.depositZone = this.physics.add.sprite(
            depositZonePos.x, 
            depositZonePos.y, 
            'deposit-zone-collider'
        );
        
        // If the texture doesn't exist, create a simple circular texture
        if (!this.textures.exists('deposit-zone-collider')) {
            const graphics = this.add.graphics();
            graphics.fillStyle(0xffffff, 0.3);  // Semi-transparent fill
            graphics.fillCircle(radius, radius, radius);
            graphics.lineStyle(4, 0xffff00, 0.8);
            graphics.strokeCircle(radius, radius, radius);
            graphics.generateTexture('deposit-zone-collider', radius * 2, radius * 2);
            graphics.destroy();
        }
        
        // Set up the physics body
        this.depositZone.setCircle(radius)           // Make the hitbox circular
                        .setVisible(true)           // Make it visible for debugging
                        .setImmovable(true)          // Don't move when collided with
                        .setAlpha(0.3);              // Semi-transparent
                        
        // Make it a sensor so it doesn't physically block objects
        if (this.depositZone.body) {
            this.depositZone.body.setAllowGravity(false);
            // Instead of using isSensor (which has TypeScript issues), 
            // disable all collisions but keep overlap detection
            (this.depositZone.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(false);
            // Disable all individual collision directions
            const body = this.depositZone.body as Phaser.Physics.Arcade.Body;
            body.checkCollision.up = false;
            body.checkCollision.down = false;
            body.checkCollision.left = false;
            body.checkCollision.right = false;
        }
        
        // Add debug text to monitor overlap
        const debugText = this.add.text(10, 120, 'Deposit Zone Ready', {
            fontSize: '18px',
            color: '#ffff00'
        }).setScrollFactor(0);
        
        // Update debug text every frame
        this.events.on('update', () => {
            let activeOverlaps = 0;
            let tetheredOverlaps = 0;
            
            this.salvageGroup.getChildren().forEach(child => {
                const salvage = child as Salvage;
                if (Phaser.Geom.Intersects.RectangleToRectangle(
                    this.depositZone.getBounds(),
                    salvage.getBounds()
                )) {
                    activeOverlaps++;
                    if (salvage.isTethered && salvage.tetheredBy === this.player) {
                        tetheredOverlaps++;
                    }
                }
            });
            
            debugText.setText(`Deposit Zone: ${activeOverlaps} overlaps, ${tetheredOverlaps} eligible`);
        });
    }

    // Process callback for deposit overlap
    checkDepositEligibility(depositZone: any, salvage: any): boolean {
        // We know the first parameter is the deposit zone, and second is salvage
        if (!(salvage instanceof Salvage) || !salvage.body) {
            console.log('Deposit check: invalid salvage object');
            return false;
        }
        
        // Basic overlap check - add extra validation using manual bounds check
        const boundsOverlap = Phaser.Geom.Intersects.RectangleToRectangle(
            depositZone.getBounds(),
            salvage.getBounds()
        );
        
        if (!boundsOverlap) {
            // If bounds don't overlap, return false immediately
            return false;
        }
        
        // Log the state for debugging
        console.log(`Deposit check: Salvage overlapping deposit zone - ${salvage.isTethered ? 'IS' : 'NOT'} tethered`);
        
        // Show visual feedback that salvage can be deposited - for all salvage
        this.parentShip.showDepositReady();
        return true;
    }

    handleSalvageDeposit(depositZone: any, salvage: any) {
        // We know the first parameter is the deposit zone, and second is salvage
        if (!(salvage instanceof Salvage) || !salvage.body) {
            console.log('Deposit attempt: invalid salvage object');
            return;
        }

        console.log(`Scene: Attempting deposit for salvage value ${salvage.value}`);
        
        // Show deposit success effect
        this.parentShip.showDepositSuccess();

        // Handle scoring
        this.score += salvage.value;
        this.scoreText.setText('Score: ' + this.score);
        EventBus.emit('score-updated', this.score);
        console.log(`Scene: Deposit successful! Score: ${this.score}`);

        // Release tether if active and attached to this salvage
        if (this.activeTether && this.activeTether.getAttachedSalvage() === salvage) {
            this.activeTether.destroy();
            this.activeTether = null;
            // Reset tether button visuals
            if (this.tetherButton) {
                this.tetherButton.setTint(TouchControlsConfig.colors.normal);
            }
        }
        
        // Destroy the salvage
        salvage.destroy();
    }

    // Manual overlap check for deposit - this ensures deposits work reliably
    checkForDirectDeposit(salvage: Salvage) {
        // Only process if salvage is valid
        if (!salvage || !salvage.body) {
            return;
        }
        
        // Check if salvage is overlapping with the deposit zone using manual bounds check
        const salvageBounds = salvage.getBounds();
        const depositZoneBounds = this.depositZone.getBounds();
        
        const boundsOverlap = Phaser.Geom.Intersects.RectangleToRectangle(
            depositZoneBounds,
            salvageBounds
        );
        
        if (boundsOverlap) {
            console.log('DIRECT OVERLAP DETECTED - Triggering deposit process...');
            
            // Show visual feedback
            this.parentShip.showDepositReady();
            
            // If overlapping, trigger the deposit function directly
            // Use a small delay to ensure visual feedback is shown before deposit completes
            this.time.delayedCall(100, () => {
                if (salvage.active) {
                    this.handleDirectDeposit(salvage);
                }
            });
        }
    }
    
    // Separate handler for direct deposit processing
    handleDirectDeposit(salvage: Salvage) {
        console.log(`Direct deposit processing for salvage value ${salvage.value}`);
        
        // Show deposit success effect
        this.parentShip.showDepositSuccess();
        
        // Award score
        this.score += salvage.value;
        this.scoreText.setText('Score: ' + this.score);
        EventBus.emit('score-updated', this.score);
        console.log(`Scene: Deposit successful! Score: ${this.score}`);
        
        // Release tether if active and attached to this salvage
        if (this.activeTether && this.activeTether.getAttachedSalvage() === salvage) {
            this.activeTether.destroy();
            this.activeTether = null;
            // Reset tether button visuals
            if (this.tetherButton) {
                this.tetherButton.setTint(TouchControlsConfig.colors.normal);
            }
        }
        
        // Destroy the salvage
        salvage.destroy();
    }
} 