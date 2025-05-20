import Phaser from 'phaser';
import { EventBus } from '../EventBus';
import { BackgroundConfig } from '../config/GameConfig';

export default class PreloaderScene extends Phaser.Scene {
    constructor() {
        super('PreloaderScene');
    }

    preload() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

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

        // Display a loading indicator (optional)
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 - 30, 320, 50);

        const loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Loading...',
            style: {
                font: '20px monospace',
                color: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);

        const percentText = this.make.text({
            x: width / 2,
            y: height / 2 - 5,
            text: '0%',
            style: {
                font: '18px monospace',
                color: '#ffffff'
            }
        });
        percentText.setOrigin(0.5, 0.5);

        this.load.on('progress', (value: number) => {
            percentText.setText(parseInt(String(value * 100)) + '%');
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 - 20, 300 * value, 30);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
            console.log('PreloaderScene complete - Starting MainMenuScene');
            this.scene.start('MainMenuScene');
        });

        // Load assets
        console.log('PreloaderScene preload');
        this.load.image('ship', 'assets/images/ship.png');
        this.load.image('parent_ship', 'assets/images/parent_ship.png');
        this.load.image(BackgroundConfig.textureKey, BackgroundConfig.imagePath); // Starfield

        // Load all salvage variants
        for (let i = 1; i <= 7; i++) {
            this.load.image(`salvage_${i}`, `assets/images/salvage_${i}.png`);
        }
        
        // Load touch control assets
        this.load.image('joystick-outer', 'assets/ui/joystick-outer.png');
        this.load.image('joystick-inner', 'assets/ui/joystick-inner.png');
        this.load.image('tether-button', 'assets/ui/tether-button.png');
        this.load.image('thrust-button', 'assets/ui/thrust-button.png');
        
        // Load particle effects
        this.load.image('thruster_particle', 'assets/vfx/thruster_particle.png');
        
        // Load tether atlas
        this.load.atlas('tether', 'assets/vfx/tether_atlas.png', 'assets/vfx/tether_atlas.json');

        // Load audio assets
        this.load.audio('menuMusic', 'assets/audio/CosmicDrifter.mp3');
        this.load.audio('gameMusic', 'assets/audio/Wayfarer.mp3');
        this.load.audio('contemplativeMusic', 'assets/audio/ThePonderer.mp3');
        
        // Sound effects will be added later
        // this.load.audio('thruster', 'assets/audio/thruster.wav');
        // this.load.audio('collision', 'assets/audio/collision.wav');
    }

    create() {
        // This scene doesn't need a create method as it transitions on load complete
        // However, we must emit the ready event if React needs to interact
        // potentially before the MainMenuScene is fully ready.
        EventBus.emit('current-scene-ready', this);
    }
} 