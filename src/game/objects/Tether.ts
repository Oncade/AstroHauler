import Phaser from 'phaser';
import Player from './Player';
import Salvage from './Salvage';
import { TetherConfig } from '../config/GameConfig';

// Enhanced tether implementation with animated segments and VFX
export default class Tether {
    private scene: Phaser.Scene;
    private player: Player;
    private salvage: Salvage;
    private visualFeedback: Phaser.GameObjects.Container; // Container for visual feedback elements
    private salvageHighlight: Phaser.GameObjects.Graphics; // Highlight around salvage
    private towDirection: Phaser.Math.Vector2; // Direction of towing
    
    // Enhanced tether visuals
    private tetherGroup: Phaser.GameObjects.Group; // Group to hold all tether segments
    private sparkPlayed: boolean = false; // Track if spark animation is currently playing
    private animationsCreated: boolean = false; // Track if animations have been created
    private energyParticles: Phaser.GameObjects.Particles.ParticleEmitter[] = []; // Track energy particles
    private pulseTween: Phaser.Tweens.Tween | null = null; // Track pulse animation
    
    // Color cycling properties
    private colorChangeTimer: Phaser.Time.TimerEvent | null = null;
    private currentColorIndex: number = 0;
    private colorCyclingEnabled: boolean = false;

    constructor(scene: Phaser.Scene, player: Player, salvage: Salvage) {
        this.scene = scene;
        this.player = player;
        this.salvage = salvage;

        // Notify player and salvage
        this.player.attachTether(this.salvage);
        this.salvage.startTether(this.player);
        
        // Create tether animations if they don't exist yet
        this.createTetherAnimations();
        
        // Initialize group for tether segments
        this.tetherGroup = this.scene.add.group();
        
        // Create enhanced visual feedback for tether
        this.createVisualFeedback();
        
        // Initialize tow direction vector
        this.towDirection = new Phaser.Math.Vector2(0, 0);
        
        // Create initial tether segments
        this.updateTetherSegments();
        
        // Create flowing energy effect
        this.createEnergyFlow();
        
        // Start color cycling
        this.startColorCycling();

        console.log('Enhanced Tether created between Player and Salvage');
    }
    
    // Create tether animations if they don't exist
    createTetherAnimations() {
        if (this.animationsCreated) return;
        
        // Check if animations already exist to avoid duplicates
        if (!this.scene.anims.exists('tetherGlow')) {
            this.scene.anims.create({
                key: 'tetherGlow',
                frames: [
                    { key: 'tether', frame: 'segment_0' },
                    { key: 'tether', frame: 'segment_1' }
                ],
                frameRate: TetherConfig.glowFrameRate,
                repeat: -1
            });
        }
        /*
        if (!this.scene.anims.exists('tetherSpark')) {
            this.scene.anims.create({
                key: 'tetherSpark',
                frames: [{ key: 'tether', frame: 'strain_spark' }],
                frameRate: 1,
                repeat: 0
            });
        }
        */
        if (!this.scene.anims.exists('tetherBreak')) {
            this.scene.anims.create({
                key: 'tetherBreak',
                frames: [
                    { key: 'tether', frame: 'break_0' },
                    { key: 'tether', frame: 'break_1' },
                    { key: 'tether', frame: 'break_2' }
                ],
                frameRate: TetherConfig.breakFrameRate,
                repeat: 0
            });
        }
        
        if (!this.scene.anims.exists('tetherReattach')) {
            this.scene.anims.create({
                key: 'tetherReattach',
                frames: [
                    { key: 'tether', frame: 'reattach_0' },
                    { key: 'tether', frame: 'reattach_1' },
                    { key: 'tether', frame: 'reattach_2' },
                    { key: 'tether', frame: 'reattach_3' }
                ],
                frameRate: TetherConfig.reattachFrameRate,
                repeat: 0
            });
        }
        
        this.animationsCreated = true;
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
        //this.salvageHighlight.lineStyle(3, TetherConfig.glowColor, 0.6);
        this.salvageHighlight.strokeCircle(this.salvage.x, this.salvage.y, radius);
        
        // Inner glowing rings for energy effect
        //this.salvageHighlight.lineStyle(2, TetherConfig.highlightColor, 0.4);
        this.salvageHighlight.strokeCircle(this.salvage.x, this.salvage.y, radius * 0.85);
        
        // Add additional inner circle for pulsing visual effect
        // Use sine wave based on time for continuous pulsing
        const pulseScale = 0.6 + 0.2 * Math.sin(Date.now() / 200);
        //this.salvageHighlight.lineStyle(2, TetherConfig.glowColor, 0.5);
        this.salvageHighlight.strokeCircle(this.salvage.x, this.salvage.y, radius * pulseScale);
        /*
        // Add energy dots around the circle
        const dotCount = 8;
        const dotRadius = 3;
        for (let i = 0; i < dotCount; i++) {
            // Calculate dot position around circle
            const angle = (i / dotCount) * Math.PI * 2 + (Date.now() / 1000);
            const dotX = this.salvage.x + Math.cos(angle) * (radius * 1.1);
            const dotY = this.salvage.y + Math.sin(angle) * (radius * 1.1);
            
            // Draw energy dot
            this.salvageHighlight.fillStyle(TetherConfig.glowColor, 0.8);
            this.salvageHighlight.fillCircle(dotX, dotY, dotRadius);
        }*/
    }
    
