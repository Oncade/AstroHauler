import Phaser from 'phaser';
import { PlayerConfig, TetherConfig } from '../config/GameConfig'; // Import config
import Salvage from './Salvage';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    public isTethered: boolean = false;
    public tetheredObject: Salvage | null = null;
    private rangeIndicator: Phaser.GameObjects.Graphics; // Add range indicator graphic
    private thrusterParticles!: Phaser.GameObjects.Particles.ParticleEmitter;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, PlayerConfig.textureKey); // Use textureKey from config
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Physics properties from config
        this.setDrag(PlayerConfig.drag); // Will be 0 from updated config
        this.setAngularDrag(PlayerConfig.angularDrag); // Will be 0 from updated config
        this.setMaxVelocity(PlayerConfig.maxVelocity);
        this.setCollideWorldBounds(true);
        this.setBounce(0.2); // Keep bounce low

        // Create and configure the range indicator with improved visibility for touch
        this.rangeIndicator = scene.add.graphics();
        
        // Enhanced visibility for the range indicator (pulse effect)
        this.createEnhancedRangeIndicator();
        
        // Start the pulsing animation for better visibility on touch screens
        this.startPulseAnimation();

        // Create thruster particles
        this.createThrusterParticles();

        console.log('Player created using config');
    }
    
    // Create thruster particle emitter
    private createThrusterParticles(): void {
        // Create the particle emitter directly
        this.thrusterParticles = this.scene.add.particles(0, 0, 'thruster_particle', {
            speed: { min: 60, max: 120 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 0.7, end: 0 },
            lifespan: { min: 200, max: 400 },
            blendMode: Phaser.BlendModes.ADD,
            tint: [0xffff00, 0xff8800, 0xff4400], // Yellow to orange to red
            frequency: 30,
            angle: 90, // Base angle - will be adjusted during runtime
            emitting: false, // Start disabled
            //depth: this.depth - 1 // Position below the player for correct render order
        });
    }
    
    // Create an enhanced range indicator with better visibility for touch screens
    createEnhancedRangeIndicator() {
        this.rangeIndicator.clear();
        
        // Outer ring (more visible)
        this.rangeIndicator.lineStyle(2, TetherConfig.attachRangeIndicatorColor, TetherConfig.attachRangeIndicatorAlpha);
        this.rangeIndicator.strokeCircle(0, 0, TetherConfig.maxAttachDistance);
        
        // Inner guiding circles
        this.rangeIndicator.lineStyle(1, TetherConfig.attachRangeIndicatorColor, TetherConfig.attachRangeIndicatorAlpha * 0.7);
        this.rangeIndicator.strokeCircle(0, 0, TetherConfig.maxAttachDistance * 0.75);
        this.rangeIndicator.strokeCircle(0, 0, TetherConfig.maxAttachDistance * 0.5);
        
        // Cross in the middle for better visibility
        this.rangeIndicator.lineStyle(1, TetherConfig.attachRangeIndicatorColor, TetherConfig.attachRangeIndicatorAlpha * 0.7);
        this.rangeIndicator.beginPath();
        this.rangeIndicator.moveTo(-10, 0);
        this.rangeIndicator.lineTo(10, 0);
        this.rangeIndicator.moveTo(0, -10);
        this.rangeIndicator.lineTo(0, 10);
        this.rangeIndicator.closePath();
        this.rangeIndicator.strokePath();
        
        this.rangeIndicator.setVisible(!this.isTethered);
    }
    
    // Start pulsing animation for better visibility
    startPulseAnimation() {
        if (!this.scene) return;
        
        // Create a pulse animation for the range indicator
        this.scene.tweens.add({
            targets: this.rangeIndicator,
            alpha: { from: TetherConfig.attachRangeIndicatorAlpha, to: TetherConfig.attachRangeIndicatorAlpha * 0.4 },
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    // --- Tether Methods ---
    attachTether(salvage: Salvage) {
        this.isTethered = true;
        this.tetheredObject = salvage;
        this.rangeIndicator.setVisible(false); // Hide indicator when tethered
        console.log('Player: Tether attached');
        // No need to reset acceleration - allows thrust to continue working
    }

    detachTether() {
        this.isTethered = false;
        this.tetheredObject = null;
        this.rangeIndicator.setVisible(true); // Show indicator when not tethered
        
        // Set drag to 0 to maintain momentum in space
        this.setDrag(0);
        // Reset acceleration to ensure no residual forces
        if (this.body instanceof Phaser.Physics.Arcade.Body) {
            this.body.setAcceleration(0, 0);
        }
        
        console.log('Player: Tether detached. Momentum maintained.');
    }

    // --- Movement Methods ---
    thrust() {
        // Create acceleration in the direction the ship is facing
        if (this.body instanceof Phaser.Physics.Arcade.Body) {
            const thrustVector = new Phaser.Math.Vector2();
            this.scene.physics.velocityFromRotation(
                this.rotation - Math.PI / 2, // Adjust for sprite orientation
                PlayerConfig.thrustForce,
                thrustVector
            );
            
            // Apply acceleration instead of directly setting velocity
            this.body.setAcceleration(thrustVector.x, thrustVector.y);
            
            // Start thruster particles
            this.startThrusterEffect();
        }
    }
    
    // Apply variable thrust force as acceleration in the direction the ship is facing
    thrustWithForce(force: number) {
        if (this.body instanceof Phaser.Physics.Arcade.Body) {
            const thrustVector = new Phaser.Math.Vector2();
            this.scene.physics.velocityFromRotation(
                this.rotation - Math.PI / 2, // Adjust for sprite orientation
                force,
                thrustVector
            );
            
            // Apply acceleration instead of directly setting velocity
            this.body.setAcceleration(thrustVector.x, thrustVector.y);
            
            // Start thruster particles with intensity based on force
            this.startThrusterEffect();

        }
    }
    
    // Start thruster particle effect
    private startThrusterEffect(): void {
        this.thrusterParticles.start();
    }
    
    // New method for directional thrust based on touch input
    thrustInDirection(angle: number) {
        if (!this.body || !(this.body instanceof Phaser.Physics.Arcade.Body)) return;
        
        // Convert the joystick angle to world coordinates considering ship rotation
        // This gives thrust relative to the player's current orientation
        const thrustAngle = angle + this.rotation - Math.PI / 2;
        
        // Create a thrust vector based on the combined angle
        const thrustVector = new Phaser.Math.Vector2();
        
        // Calculate thrust vector components
        this.scene.physics.velocityFromRotation(
            thrustAngle, 
            PlayerConfig.thrustForce,
            thrustVector
        );
        
        // Apply acceleration instead of directly adding to velocity
        this.body.setAcceleration(thrustVector.x, thrustVector.y);
        
        // Start thruster particles
        this.startThrusterEffect();
        
        // Ensure we don't exceed maximum velocity (still needed as a safety check)
        const speed = this.body.velocity.length();
        if (speed > PlayerConfig.maxVelocity) {
            this.body.velocity.scale(PlayerConfig.maxVelocity / speed);
        }
    }

    moveLeft() {
        this.setAngularVelocity(-PlayerConfig.angularVelocity);
    }

    moveRight() {
        this.setAngularVelocity(PlayerConfig.angularVelocity);
    }

    stopRotation() {
        this.setAngularVelocity(0);
    }

    // Remove stopMovement and replace with stopThrust which only stops acceleration
    stopThrust() {
        if (this.body instanceof Phaser.Physics.Arcade.Body) {
            // Only reset acceleration, maintain current velocity/momentum
            this.body.setAcceleration(0, 0);
        }
        
        // Stop thruster particles
        this.thrusterParticles.stop();
        
        console.log('Player thrust stopped, momentum maintained');
    }

    // --- Update Loop ---
    preUpdate(time: number, delta: number) {
        super.preUpdate(time, delta);
        
        // Update the range indicator's position to follow the player
        this.rangeIndicator.setPosition(this.x, this.y);
        
        // Update thruster position and angle
        if (this.thrusterParticles) {
            // Calculate position behind the ship based on current rotation
            const offsetDistance = 20; // Pixels behind the ship
            const emitterX = this.x - Math.cos(this.rotation - Math.PI/2) * offsetDistance;
            const emitterY = this.y - Math.sin(this.rotation - Math.PI/2) * offsetDistance;
            
            // Position the emitter at the back of the ship
            this.thrusterParticles.setPosition(emitterX, emitterY);
            
            // Angle the particles opposite to the ship direction (ship points up at rotation 0)
            const emitterAngle = Phaser.Math.RadToDeg(this.rotation) + 90;
            
            // Set the emitter angle (single value, not a range)
            this.thrusterParticles.setEmitterAngle(emitterAngle);
        }
    }

    // Optional: Method to apply force from tether
    applyTetherForce(force: Phaser.Math.Vector2) {
        if (this.body) {
            // Directly apply force - adjust mass influence if needed
            (this.body as Phaser.Physics.Arcade.Body).setAcceleration(force.x, force.y);
            // Alternatively, add to existing velocity/acceleration
            // this.body.velocity.add(force.scale(delta / 1000)); // Example applying force over time
        }
    }

    // Ensure indicator is destroyed when player is destroyed
    destroy(fromScene?: boolean) {
        // Stop any tweens on the range indicator before destroying
        if (this.scene) {
            this.scene.tweens.killTweensOf(this.rangeIndicator);
        }
        
        // Clean up the thruster emitter
        if (this.thrusterParticles) {
            this.thrusterParticles.stop();
            this.thrusterParticles.destroy();
        }
        
        this.rangeIndicator.destroy();
        super.destroy(fromScene);
    }
} 