import Phaser from 'phaser';
import { EventBus } from '../EventBus';

export default class MainMenuScene extends Phaser.Scene {
    constructor() {
        super('MainMenuScene');
    }

    create() {
        console.log('MainMenuScene create');
        const { width, height } = this.scale;

        // Add background and logo first
        this.add.image(width / 2, height / 2, 'bootBackground');
        const logo = this.add.image(width / 2, height - 75, 'bootLogo') // Positioned 50px from bottom
            .setOrigin(0.5, 1) // Set origin to bottom-center
            .setScale(0.4); // Scale it down



        // Start Button (Text placeholder)
        const startButton = this.add.text(width * 0.61, height * 0.48, '[ Start Game ]', {
            font: '64px Arial',
            color: '#ffff00',
            //backgroundColor: '#555555',
            padding: { left: 15, right: 15, top: 10, bottom: 10 }
        })
        .setOrigin(0.5)
        .setInteractive();

        startButton.on('pointerdown', () => {
            console.log('Start button clicked - Starting GameScene');
            this.scene.start('GameScene');
        });

        startButton.on('pointerover', () => {
            startButton.setStyle({ color: '#000000' });
        });

        startButton.on('pointerout', () => {
            startButton.setStyle({ color: '#ffff00' });
        });

        // Emit the ready event for React bridge
        EventBus.emit('current-scene-ready', this);
    }
} 