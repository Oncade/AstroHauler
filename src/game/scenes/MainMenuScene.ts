import Phaser from 'phaser';
import { EventBus } from '../EventBus';

export default class MainMenuScene extends Phaser.Scene {
    constructor() {
        super('MainMenuScene');
    }

    create() {
        console.log('MainMenuScene create');
        const { width, height } = this.scale;

        // Background color (can be replaced with image later)
        this.cameras.main.setBackgroundColor('#000030');

        // Title
        this.add.text(width * 0.5, height * 0.3, 'AstroHauler', {
            font: 'bold 64px Arial',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // Start Button (Text placeholder)
        const startButton = this.add.text(width * 0.5, height * 0.6, '[ Start Game ]', {
            font: '32px Arial',
            color: '#ffff00',
            backgroundColor: '#555555',
            padding: { left: 15, right: 15, top: 10, bottom: 10 }
        })
        .setOrigin(0.5)
        .setInteractive();

        startButton.on('pointerdown', () => {
            console.log('Start button clicked - Starting GameScene');
            this.scene.start('GameScene');
        });

        startButton.on('pointerover', () => {
            startButton.setStyle({ color: '#000000', backgroundColor: '#ffff00' });
        });

        startButton.on('pointerout', () => {
            startButton.setStyle({ color: '#ffff00', backgroundColor: '#555555' });
        });

        // Emit the ready event for React bridge
        EventBus.emit('current-scene-ready', this);
    }
} 