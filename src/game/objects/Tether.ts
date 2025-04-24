import Phaser from 'phaser';
import Player from './Player';
import Salvage from './Salvage';
import { TetherConfig } from '../config/GameConfig';

// Placeholder for the Tether System (Week 2)
export default class Tether {
    private scene: Phaser.Scene;
    private player: Player;
    private salvage: Salvage;
    private graphics: Phaser.GameObjects.Graphics; // For drawing the line
    private springForce: Phaser.Math.Vector2; // To store calculated force
    private tempVec: Phaser.Math.Vector2; // Reusable vector for calculations

    constructor(scene: Phaser.Scene, player: Player, salvage: Salvage) {
        this.scene = scene;
        this.player = player;
        this.salvage = salvage;

        // Notify player and salvage
        this.player.attachTether(this.salvage);
        this.salvage.startTether(this.player);

        this.graphics = scene.add.graphics({ lineStyle: { width: TetherConfig.lineWidth, color: TetherConfig.lineColor } });
        this.springForce = new Phaser.Math.Vector2(0, 0);
        this.tempVec = new Phaser.Math.Vector2(0, 0);

        console.log('Tether created between Player and Salvage');
    }

    update(delta: number) {
        if (!this.player.body || !this.salvage.body) {
            console.warn('Tether update skipped: Player or Salvage body missing.');
            this.destroy(); // Destroy tether if objects are gone
            return;
        }

        // --- Draw Line ---
        this.graphics.clear();
        this.graphics.lineStyle(TetherConfig.lineWidth, TetherConfig.lineColor, 1.0);
        this.graphics.lineBetween(this.player.x, this.player.y, this.salvage.x, this.salvage.y);

        // --- Apply Simulated Spring Force (Arcade Physics) ---
        const currentLength = Phaser.Math.Distance.BetweenPoints(this.player, this.salvage);
        const extension = currentLength - TetherConfig.maxLength;

        if (extension > 0) { // Only apply force if tether is stretched
            // Calculate force direction (from salvage to player)
            this.tempVec.copy(this.player.body.center).subtract(this.salvage.body.center).normalize();

            // Calculate Spring Force (Hooke's Law: F = -k * x)
            // We use a positive constant and apply direction manually
            const forceMagnitude = extension * TetherConfig.springConstant;
            this.springForce.copy(this.tempVec).scale(forceMagnitude);

            // Apply Damping Force (F = -c * v)
            // Relative velocity along the tether direction
            const relativeVelocity = this.tempVec.clone().copy(this.player.body.velocity).subtract(this.salvage.body.velocity);
            const dampingFactor = relativeVelocity.dot(this.tempVec) * TetherConfig.damping;
            const dampingForce = this.tempVec.clone().scale(-dampingFactor);

            // Combine forces
            const totalForce = this.springForce.add(dampingForce);

            // Apply forces to bodies (scaled by delta for acceleration)
            // Scale force by inverse mass (or apply directly if mass handled by physics engine)
            // Arcade physics uses acceleration, so scaling by delta and mass is appropriate
            const dt = delta / 1000; // Convert delta ms to seconds

            if (this.salvage.body instanceof Phaser.Physics.Arcade.Body) {
                const salvageAccel = totalForce.clone().scale(1 / this.salvage.mass); // F=ma -> a=F/m
                this.salvage.body.acceleration.add(salvageAccel);
            }
            if (this.player.body instanceof Phaser.Physics.Arcade.Body) {
                const playerForce = totalForce.clone().scale(-1); // Equal and opposite force
                // Assuming player mass is 1 for now, or get it from config/player properties
                const playerAccel = playerForce.scale(1); // Player mass assumed 1
                this.player.body.acceleration.add(playerAccel);
            }
        } else {
             // Optional: Add some drag or minimal force if length < minLength?
        }
    }

    getAttachedSalvage(): Salvage {
        return this.salvage;
    }

    destroy() {
        this.graphics.destroy();
        
        // Clear any lingering forces before detachment
        if (this.player.body instanceof Phaser.Physics.Arcade.Body) {
            this.player.body.setAcceleration(0, 0);
        }
        
        if (this.salvage.body instanceof Phaser.Physics.Arcade.Body) {
            this.salvage.body.setAcceleration(0, 0);
        }
        
        // Ensure player and salvage know the tether is gone
        if (this.player.tetheredObject === this.salvage) {
            this.player.detachTether();
        }
        if (this.salvage.tetheredBy === this.player) {
            this.salvage.endTether();
        }
        console.log('Tether destroyed - objects maintain their current velocity');
    }
} 