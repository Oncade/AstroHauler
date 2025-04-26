import Phaser from 'phaser';
import { EventBus } from '../EventBus';

export default class CommandCenterScene extends Phaser.Scene {
    private totalSpaceBucks: number = 0;
    private shipLevel: number = 1;

    constructor() {
        super('CommandCenterScene');
    }

    init() {
        // Load persisted data
        this.loadSavedData();
    }

    create() {
        console.log('CommandCenterScene create');
        const { width, height } = this.scale;

        // Set command center background - dark metallic interior
        this.cameras.main.setBackgroundColor('#1a1a2e');

        // Create command center panel layout
        this.createCommandCenterUI(width, height);

        // Emit the ready event for React bridge
        EventBus.emit('current-scene-ready', this);
    }

    createCommandCenterUI(width: number, height: number) {
        // Create the command center border/frame
        this.add.rectangle(width/2, height/2, width * 0.95, height * 0.9, 0x333344)
            .setStrokeStyle(4, 0x66aaff);

        // Create title for the command center
        this.add.text(width/2, 40, 'COMMAND CENTER', {
            fontFamily: 'Arial',
            fontSize: '36px',
            color: '#33ccff',
            stroke: '#000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Create ship view screen
        const shipViewArea = this.add.rectangle(width * 0.3, height * 0.35, width * 0.4, height * 0.4, 0x000000)
            .setStrokeStyle(2, 0x00ff00);
        
        // Add ship image inside view screen
        const shipImage = this.add.image(width * 0.3, height * 0.35, 'ship')
            .setScale(2);
        
        // Ship stats panel
        const statsPanel = this.add.rectangle(width * 0.7, height * 0.35, width * 0.4, height * 0.4, 0x000000)
            .setStrokeStyle(2, 0xffaa00);
            
        // Ship info text
        this.add.text(width * 0.7, height * 0.25, 'SALVAGE VESSEL', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffaa00'
        }).setOrigin(0.5);
        
        // Ship stats
        this.add.text(width * 0.55, height * 0.3, [
            `SHIP LEVEL: ${this.shipLevel}`,
            'THRUST: STANDARD',
            'TETHER: BASIC',
            'HULL: REINFORCED',
            'CAPACITY: STANDARD'
        ].join('\n'), {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff',
            align: 'left'
        });
        
        // SpaceBucks display
        this.add.text(width * 0.75, height * 0.35, `SPACEBUCKS: ${this.totalSpaceBucks}`, {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#ffff00',
            stroke: '#000',
            strokeThickness: 1
        }).setOrigin(0.5);
        
        // Mission briefing panel
        const missionPanel = this.add.rectangle(width * 0.5, height * 0.7, width * 0.8, height * 0.25, 0x000000)
            .setStrokeStyle(2, 0x33aaff);
            
        // Mission briefing text
        this.add.text(width * 0.5, height * 0.63, 'MISSION BRIEFING', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#33aaff'
        }).setOrigin(0.5);
        
        this.add.text(width * 0.5, height * 0.7, [
            'SECTOR: ALPHA QUADRANT',
            'OBJECTIVE: SALVAGE COLLECTION',
            'THREAT LEVEL: LOW',
            'ESTIMATED SALVAGE VALUE: MEDIUM',
            'READY FOR DEPLOYMENT'
        ].join('\n'), {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // Create action buttons
        // Start Haul button
        const startHaulButton = this.add.rectangle(width * 0.3, height * 0.85, 200, 60, 0x005500)
            .setStrokeStyle(2, 0x00ff00)
            .setInteractive({ useHandCursor: true });
            
        this.add.text(width * 0.3, height * 0.85, 'START HAUL', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#00ff00'
        }).setOrigin(0.5);
        
        // Return to Base button
        const returnButton = this.add.rectangle(width * 0.7, height * 0.85, 200, 60, 0x550000)
            .setStrokeStyle(2, 0xff0000)
            .setInteractive({ useHandCursor: true });
            
        this.add.text(width * 0.7, height * 0.85, 'RETURN TO BASE', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ff0000'
        }).setOrigin(0.5);
        
        // Add button events
        startHaulButton.on('pointerdown', () => {
            console.log('Starting new haul');
            this.scene.start('GameScene');
        });
        
        startHaulButton.on('pointerover', () => {
            startHaulButton.fillColor = 0x007700;
        });
        
        startHaulButton.on('pointerout', () => {
            startHaulButton.fillColor = 0x005500;
        });
        
        returnButton.on('pointerdown', () => {
            console.log('Returning to main menu');
            this.scene.start('MainMenuScene');
        });
        
        returnButton.on('pointerover', () => {
            returnButton.fillColor = 0x770000;
        });
        
        returnButton.on('pointerout', () => {
            returnButton.fillColor = 0x550000;
        });
    }
    
    // Helper method to load total SpaceBucks from localStorage
    loadSavedData() {
        // Load SpaceBucks
        const savedBucks = localStorage.getItem('totalSpaceBucks');
        if (savedBucks) {
            this.totalSpaceBucks = parseInt(savedBucks, 10);
            console.log(`Loaded total SpaceBucks: ${this.totalSpaceBucks}`);
        } else {
            this.totalSpaceBucks = 0;
            console.log('No saved SpaceBucks found, starting fresh');
        }
        
        // Load ship level (not implemented yet, just showing as concept)
        const shipLevel = localStorage.getItem('shipLevel');
        if (shipLevel) {
            this.shipLevel = parseInt(shipLevel, 10);
        } else {
            this.shipLevel = 1;
        }
    }
} 