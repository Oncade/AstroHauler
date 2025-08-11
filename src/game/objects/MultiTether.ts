import Phaser from 'phaser';
import Player from './Player';
import Salvage from './Salvage';
import Tether from './Tether';

// Stub implementation: behaves like basic tether for now, but structured
// to support multiple attached salvage in the future.
export default class MultiTether extends Tether {
  // Placeholder for future multiple salvage support
  private attachedSalvage: Salvage[];

  constructor(scene: Phaser.Scene, player: Player, salvage: Salvage) {
    super(scene, player, salvage);
    this.attachedSalvage = [salvage];
  }
}