    // Update tether segments with dynamic curve
    updateTetherSegments() {
        // Clear old segments
        this.tetherGroup.clear(true, true);

        // Get start and end points
        const start = { x: this.player.x, y: this.player.y };
        const end = { x: this.salvage.x, y: this.salvage.y };
        
        // Calculate distance to determine tension
        const distance = Phaser.Math.Distance.Between(start.x, start.y, end.x, end.y);
        const tension = distance / TetherConfig.maxLength;
        
        // Generate points along a curve for more natural look
        const segmentPoints = this.generateTetherPoints(start, end, TetherConfig.segments);
        
        // Add segments along the path with enhanced visuals
        for (let i = 0; i < segmentPoints.length - 1; i++) {
            const p0 = segmentPoints[i];
            const p1 = segmentPoints[i+1];
            const angle = Phaser.Math.Angle.Between(p0.x, p0.y, p1.x, p1.y);
            const segment = this.scene.add.sprite(p0.x, p0.y, 'tether', 'segment_0');
            
            // Set rotation, scaling and blend mode
            segment.setRotation(angle);
            segment.setOrigin(0, 0.5);
            segment.play('tetherGlow');
            
            // Apply color tint from config
            segment.setTint(TetherConfig.glowColor);
            
            // Set blend mode based on config
            if (TetherConfig.blendMode === 1) {
                segment.setBlendMode(Phaser.BlendModes.ADD);
            }
            
            // Scale segment to match distance between points
            const segmentDist = Phaser.Math.Distance.Between(p0.x, p0.y, p1.x, p1.y);
            segment.scaleX = segmentDist / 16; // Segment sprite is 16px wide
            
            // Make segments thicker by increasing Y scale
            segment.scaleY = TetherConfig.segmentThickness; // Use config value for thickness
            
            // Add slight color tint variation based on position for energy flow effect
            const position = i / (segmentPoints.length - 2); // 0 to 1
            const pulsePhase = Math.sin(position * Math.PI * 2 + (Date.now() / 200)); // Flowing wave effect
            const intensity = 0.7 + 0.3 * pulsePhase; // 0.7-1.0 range for subtle pulse
            
            // Apply intensity to segment alpha for flowing light effect
            segment.setAlpha(intensity); 
            
            // Add to group for easy management
            this.tetherGroup.add(segment);
        }
        
        // Add tension visuals when needed
        //this.updateTensionEffect(tension, segmentPoints);
    }
    
    // Generate points along the tether path
    generateTetherPoints(start: {x: number, y: number}, end: {x: number, y: number}, numPoints: number) {
        const points = [];
        
        // Calculate a midpoint with slight offset for curve effect
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;
        
        // Add slight curve to make it more interesting
        const distance = Phaser.Math.Distance.Between(start.x, start.y, end.x, end.y);
        const curveAmount = Math.min(distance * TetherConfig.curveAmount, 30); // Use config curve amount
        
        // Create random but stable offset for this tether instance
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const perpX = -dy;
        const perpY = dx;
        const perpLength = Math.sqrt(perpX * perpX + perpY * perpY);
        
        // Avoid division by zero
        if (perpLength > 0) {
            const norm = curveAmount / perpLength;
            const offsetX = perpX * norm;
            const offsetY = perpY * norm;
            
            // Create curved path using quadratic bezier
            const curve = new Phaser.Curves.QuadraticBezier(
                new Phaser.Math.Vector2(start.x, start.y),
                new Phaser.Math.Vector2(midX + offsetX, midY + offsetY),
                new Phaser.Math.Vector2(end.x, end.y)
            );
            
            // Sample points along curve
            return curve.getPoints(numPoints);
        }
        
        // Fallback to straight line if points are too close
        for (let i = 0; i < numPoints; i++) {
            const t = i / (numPoints - 1);
            points.push({
                x: start.x + (end.x - start.x) * t,
                y: start.y + (end.y - start.y) * t
            });
        }
        
        return points;
    }
    
