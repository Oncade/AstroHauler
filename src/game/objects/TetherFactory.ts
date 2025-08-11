import Phaser from 'phaser';
import Player from './Player';
import Salvage from './Salvage';
import Tether from './Tether';
import MultiTether from './MultiTether';
import BondTether from './BondTether';
import { TetherSelection } from '../config/GameConfig';

export interface ITether {
  update(delta: number): void;
  destroy(): void;
  getAttachedSalvage(): Salvage;
  playReattachAnimation(): void;
  updateTetherColor?(color: number): void;
  toggleColorCycling?(): boolean;
  onTetherButtonPressed?(): boolean;
  toggleDebug?(): void;
}

export function createTether(
  scene: Phaser.Scene,
  player: Player,
  salvage: Salvage
): ITether {
  switch (TetherSelection.selectedType) {
    case 'multi':
      return new MultiTether(scene, player, salvage);
    case 'bond':
      return new BondTether(scene, player, salvage);
    case 'basic':
    default:
      return new Tether(scene, player, salvage);
  }
}


