import Phaser from 'phaser';
import { EventBus } from '../EventBus';
import { nextLevel, loadProgress } from '../config/MetaGame';

interface GameOverData {
    score: number;
    totalSpaceBucks: number;
}

export default class GameOverScene extends Phaser.Scene {
    private finalScore: number = 0;
    private totalSpaceBucks: number = 0;
    private hasEmittedReady: boolean = false;

    constructor() {
        super('GameOverScene');
    }

    init(data: GameOverData) {
        console.log('GameOverScene init with data:', data);
        this.finalScore = data.score !== undefined ? data.score : 0;
        this.totalSpaceBucks = data.totalSpaceBucks !== undefined ? data.totalSpaceBucks : 0;
        this.hasEmittedReady = false;
        
        // Store data in registry for React components to access
        this.registry.set('score', this.finalScore);
        this.registry.set('totalSpaceBucks', this.totalSpaceBucks);
    }

    create() {
        console.log('GameOverScene create');
        const { width, height } = this.scale;

        // Background
        this.cameras.main.setBackgroundColor('#400000'); // Dark red background

        // Haul Complete Text
        this.add.text(width * 0.5, height * 0.3, 'HAUL COMPLETE', {
            fontFamily: '"Roboto Mono", "Courier New", monospace',
            fontSize: '64px',
            fontStyle: 'bold',
            color: '#ff7700',
            align: 'center'
        }).setOrigin(0.5);

        // Haul Score Text
        this.add.text(width * 0.5, height * 0.45, `SpaceBucks from haul: ${this.finalScore}` , {
            fontFamily: '"Roboto Mono", "Courier New", monospace',
            fontSize: '32px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // Total SpaceBucks Text
        this.add.text(width * 0.5, height * 0.53, `Total SpaceBucks: ${this.totalSpaceBucks}` , {
            fontFamily: '"Roboto Mono", "Courier New", monospace',
            fontSize: '36px',
            color: '#ffff00',
            align: 'center'
        }).setOrigin(0.5);

        // Return to Command Center Button
        const commandCenterButton = this.add.text(width * 0.5, height * 0.65, '[ Return to Command Center ]', {
            fontFamily: '"Roboto Mono", "Courier New", monospace',
            fontSize: '28px',
            color: '#ffff00',
            backgroundColor: '#555555',
            padding: { left: 15, right: 15, top: 10, bottom: 10 }
        })
        .setOrigin(0.5)
        .setInteractive();

        commandCenterButton.on('pointerdown', () => {
            console.log('Returning to Command Center');
            // Progress to next level if possible
            nextLevel();
            this.scene.start('CommandCenterScene');
        });
        commandCenterButton.on('pointerover', () => commandCenterButton.setStyle({ color: '#000000', backgroundColor: '#ffff00' }));
        commandCenterButton.on('pointerout', () => commandCenterButton.setStyle({ color: '#ffff00', backgroundColor: '#555555' }));

        // Return to Main Menu Button
        const menuButton = this.add.text(width * 0.5, height * 0.8, '[ Return to Base ]', {
            fontFamily: '"Roboto Mono", "Courier New", monospace',
            fontSize: '28px',
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: { left: 15, right: 15, top: 10, bottom: 10 }
        })
        .setOrigin(0.5)
        .setInteractive();

        menuButton.on('pointerdown', () => {
            console.log('Returning to base - MainMenuScene');
            nextLevel();
            this.scene.start('MainMenuScene');
        });
        menuButton.on('pointerover', () => menuButton.setStyle({ color: '#000000', backgroundColor: '#ffffff' }));
        menuButton.on('pointerout', () => menuButton.setStyle({ color: '#ffffff', backgroundColor: '#333333' }));

        // Emit the ready event for React bridge - only emit once
        if (!this.hasEmittedReady) {
            console.log('GameOverScene emitting current-scene-ready event');
            EventBus.emit('current-scene-ready', this);
            this.hasEmittedReady = true;
        }
    }
} 