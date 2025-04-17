import Phaser from 'phaser';
import { SalvageConfig } from '../config/GameConfig'; // Import config
import Player from './Player';

// Placeholder for Salvage items (Week 2)
export default class Salvage extends Phaser.Physics.Arcade.Sprite {
    public mass: number;
    public value: number;
    public isTethered: boolean = false;
    public tetheredBy: Player | null = null;

    constructor(scene: Phaser.Scene, x: number, y: number, mass: number, texture: string | Phaser.Textures.Texture = 'salvage_placeholder') {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.mass = mass;
        // Calculate value based on mass (or use a fixed value if needed)
        this.value = Math.round(SalvageConfig.defaultValue + (mass - SalvageConfig.defaultMass) * SalvageConfig.valuePerMass);
        if (this.value < 1) this.value = 1; // Ensure minimum value

        // Physics properties based on config and mass
        this.setCollideWorldBounds(true);
        this.setBounce(0.4); // More bounce than player?
        this.setMass(this.mass); // Set physics mass
        this.setDrag(SalvageConfig.baseDrag * this.mass); // Heavier items have more base drag
        this.setAngularDrag(150 * this.mass); // Heavier items resist rotation more

        // Tint based on mass (visual cue) - Simpler alpha approach
        const minAlpha = 0.5; // Min transparency for lightest items
        const maxAlpha = 1.0; // Max opacity for heaviest items
        const massRatio = Phaser.Math.Clamp((mass - SalvageConfig.minMass) / (SalvageConfig.maxMass - SalvageConfig.minMass), 0, 1);
        this.setAlpha(Phaser.Math.Linear(minAlpha, maxAlpha, massRatio));
        this.setTint(); // Clear any previous tint if needed

        console.log(`Salvage created at (${x}, ${y}) Mass: ${this.mass.toFixed(2)}, Value: ${this.value}`);
    }

    // Called when tether is attached
    startTether(player: Player) {
        this.isTethered = true;
        this.tetheredBy = player;
        const newDrag = SalvageConfig.baseDrag * this.mass * SalvageConfig.tetheredDragMultiplier;
        this.setDrag(newDrag);
        console.log(`Salvage tethered by player. New drag: ${newDrag}`);
    }

    // Called when tether is detached (e.g., deposited or broken)
    endTether() {
        this.isTethered = false;
        this.tetheredBy = null;
        this.setDrag(SalvageConfig.baseDrag * this.mass);
        console.log('Salvage tether ended.');
    }

    // Override destroy to ensure endTether is called if needed
    destroy(fromScene?: boolean) {
        if (this.isTethered) {
            this.endTether();
        }
        super.destroy(fromScene);
    }

    // Add preUpdate if specific per-frame logic is needed for salvage
    // preUpdate(time: number, delta: number) {
    //     super.preUpdate(time, delta);
    // }

    // Add methods related to salvage interaction, tethering, etc.
    collect() {
        console.log('Salvage collected (placeholder)');
        // Trigger tether attachment, scoring, etc.
        this.destroy(); // Simple removal for now
    }
} 