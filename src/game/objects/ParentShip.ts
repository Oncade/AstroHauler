import Phaser from 'phaser';
import Salvage from './Salvage';

// Placeholder for the Parent Ship (Deposit Point - Week 2)
export default class ParentShip extends Phaser.Physics.Arcade.Sprite {
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string | Phaser.Textures.Texture = 'parent_ship_placeholder') {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Make it immovable
        this.setImmovable(true);
        if (this.body) {
            (this.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
        }

        console.log(`ParentShip created at (${x}, ${y})`);
    }

    // Method to handle salvage deposit
    depositSalvage(salvage: Salvage): number {
        const value = salvage.value;
        console.log(`Deposited salvage worth ${value} (placeholder)`);
        // Potentially trigger animations or effects
        // salvage.destroy(); // Assuming salvage is destroyed after deposit
        return value;
    }
} 