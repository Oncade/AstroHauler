import Phaser from 'phaser';
import { SalvageConfig } from '../config/GameConfig'; // Import config
import Player from './Player';

// Placeholder for Salvage items (Week 2)
export default class Salvage extends Phaser.Physics.Arcade.Sprite {
    public mass: number;
    public value: number;
    public isTethered: boolean = false;
    public tetheredBy: Player | null = null;
    private tetherIndicator: Phaser.GameObjects.Graphics;

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
        this.setDrag(0); // No drag in space
        this.setAngularDrag(0); // No angular drag in space

        // Add a little initial rotation and drift to bring objects to life
        const initialAngularVelocity = Phaser.Math.FloatBetween(-60, 60); // deg/sec
        this.setAngularVelocity(initialAngularVelocity);
        const driftSpeed = Phaser.Math.FloatBetween(10, 40);
        const driftAngle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        const driftVector = new Phaser.Math.Vector2();
        scene.physics.velocityFromRotation(driftAngle, driftSpeed, driftVector);
        if (this.body instanceof Phaser.Physics.Arcade.Body) {
            this.body.setVelocity(driftVector.x, driftVector.y);
        }

        // Tint based on mass (visual cue) - Simpler alpha approach
        const minAlpha = 0.5; // Min transparency for lightest items
        const maxAlpha = 1.0; // Max opacity for heaviest items
        const massRatio = Phaser.Math.Clamp((mass - SalvageConfig.minMass) / (SalvageConfig.maxMass - SalvageConfig.minMass), 0, 1);
        this.setAlpha(Phaser.Math.Linear(minAlpha, maxAlpha, massRatio));
        this.setTint(); // Clear any previous tint if needed
        
        // Create a tether indicator that will show when this salvage is tethered
        this.tetherIndicator = scene.add.graphics();
        this.tetherIndicator.setVisible(false);
        
        console.log(`Salvage created at (${x}, ${y}) Mass: ${this.mass.toFixed(2)}, Value: ${this.value}`);
    }

    // Called when tether is attached
    startTether(player: Player) {
        this.isTethered = true;
        this.tetheredBy = player;
        // Maintain zero drag for space physics
        this.setDrag(0);
        
        // Visual indicator for tethered state
        this.showTetherIndicator();
        
        console.log(`Salvage ${this.texture.key} tethered by player at position (${this.x}, ${this.y})`);
        // No need to reset acceleration - preserves existing momentum
    }

    // Called when tether is detached (e.g., deposited or broken)
    endTether() {
        this.isTethered = false;
        this.tetheredBy = null;
        // Set drag to 0 to maintain momentum in space
        this.setDrag(0);
        // Reset acceleration to ensure no residual forces
        if (this.body instanceof Phaser.Physics.Arcade.Body) {
            this.body.setAcceleration(0, 0);
        }
        
        // Hide the tether indicator
        this.hideTetherIndicator();
        
        console.log(`Salvage ${this.texture.key} tether ended at position (${this.x}, ${this.y})`);
    }
    
    // Show visual indication that this salvage is tethered
    showTetherIndicator() {
        this.tetherIndicator.clear();
        this.tetherIndicator.lineStyle(2, 0x00ffff, 0.8);
        this.tetherIndicator.strokeCircle(0, 0, this.width * 0.6);
        this.tetherIndicator.setPosition(this.x, this.y);
        this.tetherIndicator.setVisible(true);
        
        // Add a gentle pulse animation
        if (this.scene) {
            this.scene.tweens.add({
                targets: this.tetherIndicator,
                alpha: { from: 0.8, to: 0.3 },
                duration: 1000,
                yoyo: true,
                repeat: -1
            });
        }
    }
    
    // Hide the tether indicator
    hideTetherIndicator() {
        if (this.scene) {
            this.scene.tweens.killTweensOf(this.tetherIndicator);
        }
        this.tetherIndicator.setVisible(false);
    }

    // Override destroy to ensure endTether is called if needed
    destroy(fromScene?: boolean) {
        if (this.isTethered) {
            this.endTether();
        }
        
        // Clean up the tether indicator
        if (this.tetherIndicator) {
            this.tetherIndicator.destroy();
        }
        
        super.destroy(fromScene);
    }

    // Update tether indicator position to follow salvage
    preUpdate(time: number, delta: number) {
        super.preUpdate(time, delta);
        
        // Update tether indicator position
        if (this.tetherIndicator && this.isTethered) {
            this.tetherIndicator.setPosition(this.x, this.y);
        }
    }

    // Add methods related to salvage interaction, tethering, etc.
    collect() {
        console.log('Salvage collected (placeholder)');
        // Trigger tether attachment, scoring, etc.
        this.destroy(); // Simple removal for now
    }
} 