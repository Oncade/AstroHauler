import Phaser from 'phaser';
import { EventBus } from '../EventBus';

export default class MainMenuScene extends Phaser.Scene {
    private music!: Phaser.Sound.BaseSound;

    constructor() {
        super('MainMenuScene');
    }

    create() {
        console.log('MainMenuScene create');
        const { width, height } = this.scale;

        // Play background music
        if (!this.sound.get('menuMusic')) {
            this.music = this.sound.add('menuMusic', {
                volume: 0.5,
                loop: true
            });
            this.music.play();
        } else {
            // Get reference to existing music instance
            this.music = this.sound.get('menuMusic');
            
            // Play if not already playing
            if (!this.music.isPlaying) {
                this.music.play();
            }
        }

        // Set up scene transition event to stop music when leaving this scene
        this.events.once('shutdown', () => {
            console.log('MainMenuScene shutdown - stopping music');
            if (this.music && this.music.isPlaying) {
                this.music.stop();
            }
        });

        // Add background and logo first
        this.add.image(width / 2, height / 2, 'bootBackground');
        const AstroHaulerLogo = this.add.image(width / 2, height / 2, 'AstroHaulerLogo')
            .setOrigin(0, 1)
            .setScale(0.5);

        // Add wanderers logo
        const wanderersLogo = this.add.image(width/2, height/2, 'wanderers_white')
            .setOrigin(-1.55, -0.8)
            .setScale(0.1);
            
        // Add plus sign between logos
        const plusSign = this.add.text(width / 2, height/2, '+', { 
            font: '72px Arial', 
            color: '#ffffff' 
        }).setOrigin(-17.5, -4.5);
        
        const logo = this.add.image(width / 2, height - 75, 'bootLogo') // Positioned 50px from bottom
            .setOrigin(-1.1, .5) // Set origin to bottom-center
            .setScale(0.25); // Scale it down


        // Start Button
        const startButton = this.add.text(width * .5, height * 0.7, '[ Start Game ]', {
            font: '72px monospace',
            color: '#f800ea',
            align: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            padding: { left: 100, right: 100, top: 50, bottom: 50 }
        })
        .setOrigin(0.5)
        .setInteractive();

        startButton.on('pointerdown', () => {
            console.log('Start button clicked - Starting CommandCenterScene');
            // Stop this scene when transitioning to ensure shutdown is called
            this.scene.start('CommandCenterScene');
            this.scene.stop('MainMenuScene');
        });
        
        startButton.on('pointerover', () => {
            startButton.setStyle({ backgroundColor: 'rgba(238, 0, 255, 0.37)' });
        });
        
        startButton.on('pointerout', () => {
            startButton.setStyle({ backgroundColor: 'rgba(0, 0, 0, 0.5)' });
        });

        // Version text at bottom right
        this.add.text(width - 10, height - 10, 'v0.3.0 - Command Center Update', { 
            font: '16px monospace',
            color: '#ffffff',
            align: 'right'
        }).setOrigin(1, 1);

        // Emit the ready event for React bridge
        EventBus.emit('current-scene-ready', this);
    }
} 