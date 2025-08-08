import Phaser from 'phaser';
import { EventBus } from '../EventBus';
import { loadProgress, purchaseUpgrade, getUpgradeCost, Ships, purchaseShip, getCurrentLevel } from '../config/MetaGame';

export default class CommandCenterScene extends Phaser.Scene {
    private totalSpaceBucks: number = 0;
    private shipLevel: number = 1;
    private planetVideo!: Phaser.GameObjects.Video;
    private planetVideos: string[] = ['Planet1991', 'Planet4626', 'Planet8631'];
    private selectedShipId: string = 'scout';

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
        const shipImage = this.add.image(width * 0.2, height * 0.33, 'ship')
            .setScale(2);
        

        // Ship info text
        this.add.text(width * 0.2, height * 0.41, 'SALVAGE VESSEL', {
            fontFamily: '"Roboto Mono", "Courier New", monospace',
            fontSize: '24px',
            color: '#ffaa00'
        }).setOrigin(0.5);
        
        // Ship stats & bucks
        const progress = loadProgress();
        const upgrades = progress.upgrades;
        const statsText = this.add.text(width * 0.15, height * 0.5, [
            `SHIP: ${progress.selectedShipId.toUpperCase()}`,
            `THRUSTERS: Lv.${upgrades.thrusters}`,
            `TETHER STABILITY: Lv.${upgrades.tether}`,
            `HULL: Lv.${upgrades.hull}`,
        ].join('\n'), {
            fontFamily: '"Roboto Mono", "Courier New", monospace',
            fontSize: '18px',
            color: '#ffffff',
            align: 'left'
        });
        
