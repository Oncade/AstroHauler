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
    private visualFeedback: Phaser.GameObjects.Container; // Container for visual feedback elements
    private stretchIndicator: Phaser.GameObjects.Graphics; // Visual indicator for tether stretch
    private salvageHighlight: Phaser.GameObjects.Graphics; // Highlight around salvage

    constructor(scene: Phaser.Scene, player: Player, salvage: Salvage) {
        this.scene = scene;
        this.player = player;
        this.salvage = salvage;

        // Notify player and salvage
        this.player.attachTether(this.salvage);
        this.salvage.startTether(this.player);

        // Create main tether line graphics
        this.graphics = scene.add.graphics({ lineStyle: { width: TetherConfig.lineWidth, color: TetherConfig.lineColor } });
        
        // Create enhanced visual feedback for tether
        this.createVisualFeedback();
        
        // Initialize physics vectors
        this.springForce = new Phaser.Math.Vector2(0, 0);
        this.tempVec = new Phaser.Math.Vector2(0, 0);

        console.log('Tether created between Player and Salvage');
    }
    
    // Create enhanced visual feedback elements for better touch control experience
    createVisualFeedback() {
        // Create container for all visual feedback elements
        this.visualFeedback = this.scene.add.container(0, 0);
        
        // Create stretch indicator to show tether tension
        this.stretchIndicator = this.scene.add.graphics();
        this.visualFeedback.add(this.stretchIndicator);
        
        // Create highlight around salvage to make it clear which object is tethered
        this.salvageHighlight = this.scene.add.graphics();
        this.visualFeedback.add(this.salvageHighlight);
        
        // Update salvage highlight
        this.updateSalvageHighlight();
        
        // Add pulse animation to the salvage highlight
        this.scene.tweens.add({
            targets: this.salvageHighlight,
            alpha: { from: 0.8, to: 0.4 },
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    // Update the highlight around the tethered salvage
    updateSalvageHighlight() {
        this.salvageHighlight.clear();
        
        // Draw a circle around the salvage with a glowing effect
        const radius = this.salvage.width * 0.6;
        
        // Main highlight (outer glow)
        this.salvageHighlight.lineStyle(3, 0x00ff00, 0.6);
        this.salvageHighlight.strokeCircle(this.salvage.x, this.salvage.y, radius);
        
        // Inner highlight
        this.salvageHighlight.lineStyle(2, 0xffffff, 0.4);
        this.salvageHighlight.strokeCircle(this.salvage.x, this.salvage.y, radius * 0.85);
    }
    
    // Update the stretch indicator to show tether tension
    updateStretchIndicator(stretchFactor: number) {
        this.stretchIndicator.clear();
        
        // Only show if there's significant stretch
        if (stretchFactor <= 0) return;
        
        // Calculate middle point of tether
        const midX = (this.player.x + this.salvage.x) / 2;
        const midY = (this.player.y + this.salvage.y) / 2;
        
        // Calculate perpendicular vector for indicator position
        const dirX = this.salvage.x - this.player.x;
        const dirY = this.salvage.y - this.player.y;
        const length = Math.sqrt(dirX * dirX + dirY * dirY);
        
        if (length === 0) return;
        
        // Normalize direction vector and create perpendicular vector
        const normX = dirX / length;
        const normY = dirY / length;
        const perpX = -normY;
        const perpY = normX;
        
        // Calculate indicator size based on stretch
        const indicatorSize = stretchFactor * 10; // Scale for visibility
        
        // Choose color based on stretch factor
        let color = 0x00ff00; // Green for low stretch
        if (stretchFactor > 0.5) {
            color = 0xffff00; // Yellow for medium stretch
        }
        if (stretchFactor > 0.8) {
            color = 0xff0000; // Red for high stretch
        }
        
        // Draw stretch indicator
        this.stretchIndicator.lineStyle(3, color, 0.8);
        this.stretchIndicator.beginPath();
        this.stretchIndicator.moveTo(midX + perpX * indicatorSize, midY + perpY * indicatorSize);
        this.stretchIndicator.lineTo(midX - perpX * indicatorSize, midY - perpY * indicatorSize);
        this.stretchIndicator.closePath();
        this.stretchIndicator.strokePath();
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
        
        // Update salvage highlight position
        this.updateSalvageHighlight();

        // --- Apply Simulated Spring Force (Arcade Physics) ---
        const currentLength = Phaser.Math.Distance.BetweenPoints(this.player, this.salvage);
        const extension = currentLength - TetherConfig.maxLength;
        
        // Calculate stretch factor for visual feedback (0-1)
        const stretchFactor = extension > 0 ? Math.min(extension / (TetherConfig.maxLength * 0.5), 1) : 0;
        this.updateStretchIndicator(stretchFactor);

        if (extension > 0) { // Only apply force if tether is stretched beyond maxLength
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
            // Scale force by inverse mass (or apply directly if physics engine handles it)
            // Arcade physics uses acceleration, so scaling by delta and mass is appropriate
            const dt = delta / 1000; // Convert delta ms to seconds

            if (this.salvage.body instanceof Phaser.Physics.Arcade.Body) {
                const salvageAccel = totalForce.clone().scale(1 / this.salvage.mass); // F=ma -> a=F/m
                // Add to existing acceleration rather than replacing it
                this.salvage.body.acceleration.add(salvageAccel);
            }
            if (this.player.body instanceof Phaser.Physics.Arcade.Body) {
                const playerForce = totalForce.clone().scale(-1); // Equal and opposite force
                // Assuming player mass is 1 for now, or get it from config/player properties
                const playerAccel = playerForce.scale(1); // Player mass assumed 1
                // Add to existing acceleration rather than replacing it
                this.player.body.acceleration.add(playerAccel);
            }
        }
        // When extension <= 0, do nothing - no forces are applied when the tether is not stretched
        // This ensures the tether only acts as a constraint when stretched, not as a constant force
    }

    getAttachedSalvage(): Salvage {
        return this.salvage;
    }

    destroy() {
        this.graphics.destroy();
        this.visualFeedback.destroy();
        
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