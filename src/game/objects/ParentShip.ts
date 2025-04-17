import Phaser from 'phaser';
import { ParentShipConfig } from '../config/GameConfig'; // Import config
// import Salvage from './Salvage'; // No longer needed here

// Parent Ship (Deposit Point)
export default class ParentShip extends Phaser.Physics.Arcade.Image { // Use Image for non-animated object
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
    }

    // Removed depositSalvage - Handled in GameScene collision callback
    // depositSalvage(salvage: Salvage): number {
    //     const value = salvage.value;
    //     console.log(`Deposited salvage worth ${value} (placeholder)`);
    //     // Potentially trigger animations or effects
    //     // salvage.destroy(); // Assuming salvage is destroyed after deposit
    //     return value;
    // }
} 