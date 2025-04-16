import Phaser from 'phaser';
import { EventBus } from '../EventBus';

export default class PreloaderScene extends Phaser.Scene {
    constructor() {
        super('PreloaderScene');
    }

    preload() {
        // Display a loading indicator (optional)
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
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
        this.load.image('ship_placeholder', 'assets/images/ship_placeholder.png');

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