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

        // Add game title text
        this.add.text(width * 0.5, height * 0.3, 'ASTRO HAULER', { 
            font: 'bold 64px Arial',
            color: '#00ffff',
            align: 'center',
            stroke: '#000',
            strokeThickness: 6
        }).setOrigin(0.5);

        // Subtitle
        this.add.text(width * 0.5, height * 0.4, 'A space salvage adventure', { 
            font: '24px Arial',
            color: '#ffffff',
            align: 'center',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Start Button
        const startButton = this.add.text(width * 0.5, height * 0.6, '[ Start Game ]', {
            font: '32px Arial',
            color: '#00ff00',
            align: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
            padding: { left: 20, right: 20, top: 10, bottom: 10 }
        })
        .setOrigin(0.5)
        .setInteractive();

        startButton.on('pointerdown', () => {
            console.log('Start button clicked - Starting CommandCenterScene');
            this.scene.start('CommandCenterScene');
        });
        
        startButton.on('pointerover', () => {
            startButton.setStyle({ backgroundColor: 'rgba(0,100,0,0.8)' });
        });
        
        startButton.on('pointerout', () => {
            startButton.setStyle({ backgroundColor: 'rgba(0,0,0,0.5)' });
        });

        // Version text at bottom right
        this.add.text(width - 10, height - 10, 'v0.3.0 - Command Center Update', { 
            font: '16px Arial',
            color: '#ffffff',
            align: 'right'
        }).setOrigin(1, 1);

        // Emit the ready event for React bridge
        EventBus.emit('current-scene-ready', this);
    }
} 