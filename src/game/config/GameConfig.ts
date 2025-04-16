import Phaser from 'phaser';

// Define configuration constants
export const GameConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container', // Matches the div id in PhaserGame.tsx
    backgroundColor: '#000020',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 }, // No global gravity, ship handles its own
            debug: true // Enable physics debugging for Phase 1
        }
    },
    // Scene list will be added in main.ts
}; 