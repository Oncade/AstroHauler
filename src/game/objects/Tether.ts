import Phaser from 'phaser';
import Player from './Player';
import Salvage from './Salvage';

// Placeholder for the Tether System (Week 2)
export default class Tether {
    private scene: Phaser.Scene;
    private player: Player;
    private attachedSalvage: Salvage | null = null;
    private graphics: Phaser.GameObjects.Graphics; // For drawing the line
    // private constraint: any | null = null; // Arcade constraints are limited, placeholder
    private maxLength: number = 150; // Example max tether length

    constructor(scene: Phaser.Scene, player: Player) {
        this.scene = scene;
        this.player = player;
        this.graphics = scene.add.graphics({ lineStyle: { width: 2, color: 0x00ffff } });
        console.log('Tether system initialized');
    }

    attach(salvage: Salvage) {
        if (this.attachedSalvage) {
            console.log('Already tethered to something!');
            return; // Already towing something
        }
        this.attachedSalvage = salvage;
        console.log('Tether attached to salvage');

        // --- Placeholder Constraint Logic (Arcade Physics Example) ---
        // Arcade physics constraints are limited. Might need Matter.js or custom logic.
        // this.constraint = this.scene.physics.add.constraint(this.player, this.attachedSalvage, this.maxLength, 0.1); // stiffness

        // Ensure salvage physics properties are set for towing
        this.attachedSalvage.setCollideWorldBounds(true);
        this.attachedSalvage.setBounce(0.3);
        this.attachedSalvage.setDrag(80); // Increase drag when towed?
    }

    detach() {
        if (!this.attachedSalvage) {
            return;
        }
        console.log('Tether detached');
        // if (this.constraint) {
        //     this.scene.physics.world.removeConstraint(this.constraint);
        //     this.constraint = null;
        // }
        // Reset salvage physics?
        this.attachedSalvage = null;
    }

    update() {
        this.graphics.clear();

        if (this.attachedSalvage) {
            // Draw the tether line
            this.graphics.lineBetween(
                this.player.x,
                this.player.y,
                this.attachedSalvage.x,
                this.attachedSalvage.y
            );

            // --- Placeholder Tether Physics Logic ---
            // Apply spring-like forces or handle constraint updates here
            // For Arcade physics, might need manual force application:
            const distance = Phaser.Math.Distance.BetweenPoints(this.player, this.attachedSalvage);
            if (distance > this.maxLength && this.attachedSalvage.body) {
                // Simple pull force towards player (needs refinement)
                const angle = Phaser.Math.Angle.BetweenPoints(this.attachedSalvage, this.player);
                const forceMagnitude = (distance - this.maxLength) * 0.5; // Basic spring force
                this.scene.physics.velocityFromRotation(angle, forceMagnitude * this.attachedSalvage.mass, (this.attachedSalvage.body.velocity as Phaser.Math.Vector2));
                // Apply counter-force to player?
            }
        }
    }

    isAttached(): boolean {
        return this.attachedSalvage !== null;
    }

    destroy() {
        this.graphics.destroy();
        this.detach(); // Ensure cleanup
        console.log('Tether system destroyed');
    }
} 