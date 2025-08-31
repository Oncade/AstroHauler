import Phaser from 'phaser';
import Player from '../objects/Player';
import Salvage from '../objects/Salvage';
import ParentShip from '../objects/ParentShip';
import { ITether, createTether } from '../objects/TetherFactory';
import { EventBus } from '../EventBus';
import {
    ControlKeys,
    getRandomSalvageMass,
    getRandomSalvageTexture,
    ParentShipConfig,
    BackgroundConfig,
    TetherConfig,
    TouchControlsConfig,
    DeviceDetection,
    PlayerConfig,
    ResponsiveConfig,
    CameraConfig,
    WorldConfig
} from '../config/GameConfig';
import { applyMetaToRuntimeConfigs, getHaulParams, addSpaceBucks, loadProgress as loadMetaProgress } from '../config/MetaGame';
import Minimap from '../objects/Minimap';
import FogOfWar from '../objects/FogOfWar';

export default class GameScene extends Phaser.Scene {
    private player!: Player;
    private parentShip!: ParentShip;
    private salvageGroup!: Phaser.Physics.Arcade.Group;
    private activeTether: ITether | null = null;
    private depositZone!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
    private exitZone!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
    private hasPlayerLeftExitZone: boolean = false;
    private isPlayerEligibleToExit: boolean = false;

    private scoreText!: Phaser.GameObjects.Text;
    private score: number = 0;
    private totalSpaceBucks: number = 0;
    private music!: Phaser.Sound.BaseSound;

    private keys: { [key: string]: Phaser.Input.Keyboard.Key } = {};
    
    // Touch controls
    private joystick!: { outer: Phaser.GameObjects.Image; inner: Phaser.GameObjects.Image; };
    private tetherButton!: Phaser.GameObjects.Image;
    private thrustButton!: Phaser.GameObjects.Image;
    private isTouching: boolean = false;
    private isThrustButtonPressed: boolean = false;
    private currentThrustForce: number = 0;
    private thrustTween: Phaser.Tweens.Tween | null = null;
    private targetRotation: number = 0;
    private isTouchDevice: boolean = false;
    private joystickAngle: number = 0;
    private joystickDistance: number = 0;
    private touchDirectionIndicator!: Phaser.GameObjects.Graphics;
    private joystickVisible: boolean = false;
    private joystickFadeTween: Phaser.Tweens.Tween | null = null;

    // Minimap
    private minimap?: Minimap;
    // Minimap button removed; React controls visibility
    private worldWidth: number = 0;
    private worldHeight: number = 0;
    private isPausedForMinimap: boolean = false;
    
    // Phaser UI buttons removed; React owns buttons and instructions

    // Fog of War
    private fogOfWar?: FogOfWar;

    // Static colliders generated from debris alpha map
    private debrisStaticGroup?: Phaser.Physics.Arcade.StaticGroup;
    private debrisTileSize: number = 32;
    private showDebrisCollisionDebug: boolean = false;
    private debrisDebugGraphics?: Phaser.GameObjects.Graphics;

    private isMobileDevice: boolean = false;
    private deviceMultiplier: number = 1.0;
    private screenOrientation: 'portrait' | 'landscape' = 'landscape';

    // Cached UI listener refs for cleanup
    private onUiEndHaul?: () => void;
    private onUiMinimapToggle?: (show: boolean) => void;
    private onUiTetherToggle?: () => void;
    private onUiThrustControl?: (payload: { active: boolean; force?: number }) => void;
    private onUiRotationControl?: (payload: { angle: number; strength?: number }) => void;

    constructor() {
        super('GameScene');
    }

