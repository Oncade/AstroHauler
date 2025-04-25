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

        // Add background and logo first
        this.add.image(width / 2, height / 2, 'bootBackground');
        const logo = this.add.image(width / 2, height - 50, 'bootLogo') // Positioned 50px from bottom
            .setOrigin(0.5, 1) // Set origin to bottom-center
            .setScale(0.4); // Scale it down

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

        // Placeholder for audio assets (Week 4)
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