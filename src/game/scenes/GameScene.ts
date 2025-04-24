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
    TetherConfig
} from '../config/GameConfig';

export default class GameScene extends Phaser.Scene {
    private player!: Player;
    private parentShip!: ParentShip;
    private salvageGroup!: Phaser.Physics.Arcade.Group;
    private activeTether: Tether | null = null;

    private scoreText!: Phaser.GameObjects.Text;
    private score: number = 0;

    private keys: { [key: string]: Phaser.Input.Keyboard.Key } = {};

    constructor() {
        super('GameScene');
    }

    create() {
        console.log('GameScene create');
        const { width, height } = this.scale;

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

        // Setup Collisions
        this.physics.add.collider(this.player, this.salvageGroup); // Player bounces off salvage
        this.physics.add.collider(this.salvageGroup, this.salvageGroup); // Salvage bounces off each other
        this.physics.add.collider(this.salvageGroup, this.parentShip); // Salvage bounces off parent ship (static)
        // Note: Player does *not* collide with Parent Ship by default, can add if needed
        // this.physics.add.collider(this.player, this.parentShip);

        // Overlap for Salvage Deposit
        this.physics.add.overlap(
            this.parentShip,
            this.salvageGroup,
            this.handleSalvageDeposit,
            this.checkDepositEligibility, // Process callback to check if tethered
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
    }

    update(time: number, delta: number) {
        // --- Handle Input ---
        if (this.keys.left.isDown) {
            this.player.moveLeft();
        } else if (this.keys.right.isDown) {
            this.player.moveRight();
        } else {
            this.player.stopRotation();
        }

        if (this.keys.thrust.isDown) {
            this.player.thrust();
        }

        // --- Handle Tether Key Press ---
        if (Phaser.Input.Keyboard.JustDown(this.keys.tether)) {
            if (this.activeTether) {
                // If already tethered, release the tether
                this.activeTether.destroy();
                this.activeTether = null;
                console.log('Scene: Tether released by key press.');
            } else {
                // If not tethered, try to attach to nearest salvage
                this.attemptTetherAttach();
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

    // --- Collision Handlers ---

    // Process callback for deposit overlap
    checkDepositEligibility(object1: any, object2: any): boolean {
        // Determine which is parent ship and which is salvage
        const parentShip = (object1 instanceof ParentShip) ? object1 : (object2 instanceof ParentShip) ? object2 : null;
        const salvage = (object1 instanceof Salvage) ? object1 : (object2 instanceof Salvage) ? object2 : null;

        // Ensure we have both and they have bodies
        if (!parentShip || !salvage || !parentShip.body || !salvage.body) {
            return false;
        }
        return salvage.isTethered && salvage.tetheredBy === this.player;
    }

    handleSalvageDeposit(object1: any, object2: any) {
        // Determine which is parent ship and which is salvage
        const parentShip = (object1 instanceof ParentShip) ? object1 : (object2 instanceof ParentShip) ? object2 : null;
        const salvage = (object1 instanceof Salvage) ? object1 : (object2 instanceof Salvage) ? object2 : null;

         // Ensure we have both and they have bodies
        if (!parentShip || !salvage || !parentShip.body || !salvage.body) {
            return;
        }

        console.log(`Scene: Attempting deposit for salvage value ${salvage.value}`);

        // Eligibility is handled by the processCallback (checkDepositEligibility)
        this.score += salvage.value;
        this.scoreText.setText('Score: ' + this.score);
        EventBus.emit('score-updated', this.score);
        console.log(`Scene: Deposit successful! Score: ${this.score}`);

        if (this.activeTether && this.activeTether.getAttachedSalvage() === salvage) {
            this.activeTether.destroy();
            this.activeTether = null;
        }
        salvage.destroy();
    }
} 