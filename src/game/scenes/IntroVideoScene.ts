import Phaser from 'phaser';
import { EventBus } from '../EventBus';

export default class IntroVideoScene extends Phaser.Scene {
    private introVideo!: Phaser.GameObjects.Video;
    private skipText!: Phaser.GameObjects.Text;

    constructor() {
        super('IntroVideoScene');
    }

    preload() {
        this.load.video('introVideo', 'assets/video/OGWanderer1.mp4');
    }

    create() {
        console.log('IntroVideoScene create');
        const { width, height } = this.scale;

        // Create fullscreen video
        this.introVideo = this.add.video(width/2, height/2, 'introVideo');
        
        // Scale video to fill screen while maintaining aspect ratio
        const scaleX = width / this.introVideo.width*.2;
        const scaleY = height / this.introVideo.height*.2;
        const scale = Math.max(scaleX, scaleY);
        this.introVideo.setScale(scale);

        // Add skip text
        this.skipText = this.add.text(width - 20, height - 20, 'Skip [Space]', {
            fontFamily: '"Roboto Mono", "Courier New", monospace',
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(1, 1).setInteractive({ useHandCursor: true });

        // Add keyboard listener for skip
        this.input.keyboard?.addKey('SPACE').on('down', () => this.skipIntro());
        
        // Add touch/click listener for skip
        this.skipText.on('pointerdown', () => this.skipIntro());
        
        // Play video and transition to game when complete
        this.introVideo.play();
        this.introVideo.on('complete', () => this.startGame());

        // Emit the ready event for React bridge
        EventBus.emit('current-scene-ready', this);
    }

    skipIntro() {
        if (this.introVideo.isPlaying()) {
            this.introVideo.stop();
        }
        this.startGame();
    }

    startGame() {
        this.scene.start('GameScene');
    }
} 