import Phaser from 'phaser';

// Define configuration constants
export const GameConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    parent: 'game-container', // Matches the div id in PhaserGame.tsx
    backgroundColor: '#000010', // Darker space background
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 }, // No global gravity, ship handles its own
            debug: true // Enable physics debugging for Phase 1
        }
    },
    // Scene list will be added in main.ts
};

// Player Specific Config
export const PlayerConfig = {
    thrustForce: 175,
    maxVelocity: 400,
    angularVelocity: 200,
    drag: 100, // Linear drag
    angularDrag: 100, // Angular drag
};

// Controls Config
export const ControlKeys = {
    thrust: 'W',
    rotateLeft: 'A',
    rotateRight: 'D',
    // Add strafe keys if needed later
    // strafeLeft: 'Q',
    // strafeRight: 'E',
};

// Tether Config
export const TetherConfig = {
    maxLength: 50,        // Maximum distance before tether pulls
    minLength: 10,         // Minimum distance (less important for simple spring)
    springConstant: 0.02,  // How strong the pull is (adjust for feel)
    damping: 0.01,         // How much the spring force is dampened (prevents oscillation)
    lineColor: 0x00ffff,   // Cyan color for the tether line
    lineWidth: 2,
};

// Background Config
export const BackgroundConfig = {
    textureKey: 'starfield',
    imagePath: 'assets/images/Starfield.png'
};

// Salvage Config
export const SalvageConfig = {
    defaultMass: 1,
    defaultValue: 10,
    minMass: 0.5,
    maxMass: 3.0,
    spawnCount: 15, // Increased spawn count slightly
    baseDrag: 50, // Drag when not tethered
    tetheredDragMultiplier: 1.5, // Increase drag when tethered
    valuePerMass: 5, // Value based on mass
    textureKeys: [ // Array of available texture keys
        'salvage_1',
        'salvage_2',
        'salvage_3',
        'salvage_4',
        'salvage_5',
        'salvage_6',
        'salvage_7'
    ]
};

// Parent Ship Config
export const ParentShipConfig = {
    texture: 'parent_ship', // Use the actual asset key
    spawnX: typeof GameConfig.width === 'number' ? GameConfig.width * 0.1 : 1024 * 0.1, // Position near left edge
    spawnY: typeof GameConfig.height === 'number' ? GameConfig.height * 0.5 : 768 * 0.5, // Position vertically centered
};

// --- Helper Functions ---
// Function to generate a random mass for salvage
export function getRandomSalvageMass(): number {
    return Phaser.Math.FloatBetween(SalvageConfig.minMass, SalvageConfig.maxMass);
}

// Function to get a random salvage texture key
export function getRandomSalvageTexture(): string {
    return Phaser.Utils.Array.GetRandom(SalvageConfig.textureKeys);
} 