        // SpaceBucks display
        const bucksText = this.add.text(width * 0.65, height * 0.61, `SPACEBUCKS: ${this.totalSpaceBucks}`, {
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
        
        const currentLevel = getCurrentLevel();
        this.add.text(width * 0.46, height * 0.77, [
            `SECTOR: ${currentLevel.name}`,
            'OBJECTIVE: SALVAGE COLLECTION',
            'THREAT LEVEL: RISING',
            `EST. SALVAGE COUNT: ${currentLevel.salvageSpawnCount}`,
            'READY FOR DEPLOYMENT'
        ].join('\n'), {
            fontFamily: '"Roboto Mono", "Courier New", monospace',
            fontSize: '18px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // Create action buttons
        // Start Haul button
        const startHaulButton = this.add.rectangle(width * 0.85, height * 0.85, 400, 100, 0x005500)
            .setStrokeStyle(2, 0x00ff00)
            .setInteractive({ useHandCursor: true });
            
        this.add.text(width * 0.85, height * 0.85, 'START HAUL', {
            fontFamily: '"Roboto Mono", "Courier New", monospace',
            fontSize: '24px',
            color: '#00ff00'
        }).setOrigin(0.5);
        
        // Return to Base button
        const returnButton = this.add.rectangle(width * 0.15, height * 0.85, 400, 100, 0x550000)
            .setStrokeStyle(2, 0xff0000)
            .setInteractive({ useHandCursor: true });
            
        this.add.text(width * 0.15, height * 0.85, 'RETURN TO BASE', {
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

        // Simple Upgrades UI (3 buttons): thrusters, tether, hull

        const makeUpgradeButton = (label: string, x: number, y: number, key: 'thrusters'|'tether'|'hull') => {
            const nextLevel = (upgrades as any)[key] + 1;
            const cost = getUpgradeCost(key, nextLevel);
            const rect = this.add.rectangle(x, y, 260, 64, 0x002244).setStrokeStyle(2, 0x33ccff).setInteractive({ useHandCursor: true });
            const txt = this.add.text(x, y, `${label} (${nextLevel}) - ${cost}`, {
                fontFamily: '"Roboto Mono", "Courier New", monospace',
                fontSize: '16px',
                color: '#a9f7ff'
            }).setOrigin(0.5);
            rect.on('pointerdown', () => {
                const res = purchaseUpgrade(key);
                if (res.ok) {
                    // Refresh
                    this.totalSpaceBucks = res.newProgress.totalSpaceBucks;
                    bucksText.setText(`SPACEBUCKS: ${this.totalSpaceBucks}`);
                    statsText.setText([
                        `SHIP: ${res.newProgress.selectedShipId.toUpperCase()}`,
                        `THRUSTERS: Lv.${res.newProgress.upgrades.thrusters}`,
                        `TETHER STABILITY: Lv.${res.newProgress.upgrades.tether}`,
                        `HULL: Lv.${res.newProgress.upgrades.hull}`,
                    ].join('\n'));
                    // Update button label to next tier cost
                    const next = (res.newProgress.upgrades as any)[key] + 1;
                    txt.setText(`${label} (${next}) - ${getUpgradeCost(key, next)}`);
                }
            });
        };
        makeUpgradeButton('UPGRADE THRUSTERS', width * 0.69,height * 0.34, 'thrusters');
        makeUpgradeButton('UPGRADE TETHER', width * 0.69,height * 0.42, 'tether');
        makeUpgradeButton('UPGRADE HULL', width * 0.69,height * 0.50, 'hull');

        // Simple Ship select/purchase (cycle through)
        const shipLabel = this.add.text(width * 0.2, height * 0.43, 'SHIP SELECT', {
            fontFamily: '"Roboto Mono", "Courier New", monospace',
            fontSize: '18px', color: '#ffaa00'
        }).setOrigin(0.5);
        const shipIds = Object.keys(Ships);
        let idx = Math.max(0, shipIds.indexOf(progress.selectedShipId));
        const shipInfo = this.add.text(width * 0.2, height * 0.46, '', {
            fontFamily: '"Roboto Mono", "Courier New", monospace',
            fontSize: '16px', color: '#ffffff', align: 'center'
        }).setOrigin(0.5);
        const refreshShipInfo = () => {
            const id = shipIds[idx];
            const s = Ships[id];
            const owned = loadProgress().ownedShips.includes(id);
            shipInfo.setText(`${s.name}\n${s.description}\n${owned ? 'OWNED' : 'Cost: ' + s.cost}`);
        };
        refreshShipInfo();
        const prevBtn = this.add.text(width * 0.14, height * 0.6, '<', { font: '24px monospace', color: '#ffffff' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        const nextBtn = this.add.text(width * 0.26, height * 0.6, '>', { font: '24px monospace', color: '#ffffff' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        const selectBtn = this.add.text(width * 0.2, height * 0.6, '[ Select / Buy ]', { font: '18px monospace', color: '#00ff00', backgroundColor: '#222', padding: { left: 8, right: 8, top: 4, bottom: 4 } }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        prevBtn.on('pointerdown', () => { idx = (idx - 1 + shipIds.length) % shipIds.length; refreshShipInfo(); });
        nextBtn.on('pointerdown', () => { idx = (idx + 1) % shipIds.length; refreshShipInfo(); });
        selectBtn.on('pointerdown', () => {
            const id = shipIds[idx];
            const res = purchaseShip(id);
            if (res.ok) {
                this.totalSpaceBucks = res.newProgress.totalSpaceBucks;
                bucksText.setText(`SPACEBUCKS: ${this.totalSpaceBucks}`);
                statsText.setText([
                    `SHIP: ${res.newProgress.selectedShipId.toUpperCase()}`,
                    `THRUSTERS: Lv.${res.newProgress.upgrades.thrusters}`,
                    `TETHER STABILITY: Lv.${res.newProgress.upgrades.tether}`,
                    `HULL: Lv.${res.newProgress.hull}`,
                ].join('\n'));
                refreshShipInfo();
            }
        });
    }
    
    // Helper method to load total SpaceBucks from localStorage
    loadSavedData() {
        const p = loadProgress();
        this.totalSpaceBucks = p.totalSpaceBucks;
        this.selectedShipId = p.selectedShipId;
        // Keep shipLevel concept for UI legacy
        this.shipLevel = Math.max(p.upgrades.thrusters, p.upgrades.tether, p.upgrades.hull) + 1;
        console.log(`Loaded progress: bucks=${this.totalSpaceBucks}, ship=${this.selectedShipId}`);
    }
} 