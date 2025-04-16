import Phaser from 'phaser';
import { EventBus } from '../EventBus';

interface GameOverData {
    score: number;
}

export default class GameOverScene extends Phaser.Scene {
    private finalScore: number = 0;

    constructor() {
        super('GameOverScene');
    }

    init(data: GameOverData) {
        console.log('GameOverScene init with data:', data);
        this.finalScore = data.score !== undefined ? data.score : 0;
    }

    create() {
        console.log('GameOverScene create');
        const { width, height } = this.scale;

        // Background
        this.cameras.main.setBackgroundColor('#400000'); // Dark red background

        // Game Over Text
        this.add.text(width * 0.5, height * 0.3, 'GAME OVER', {
            font: 'bold 64px Arial',
            color: '#ff0000',
            align: 'center'
        }).setOrigin(0.5);

        // Final Score Text
        this.add.text(width * 0.5, height * 0.45, `Final Score: ${this.finalScore}` , {
            font: '32px Arial',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // Restart Button
        const restartButton = this.add.text(width * 0.5, height * 0.6, '[ Restart ]', {
            font: '28px Arial',
            color: '#ffff00',
            backgroundColor: '#555555',
            padding: { left: 15, right: 15, top: 10, bottom: 10 }
        })
        .setOrigin(0.5)
        .setInteractive();

        restartButton.on('pointerdown', () => {
            console.log('Restart button clicked - Starting GameScene');
            this.scene.start('GameScene');
        });
        restartButton.on('pointerover', () => restartButton.setStyle({ color: '#000000', backgroundColor: '#ffff00' }));
        restartButton.on('pointerout', () => restartButton.setStyle({ color: '#ffff00', backgroundColor: '#555555' }));

        // Main Menu Button
        const menuButton = this.add.text(width * 0.5, height * 0.75, '[ Main Menu ]', {
            font: '28px Arial',
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: { left: 15, right: 15, top: 10, bottom: 10 }
        })
        .setOrigin(0.5)
        .setInteractive();

        menuButton.on('pointerdown', () => {
            console.log('Main Menu button clicked - Starting MainMenuScene');
            this.scene.start('MainMenuScene');
        });
        menuButton.on('pointerover', () => menuButton.setStyle({ color: '#000000', backgroundColor: '#ffffff' }));
        menuButton.on('pointerout', () => menuButton.setStyle({ color: '#ffffff', backgroundColor: '#333333' }));


        // Emit the ready event for React bridge
        EventBus.emit('current-scene-ready', this);
    }
} 