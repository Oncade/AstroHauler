import Phaser from 'phaser';
import { PlayerConfig, TetherConfig } from '../config/GameConfig'; // Import config
import Salvage from './Salvage';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    public isTethered: boolean = false;
    public tetheredObject: Salvage | null = null;
    private rangeIndicator: Phaser.GameObjects.Graphics; // Add range indicator graphic

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, PlayerConfig.textureKey); // Use textureKey from config
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Physics properties from config
        this.setDrag(PlayerConfig.drag);
        this.setAngularDrag(PlayerConfig.angularDrag);
        this.setMaxVelocity(PlayerConfig.maxVelocity);
        this.setCollideWorldBounds(true);
        this.setBounce(0.2); // Keep bounce low

        // Create and configure the range indicator
        this.rangeIndicator = scene.add.graphics();
        this.rangeIndicator.lineStyle(1, TetherConfig.attachRangeIndicatorColor, TetherConfig.attachRangeIndicatorAlpha);
        this.rangeIndicator.strokeCircle(0, 0, TetherConfig.maxAttachDistance); // Draw circle relative to graphic's origin
        this.rangeIndicator.setVisible(!this.isTethered); // Initially visible if not tethered

        console.log('Player created using config');
    }

    // --- Tether Methods ---
    attachTether(salvage: Salvage) {
        this.isTethered = true;
        this.tetheredObject = salvage;
        this.rangeIndicator.setVisible(false); // Hide indicator when tethered
        console.log('Player: Tether attached');
    }

    detachTether() {
        this.isTethered = false;
        this.tetheredObject = null;
        this.rangeIndicator.setVisible(true); // Show indicator when not tethered
        console.log('Player: Tether detached');
    }

    // --- Movement Methods ---
    thrust() {
        // Apply force in the direction the ship is facing using config
        if (this.body?.velocity) {
            this.scene.physics.velocityFromRotation(
                this.rotation - Math.PI / 2, // Adjust for sprite orientation
                PlayerConfig.thrustForce,
                (this.body.velocity as Phaser.Math.Vector2)
            );
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

    stopMovement() {
        if (this.body) {
            this.setVelocity(0, 0);
            this.setAngularVelocity(0);
        }
        console.log('Player movement stopped');
    }

    // --- Update Loop ---
    preUpdate(time: number, delta: number) {
        super.preUpdate(time, delta);
        // Update the range indicator's position to follow the player
        this.rangeIndicator.setPosition(this.x, this.y);
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
        this.rangeIndicator.destroy();
        super.destroy(fromScene);
    }
} 