# AstroHauler - Phase 1 Implementation Plan

## Overview

This document outlines the implementation plan for Phase 1 of AstroHauler, focusing on prototyping and core mechanics as defined in the game design document. This phase will establish the foundation of the game with basic physics, ship movement, and the tether system for salvage dragging.

## Project Structure

Following the Phaser-React-TypeScript template structure:

```
src/
├── App.tsx                       # Main React component
├── main.tsx                      # React entry point
├── components/
│   ├── MainMenu.tsx              # Main menu component
│   ├── GameUI.tsx                # In-game UI overlay
│   └── GameOverScreen.tsx        # Game over screen component
├── game/
│   ├── main.ts                   # Game configuration
│   ├── PhaserGame.tsx            # React-Phaser bridge
│   ├── EventBus.ts               # Communication between React and Phaser
│   ├── config/
│   │   └── GameConfig.ts         # Game configuration constants
│   ├── objects/
│   │   ├── Player.ts             # Player ship class
│   │   ├── Salvage.ts            # Salvage item class
│   │   ├── ParentShip.ts         # Parent ship class
│   │   └── Tether.ts             # Tether physics system
│   └── scenes/
│       ├── BootScene.ts          # Initial loading scene
│       ├── PreloaderScene.ts     # Asset preloading
│       ├── MainMenuScene.ts      # Main menu scene
│       ├── GameScene.ts          # Main gameplay scene
│       └── GameOverScene.ts      # Game over scene
└── assets/
    ├── images/                   # Game sprites and UI elements
    └── audio/                    # Sound effects and music
```

## Core Mechanics Implementation

### 1. Ship Movement and Physics Setup

- Implement player ship with Phaser's Arcade Physics
- Create responsive controls for keyboard, mouse, and touch inputs
- Simulate low-gravity, inertia-driven movement
- Add ship sprites with proper animations for thrusting and rotation

### 2. Tether System

- Create a physics-based tether connecting player ship to salvage
- Implement realistic swing and momentum for tethered objects
- Visualize tether as a line with proper tension representation
- Handle collision detection between tethered salvage and environment

### 3. Salvage Collection

- Create basic salvage item types with different mass properties
- Implement collision detection for attaching salvage to player ship
- Create the parent ship as a deposit point for collected salvage
- Implement a simple scoring system based on deposited salvage

## Game Flow

```
+-------------+     +-----------+     +-------------+
| Main Menu   |---->| Gameplay  |---->| Game Over   |
|             |     |           |     |             |
| - Start     |     | - Exit    |     | - Restart   |
| - Settings  |<----|           |<----| - Main Menu |
+-------------+     +-----------+     +-------------+
```

### Main Menu Scene

- Title and game logo
- Start Game button
- Settings button (minimal implementation for Phase 1)
- Animated background with space theme

### Gameplay Scene

- Player ship controls
- Simple level with scattered salvage items
- Parent ship as deposit point
- Basic physics and tether mechanics
- Minimal HUD showing:
  - Current score
  - Exit button (returns to main menu)
  - Basic ship status indicators

### Game Over Scene

- Display final score
- Option to restart the game
- Option to return to main menu
- Brief animation or effect to signify game ending

## React-Phaser Integration

- Use EventBus for communication between React components and Phaser scenes
- Emit `current-scene-ready` events from each Phaser scene
- Implement UI overlays in React that respond to game state
- Handle responsive design for different device sizes

## Asset Requirements (Minimum Viable Product)

### Graphics
- Player ship sprite (with thrust animation)
- Parent ship sprite
- 3-5 different salvage item sprites
- Simple space background
- UI elements (buttons, score display, etc.)

### Audio
- Thruster sound effect
- Collision sound effect
- Tether attachment sound
- Salvage deposit sound
- Background music loop

## Implementation Tasks and Timeline

### Week 1: Project Setup and Basic Movement
- [ ] Create project structure following the template
- [ ] Set up game scenes architecture
- [ ] Implement basic ship movement with physics
- [ ] Create placeholder assets for development

### Week 2: Tether Mechanics and Salvage
- [ ] Implement the tether system physics
- [ ] Create salvage items with different properties
- [ ] Implement collision detection between ship and salvage
- [ ] Create parent ship and deposit mechanics

### Week 3: Game Flow and UI
- [ ] Implement main menu, gameplay, and game over scenes
- [ ] Create React components for UI overlays
- [ ] Implement EventBus communication
- [ ] Add exit button and menu navigation

### Week 4: Polishing and Testing
- [ ] Refine physics and movement feel
- [ ] Integrate final placeholder art and sound
- [ ] Test on different devices and input methods
- [ ] Fix bugs and optimize performance

## Technical Considerations

### Physics Implementation
- Use Phaser's Arcade Physics for ship movement
- Implement custom physics for the tether system using point-to-point constraints
- Handle mass and inertia calculations for realistic movement

### Input Handling
- Create adaptable control scheme that works across devices
- Implement touch controls that mirror keyboard/mouse functionality
- Use EventBus to communicate input changes between React and Phaser

### Performance Optimization
- Limit particle effects and complex physics calculations
- Implement object pooling for frequently created/destroyed objects
- Ensure responsive design works on various screen sizes

## Next Steps After Phase 1

- Enhance tether physics with more realistic behavior
- Add multiple levels with increasing difficulty
- Implement the upgrade system for ship improvements
- Create more diverse salvage types and obstacles
- Refine art style and add more visual polish

## Conclusion

This implementation plan provides a roadmap for developing Phase 1 of AstroHauler, focusing on the core mechanics and game flow. By following this plan, we'll create a functional prototype that demonstrates the key gameplay elements described in the design document while adhering to the structure outlined in the README.md file. 