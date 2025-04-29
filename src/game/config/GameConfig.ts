import Phaser from 'phaser';

// Device detection helper
export const DeviceDetection = {
    isTouchDevice: (): boolean => {
        return (('ontouchstart' in window) || 
                (navigator.maxTouchPoints > 0) || 
                ('msMaxTouchPoints' in navigator && (navigator as any).msMaxTouchPoints > 0));
    }
};

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
    input: {
        activePointers: 3, // Support multi-touch with up to 3 pointers
        touch: { capture: true } // Enable touch events
    }
};

// Player Specific Config
export const PlayerConfig = {
    thrustForce: 175,       // Reduced force for more gradual acceleration
    drag: 0,                // No drag in space
    angularDrag: 0,         // No angular drag in space
    angularVelocity: 150,   // Rotation speed
    maxVelocity: 400,       // Maximum speed cap
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

// Touch Controls Config
export const TouchControlsConfig = {
    joystickSize: 150,          // Size of virtual joystick in pixels
    buttonSize: 100,            // Size of virtual buttons in pixels
    joystickHitArea: 200,       // Size of the joystick's interactive area (larger than visible area)
    buttonHitArea: 150,         // Size of the tether button's interactive area (larger than visible)
    opacity: 0.7,               // Opacity of touch controls
    joystickPosition: {
        x: 150,                 // Position from left edge
        y: -150                 // Position from bottom edge (negative for bottom positioning)
    },
    tetherButtonPosition: {
        x: -150,                // Position from right edge (negative for right positioning)
        y: -150                 // Position from bottom edge (negative for bottom positioning)
    },
    thrustButtonPosition: {
        x: -280,                // Position from right edge (negative for right positioning)
        y: -150                 // Position from bottom edge (negative for bottom positioning)
    },
    thrustParameters: {
        initialForce: 20,       // Reduced initial thrust force
        maxForce: 100,          // Reduced maximum thrust to match thrustForce
        rampUpTime: 1500,       // Longer ramp-up time for more gradual acceleration
        rampUpEase: 'Sine.easeInOut', // Easing function for thrust ramp-up
    },
    joystickDeadZone: 10,       // Deadzone in pixels for the joystick
    colors: {
        normal: 0xffffff,       // Normal state color
        active: 0x00ff00,       // Active state color
        warning: 0xff0000       // Warning state color
    },
    directionIndicator: {
        color: 0x00ffff,        // Color of the direction indicator
        alpha: 0.7,             // Alpha/transparency of the direction indicator
        lineWidth: 3,           // Width of the direction indicator line
        arrowSize: 10           // Size of the arrowhead
    },
    dynamicJoystick: {
        enabled: true,          // Enable dynamic joystick that appears at touch location
        fadeOutTime: 250,       // Time in ms for joystick to fade out after release
        buttonSafeZone: 70      // Distance in pixels to keep joystick away from buttons
    }
};

// Tether Config
export const TetherConfig = {
    maxLength: 150,         // Fixed distance between player and salvage (pixels)
    lineWidth: 2,
    lineColor: 0x00ff00,     // Green tether line
    maxAttachDistance: 150, // Max distance player can be from salvage to attach tether
    attachRangeIndicatorColor: 0x00ff00, // Color of the visual range indicator
    attachRangeIndicatorAlpha: 0.25,    // Alpha/transparency of the range indicator
    towForce: 100,          // Force applied to towed salvage
    towDamping: 0.1,        // Damping factor for smoother movement
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
    depositZoneRadius: 100, // Visual radius for deposit zone indicator
    depositZoneOffset: { x: 600, y: 0 } // Offset from parent ship center (positive x = right)
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