    create() {
        console.log('GameScene create');
        const { width, height } = this.scale;

        // Apply meta-game upgrades/ship modifiers to runtime configs
        applyMetaToRuntimeConfigs();

        // Play random background music
        this.playRandomBackgroundMusic();

        // Set up scene transition event to stop music when leaving
        this.events.once('shutdown', () => {
            console.log('GameScene shutdown - stopping music');
            if (this.music && this.music.isPlaying) {
                this.music.stop();
            }
            // Clean up minimap resources
            this.minimap?.destroy();
            // Clean up fog resources
            this.fogOfWar?.destroy();
        });

        // Detect device type and set screen properties
        this.isTouchDevice = DeviceDetection.isTouchDevice();
        this.isMobileDevice = DeviceDetection.isMobileDevice();
        this.screenOrientation = DeviceDetection.getScreenOrientation();
        this.deviceMultiplier = ResponsiveConfig.getMultiplier();
        
        console.log(`Device detection: Touch: ${this.isTouchDevice}, Mobile: ${this.isMobileDevice}, Orientation: ${this.screenOrientation}, Size Multiplier: ${this.deviceMultiplier}`);

        // Debug text removed

        // The thrust-button image is already loaded in PreloaderScene,
        // so we don't need to create it here

        // Load persisted total SpaceBucks from meta progress
        this.loadTotalSpaceBucks();
        // Inform React HUD immediately
        EventBus.emit('spacebucks-updated', this.totalSpaceBucks);
        
        // Reset current haul score on scene start
        this.score = 0;

        // Load debris map texture details (will set world size to image size if available)
        const debrisTexture = this.textures.get('debris_map');
        const debrisSource = debrisTexture.getSourceImage() as HTMLImageElement | HTMLCanvasElement | undefined;
        const debrisWidth = debrisSource ? (debrisSource as any).width : undefined;
        const debrisHeight = debrisSource ? (debrisSource as any).height : undefined;

        // Set world bounds; prefer debris map size when present
        const worldSizeMultiplier = this.isMobileDevice ? WorldConfig.sizeMultiplier.mobile : WorldConfig.sizeMultiplier.desktop;
        const worldWidth = debrisWidth ?? width * worldSizeMultiplier;
        const worldHeight = debrisHeight ?? height * worldSizeMultiplier;
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;
        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

        // Add Background FIRST (fixed starfield for parallax feel) and make it track viewport size
        const starfield = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, BackgroundConfig.textureKey)
            .setOrigin(0, 0)
            .setScrollFactor(0);
        // Update starfield size on resize to cover entire viewport
        this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
            starfield.setSize(gameSize.width, gameSize.height);
        });

        // Add debris map image as the visible level layer at world origin and build collision from its alpha
        if (debrisTexture && debrisWidth && debrisHeight) {
            this.add.image(0, 0, 'debris_map').setOrigin(0, 0).setScrollFactor(1);
            this.debrisTileSize = 32;
            this.buildDebrisCollisionFromAlpha(this.debrisTileSize, 100); // tile size, alpha threshold
        }

        // Create Parent Ship first
        this.parentShip = new ParentShip(this, ParentShipConfig.spawnX, ParentShipConfig.spawnY);

        // Create a separate physics body for the deposit zone
        this.createDepositZoneCollider();
        
        // Create exit zone first, before player spawn
        this.createExitZoneCollider();
        
        // Get exit zone position for player spawn
        const exitZonePos = {
            x: this.parentShip.x - 400, // Offset from parent ship
            y: this.parentShip.y - 250
        };
        
        // Create Player at exit zone position
        this.player = new Player(this, exitZonePos.x, exitZonePos.y);
        
        // Set player's initial rotation to face right (90 degrees clockwise from facing up)
        this.player.setRotation(0); // 0 degrees = facing right

        // Create Salvage Group
        this.salvageGroup = this.physics.add.group({
            classType: Salvage,
            runChildUpdate: false // Salvage update logic is mainly driven by tether/physics
        });

        // Calculate safe spawn distance from parent ship
        const safeDistance = 200; // Minimum distance from parent ship

        // Spawn initial salvage items (avoiding parent ship)
        const haulParams = getHaulParams();
        const spawnCount = haulParams.salvageSpawnCount;
        for (let i = 0; i < spawnCount; i++) {
            let x, y, distanceToShip;
            
            // Keep trying positions until we find one far enough from the parent ship
            do {
                x = Phaser.Math.Between(50, worldWidth - 50);
                y = Phaser.Math.Between(50, worldHeight - 50);
                
                // Calculate distance from this point to parent ship
                distanceToShip = Phaser.Math.Distance.Between(
                    x, y, 
                    this.parentShip.x, this.parentShip.y
                );
            } while (distanceToShip < safeDistance);
            
            const mass = getRandomSalvageMass();
            const textureKey = getRandomSalvageTexture();
            const salvageItem = new Salvage(this, x, y, mass, textureKey);
            this.salvageGroup.add(salvageItem, true);

            // Ensure initial life after adding to physics group (in case defaults override)
            const angVel = Phaser.Math.FloatBetween(-60, 60);
            salvageItem.setAngularVelocity(angVel);
            const driftSpeed = Phaser.Math.FloatBetween(20, 60);
            const driftAngle = Phaser.Math.FloatBetween(0, Math.PI * 2);
            const driftVec = new Phaser.Math.Vector2();
            this.physics.velocityFromRotation(driftAngle, driftSpeed, driftVec);
            salvageItem.setVelocity(driftVec.x, driftVec.y);
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
        } else {
            // Desktop mouse setup
            // Prevent context menu so right-click can be used for tether toggle
            this.input.mouse?.disableContextMenu();

            // Right-click toggles tether
            this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
                if (pointer.rightButtonDown()) {
                    if (this.activeTether) {
                        this.activeTether.destroy();
                        this.activeTether = null;
                        if (this.tetherButton) {
                            this.tetherButton.setTint(TouchControlsConfig.colors.normal);
                        }
                    } else {
                        this.attemptTetherAttach();
                        if (this.activeTether && this.tetherButton) {
                            this.tetherButton.setTint(TouchControlsConfig.colors.active);
                        }
                    }
                }
            });
        }

        // Setup Collisions
        this.physics.add.collider(this.player, this.salvageGroup); // Player bounces off salvage
        this.physics.add.collider(this.salvageGroup, this.salvageGroup); // Salvage bounces off each other
        //this.physics.add.collider(this.salvageGroup, this.parentShip); // Salvage bounces off parent ship (static)
        // Note: Player does *not* collide with Parent Ship by default, can add if needed
        // this.physics.add.collider(this.player, this.parentShip);
        
        // Collide against debris static obstacles if present
        if (this.debrisStaticGroup) {
            this.physics.add.collider(this.player, this.debrisStaticGroup);
            this.physics.add.collider(this.salvageGroup, this.debrisStaticGroup);
        }

        // Toggle collision debug with F1
        this.input.keyboard?.on('keydown-F1', () => {
            this.showDebrisCollisionDebug = !this.showDebrisCollisionDebug;
            if (this.showDebrisCollisionDebug) {
                this.drawDebrisCollisionDebug();
            } else {
                this.clearDebrisCollisionDebug();
            }
        });

        // Overlap for Salvage Deposit - now using the deposit zone physics body
        this.physics.add.overlap(
            this.depositZone,
            this.salvageGroup,
            this.handleSalvageDeposit,
            this.checkDepositEligibility, // Process callback to check if tethered - now checks only overlap
            this
        );
