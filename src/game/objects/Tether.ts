import Phaser from 'phaser';
import Player from './Player';
import Salvage from './Salvage';
import { TetherConfig } from '../config/GameConfig';

// Simple tow rope implementation for tethering salvage to player
export default class Tether {
    private scene: Phaser.Scene;
    private player: Player;
    private salvage: Salvage;
    private graphics: Phaser.GameObjects.Graphics; // For drawing the line
    private visualFeedback: Phaser.GameObjects.Container; // Container for visual feedback elements
    private salvageHighlight: Phaser.GameObjects.Graphics; // Highlight around salvage
    private towDirection: Phaser.Math.Vector2; // Direction of towing

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
        
        // Initialize tow direction vector
        this.towDirection = new Phaser.Math.Vector2(0, 0);

        console.log('Tether created between Player and Salvage');
    }
    
    // Create enhanced visual feedback elements for better touch control experience
    createVisualFeedback() {
        // Create container for all visual feedback elements
        this.visualFeedback = this.scene.add.container(0, 0);
        
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
        
        // --- Implement Tow Rope Logic ---
        // Calculate current distance and direction
        const dx = this.player.x - this.salvage.x;
        const dy = this.player.y - this.salvage.y;
        const currentDistance = Math.sqrt(dx * dx + dy * dy);
        
        // Only apply towing force if the distance exceeds the max length
        if (currentDistance > TetherConfig.maxLength) {
            // Calculate tow direction (normalized)
            this.towDirection.set(dx, dy).normalize();
            
            // Calculate target position for salvage (player position minus maxLength in the direction)
            const targetX = this.player.x - (this.towDirection.x * TetherConfig.maxLength);
            const targetY = this.player.y - (this.towDirection.y * TetherConfig.maxLength);
            
            // Calculate vector from current position to target position
            const moveX = targetX - this.salvage.x;
            const moveY = targetY - this.salvage.y;
            
            // Convert delta to seconds for consistent movement
            const dt = delta / 1000;
            
            // Apply force to salvage to move it toward the target position
            if (this.salvage.body instanceof Phaser.Physics.Arcade.Body) {
                // Apply force scaled by salvage mass and damping for smoother movement
                const forceFactor = TetherConfig.towForce / this.salvage.mass;
                
                // Use velocity to move toward target position with damping
                const newVelX = moveX * forceFactor * dt;
                const newVelY = moveY * forceFactor * dt;
                
                // Apply damping to current velocity for smoother movement
                const currentVelX = this.salvage.body.velocity.x;
                const currentVelY = this.salvage.body.velocity.y;
                
                // Blend current and new velocity using damping factor
                this.salvage.body.velocity.x = (currentVelX * TetherConfig.towDamping) + 
                                              (newVelX * (1 - TetherConfig.towDamping));
                this.salvage.body.velocity.y = (currentVelY * TetherConfig.towDamping) + 
                                              (newVelY * (1 - TetherConfig.towDamping));
            }
        }
    }

    getAttachedSalvage(): Salvage {
        return this.salvage;
    }

    destroy() {
        this.graphics.destroy();
        this.visualFeedback.destroy();
        
        // Clear any lingering velocities or forces
        if (this.salvage.body instanceof Phaser.Physics.Arcade.Body) {
            // Let the salvage keep its momentum
        }
        
        // Ensure player and salvage know the tether is gone
        if (this.player.tetheredObject === this.salvage) {
            this.player.detachTether();
        }
        if (this.salvage.tetheredBy === this.player) {
            this.salvage.endTether();
        }
        console.log('Tether destroyed - salvage maintains its current velocity');
    }
} 