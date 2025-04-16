import Phaser from 'phaser';

// Placeholder for Salvage items (Week 2)
export default class Salvage extends Phaser.Physics.Arcade.Sprite {
    public value: number = 10; // Example value
    public mass: number = 1; // Example mass

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string | Phaser.Textures.Texture = 'salvage_placeholder') {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Basic physics properties (will be refined)
        this.setCollideWorldBounds(true);
        this.setBounce(0.5);
        this.setDrag(50);

        console.log(`Salvage created at (${x}, ${y})`);
    }

    // Add methods related to salvage interaction, tethering, etc.
    collect() {
        console.log('Salvage collected (placeholder)');
        // Trigger tether attachment, scoring, etc.
        this.destroy(); // Simple removal for now
    }
} 