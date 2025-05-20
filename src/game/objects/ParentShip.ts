import Phaser from 'phaser';
import { ParentShipConfig } from '../config/GameConfig'; // Import config
// import Salvage from './Salvage'; // No longer needed here

// Parent Ship (Deposit Point)
export default class ParentShip extends Phaser.Physics.Arcade.Image { // Use Image for non-animated object
    private depositZone: Phaser.GameObjects.Graphics;
    private depositIndicator: Phaser.GameObjects.Sprite;
    private pulseTimer: Phaser.Time.TimerEvent;
    private depositText: Phaser.GameObjects.Text;
    private depositZonePosition: { x: number, y: number };

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, ParentShipConfig.texture);
        scene.add.existing(this);
        scene.physics.add.existing(this, true); // Add as static body

        // Ensure it's immovable and doesn't react to gravity (already static)
        // this.setImmovable(true); // setImmovable is for dynamic bodies
        // if (this.body) {
        //     (this.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
        // }

        console.log(`ParentShip created at (${x}, ${y}) using texture: ${ParentShipConfig.texture}`);
        
        // Calculate deposit zone position based on offset config
        this.depositZonePosition = {
            x: this.x + (ParentShipConfig.depositZoneOffset?.x || 0),
            y: this.y + (ParentShipConfig.depositZoneOffset?.y || 0)
        };
        
        // Create a deposit zone visualization
        this.createDepositZone();
        
        // Add pulsing deposit indicator that says "DEPOSIT HERE"
        this.createDepositIndicator();
    }
    
    private createDepositZone() {
        // Create a circular deposit zone next to the ship
        this.depositZone = this.scene.add.graphics();
        this.depositZone.setDepth(-1); // Below ship
        
        // Draw the deposit zone circle
        const radius = ParentShipConfig.depositZoneRadius || 120;
        this.depositZone.lineStyle(4, 0x00ff00, 0.7); // Green outline
        this.depositZone.fillStyle(0x00ff00, 0.2); // Semitransparent green fill
        this.depositZone.strokeCircle(0, 0, radius);
        this.depositZone.fillCircle(0, 0, radius);
        
        // Position at the offset location
        this.depositZone.x = this.depositZonePosition.x;
        this.depositZone.y = this.depositZonePosition.y;
        
        // Add "DEPOSIT" text
        this.depositText = this.scene.add.text(
            this.depositZonePosition.x, 
            this.depositZonePosition.y + 200, 
            'DEPOSIT ZONE', 
            {
                fontSize: '24px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4,
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);
        /*
        // Add connecting line between ship and deposit zone
        const line = this.scene.add.graphics();
        line.lineStyle(3, 0x00ff00, 0.6);
        line.beginPath();
        line.moveTo(this.x, this.y);
        line.lineTo(this.depositZonePosition.x, this.depositZonePosition.y);
        line.strokePath();
        */
    }
    
    private createDepositIndicator() {
        // Check if the texture exists, create if not
        if (!this.scene.textures.exists('deposit-arrow')) {
            // Create a temporary graphics object
            const tempGraphics = this.scene.add.graphics();
            
            // Draw the arrow
            tempGraphics.fillStyle(0xffff00, 1);
            tempGraphics.fillTriangle(0, -30, -20, 0, 20, 0);
            tempGraphics.fillRect(-15, 0, 30, 20);
            
            // Create the texture from the graphics
            try {
                // Create a render texture first
                const renderTexture = this.scene.add.renderTexture(0, 0, 40, 50);
                
                // Draw the graphics to the render texture
                renderTexture.draw(tempGraphics, 20, 40);
                
                // Generate a texture from the render texture
                renderTexture.saveTexture('deposit-arrow');
                
                // Clean up
                renderTexture.destroy();
                tempGraphics.destroy();
                
                console.log('Created deposit-arrow texture successfully');
            } catch (e) {
                console.error('Failed to create deposit-arrow texture:', e);
            }
        }
        
        // Now create the sprite with the generated texture
        this.depositIndicator = this.scene.add.sprite(
            this.depositZonePosition.x, 
            this.depositZonePosition.y + 150, 
            'deposit-arrow'
        );
        
        // Create a pulsing effect
        this.scene.tweens.add({
            targets: this.depositIndicator,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Create a color pulsing effect for the deposit zone
        this.pulseTimer = this.scene.time.addEvent({
            delay: 1500,
            callback: this.pulseDepositZone,
            callbackScope: this,
            loop: true
        });
    }
    
    private pulseDepositZone() {
        // Pulse the deposit zone between colors
        this.scene.tweens.add({
            targets: this.depositZone,
            alpha: 0.5,
            duration: 750,
            yoyo: true,
            onUpdate: () => {
                // Redraw with new alpha
                this.depositZone.clear();
                const radius = ParentShipConfig.depositZoneRadius || 120;
                this.depositZone.lineStyle(4, 0x00ff00, 0.7);
                this.depositZone.fillStyle(0x00ff00, 0.2 + 0.3 * this.depositZone.alpha);
                this.depositZone.strokeCircle(0, 0, radius);
                this.depositZone.fillCircle(0, 0, radius);
            }
        });
    }
    
    // Method to show visual feedback when a tethered salvage enters the zone
    showDepositReady() {
        // Change color to indicate ready to deposit
        this.depositZone.clear();
        const radius = ParentShipConfig.depositZoneRadius || 120;
        this.depositZone.lineStyle(6, 0xffff00, 0.9); // Thicker, bright yellow
        this.depositZone.fillStyle(0xffff00, 0.4); // Brighter fill
        this.depositZone.strokeCircle(0, 0, radius);
        this.depositZone.fillCircle(0, 0, radius);
        
        // Pulse the deposit text for attention
        if (this.depositText) {
            this.scene.tweens.add({
                targets: this.depositText,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 150,
                yoyo: true,
                repeat: 3
            });
            
            // Change text to indicate ready state
            this.depositText.setText('READY TO DEPOSIT!');
            this.depositText.setStyle({ 
                fontSize: '28px',
                color: '#ffff00',
                stroke: '#000000',
                strokeThickness: 5,
                fontStyle: 'bold'
            });
        }
        
        // Add a particle burst for more visual emphasis
        if (this.scene.add.particles) {
            try {
                const particles = this.scene.add.particles(this.depositZonePosition.x, this.depositZonePosition.y, 'flare', {
                    speed: 100,
                    lifespan: 300,
                    quantity: 10,
                    scale: { start: 0.4, end: 0.1 },
                    emitting: false,
                    emitZone: { type: 'edge', source: new Phaser.Geom.Circle(0, 0, radius * 0.8), quantity: 10 }
                });
                
                particles.explode(20);
                
                // Clean up particles after a short time
                this.scene.time.delayedCall(500, () => {
                    particles.destroy();
                });
            } catch (e) {
                // Fallback if particles aren't available
                console.log('Particle system not available, using fallback visuals');
                
                // Create a flash effect instead
                const flash = this.scene.add.graphics();
                flash.fillStyle(0xffff00, 0.3);
                flash.fillCircle(this.depositZonePosition.x, this.depositZonePosition.y, radius * 1.2);
                
                // Fade out and destroy
                this.scene.tweens.add({
                    targets: flash,
                    alpha: 0,
                    duration: 300,
                    onComplete: () => flash.destroy()
                });
            }
        }
        
        // Reset after a short time
        this.scene.time.delayedCall(1000, () => {
            this.depositZone.clear();
            this.depositZone.lineStyle(4, 0x00ff00, 0.7);
            this.depositZone.fillStyle(0x00ff00, 0.2);
            this.depositZone.strokeCircle(0, 0, radius);
            this.depositZone.fillCircle(0, 0, radius);
            
            // Reset text
            if (this.depositText) {
                this.depositText.setText('DEPOSIT ZONE');
                this.depositText.setStyle({ 
                    fontSize: '24px',
                    color: '#ffffff',
                    stroke: '#000000',
                    strokeThickness: 4,
                    fontStyle: 'bold'
                });
            }
        });
    }
    
    // Called when successfully depositing salvage
    showDepositSuccess() {
        // Flash the deposit zone with bright cyan
        const radius = ParentShipConfig.depositZoneRadius || 120;
        
        // Multiple flashes for more impact
        for (let i = 0; i < 3; i++) {
            this.scene.time.delayedCall(i * 200, () => {
                this.depositZone.clear();
                this.depositZone.lineStyle(8, 0x00ffff, 0.9); // Thicker, bright cyan
                this.depositZone.fillStyle(0x00ffff, 0.5); // Brighter fill
                this.depositZone.strokeCircle(0, 0, radius);
                this.depositZone.fillCircle(0, 0, radius);
                
                // Reset after flash
                this.scene.time.delayedCall(150, () => {
                    this.depositZone.clear();
                    this.depositZone.lineStyle(4, 0x00ff00, 0.7);
                    this.depositZone.fillStyle(0x00ff00, 0.2);
                    this.depositZone.strokeCircle(0, 0, radius);
                    this.depositZone.fillCircle(0, 0, radius);
                });
            });
        }
        
        // Show success text
        if (this.depositText) {
            this.depositText.setText('DEPOSIT SUCCESS!');
            this.depositText.setStyle({ 
                fontSize: '32px',
                color: '#00ffff',
                stroke: '#000000',
                strokeThickness: 6,
                fontStyle: 'bold'
            });
            
            // Add text animation
            this.scene.tweens.add({
                targets: this.depositText,
                scaleX: 1.5,
                scaleY: 1.5,
                duration: 300,
                yoyo: true,
                ease: 'Bounce.Out',
                onComplete: () => {
                    // Reset text after animation
                    this.scene.time.delayedCall(800, () => {
                        this.depositText.setText('DEPOSIT ZONE');
                        this.depositText.setStyle({ 
                            fontSize: '24px',
                            color: '#ffffff',
                            stroke: '#000000',
                            strokeThickness: 4,
                            fontStyle: 'bold'
                        });
                    });
                }
            });
        }
        
        // Add particle effect for success
        if (this.scene.add.particles) {
            try {
                // Create explosion-like particle effect
                const particles = this.scene.add.particles(this.depositZonePosition.x, this.depositZonePosition.y, 'flare', {
                    speed: { min: 50, max: 200 },
                    lifespan: 800,
                    quantity: 30,
                    scale: { start: 0.6, end: 0 },
                    emitting: false,
                    emitZone: { type: 'random', source: new Phaser.Geom.Circle(0, 0, radius * 0.5), quantity: 30 }
                });
                
                particles.explode(50);
                
                // Clean up particles after effect completes
                this.scene.time.delayedCall(1000, () => {
                    particles.destroy();
                });
            } catch (e) {
                // Fallback if particles aren't available
                console.log('Particle system not available for success effect, using fallback');
                
                // Create expanding circles instead
                for (let i = 0; i < 3; i++) {
                    this.scene.time.delayedCall(i * 200, () => {
                        const ring = this.scene.add.graphics();
                        ring.lineStyle(6 - i * 2, 0x00ffff, 0.8 - i * 0.2);
                        ring.strokeCircle(this.depositZonePosition.x, this.depositZonePosition.y, radius * 0.5);
                        
                        // Expand and fade
                        this.scene.tweens.add({
                            targets: ring,
                            alpha: 0,
                            scale: 2,
                            duration: 600,
                            onComplete: () => ring.destroy()
                        });
                    });
                }
            }
        }
    }

    // Removed depositSalvage - Handled in GameScene collision callback
    // depositSalvage(salvage: Salvage): number {
    //     const value = salvage.value;
    //     console.log(`Deposited salvage worth ${value} (placeholder)`);
    //     // Potentially trigger animations or effects
    //     // salvage.destroy(); // Assuming salvage is destroyed after deposit
    //     return value;
    // }

    // Get the position of the deposit zone for collision detection
    getDepositZonePosition(): { x: number, y: number } {
        return this.depositZonePosition;
    }
} 