/*
        // UI Elements
        this.scoreText = this.add.text(16, 16, 'Score: 0', {
            fontFamily: '"Roboto Mono", "Courier New", monospace',
            fontSize: '32px',
            color: '#fff',
            // fixedWidth: 300 // Optional for alignment
        }).setScrollFactor(0); // Keep UI fixed on screen

        // Update Phaser score text after reset
        this.scoreText.setText('Score: ' + this.score);
*/
        // UI buttons will be created after minimap setup

        // Camera setup with device-specific settings
        const cameraZoom = this.isMobileDevice ? 
            (this.screenOrientation === 'portrait' ? CameraConfig.zoomLevel.mobile * 0.8 : CameraConfig.zoomLevel.mobile) :
            CameraConfig.zoomLevel.desktop;
            
        const cameraFollowSpeed = this.isMobileDevice ? 
            CameraConfig.followSpeed.mobile : 
            CameraConfig.followSpeed.desktop;
            
        this.cameras.main.startFollow(this.player, true, cameraFollowSpeed, cameraFollowSpeed);
        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
        this.cameras.main.setZoom(cameraZoom);
        
        console.log(`Camera setup: Zoom: ${cameraZoom}, Follow Speed: ${cameraFollowSpeed}`);

        // Listen for orientation changes
        this.scale.on('resize', this.handleScreenResize, this);

        // Emit the ready event for React bridge (single emit is sufficient)
        EventBus.emit('current-scene-ready', this);

        // Update all salvage objects to check for deposit zone overlap - safely
        const checkForDeposits = () => {
            // Only proceed if the scene is still active
            if (!this.scene.isActive()) return;
            
            try {
                // Check untethered salvage for direct deposit
                this.salvageGroup.getChildren().forEach(child => {
                    if (!this.scene.isActive()) return; // Exit if scene changes during iteration
                    
                    const salvage = child as Salvage;
                    if (salvage.active) {
                        this.checkForDirectDeposit(salvage);
                    }
                });
                
                // If we have an active tether, also check its salvage
                if (this.activeTether && this.scene.isActive()) {
                    const tetheredSalvage = this.activeTether.getAttachedSalvage();
                    if (tetheredSalvage && tetheredSalvage.active) {
                        this.checkForDirectDeposit(tetheredSalvage);
                    }
                }
            } catch (e) {
                console.error('Error in salvage deposit check:', e);
            }
        };
        
        // Use event to check for deposits but with safety guards
        this.events.on('update', () => {
            if (!this.isPausedForMinimap) {
                checkForDeposits();
            }
        });

        // Initialize Fog of War overlay (after world and objects are ready, before UI)
        this.fogOfWar = new FogOfWar(this, this.worldWidth, this.worldHeight);

        // Create minimap overlay (after world and objects are ready)
        this.minimap = new Minimap(this, {
            worldWidth: this.worldWidth,
            worldHeight: this.worldHeight,
            hasDebrisMap: Boolean(debrisTexture && debrisWidth && debrisHeight),
            isMobileDevice: this.isMobileDevice
        });
        this.minimap.start(this.player, this.parentShip, this.salvageGroup);

        // Minimap button and UI buttons removed (React owns UI)
        
        // Setup React UI event listeners
        this.setupReactUIEventListeners();
        
        // Touch debugging completed - coordinates work correctly
    }

    // Handler for screen resize/orientation change
    handleScreenResize() {
        if (!this.scene.isActive()) return;
        
        const newOrientation = DeviceDetection.getScreenOrientation();
        const newMultiplier = ResponsiveConfig.getMultiplier();
        
        console.log(`Screen resized: New orientation: ${newOrientation}, New multiplier: ${newMultiplier}`);
        
        // Update stored values
        this.screenOrientation = newOrientation;
        this.deviceMultiplier = newMultiplier;
        
        // Adjust camera zoom based on new orientation
        if (this.isMobileDevice) {
            const newZoom = this.screenOrientation === 'portrait' 
                ? CameraConfig.zoomLevel.mobile * 0.8 
                : CameraConfig.zoomLevel.mobile;
                
            this.cameras.main.setZoom(newZoom);
            console.log(`Camera zoom adjusted to: ${newZoom}`);
        }
        
        // Recreate touch controls with new sizes if they exist
        if (this.isTouchDevice && this.tetherButton && this.thrustButton) {
            // Remove old controls
            this.tetherButton.destroy();
            this.thrustButton.destroy();
            if (this.joystick) {
                this.joystick.outer.destroy();
                this.joystick.inner.destroy();
            }
            
            // Recreate with new sizes
            this.createTouchControls();
            console.log('Touch controls recreated for new screen size');
        }

        // Resize/rebuild minimap for new screen size
        this.minimap?.handleResize(this.isMobileDevice);

        // No Phaser UI to reposition
    }

    // Minimap button removed; React toggles via EventBus

    private setPausedForMinimap(paused: boolean) {
        this.isPausedForMinimap = paused;
        // Pause/resume physics and time-based systems
        this.physics.world.isPaused = paused;
        this.tweens.timeScale = paused ? 0 : 1;
        // Optionally dim player thruster sound etc. (not implemented)
        EventBus.emit('game-pause-changed', paused);
    }

    // Phaser-created UI buttons removed; React handles UI

    // Setup event listeners for React UI components
    private setupReactUIEventListeners() {
        this.onUiEndHaul = () => { this.endHaul(); };
        EventBus.on('ui-end-haul', this.onUiEndHaul);

        // Minimap toggle from React UI
        this.onUiMinimapToggle = (show: boolean) => {
            if (!this.minimap) return;
            if (show) {
                this.minimap.show();
            } else {
                this.minimap.hide();
            }
            this.setPausedForMinimap(show);
            // Inform React of final minimap visibility state
            EventBus.emit('minimap-state-changed', this.minimap.isVisible());
        };
        EventBus.on('ui-minimap-toggle', this.onUiMinimapToggle);

        // Tether toggle from React UI
        this.onUiTetherToggle = () => {
            if (this.activeTether) {
                console.log('Tether toggle: activeTether exists');
                // Allow active tether to handle press first (e.g., bond add or reattach)
                if (typeof this.activeTether.onTetherButtonPressed === 'function') {
                    const handled = this.activeTether.onTetherButtonPressed();
                    if (handled) {
                        console.log('Tether toggle: activeTether handled');
                        EventBus.emit('tether-state-changed', true);
                        return;
                    }
                }
                console.log('Tether toggle: activeTether not handled');
                // If not handled, default to release
                this.activeTether.destroy();
                this.activeTether = null;
                EventBus.emit('tether-state-changed', false);
            } else {
                console.log('Tether toggle: no activeTether');
                // If not tethered, try to attach to nearest salvage
                this.attemptTetherAttach();
                EventBus.emit('tether-state-changed', !!this.activeTether);
            }
        };
        EventBus.on('ui-tether-toggle', this.onUiTetherToggle);

        // Thrust control from React UI
        this.onUiThrustControl = (payload: { active: boolean; force?: number }) => {
            if (!payload) return;
            const { active, force } = payload;
            if (active) {
                this.isThrustButtonPressed = true;
                if (typeof force === 'number') {
                    this.currentThrustForce = force;
                }
            } else {
                this.stopThrust();
            }
        };
        EventBus.on('ui-thrust-control', this.onUiThrustControl);

        // Rotation control from React UI
        this.onUiRotationControl = (payload: { angle: number; strength?: number }) => {
            if (!payload || !this.player) return;
            const { angle, strength } = payload;
            // If strength provided, rotate smoothly; otherwise snap to angle
            if (typeof strength === 'number') {
                this.rotateShipTowards(angle, 16, strength);
            } else {
                this.player.setRotation(angle);
                this.player.setAngularVelocity(0);
            }
        };
        EventBus.on('ui-rotation-control', this.onUiRotationControl);
    }

    // No Phaser UI to reposition

    // Instructions panel removed; React owns this UI

    // Touch coordinate debugging completed - system works correctly

    createTouchControls() {
        const { width, height } = this.scale;
        
        // Apply responsive sizing based on device - use mobile factor for mobile devices
        const joystickSize = TouchControlsConfig.getResponsiveSize(TouchControlsConfig.joystickSize, this.isMobileDevice);
        const buttonSize = TouchControlsConfig.getResponsiveSize(TouchControlsConfig.buttonSize, this.isMobileDevice);
        
        // Calculate positions for buttons - adapted for different screen sizes and orientations
        let tetherX, tetherY, thrustX, thrustY;
        
        if (this.isMobileDevice) {
            // Use percentage-based positioning for mobile devices
            tetherX = width * TouchControlsConfig.mobilePositioning.tether.x;
            tetherY = height * TouchControlsConfig.mobilePositioning.tether.y;
            thrustX = width * TouchControlsConfig.mobilePositioning.thrust.x;
            thrustY = height * TouchControlsConfig.mobilePositioning.thrust.y;
            
            // Log the positions for debugging
            console.log(`Mobile button positions - width: ${width}, height: ${height}`);
            console.log(`Tether: (${tetherX}, ${tetherY}), Thrust: (${thrustX}, ${thrustY})`);
        } else if (this.screenOrientation === 'portrait') {
            // Portrait mode - buttons at bottom of screen
            tetherX = width - buttonSize;
            tetherY = height - buttonSize * 1.5;
            thrustX = width - buttonSize * 2.5;
            thrustY = height - buttonSize * 1.5;
        } else {
            // Landscape mode - use regular positions but scaled
            tetherX = TouchControlsConfig.tetherButtonPosition.x >= 0 
                ? TouchControlsConfig.tetherButtonPosition.x 
                : width + TouchControlsConfig.tetherButtonPosition.x;
                
            tetherY = TouchControlsConfig.tetherButtonPosition.y >= 0 
                ? TouchControlsConfig.tetherButtonPosition.y 
                : height + TouchControlsConfig.tetherButtonPosition.y;
            
            thrustX = TouchControlsConfig.thrustButtonPosition.x >= 0 
                ? TouchControlsConfig.thrustButtonPosition.x 
                : width + TouchControlsConfig.thrustButtonPosition.x;
                
            thrustY = TouchControlsConfig.thrustButtonPosition.y >= 0 
                ? TouchControlsConfig.thrustButtonPosition.y 
                : height + TouchControlsConfig.thrustButtonPosition.y;
        }
        
        console.log(`Creating touch controls: joystick size: ${joystickSize}, button size: ${buttonSize}`);
        console.log(`Button positions: Tether(${tetherX},${tetherY}), Thrust(${thrustX},${thrustY})`);
        
        // Create virtual joystick with configured sizes, but initially invisible
        this.joystick = {
            outer: this.add.image(0, 0, 'joystick-outer')
                .setScrollFactor(0)
                .setAlpha(0)  // Initially invisible
                .setDepth(1000)
                .setScale(joystickSize / 100),  // Scale based on config size
            inner: this.add.image(0, 0, 'joystick-inner')
                .setScrollFactor(0)
                .setAlpha(0)  // Initially invisible
                .setDepth(1001)
                .setScale(joystickSize * 0.6 / 100)  // Smaller inner stick
        };
        
        // Create direction indicator for visualizing thrust direction
        this.touchDirectionIndicator = this.add.graphics()
            .setScrollFactor(0)
            .setDepth(999);
        
        // Create tether button with configured size
        this.tetherButton = this.add.image(tetherX, tetherY, 'tether-button')
            .setScrollFactor(0)
            .setAlpha(TouchControlsConfig.opacity)
            .setDepth(1000)
            .setScale(buttonSize / 100)
            .setInteractive()
            .setTint(TouchControlsConfig.colors.normal);
            
        // Create thrust button
        this.thrustButton = this.add.image(thrustX, thrustY, 'thrust-button')
            .setScrollFactor(0)
            .setAlpha(TouchControlsConfig.opacity)
            .setDepth(1000)
            .setScale(buttonSize / 100)
            .setInteractive()
            .setTint(TouchControlsConfig.colors.normal);

        // Add visual outlines to buttons on mobile to make them more visible
        if (this.isMobileDevice) {
            // Create a glowing outline for the tether button
            const tetherOutline = this.add.graphics()
                .setScrollFactor(0)
                .setDepth(999);
            tetherOutline.lineStyle(3, 0x88ffff, 0.8);
            tetherOutline.strokeCircle(tetherX, tetherY, buttonSize/2 + 5);
            
            // Create a glowing outline for the thrust button
            const thrustOutline = this.add.graphics()
                .setScrollFactor(0)
                .setDepth(999);
            thrustOutline.lineStyle(3, 0xffaa44, 0.8);
            thrustOutline.strokeCircle(thrustX, thrustY, buttonSize/2 + 5);
        }
        
        // Tether button events
        this.tetherButton.on('pointerdown', () => {
            // Don't stop propagation as it might be interfering with touch events
            
            if (this.activeTether) {
                // Allow active tether implementation to handle the press first (bond add or reattach)
                if (typeof this.activeTether.onTetherButtonPressed === 'function') {
                    const handled = this.activeTether.onTetherButtonPressed();
                    if (handled) {
                        this.tetherButton.setTint(TouchControlsConfig.colors.active);
                        return;
                    }
                }
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
        
        // Thrust button events
        this.thrustButton.on('pointerdown', () => {
            this.isThrustButtonPressed = true;
            this.thrustButton.setTint(TouchControlsConfig.colors.active);
            
            // Start with initial thrust force
            this.currentThrustForce = TouchControlsConfig.thrustParameters.initialForce;
            
            // Stop any existing tween
            if (this.thrustTween) {
                this.thrustTween.stop();
            }
            
            // Create a tween to gradually increase thrust force
            this.thrustTween = this.tweens.add({
                targets: this,
                currentThrustForce: TouchControlsConfig.thrustParameters.maxForce,
                duration: TouchControlsConfig.thrustParameters.rampUpTime,
                ease: TouchControlsConfig.thrustParameters.rampUpEase,
            });
        });
        
        this.thrustButton.on('pointerup', () => {
            this.stopThrust();
        });
        
        this.thrustButton.on('pointerout', () => {
            this.stopThrust();
        });
        
        // Track the joystick pointer ID to handle multiple simultaneous touches
        let joystickPointerId: number | null = null;
        
        // Setup dynamic joystick input
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            // Don't create joystick if it's already active
            if (joystickPointerId !== null) return;
            
            // Get the actual position considering camera zoom
            const adjustedPosition = this.getCorrectedPointerPosition(pointer);
            
            // Check if pointer is over a button to avoid creating joystick there
            const isTouchingTetherButton = this.tetherButton.getBounds().contains(adjustedPosition.x, adjustedPosition.y);
            const isTouchingThrustButton = this.thrustButton.getBounds().contains(adjustedPosition.x, adjustedPosition.y);
            
            // Also check for a safe zone around the buttons
            const safeZone = TouchControlsConfig.dynamicJoystick.buttonSafeZone;
            const tetherButtonDist = Phaser.Math.Distance.Between(
                adjustedPosition.x, adjustedPosition.y, 
                this.tetherButton.x, this.tetherButton.y
            );
            const thrustButtonDist = Phaser.Math.Distance.Between(
                adjustedPosition.x, adjustedPosition.y, 
                this.thrustButton.x, this.thrustButton.y
            );
            
            const isNearButtons = tetherButtonDist < this.tetherButton.displayWidth/2 + safeZone || 
                                 thrustButtonDist < this.thrustButton.displayWidth/2 + safeZone;
            
            // Only create joystick if not touching or near buttons
            if (!isTouchingTetherButton && !isTouchingThrustButton && !isNearButtons) {
                // Position joystick at touch location (use adjusted position)
                this.joystick.outer.setPosition(adjustedPosition.x, adjustedPosition.y);
                this.joystick.inner.setPosition(adjustedPosition.x, adjustedPosition.y);
                
                // Make joystick visible with proper alpha
                this.joystick.outer.setAlpha(TouchControlsConfig.opacity);
                this.joystick.inner.setAlpha(TouchControlsConfig.opacity + 0.1);
                
                // Start tracking this pointer for joystick movement
                joystickPointerId = pointer.id;
                this.isTouching = true;
                this.joystickVisible = true;
                
                // Stop any fade tween that might be active
                if (this.joystickFadeTween) {
                    this.joystickFadeTween.stop();
                }
                
                // Start tracking joystick movement
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
            // Only process if this is the pointer we're tracking for the joystick
            if (pointer.id === joystickPointerId) {
                // Fade out joystick
                if (this.joystickVisible) {
                    this.fadeOutJoystick();
                }
                
                this.isTouching = false;
                joystickPointerId = null;
                
                // Clear the direction indicator
                this.touchDirectionIndicator.clear();
            }
        };
        
        this.input.on('pointerup', handlePointerRelease);
        this.input.on('pointercancel', handlePointerRelease);
    }
    
    // Helper method to correct pointer position for camera zoom
    getCorrectedPointerPosition(pointer: Phaser.Input.Pointer): { x: number, y: number } {
        // Phaser automatically handles canvas scaling for pointer coordinates
        // The pointer.x and pointer.y are already in the correct game coordinate system
        return { 
            x: pointer.x,
            y: pointer.y
        };
    }
    
    // Helper method to get world coordinates for game world interactions
    // This is for interacting with game objects that are affected by camera zoom
    getWorldPointerPosition(pointer: Phaser.Input.Pointer): { x: number, y: number } {
        // Get camera zoom level
        const zoom = this.cameras.main.zoom;
        
        // Get camera scroll position
        const scrollX = this.cameras.main.scrollX;
        const scrollY = this.cameras.main.scrollY;
        
        // Convert screen coordinates to world coordinates
        const worldX = pointer.x / zoom + scrollX;
        const worldY = pointer.y / zoom + scrollY;
        
        return { x: worldX, y: worldY };
    }

    // Build a tilemap collision layer from the alpha channel of the debris map image
    // tileSize: pixels per tile; alphaThreshold: 0..255 below which is empty
    private buildDebrisCollisionFromAlpha(tileSize: number, alphaThreshold: number) {
        const texture = this.textures.get('debris_map');
        const src = texture.getSourceImage() as HTMLImageElement | HTMLCanvasElement | undefined;
        if (!src) return;

        // Draw into an offscreen canvas to read pixels
        const canvas = document.createElement('canvas');
        const width = (src as any).width;
        const height = (src as any).height;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(src as CanvasImageSource, 0, 0);
        const imageData = ctx.getImageData(0, 0, width, height).data;

        const cols = Math.ceil(width / tileSize);
        const rows = Math.ceil(height / tileSize);
        const data: number[][] = [];

        // Simple sampling: if any pixel in the tile has alpha >= threshold, mark as colliding (1)
        for (let ty = 0; ty < rows; ty++) {
            const row: number[] = [];
            for (let tx = 0; tx < cols; tx++) {
                let solid = false;
                const startX = tx * tileSize;
                const startY = ty * tileSize;
                const endX = Math.min(startX + tileSize, width);
                const endY = Math.min(startY + tileSize, height);
                for (let y = startY; !solid && y < endY; y += Math.max(1, Math.floor(tileSize / 4))) {
                    for (let x = startX; x < endX; x += Math.max(1, Math.floor(tileSize / 4))) {
                        const idx = (y * width + x) * 4 + 3; // alpha channel
                        if (imageData[idx] >= alphaThreshold) { solid = true; break; }
                    }
                }
                // Use 1 for solid tile index and -1 for empty space
                row.push(solid ? 1 : -1);
            }
            data.push(row);
        }

        // Build static physics rectangles instead of a tilemap for reliability
        this.debrisStaticGroup = this.physics.add.staticGroup();
        for (let ty = 0; ty < rows; ty++) {
            const row = data[ty];
            if (!row) continue;
            for (let tx = 0; tx < cols; tx++) {
                if (row[tx] === 1) {
                    const x = tx * tileSize + tileSize / 2;
                    const y = ty * tileSize + tileSize / 2;
                    const block = this.add.rectangle(x, y, tileSize, tileSize, 0x000000, 0);
                    this.physics.add.existing(block, true); // true => static body
                    this.debrisStaticGroup.add(block);
                }
            }
        }

        if (this.showDebrisCollisionDebug) {
            this.drawDebrisCollisionDebug();
        }
    }

    private drawDebrisCollisionDebug() {
        if (!this.debrisStaticGroup) return;
        if (!this.debrisDebugGraphics) {
            this.debrisDebugGraphics = this.add.graphics();
            this.debrisDebugGraphics.setScrollFactor(1);
        }
        this.debrisDebugGraphics.clear();
        this.debrisDebugGraphics.lineStyle(1, 0x00ff00, 0.5);
        this.debrisStaticGroup.getChildren().forEach((obj) => {
            const rect = (obj as Phaser.GameObjects.Rectangle).getBounds();
            this.debrisDebugGraphics?.strokeRect(rect.x, rect.y, rect.width, rect.height);
        });
    }

    private clearDebrisCollisionDebug() {
        if (this.debrisDebugGraphics) {
            this.debrisDebugGraphics.clear();
        }
    }
    
    // Fade out joystick smoothly
    fadeOutJoystick() {
        if (!this.joystickVisible) return;
        
        this.joystickFadeTween = this.tweens.add({
            targets: [this.joystick.outer, this.joystick.inner],
            alpha: 0,
            duration: TouchControlsConfig.dynamicJoystick.fadeOutTime,
            onComplete: () => {
                this.joystickVisible = false;
            }
        });
    }
    
    updateJoystick(pointer: Phaser.Input.Pointer) {
        if (!this.joystickVisible) return;
        
        // Get corrected pointer position
        const adjustedPosition = this.getCorrectedPointerPosition(pointer);
        
        const joystickCenterX = this.joystick.outer.x;
        const joystickCenterY = this.joystick.outer.y;
        
        // Calculate distance from center using corrected position
        const dx = adjustedPosition.x - joystickCenterX;
        const dy = adjustedPosition.y - joystickCenterY;
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
        } else {
            // Center position - no input
            this.resetJoystick();
        }
    }
    
    updateDirectionIndicator() {
        // Clear previous drawing
        this.touchDirectionIndicator.clear();
        
        // Don't draw if not actively using joystick
        if (!this.isTouching || !this.joystickVisible) return;
        
        // Calculate direction line endpoints
        const startX = this.joystick.outer.x;
        const startY = this.joystick.outer.y;
        const length = TouchControlsConfig.joystickSize * 0.8; // Line length
        const endX = startX + Math.cos(this.joystickAngle) * length;
        const endY = startY + Math.sin(this.joystickAngle) * length;
        
        // Draw arrow to show rotation direction using config settings
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
        if (!this.joystick || !this.joystickVisible) return;
        
        this.joystick.inner.x = this.joystick.outer.x;
        this.joystick.inner.y = this.joystick.outer.y;
        this.joystickAngle = 0;
        this.joystickDistance = 0;
        
        // Clear the direction indicator
        if (this.touchDirectionIndicator) {
            this.touchDirectionIndicator.clear();
        }
    }

    update(_time: number, delta: number) {
        // Pause gameplay simulation while minimap overlay is visible
        if (this.isPausedForMinimap) {
            return;
        }
        // --- Handle Input ---
        // Handle rotation
        if (this.isTouchDevice && this.isTouching && this.joystickVisible) {
            // Touch controls - rotate ship to face the direction of joystick movement
            this.rotateShipTowards(this.targetRotation, delta, this.joystickDistance);
        } else {
            // Desktop: rotate towards mouse unless keyboard rotation is being used
            if (this.keys.left?.isDown) {
                this.player.moveLeft();
            } else if (this.keys.right?.isDown) {
                this.player.moveRight();
            } else {
                const pointer = this.input.activePointer;
                if (pointer) {
                    const { x: worldX, y: worldY } = this.getWorldPointerPosition(pointer);
                    const angleToPointer = Math.atan2(worldY - this.player.y, worldX - this.player.x);
                    // Adjust for ship sprite facing up at rotation 0
                    const target = angleToPointer + Math.PI / 2;
                    this.rotateShipTowards(target, delta);
                } else {
                    this.player.stopRotation();
                }
            }
        }

        // Handle thrust (mouse left button, keyboard, or touch thrust button)
        if (!this.isTouchDevice && this.input.activePointer?.leftButtonDown()) {
            this.player.thrust();
        } else if (this.keys.thrust?.isDown) {
            // Keyboard thrust - always in the direction the ship is facing
            this.player.thrust();
        } else if (this.isThrustButtonPressed) {
            // Thrust button - apply gradual thrust in the direction the ship is facing
            //this.player.thrust();
            this.player.thrustWithForce(this.currentThrustForce);
        } else {
            // Stop applying acceleration when no thrust buttons are pressed
            this.player.stopThrust();
        }

        // --- Handle Tether Key Press ---
        if (Phaser.Input.Keyboard.JustDown(this.keys.tether)) {
            if (this.activeTether) {
                // Allow active tether to handle press first (e.g., bond add or reattach)
                if (typeof this.activeTether.onTetherButtonPressed === 'function') {
                    const handled = this.activeTether.onTetherButtonPressed();
                    if (handled) {
                        if (this.tetherButton) this.tetherButton.setTint(TouchControlsConfig.colors.active);
                        return;
                    }
                }
                // If not handled, default to release
                this.activeTether.destroy();
                this.activeTether = null;
                console.log('Scene: Tether released by key press.');
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
            // Remove the acceleration reset that's canceling thrust
            // Let tether forces add to the existing acceleration
            this.activeTether.update(delta);
        }
        
        // Check for player in exit zone
        this.checkPlayerExitZoneOverlap();

        // Update Fog of War with player's current vision
        if (this.fogOfWar && this.player && this.parentShip) {
            this.fogOfWar.update(
                { x: this.player.x, y: this.player.y, rotation: this.player.rotation },
                { x: this.parentShip.x, y: this.parentShip.y }
            );
        }
    }
    
    // Helper method to smoothly rotate the ship towards a target angle
    rotateShipTowards(targetAngle: number, delta: number, speedFactor: number = 1) {
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
        
        // Calculate rotation speed; on touch use joystick distance, desktop uses full speed by default
        const rotationSpeed = PlayerConfig.angularVelocity * speedFactor;
        
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
            // No need to reset acceleration - this allows both objects to maintain their current momentum
            // Create the tether without modifying current physics state
            this.activeTether = createTether(this, this.player, closestSalvage);
            console.log('Scene: Tether initiated by key press to nearest salvage.');
        } else {
            console.log('Scene: Nearest eligible salvage is out of range.');
            // Optional: Play a failure sound/effect
        }
    }
    
    // Update the tether color
    updateTetherColor(color: number) {
        if (this.activeTether) {
            // Call the updateTetherColor method on the active tether
            if (typeof this.activeTether.updateTetherColor === 'function') {
                this.activeTether.updateTetherColor(color);
            }
        }
    }
    
    // Toggle tether color cycling
    toggleTetherColorCycling() {
        if (this.activeTether && typeof this.activeTether.toggleColorCycling === 'function') {
            const isEnabled = this.activeTether.toggleColorCycling();
            console.log(`Tether color cycling: ${isEnabled ? 'enabled' : 'disabled'}`);
            return isEnabled;
        }
        return false;
    }

    // Create a physics collider for the deposit zone
    createDepositZoneCollider() {
        // Get the deposit zone position from the parent ship
        const depositZonePos = this.parentShip.getDepositZonePosition();
        const radius = ParentShipConfig.depositZoneRadius * (this.isMobileDevice ? 1.2 : 1.0); // Slightly larger on mobile

        // If the texture doesn't exist, create a simple circular texture
        if (!this.textures.exists('deposit-zone-collider')) {
            // Create a circular texture using render texture
            const renderTexture = this.add.renderTexture(0, 0, radius * 2, radius * 2);
            
            // Draw the circle on a temporary graphics object
            const graphics = this.add.graphics();
            graphics.fillStyle(0xffffff, 0.3);  // Semi-transparent fill
            graphics.fillCircle(radius, radius, radius);
            graphics.lineStyle(4, 0xffff00, 0.8);
            graphics.strokeCircle(radius, radius, radius);
            
            // Draw graphics to the render texture
            renderTexture.draw(graphics, 0, 0);
            
            // Save as a new texture
            renderTexture.saveTexture('deposit-zone-collider');
            
            // Clean up
            renderTexture.destroy();
            graphics.destroy();
            
            console.log('Created deposit-zone-collider texture');
        }
        
        // Create an invisible sprite to act as the deposit zone collider
        this.depositZone = this.physics.add.sprite(
            depositZonePos.x, 
            depositZonePos.y, 
            'deposit-zone-collider'
        );
        
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
        
        // Monitor deposit zone overlaps for gameplay logic (debug text removed)
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
        });
    }

    // Process callback for deposit overlap
    checkDepositEligibility(_depositZone: any, salvage: any): boolean {
        // We know the first parameter is the deposit zone, and second is salvage
        if (!(salvage instanceof Salvage) || !salvage.body) {
            console.log('Deposit check: invalid salvage object');
            return false;
        }
        
        // Basic overlap check - add extra validation using manual bounds check
        const boundsOverlap = Phaser.Geom.Intersects.RectangleToRectangle(
            this.depositZone.getBounds(),
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

    handleSalvageDeposit(_depositZone: any, salvage: any) {
        // We know the first parameter is the deposit zone, and second is salvage
        if (!(salvage instanceof Salvage) || !salvage.body) {
            console.log('Deposit attempt: invalid salvage object');
            return;
        }

        // Inform active tether (if bond chain) before we destroy or detach salvage
        if (this.activeTether && typeof this.activeTether.onSalvageDeposited === 'function') {
            // Only notify if the deposited salvage is not the current ship-attached node
            try {
                const attached = this.activeTether.getAttachedSalvage();
                if (attached !== salvage) {
                    this.activeTether.onSalvageDeposited(salvage);
                }
            } catch (e) {
                console.warn('onSalvageDeposited callback failed:', e);
            }
        }

        console.log(`Scene: Attempting deposit for salvage value ${salvage.value}`);
        
        // Show deposit success effect
        this.parentShip.showDepositSuccess();

        // Handle scoring
        this.score += salvage.value;
        
        // Check if scene is still active before updating UI
        if (this.scene.isActive()) {
            if (this.scoreText && this.scoreText.active) {
                this.scoreText.setText('Score: ' + this.score);
            }
            EventBus.emit('score-updated', this.score);
            console.log(`Scene: Deposit successful! Score: ${this.score}`);
        }

        // Release tether if active and attached to this salvage
        if (this.activeTether && this.activeTether.getAttachedSalvage() === salvage) {
            this.activeTether.destroy();
            this.activeTether = null;
            // Reset tether button visuals
            if (this.tetherButton && this.tetherButton.active) {
                this.tetherButton.setTint(TouchControlsConfig.colors.normal);
            }
        }
        
        // Destroy the salvage (if it's still active)
        if (salvage.active) {
            salvage.destroy();
        }
    }

    // Manual overlap check for deposit - this ensures deposits work reliably
    checkForDirectDeposit(salvage: Salvage) {
        // Only process if salvage is valid and scene is active
        if (!salvage || !salvage.body || !salvage.active || !this.scene.isActive()) {
            return;
        }
        
        // Make sure deposit zone still exists
        if (!this.depositZone || !this.depositZone.active) {
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
            
            // Show visual feedback if parent ship is still active
            if (this.parentShip && this.parentShip.active) {
                this.parentShip.showDepositReady();
            }
            
            // If overlapping, trigger the deposit function directly
            // Use a small delay to ensure visual feedback is shown before deposit completes
            // But first make sure the scene is still active
            if (this.scene.isActive()) {
                this.time.delayedCall(100, () => {
                    // Double-check if scene and salvage are still active before processing deposit
                    if (this.scene.isActive() && salvage.active) {
                        this.handleDirectDeposit(salvage);
                    }
                });
            }
        }
    }
    
    // Separate handler for direct deposit processing
    handleDirectDeposit(salvage: Salvage) {
        // Check if salvage still exists and is active
        if (!salvage || !salvage.active) {
            console.log('Direct deposit: salvage not active anymore');
            return;
        }
        
        // Inform active tether (if bond chain) before we destroy or detach salvage
        if (this.activeTether && typeof this.activeTether.onSalvageDeposited === 'function') {
            try {
                const attached = this.activeTether.getAttachedSalvage();
                if (attached !== salvage) {
                    this.activeTether.onSalvageDeposited(salvage);
                }
            } catch (e) {
                console.warn('onSalvageDeposited callback failed:', e);
            }
        }

        console.log(`Direct deposit processing for salvage value ${salvage.value}`);
        
        // Show deposit success effect
        this.parentShip.showDepositSuccess();
        
        // Award score
        this.score += salvage.value;
        
        // Safely update UI only if scene is still active
        if (this.scene.isActive()) {
            if (this.scoreText && this.scoreText.active) {
                this.scoreText.setText('Score: ' + this.score);
            }
            EventBus.emit('score-updated', this.score);
            console.log(`Scene: Deposit successful! Score: ${this.score}`);
        }
        
        // Release tether if active and attached to this salvage
        if (this.activeTether && this.activeTether.getAttachedSalvage() === salvage) {
            this.activeTether.destroy();
            this.activeTether = null;
            // Reset tether button visuals
            if (this.tetherButton && this.tetherButton.active) {
                this.tetherButton.setTint(TouchControlsConfig.colors.normal);
            }
        }
        
        // Safely destroy the salvage
        if (salvage.active) {
            salvage.destroy();
        }
    }

    // Helper method to load total SpaceBucks from localStorage
    loadTotalSpaceBucks() {
        const progress = loadMetaProgress();
        this.totalSpaceBucks = progress.totalSpaceBucks || 0;
        console.log(`Loaded total SpaceBucks: ${this.totalSpaceBucks}`);
    }
    
    // Helper method to save total SpaceBucks to localStorage
    saveTotalSpaceBucks() {
        localStorage.setItem('totalSpaceBucks', this.totalSpaceBucks.toString());
        console.log(`Saved total SpaceBucks: ${this.totalSpaceBucks}`);
    }
    
    // End the current haul and save progress
    endHaul() {
        console.log('Ending haul. Adding score to total SpaceBucks (meta).');
        // Persist SpaceBucks via meta system
        addSpaceBucks(this.score);
        const updatedTotal = loadMetaProgress().totalSpaceBucks;
        // Inform React about new total immediately
        EventBus.emit('spacebucks-updated', updatedTotal);

        // Clean up tether before changing scene
        if (this.activeTether) {
            this.activeTether.destroy();
            this.activeTether = null;
        }
        // Pass both current score and total to GameOverScene inside Phaser's update cycle
        this.time.delayedCall(0, () => {
            this.scene.start('GameOverScene', { 
                score: this.score,
                totalSpaceBucks: updatedTotal
            });
            // Explicitly stop this scene to ensure shutdown is called
            this.scene.stop('GameScene');
        });
    }
    
    // Create the exit zone for ending the current haul
    createExitZoneCollider() {
        // Position the exit zone on the opposite side of the parent ship
        const exitZonePos = {
            x: this.parentShip.x - 400, // Offset from parent ship
            y: this.parentShip.y - 250
        };
        const radius = 100 * (this.isMobileDevice ? 1.2 : 1.0); // Slightly larger on mobile

        // If the texture doesn't exist, create a circular texture
        if (!this.textures.exists('exit-zone-collider')) {
            // Create a circular texture
            const renderTexture = this.add.renderTexture(0, 0, radius * 2, radius * 2);
            
            // Draw the circle
            const graphics = this.add.graphics();
            graphics.fillStyle(0xff0000, 0.3);  // Semi-transparent red
            graphics.fillCircle(radius, radius, radius);
            graphics.lineStyle(4, 0xff3300, 0.8); // Orange-red outline
            graphics.strokeCircle(radius, radius, radius);
            
            // Draw text in the center
            const textObject = this.add.text(radius, radius, 'EXIT', {
                fontSize: '24px',
                color: '#ffffff',
                align: 'center'
            }).setOrigin(0.5);
            
            // Draw graphics to the render texture
            renderTexture.draw(graphics, 0, 0);
            renderTexture.draw(textObject, radius, radius);
            
            // Save as a new texture
            renderTexture.saveTexture('exit-zone-collider');
            
            // Clean up
            renderTexture.destroy();
            graphics.destroy();
            textObject.destroy();
            
            console.log('Created exit-zone-collider texture');
        }
        
        // Create an exit zone sprite
        this.exitZone = this.physics.add.sprite(
            exitZonePos.x, 
            exitZonePos.y, 
            'exit-zone-collider'
        );
        
        // Set up the physics body
        this.exitZone.setCircle(radius)
                    .setVisible(false) // Initially hidden
                    .setImmovable(true)
                    .setAlpha(0.5);
                    
        // Make it a sensor
        if (this.exitZone.body) {
            this.exitZone.body.setAllowGravity(false);
            (this.exitZone.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(false);
            const body = this.exitZone.body as Phaser.Physics.Arcade.Body;
            body.checkCollision.up = false;
            body.checkCollision.down = false;
            body.checkCollision.left = false;
            body.checkCollision.right = false;
        }

        // Initialize the player exit zone tracking flag
        this.hasPlayerLeftExitZone = false;
    }
    
    // Check if player is in the exit zone
    checkPlayerExitZoneOverlap() {
        if (!this.player || !this.exitZone) return;
        
        const playerBounds = this.player.getBounds();
        const exitZoneBounds = this.exitZone.getBounds();
        
        const boundsOverlap = Phaser.Geom.Intersects.RectangleToRectangle(
            exitZoneBounds,
            playerBounds
        );
        
        // Handle player leaving exit zone for first time
        if (!boundsOverlap && !this.hasPlayerLeftExitZone) {
            this.hasPlayerLeftExitZone = true;
            
            // Show exit zone once player has left it for the first time
            this.exitZone.setVisible(true);
            console.log('Player left exit zone, making it visible');
        }
        
        // Determine exit eligibility: inside zone, has left once, nearly stopped
        let eligible = false;
        if (boundsOverlap && this.hasPlayerLeftExitZone) {
            const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
            const velocityMagnitude = Math.sqrt(
                playerBody.velocity.x * playerBody.velocity.x + 
                playerBody.velocity.y * playerBody.velocity.y
            );
            const velocityThreshold = 50;
            eligible = velocityMagnitude <= velocityThreshold;
        }

        if (eligible !== this.isPlayerEligibleToExit) {
            this.isPlayerEligibleToExit = eligible;
            EventBus.emit('player-exit-zone-changed', eligible);
        }
    }
    
    // Legacy exit prompt removed; React controls the prompt via EventBus

    // Helper method to stop thrust and reset values
    stopThrust() {
        this.isThrustButtonPressed = false;
        this.thrustButton.setTint(TouchControlsConfig.colors.normal);
        
        // Stop the thrust ramp-up tween
        if (this.thrustTween) {
            this.thrustTween.stop();
        }
        
        // Reset thrust force
        this.currentThrustForce = 0;
        
        // Stop applying acceleration but maintain momentum
        this.player.stopThrust();
    }

    // Clean up resources when scene is shut down
    shutdown() {
        // Clean up tweens
        if (this.joystickFadeTween) {
            this.joystickFadeTween.stop();
            this.joystickFadeTween = null;
        }
        
        if (this.thrustTween) {
            this.thrustTween.stop();
            this.thrustTween = null;
        }
        
        // Clear any graphics
        if (this.touchDirectionIndicator) {
            this.touchDirectionIndicator.clear();
        }
        
        // Remove event listeners
        this.input.off('pointerdown');
        this.input.off('pointermove');
        this.input.off('pointerup');
        this.input.off('pointercancel');
        
        // Remove the resize event listener
        this.scale.off('resize', this.handleScreenResize, this);

        // Clean up EventBus listeners
        if (this.onUiEndHaul) EventBus.off('ui-end-haul', this.onUiEndHaul);
        if (this.onUiMinimapToggle) EventBus.off('ui-minimap-toggle', this.onUiMinimapToggle);
        if (this.onUiTetherToggle) EventBus.off('ui-tether-toggle', this.onUiTetherToggle);
        if (this.onUiThrustControl) EventBus.off('ui-thrust-control', this.onUiThrustControl);
        if (this.onUiRotationControl) EventBus.off('ui-rotation-control', this.onUiRotationControl);
    }

    // Helper method to select and play random background music
    playRandomBackgroundMusic() {
        // Available music tracks (excluding main menu music)
        const musicTracks = ['gameMusic', 'contemplativeMusic'];
        
        // Randomly select a track
        const selectedTrack = Phaser.Utils.Array.GetRandom(musicTracks);
        
        console.log(`Selected background music: ${selectedTrack}`);
        
        // Play the selected music with lower volume and looping
        this.music = this.sound.add(selectedTrack, {
            volume: 0.4, // Lower volume for background music
            loop: true
        });
        
        this.music.play();
    }
} 