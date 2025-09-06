import Phaser from 'phaser';
import { EventBus } from '../EventBus';

export default class MainMenuScene extends Phaser.Scene {
    private music!: Phaser.Sound.BaseSound;
    private onStartGame?: () => void;

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

        // Background and logos are now handled by React overlay (MainMenu)


        // Listen for React intent to start the game
        this.onStartGame = () => {
            console.log('ui-start-game received - Starting CommandCenterScene');
            this.scene.start('CommandCenterScene');
            this.scene.stop('MainMenuScene');
        };
        EventBus.on('ui-start-game', this.onStartGame);

        // Version text at bottom right
        this.add.text(width - 10, height - 10, 'v0.3.0 - Command Center Update', { 
            font: '16px monospace',
            color: '#ffffff',
            align: 'right'
        }).setOrigin(1, 1);

        // Emit the ready event for React bridge
        EventBus.emit('current-scene-ready', this);
    }

    shutdown() {
        if (this.onStartGame) {
            EventBus.off('ui-start-game', this.onStartGame);
            this.onStartGame = undefined;
        }
    }
} 