import Phaser from 'phaser';
import Player from '../objects/Player';
import { EventBus } from '../EventBus';

export default class GameScene extends Phaser.Scene {
    private player!: Player; // Definite assignment assertion
    private scoreText!: Phaser.GameObjects.Text;
    private score: number = 0;

    constructor() {
        super('GameScene');
    }

    preload() {
        // Preload assets specific to this scene if needed (most are in PreloaderScene)
        console.log('GameScene preload');
    }

    create() {
        console.log('GameScene create');
        const { width, height } = this.scale;

        // Set world bounds
        this.physics.world.setBounds(0, 0, width, height);

        // Background (placeholder color)
        this.cameras.main.setBackgroundColor('#000010');

        // Create Player
        this.player = new Player(this, width * 0.5, height * 0.8);

        // Basic Score Display (Placeholder)
        this.scoreText = this.add.text(16, 16, 'Score: 0', {
            fontSize: '32px',
            color: '#fff',
            // backgroundColor: '#000000a0' // Optional background
        });

        // Exit Button (Placeholder)
        const exitButton = this.add.text(width - 16, 16, '[ Exit ]', {
            fontSize: '24px',
            color: '#ff0000',
            backgroundColor: '#555555',
            padding: { left: 10, right: 10, top: 5, bottom: 5 }
        })
        .setOrigin(1, 0) // Align to top-right
        .setInteractive();

        exitButton.on('pointerdown', () => {
            console.log('Exit button clicked - Returning to MainMenuScene');
            this.scene.start('MainMenuScene');
        });

        exitButton.on('pointerover', () => {
            exitButton.setStyle({ color: '#000000', backgroundColor: '#ff0000' });
        });

        exitButton.on('pointerout', () => {
            exitButton.setStyle({ color: '#ff0000', backgroundColor: '#555555' });
        });

        // --- Input Handling Placeholder (To be implemented in Phase 2/Week 3) ---
        // Example:
        // this.input.keyboard.on('keydown-W', () => this.player.thrust());
        // this.input.keyboard.on('keydown-A', () => this.player.moveLeft());
        // this.input.keyboard.on('keyup-A', () => this.player.stopRotation());
        // this.input.keyboard.on('keydown-D', () => this.player.moveRight());
        // this.input.keyboard.on('keyup-D', () => this.player.stopRotation());

        // --- Collision Handling Placeholder (To be implemented Week 2+) ---
        // Example:
        // this.physics.add.collider(this.player, someObstacleGroup);

        // Emit the ready event for React bridge
        EventBus.emit('current-scene-ready', this);
    }

    update(time: number, delta: number) {
        // Game loop logic
        // this.player.update(time, delta); // If player has its own update logic

        // --- Simple Score Update Placeholder ---
        // this.score += 1; // Increment score over time (example)
        // this.scoreText.setText('Score: ' + this.score);

        // --- Game Over Condition Placeholder ---
        // if (this.player.y > this.scale.height + 50) { // Example: Fell off screen
        //     console.log('Game Over condition met - Starting GameOverScene');
        //     this.scene.start('GameOverScene', { score: this.score });
        // }
    }
} 