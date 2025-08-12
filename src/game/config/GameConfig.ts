import Phaser from 'phaser';

// Device detection helper
export const DeviceDetection = {
    isTouchDevice: (): boolean => {
        return (('ontouchstart' in window) || 
                (navigator.maxTouchPoints > 0) || 
                ('msMaxTouchPoints' in navigator && (navigator as any).msMaxTouchPoints > 0));
    },
    isMobileDevice: (): boolean => {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },
    getScreenOrientation: (): 'portrait' | 'landscape' => {
        return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    }
};

// Responsive scaling configuration
export const ResponsiveConfig = {
    // Size multipliers based on screen size categories
    sizeMultiplier: {
        small: 0.8,  // For phones - increased from 0.6
        medium: 0.9, // For small tablets - increased from 0.8
        large: 1.0   // For large tablets and desktops
    },
    // Threshold breakpoints in pixels
    breakpoints: {
        small: 600,    // Phones
        medium: 1024   // Tablets
    },
    // Get the appropriate size multiplier based on screen dimensions
    getMultiplier: (): number => {
        const smallerDimension = Math.min(window.innerWidth, window.innerHeight);
        if (smallerDimension < ResponsiveConfig.breakpoints.small) {
            return ResponsiveConfig.sizeMultiplier.small;
        } else if (smallerDimension < ResponsiveConfig.breakpoints.medium) {
            return ResponsiveConfig.sizeMultiplier.medium;
        }
        return ResponsiveConfig.sizeMultiplier.large;
    },
    // Mobile-specific button size factor (makes buttons larger on mobile)
    mobileButtonSizeFactor: 1.5
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
        mode: Phaser.Scale.FIT, // Change to FIT for better cross-device scaling
        autoCenter: Phaser.Scale.CENTER_BOTH, // Center the game canvas
        width: 1920,
        height: 1080,
        min: {
            width: 320,
            height: 480
        },
        max: {
            width: 1920,
            height: 1080
        }
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
    tether: Phaser.Input.Keyboard.KeyCodes.SPACE, // Tether key (Spacebar)
    // Add strafe keys if needed later
    // strafeLeft: 'Q',
    // strafeRight: 'E',
};

// Touch Controls Config
export const TouchControlsConfig = {
    // Base sizes (will be multiplied by responsive multiplier)
    joystickSize: 150,          // Size of virtual joystick in pixels
    buttonSize: 100,            // Size of virtual buttons in pixels
    joystickHitArea: 200,       // Size of the joystick's interactive area (larger than visible area)
    buttonHitArea: 150,         // Size of the tether button's interactive area (larger than visible)
    opacity: 0.75,              // Opacity of touch controls - increased from 0.7 for better visibility
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
    // Mobile-specific positioning (percentage of screen width/height)
    mobilePositioning: {
        tether: {
            x: 0.95,            // 95% from left (5% from right)
            y: 0.85             // 85% from top (15% from bottom)
        },
        thrust: {
            x: 0.80,            // 80% from left (20% from right)
            y: 0.85             // 85% from top (15% from bottom)
        }
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
    },
    // Get responsive size based on screen dimensions
    getResponsiveSize: (baseSize: number, isMobile: boolean = false): number => {
        // Apply additional size factor for mobile buttons
        const mobileFactor = isMobile ? ResponsiveConfig.mobileButtonSizeFactor : 1.0;
        return baseSize * ResponsiveConfig.getMultiplier() * mobileFactor;
    }
};

// Tether Config
export const TetherConfig = {
    // Physics properties
    maxLength: 150,         // Fixed distance between player and salvage (pixels)
    maxAttachDistance: 150, // Max distance player can be from salvage to attach tether
    towForce: 100,          // Force applied to towed salvage
    towDamping: 0.1,        // Damping factor for smoother movement
    
    // Visual properties
    lineWidth: 2,
    lineColor: 0x00ff00,     // Green tether line
    attachRangeIndicatorColor: 0x3df2b0, // Color of the visual range indicator
    attachRangeIndicatorAlpha: 0.25,    // Alpha/transparency of the range indicator
    
    // Enhanced visual properties
    segments: 14,            // Increased number of segments for smoother curve
    glowColor: 0x3df2b0,     // Base glow color (#3df2b0)
    highlightColor: 0xf2168f, // Secondary glow color (#f2168f)
    strainThreshold: 1,    // Tension threshold for strain effects (0.0-1.0)
    sparkColor: 0xae2abf,    // Color for max-strain spark (#ae2abf)
    blendMode: 1,            // Blend mode for segments (1 = ADD)
    segmentThickness: 4.5,   // Base thickness of tether segments
    pulseThicknessMax: 5.2,  // Maximum thickness during pulse animation
    
    // Predefined color options
    colorOptions: {
        default: 0x3df2b0,  // Default teal color
        blue: 0x1e18d9,     // Cyan blue
        purple: 0xae2abf,   // Bright purple
        green: 0x3df2b0,    // Bright green
        red: 0xe7552c,      // Pinkish red
        yellow: 0xf4bf56,   // Gold yellow
        white: 0xfffBFA     // Pure white
    } as const,
    
    // Animation properties
    glowFrameRate: 24,       // Frames per second for glow animation
    breakFrameRate: 12,      // Frames per second for break animation
    reattachFrameRate: 12,   // Frames per second for reattach animation
    
    // Particle effects
    particleLifespan: 500,   // Lifespan of break particles in ms
    particleCount: 4,        // Increased number of particles to emit on break
    particleSpeed: { min: 20, max: 50 }, // Speed range for particles
    
    // Energy flow effects
    energyParticleFrequency: 100, // Time between energy particle emissions (ms)
    energyParticleSpeed: 200,    // Speed of energy particles
    pulseDuration: 10,          // Duration of pulse animation (ms)
    curveAmount: 0.1,            // Amount of curve in the tether (0-1)
};

// Simple runtime selection for tether type; can be driven by meta/progression later
export const TetherSelection = {
    selectedType: 'bond' as 'basic' | 'multi' | 'bond'
};

// Type for color names
type TetherColorName = keyof typeof TetherConfig.colorOptions;

// Function to get tether color by name
export function getTetherColorByName(colorName: string): number {
    // Convert to lowercase and check if it's a valid color name
    const normalizedName = colorName.toLowerCase() as TetherColorName;
    
    // Check if the color name exists in the options
    if (normalizedName in TetherConfig.colorOptions) {
        return TetherConfig.colorOptions[normalizedName];
    }
    
    // Return default if color name not found
    return TetherConfig.colorOptions.default;
}

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
    spawnX: typeof GameConfig.width === 'number' ? GameConfig.width * 0.5 : 1024 * 0.3, // Position near left edge
    spawnY: typeof GameConfig.height === 'number' ? GameConfig.height * 0.5 : 768 * 0.5, // Position vertically centered
    depositZoneRadius: 100, // Visual radius for deposit zone indicator
    depositZoneOffset: { x: 500, y: 200 } // Offset from parent ship center (positive x = right)
};

// Camera Config for different device types
export const CameraConfig = {
    zoomLevel: {
        mobile: 0.9,    // Increased from 0.7 to prevent touch input issues
        tablet: 0.95,   // Increased from 0.85
        desktop: 1.0    // Regular zoom on desktop
    },
    followSpeed: {
        mobile: 0.05,   // Slower follow for mobile (less disorienting)
        desktop: 0.1    // Regular follow speed for desktop
    }
};

// World size config based on device type
export const WorldConfig = {
    sizeMultiplier: {
        mobile: 1.2,    // Smaller world for mobile
        desktop: 1.5    // Larger world for desktop
    }
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