    // Update tension-based visual effects
    updateTensionEffect(tension: number, points: {x: number, y: number}[]) {
        // Add spark at high tension if not already playing
        if (tension > TetherConfig.strainThreshold && !this.sparkPlayed) {
            // Add spark at midpoint
            const midIndex = Math.floor(points.length/2);
            const spark = this.scene.add.sprite(
                points[midIndex].x, 
                points[midIndex].y, 
                'tether', 
                'strain_spark'
            );
            spark.play('tetherSpark');
            spark.setBlendMode(Phaser.BlendModes.ADD);
            this.sparkPlayed = true;
            
            // Reset after animation completes
            spark.once('animationcomplete', () => {
                this.sparkPlayed = false;
                spark.destroy();
            });
        }
    }

    // Create flowing energy particles along the tether
    createEnergyFlow() {
        // Clean up any existing particle emitters
        this.cleanupEnergyParticles();
        
        // Get tether segment positions for particle emitters
        const segments = this.tetherGroup.getChildren();
        if (segments.length < 3) return; // Need at least a few segments to create flow
        
        // Create pulsing effect on all segments
        this.createPulsingEffect();
    }
    
    // Clean up energy particle emitters
    cleanupEnergyParticles() {
        this.energyParticles.forEach(particles => {
            if (particles) {
                particles.destroy();
            }
        });
        this.energyParticles = [];
        
        // Stop any active pulse tween
        if (this.pulseTween) {
            this.pulseTween.stop();
            this.pulseTween = null;
        }
    }
    
    // Create pulsing glow effect on segments
    createPulsingEffect() {
        const segments = this.tetherGroup.getChildren();
        if (segments.length === 0) return;
        
        // Cancel any existing tween
        if (this.pulseTween) {
            this.pulseTween.stop();
        }
        
        // Create pulse effect (scale/alpha changes) using config duration
        this.pulseTween = this.scene.tweens.add({
            targets: segments,
            scaleY: { from: TetherConfig.segmentThickness, to: TetherConfig.pulseThicknessMax }, // Use config values
            alpha: { from: 0.8, to: 1 },
            duration: TetherConfig.pulseDuration,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            onUpdate: () => {
                // Update particle positions if needed
                //this.updateEnergyParticlePositions();
            }
        });
    }
    /*
    // Update particle emitter positions to follow segments
    updateEnergyParticlePositions() {
        const segments = this.tetherGroup.getChildren();
        if (segments.length < 3 || this.energyParticles.length === 0) return;
        
        // Update each particle emitter position
        const emitPoints = [
            Math.floor(segments.length * 0.1),
            Math.floor(segments.length * 0.25),
            Math.floor(segments.length * 0.5),
            Math.floor(segments.length * 0.75),
            Math.floor(segments.length * 0.9)
        ];
        
        emitPoints.forEach((index, i) => {
            if (index >= segments.length || i >= this.energyParticles.length) return;
            
            const segment = segments[index] as Phaser.GameObjects.Sprite;
            const particles = this.energyParticles[i];
            
            if (segment && particles) {
                particles.setPosition(segment.x, segment.y);
            }
        });
    }*/

