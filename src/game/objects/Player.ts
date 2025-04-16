import Phaser from 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    private moveSpeed: number = 200; // Velocity for horizontal movement
    private thrustForce: number = 300; // Acceleration for thrusting
    private maxVelocity: number = 400; // Max speed
    private angularVelocity: number = 200; // Rotation speed

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'ship_placeholder');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Physics properties
        this.setDrag(100); // Friction/damping
        this.setAngularDrag(100); // Rotational friction
        this.setMaxVelocity(this.maxVelocity);
        this.setCollideWorldBounds(true);
        this.setBounce(0.2); // Slight bounce on collision

        console.log('Player created');
    }

    // Placeholder Movement Methods (to be called by input handlers later)
    thrust() {
        // Apply force in the direction the ship is facing
        if (this.body?.velocity) { // Check if body and velocity exist
            this.scene.physics.velocityFromRotation(this.rotation - Math.PI / 2, this.thrustForce, (this.body.velocity as Phaser.Math.Vector2));
        }
        // console.log('Player thrusting');
        // Add particle effects or animation triggers here later
    }

    moveLeft() {
        this.setAngularVelocity(-this.angularVelocity);
        // console.log('Player rotating left');
    }

    moveRight() {
        this.setAngularVelocity(this.angularVelocity);
        // console.log('Player rotating right');
    }

    stopRotation() {
        this.setAngularVelocity(0);
    }

    // Stop all movement (e.g., for game over)
    // Renamed from stop() to avoid conflict with base Sprite method
    stopMovement() {
        if (this.body) { // Check if body exists
            this.setVelocity(0, 0);
            this.setAngularVelocity(0);
        }
        console.log('Player movement stopped');
    }

    // Pre-update method (called automatically by Phaser)
    preUpdate(time: number, delta: number) {
        super.preUpdate(time, delta);
        // Any per-frame logic for the player can go here
        // E.g., clamp velocity if needed, check fuel, etc.
    }
} 