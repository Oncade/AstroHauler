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
    BackgroundConfig
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

        // Overlap for Tether Attachment
        this.physics.add.overlap(
            this.player,
            this.salvageGroup,
            this.handleShipSalvageCollision,
            undefined,
            this
        );

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

        // --- Update Tether ---
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
            this.scene.start('GameOverScene', { score: this.score });
        }
    }

    // --- Collision Handlers ---

    handleShipSalvageCollision(object1: any, object2: any) {
        // Determine which object is the player and which is salvage
        const player = (object1 instanceof Player) ? object1 : (object2 instanceof Player) ? object2 : null;
        const salvage = (object1 instanceof Salvage) ? object1 : (object2 instanceof Salvage) ? object2 : null;

        // Ensure we have both and they have bodies
        if (!player || !salvage || !player.body || !salvage.body) {
            return;
        }

        if (!player.isTethered && !salvage.isTethered) {
            if (player.body instanceof Phaser.Physics.Arcade.Body) player.body.setAcceleration(0,0);
            if (salvage.body instanceof Phaser.Physics.Arcade.Body) salvage.body.setAcceleration(0,0);
            this.activeTether = new Tether(this, player, salvage);
            console.log('Scene: Tether initiated.');
        }
    }

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