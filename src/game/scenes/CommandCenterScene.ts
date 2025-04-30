import Phaser from 'phaser';
import { EventBus } from '../EventBus';

export default class CommandCenterScene extends Phaser.Scene {
    private totalSpaceBucks: number = 0;
    private shipLevel: number = 1;
    private planetVideo!: Phaser.GameObjects.Video;
    private planetVideos: string[] = ['Planet1991', 'Planet4626', 'Planet8631'];

    constructor() {
        super('CommandCenterScene');
    }

    preload() {
        // Load the command center background image
        this.load.image('commandCenterBg', 'assets/CommandCenter.png');
        
        // Load all planet videos
        this.planetVideos.forEach(video => {
            this.load.video(video, `assets/video/${video}.mp4`);
        });
    }

    init() {
        // Load persisted data
        this.loadSavedData();
    }

    create() {
        console.log('CommandCenterScene create');
        const { width, height } = this.scale;

        // Add the command center background image
        const bg = this.add.image(width/2, height/2, 'commandCenterBg');
        
        // Scale the background to cover the screen while maintaining aspect ratio
        const scaleX = width / bg.width;
        const scaleY = height / bg.height;
        const scale = Math.max(scaleX, scaleY);
        bg.setScale(scale);
        
        // Define both ratios in one object
        const VIDEO_RATIO = {
        width: 0.06,
        height: 0.10,
        scale: 0.87
        };

        // Add the planet video in the center of the screen with 4:3 aspect ratio
        // Size it to about 1/4 of the screen
        const videoWidth = width * VIDEO_RATIO.width * VIDEO_RATIO.scale; // 1/2 of screen width
        const videoHeight = height * VIDEO_RATIO.height * VIDEO_RATIO.scale; // 4:3 aspect ratio
        
        // Select a random planet video
        const randomVideo = Phaser.Math.RND.pick(this.planetVideos);
        
        this.planetVideo = this.add.video(width/2.2, height/2.55, randomVideo);
        this.planetVideo.setDisplaySize(videoWidth, videoHeight);
        this.planetVideo.play(true); // true enables looping
        
        // Create command center panel layout
        this.createCommandCenterUI(width, height);

        // Emit the ready event for React bridge
        EventBus.emit('current-scene-ready', this);
    }

    createCommandCenterUI(width: number, height: number) {

        // Add ship image inside view screen
        const shipImage = this.add.image(width * 0.2, height * 0.37, 'ship')
            .setScale(2);
        

        // Ship info text
        this.add.text(width * 0.2, height * 0.45, 'SALVAGE VESSEL', {
            fontFamily: '"Roboto Mono", "Courier New", monospace',
            fontSize: '24px',
            color: '#ffaa00'
        }).setOrigin(0.5);
        
        // Ship stats
        this.add.text(width * 0.15, height * 0.5, [
            `SHIP LEVEL: ${this.shipLevel}`,
            'THRUST: STANDARD',
            'TETHER: BASIC',
            'HULL: REINFORCED',
            'CAPACITY: STANDARD'
        ].join('\n'), {
            fontFamily: '"Roboto Mono", "Courier New", monospace',
            fontSize: '18px',
            color: '#ffffff',
            align: 'left'
        });
        
        // SpaceBucks display
        this.add.text(width * 0.65, height * 0.61, `SPACEBUCKS: ${this.totalSpaceBucks}`, {
            fontFamily: '"Roboto Mono", "Courier New", monospace',
            fontSize: '28px',
            color: '#ffff00',
            stroke: '#000',
            strokeThickness: 1
        }).setOrigin(0.5);
        
        // Mission briefing text
        this.add.text(width * 0.46, height * 0.7, 'MISSION BRIEFING', {
            fontFamily: '"Roboto Mono", "Courier New", monospace',
            fontSize: '24px',
            color: '#33aaff'
        }).setOrigin(0.5);
        
        this.add.text(width * 0.46, height * 0.77, [
            'ANOMALY: DESTROYED',
            'OBJECTIVE: SALVAGE COLLECTION',
            'THREAT LEVEL: LOW',
            'ESTIMATED SALVAGE VALUE: MEDIUM',
            'READY FOR DEPLOYMENT'
        ].join('\n'), {
            fontFamily: '"Roboto Mono", "Courier New", monospace',
            fontSize: '18px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // Create action buttons
        // Start Haul button
        const startHaulButton = this.add.rectangle(width * 0.15, height * 0.85, 400, 100, 0x005500)
            .setStrokeStyle(2, 0x00ff00)
            .setInteractive({ useHandCursor: true });
            
        this.add.text(width * 0.15, height * 0.85, 'START HAUL', {
            fontFamily: '"Roboto Mono", "Courier New", monospace',
            fontSize: '24px',
            color: '#00ff00'
        }).setOrigin(0.5);
        
        // Return to Base button
        const returnButton = this.add.rectangle(width * 0.85, height * 0.85, 400, 100, 0x550000)
            .setStrokeStyle(2, 0xff0000)
            .setInteractive({ useHandCursor: true });
            
        this.add.text(width * 0.85, height * 0.85, 'RETURN TO BASE', {
            fontFamily: '"Roboto Mono", "Courier New", monospace',
            fontSize: '24px',
            color: '#ff0000'
        }).setOrigin(0.5);
        
        // Add button events
        startHaulButton.on('pointerdown', () => {
            console.log('Starting new haul');
            this.scene.start('IntroVideoScene');
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