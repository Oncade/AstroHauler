import Phaser from 'phaser';
import { EventBus } from '../EventBus';
import { loadProgress, purchaseUpgrade, getUpgradeCost, Ships, purchaseShip, getCurrentLevel } from '../config/MetaGame';

export default class CommandCenterScene extends Phaser.Scene {
    private totalSpaceBucks: number = 0;
    private shipLevel: number = 1;
    private selectedShipId: string = 'scout';
    private shipIds: string[] = [];
    private shipIndex: number = 0;

    // React intent handlers (stored for cleanup)
    private onStartHaul?: () => void;
    private onReturnToMenu?: () => void;
    private onUpgrade?: (p: { key: 'thrusters'|'tether'|'hull' }) => void;
    private onShipPrev?: () => void;
    private onShipNext?: () => void;
    private onShipSelect?: () => void;
    private onRequestState?: () => void;

    constructor() {
        super('CommandCenterScene');
    }

    preload() {
        // React overlay handles visuals for this scene; no UI assets are preloaded here.
    }

    init() {
        // Load persisted data
        this.loadSavedData();
    }

    create() {
        console.log('CommandCenterScene create');
        
        // Initialize state
        this.loadSavedData();
        this.shipIds = Object.keys(Ships);
        this.shipIndex = Math.max(0, this.shipIds.indexOf(this.selectedShipId));

        // Register EventBus listeners for React overlay intents
        this.onStartHaul = () => {
            this.scene.start('IntroVideoScene');
            this.scene.stop('CommandCenterScene');
        };
        this.onReturnToMenu = () => {
            this.scene.start('MainMenuScene');
            this.scene.stop('CommandCenterScene');
        };
        this.onUpgrade = (p: { key: 'thrusters'|'tether'|'hull' }) => {
            const res = purchaseUpgrade(p.key);
            if (res.ok) {
                this.totalSpaceBucks = res.newProgress.totalSpaceBucks;
                this.selectedShipId = res.newProgress.selectedShipId;
                EventBus.emit('spacebucks-updated', this.totalSpaceBucks);
                this.emitCommandCenterState();
            }
        };
        this.onShipPrev = () => { this.shipIndex = (this.shipIndex - 1 + this.shipIds.length) % this.shipIds.length; this.emitCommandCenterState(); };
        this.onShipNext = () => { this.shipIndex = (this.shipIndex + 1) % this.shipIds.length; this.emitCommandCenterState(); };
        this.onShipSelect = () => {
            const id = this.shipIds[this.shipIndex];
            const res = purchaseShip(id);
            if (res.ok) {
                this.totalSpaceBucks = res.newProgress.totalSpaceBucks;
                this.selectedShipId = res.newProgress.selectedShipId;
                EventBus.emit('spacebucks-updated', this.totalSpaceBucks);
                this.emitCommandCenterState();
            }
        };
        this.onRequestState = () => this.emitCommandCenterState();

        EventBus.on('ui-command-start-haul', this.onStartHaul);
        EventBus.on('ui-command-return', this.onReturnToMenu);
        EventBus.on('ui-command-upgrade', this.onUpgrade);
        EventBus.on('ui-command-ship-prev', this.onShipPrev);
        EventBus.on('ui-command-ship-next', this.onShipNext);
        EventBus.on('ui-command-ship-select', this.onShipSelect);
        EventBus.on('ui-command-request-state', this.onRequestState);

        // Ensure cleanup
        this.events.once('shutdown', () => this.shutdown());

        // Bridge ready and initial state
        EventBus.emit('current-scene-ready', this);
        this.emitCommandCenterState();
    }

    private emitCommandCenterState() {
        const p = loadProgress();
        const upgrades = p.upgrades;
        const nextCosts = {
            thrusters: getUpgradeCost('thrusters', upgrades.thrusters + 1),
            tether: getUpgradeCost('tether', upgrades.tether + 1),
            hull: getUpgradeCost('hull', upgrades.hull + 1)
        };
        const level = getCurrentLevel();
        const currentShipId = this.shipIds[this.shipIndex] || p.selectedShipId;
        const ship = Ships[currentShipId];
        const owned = p.ownedShips.includes(currentShipId);

        EventBus.emit('commandcenter-state-changed', {
            totalSpaceBucks: p.totalSpaceBucks,
            upgrades,
            nextCosts,
            selectedShipId: p.selectedShipId,
            shipIndex: this.shipIndex,
            shipCount: this.shipIds.length,
            ship: {
                id: currentShipId,
                name: ship.name,
                description: ship.description,
                cost: ship.cost,
                owned
            },
            level: {
                name: level.name,
                salvageSpawnCount: level.salvageSpawnCount
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

    shutdown() {
        if (this.onStartHaul) { EventBus.off('ui-command-start-haul', this.onStartHaul); this.onStartHaul = undefined; }
        if (this.onReturnToMenu) { EventBus.off('ui-command-return', this.onReturnToMenu); this.onReturnToMenu = undefined; }
        if (this.onUpgrade) { EventBus.off('ui-command-upgrade', this.onUpgrade); this.onUpgrade = undefined; }
        if (this.onShipPrev) { EventBus.off('ui-command-ship-prev', this.onShipPrev); this.onShipPrev = undefined; }
        if (this.onShipNext) { EventBus.off('ui-command-ship-next', this.onShipNext); this.onShipNext = undefined; }
        if (this.onShipSelect) { EventBus.off('ui-command-ship-select', this.onShipSelect); this.onShipSelect = undefined; }
        if (this.onRequestState) { EventBus.off('ui-command-request-state', this.onRequestState); this.onRequestState = undefined; }
    }
} 