import Phaser from 'phaser';

// Define configuration constants
export const GameConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    parent: 'game-container', // Matches the div id in PhaserGame.tsx
    backgroundColor: '#000010', // Darker space background
    transparent: true,
    scale: {
        mode: Phaser.Scale.RESIZE,
        width: window.innerWidth,
        height: window.innerHeight
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 }, // No global gravity, ship handles its own
            debug: false // Set to true for physics debugging visuals
        }
    },
    // Scene list will be added in main.ts
};

// Player Specific Config
export const PlayerConfig = {
    thrustForce: 175,       // Increased force for more responsiveness
    drag: 0,                // No drag in space
    angularDrag: 0,         // No angular drag in space
    angularVelocity: 150,   // Rotation speed
    maxVelocity: 400,       // Increased maximum speed for space
    textureKey: 'ship'
};

// Controls Config
export const ControlKeys = {
    thrust: Phaser.Input.Keyboard.KeyCodes.W,
    rotateLeft: Phaser.Input.Keyboard.KeyCodes.A,
    rotateRight: Phaser.Input.Keyboard.KeyCodes.D,
    tether: Phaser.Input.Keyboard.KeyCodes.T, // Added tether key
    // Add strafe keys if needed later
    // strafeLeft: 'Q',
    // strafeRight: 'E',
};

// Tether Config
export const TetherConfig = {
    maxLength: 100,         // Maximum length before spring force applies (pixels)
    minLength: 20,          // Minimum length (optional, less critical for this implementation)
    springConstant: 1,   // Stiffness of the tether spring (k)
    damping: 0.001,         // Damping factor to reduce oscillations (c)
    lineWidth: 2,
    lineColor: 0x00ff00,     // Green tether line
    maxAttachDistance: 150, // Max distance player can be from salvage to attach tether
    attachRangeIndicatorColor: 0x00ff00, // Color of the visual range indicator
    attachRangeIndicatorAlpha: 0.25,    // Alpha/transparency of the range indicator
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
    baseDrag: 0, // No drag when not tethered (space physics)
    tetheredDragMultiplier: 0, // No drag when tethered
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