import Phaser from 'phaser';
import { PlayerConfig } from '../config/GameConfig'; // Import config
import Salvage from './Salvage';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    public isTethered: boolean = false;
    public tetheredObject: Salvage | null = null;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'ship_placeholder');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Physics properties from config
        this.setDrag(PlayerConfig.drag);
        this.setAngularDrag(PlayerConfig.angularDrag);
        this.setMaxVelocity(PlayerConfig.maxVelocity);
        this.setCollideWorldBounds(true);
        this.setBounce(0.2); // Keep bounce low

        console.log('Player created using config');
    }

    // --- Tether Methods ---
    attachTether(salvage: Salvage) {
        this.isTethered = true;
        this.tetheredObject = salvage;
        console.log('Player: Tether attached');
    }

    detachTether() {
        this.isTethered = false;
        this.tetheredObject = null;
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
        // Add any player-specific frame logic here
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
} 