    update(delta: number) {
        if (!this.player.body || !this.salvage.body) {
            console.warn('Tether update skipped: Player or Salvage body missing.');
            this.destroy(); // Destroy tether if objects are gone
            return;
        }

        // Update tether segments
        this.updateTetherSegments();
        
        // Update salvage highlight position
        this.updateSalvageHighlight();
        
        // Update energy particle positions
        //this.updateEnergyParticlePositions();
        
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
    
    // Play break animation with particles
    playBreakAnimation() {
        // Get positions for break effect
        const start = { x: this.player.x, y: this.player.y };
        const end = { x: this.salvage.x, y: this.salvage.y };
        
        // Play break animation on all segments
        this.tetherGroup.getChildren().forEach((segment: any) => {
            segment.play('tetherBreak');
            segment.once('animationcomplete', () => segment.destroy());
        });
        
        // Add particle burst at endpoints
        this.emitBreakParticles(start.x, start.y);
        this.emitBreakParticles(end.x, end.y);
    }
    
    // Emit particles for break effect
    emitBreakParticles(x: number, y: number) {
        // Create a simple burst of particles using graphics objects
        for (let i = 0; i < TetherConfig.particleCount; i++) {
            // Create a particle
            const angle = Math.random() * Math.PI * 2;
            const speed = Phaser.Math.Between(TetherConfig.particleSpeed.min, TetherConfig.particleSpeed.max);
            const particle = this.scene.add.sprite(x, y, 'tether', 'segment_0');
            
            // Configure particle with larger size
            particle.setScale(0.8); // Increased scale for better visibility
            particle.setBlendMode(Phaser.BlendModes.ADD);
            particle.setAlpha(0.9); // Increased alpha for better visibility
            
            // Animate and move particle
            this.scene.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * speed,
                y: y + Math.sin(angle) * speed,
                alpha: 0,
                scale: 0.2, // End with larger scale for better visibility
                duration: TetherConfig.particleLifespan,
                onComplete: () => particle.destroy()
            });
        }
    }
    
    // Play reattach animation
    playReattachAnimation() {
        const end = { x: this.salvage.x, y: this.salvage.y };
        
        // Create reattach effect at salvage point
        const reattach = this.scene.add.sprite(end.x, end.y, 'tether', 'reattach_0');
        reattach.play('tetherReattach');
        reattach.setBlendMode(Phaser.BlendModes.ADD);
        
        // Clean up after animation
        reattach.once('animationcomplete', () => reattach.destroy());
        
        // Update tether segments after animation
        this.scene.time.delayedCall(250, () => this.updateTetherSegments());
    }

    getAttachedSalvage(): Salvage {
        return this.salvage;
    }

    destroy() {
        // Stop color cycling
        this.stopColorCycling();
        
        // Clean up energy particles
        this.cleanupEnergyParticles();
        
        // Play break animation before destroying
        this.playBreakAnimation();
        
        // Wait for animation to complete before final cleanup
        this.scene.time.delayedCall(300, () => {
            // Clean up all visual components
            this.tetherGroup.destroy(true);
            this.visualFeedback.destroy();
            
            // Ensure player and salvage know the tether is gone
            if (this.player.tetheredObject === this.salvage) {
                this.player.detachTether();
            }
            if (this.salvage.tetheredBy === this.player) {
                this.salvage.endTether();
            }
            
            console.log('Tether destroyed with visual effect');
        });
    }

    // Function to update tether color - can be called externally
    updateTetherColor(color: number) {
        // Apply new color to all existing segments
        this.tetherGroup.getChildren().forEach((segment: any) => {
            segment.setTint(color);
        });
        
        // Update salvage highlight color
        if (this.salvageHighlight) {
            this.salvageHighlight.clear();
            
            // Draw a circle around the salvage with the new color
            const radius = this.salvage.width * 0.6;
            
            // Update highlight with new color
            this.salvageHighlight.lineStyle(3, color, 0.6);
            this.salvageHighlight.strokeCircle(this.salvage.x, this.salvage.y, radius);
            
            // Redraw other highlight elements
            this.updateSalvageHighlight();
        }
        
        // Store the current color in TetherConfig for future segments
        TetherConfig.glowColor = color;
    }

    // Start the color cycling timer
    startColorCycling() {
        // Stop any existing timer
        this.stopColorCycling();
        
        // Enable color cycling
        this.colorCyclingEnabled = true;
        
        // Create a timer that triggers every 1 second
        this.colorChangeTimer = this.scene.time.addEvent({
            delay: 1000, // 1 second
            callback: this.changeToRandomColor,
            callbackScope: this,
            loop: true
        });
    }
    
    // Stop the color cycling timer
    stopColorCycling() {
        if (this.colorChangeTimer) {
            this.colorChangeTimer.remove();
            this.colorChangeTimer = null;
        }
        this.colorCyclingEnabled = false;
    }
    
    // Toggle color cycling on/off
    toggleColorCycling() {
        if (this.colorCyclingEnabled) {
            this.stopColorCycling();
        } else {
            this.startColorCycling();
        }
        return this.colorCyclingEnabled;
    }
    
    // Change to a random color from the predefined color options
    changeToRandomColor() {
        // Get all available color keys (excluding 'default')
        const colorKeys = Object.keys(TetherConfig.colorOptions).filter(key => key !== 'default');
        
        // Choose a random color key
        const randomIndex = Math.floor(Math.random() * colorKeys.length);
        const colorKey = colorKeys[randomIndex];
        
        // Get the color value and apply it
        const colorValue = TetherConfig.colorOptions[colorKey as keyof typeof TetherConfig.colorOptions];
        this.updateTetherColor(colorValue);
    }
} 