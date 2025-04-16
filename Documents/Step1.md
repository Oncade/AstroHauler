# AstroHauler - Phase 1 Implementation Plan

## Overview

This document outlines the implementation plan for Phase 1 of AstroHauler, focusing on prototyping and core mechanics as defined in the game design document. This phase will establish the foundation of the game with basic physics, ship movement, and the tether system for salvage dragging.

## Project Structure

Following the Phaser-React-TypeScript template structure:

```
public/                     # Static assets
├── assets/
│   ├── images/             # Game sprites and UI elements (ship_placeholder.png added)
│   └── audio/              # Sound effects and music (placeholder)
└── index.html              # Main HTML file
src/
├── App.tsx                 # Main React component (updated)
├── main.tsx                # React entry point
├── components/
│   ├── MainMenu.tsx        # Main menu component (placeholder created)
│   ├── GameUI.tsx          # In-game UI overlay (placeholder created)
│   └── GameOverScreen.tsx  # Game over screen component (placeholder created)
├── game/
│   ├── main.ts             # Game configuration (created)
│   ├── PhaserGame.tsx      # React-Phaser bridge (exists in template)
│   ├── EventBus.ts         # Communication between React and Phaser (exists in template)
│   ├── config/
│   │   └── GameConfig.ts   # Game configuration constants (created)
│   ├── objects/
│   │   ├── Player.ts       # Player ship class (created with physics)
│   │   ├── Salvage.ts      # Salvage item class (placeholder created)
│   │   ├── ParentShip.ts   # Parent ship class (placeholder created)
│   │   └── Tether.ts       # Tether physics system (placeholder created)
│   └── scenes/
│       ├── BootScene.ts      # Initial loading scene (created)
│       ├── PreloaderScene.ts # Asset preloading (created with placeholder assets)
│       ├── MainMenuScene.ts  # Main menu scene (created with placeholders)
│       ├── GameScene.ts      # Main gameplay scene (created with player)
│       └── GameOverScene.ts  # Game over scene (created with placeholders)
└── vite-env.d.ts           # Vite TypeScript declarations
```
*(Structure mostly follows the plan, placeholder files created for future weeks)*

## Core Mechanics Implementation

### 1. Ship Movement and Physics Setup

- Implement player ship with Phaser's Arcade Physics **(Done - Player class created)**
- Create responsive controls for keyboard, mouse, and touch inputs **(Pending - Phase 2)**
- Simulate low-gravity, inertia-driven movement **(Done - Via Player physics properties)**
- Add ship sprites with proper animations for thrusting and rotation **(Done - Placeholder sprite added, animations pending assets)**

### 2. Tether System

- Create a physics-based tether connecting player ship to salvage **(Pending - Week 2, placeholder Tether class created)**
- Implement realistic swing and momentum for tethered objects **(Pending - Week 2/Refinement)**
- Visualize tether as a line with proper tension representation **(Pending - Week 2, basic line added to Tether placeholder)**
- Handle collision detection between tethered salvage and environment **(Pending - Week 2/3)**

### 3. Salvage Collection

- Create basic salvage item types with different mass properties **(Pending - Week 2, placeholder Salvage class created)**
- Implement collision detection for attaching salvage to player ship **(Pending - Week 2)**
- Create the parent ship as a deposit point for collected salvage **(Pending - Week 2, placeholder ParentShip class created)**
- Implement a simple scoring system based on deposited salvage **(Pending - Week 2/3)**

## Game Flow

```
+-----------------+     +-----------------+     +-----------------+
| MainMenuScene   |---->| GameScene       |---->| GameOverScene   |
| (Phaser UI)     |     | (Phaser UI)     |     | (Phaser UI)     |
| - Start Button  |     | - Exit Button   |     | - Restart Button|
| - Settings (opt)|     | - Score Display |     | - Menu Button   |
+-----------------+     +-----------------+     +-----------------+
```
*(Initial flow implemented using Phaser Scenes)*

### Main Menu Scene

- [X] Title and game logo (Text-based)
- [X] Start Game button
- [ ] Settings button (minimal implementation for Phase 1) - *(Deferred)*
- [ ] Animated background with space theme - *(Deferred)*

### Gameplay Scene

- [X] Player ship controls *(Setup in Player class, input handling pending)*
- [X] Simple level with scattered salvage items *(Level setup basic, items pending Week 2)*
- [X] Parent ship as deposit point *(Object pending Week 2)*
- [X] Basic physics and tether mechanics *(Physics setup done, tether mechanics pending Week 2)*
- [X] Minimal HUD showing:
  - [X] Current score (Placeholder text)
  - [X] Exit button (returns to main menu)
  - [ ] Basic ship status indicators *(Deferred)*

### Game Over Scene

- [X] Display final score (Placeholder logic)
- [X] Option to restart the game
- [X] Option to return to main menu
- [ ] Brief animation or effect to signify game ending *(Deferred)*

## React-Phaser Integration

- [X] Use EventBus for communication between React components and Phaser scenes *(Setup in template, placeholder components created)*
- [X] Emit `current-scene-ready` events from each Phaser scene *(Implemented in created scenes)*
- [ ] Implement UI overlays in React that respond to game state *(Placeholders created, actual implementation deferred)*
- [ ] Handle responsive design for different device sizes *(Partially handled by Phaser config, React UI needs testing)*

## Asset Requirements (Minimum Viable Product - Phase 1, Week 1 Focus)

### Graphics
- [X] Player ship sprite (Placeholder created: `ship_placeholder.png`)
- [ ] Parent ship sprite *(Placeholder object created, asset pending)*
- [ ] 3-5 different salvage item sprites *(Placeholder object created, assets pending)*
- [ ] Simple space background *(Deferred)*
- [X] UI elements (buttons, score display, etc.) *(Text-based placeholders implemented)*

### Audio
- [ ] Thruster sound effect *(Deferred)*
- [ ] Collision sound effect *(Deferred)*
- [ ] Tether attachment sound *(Deferred)*
- [ ] Salvage deposit sound *(Deferred)*
- [ ] Background music loop *(Deferred)*

## Implementation Tasks and Timeline

### Week 1: Project Setup and Basic Movement (Completed)
- [X] Create project structure following the template
- [X] Set up game scenes architecture
- [X] Implement basic ship movement with physics *(Player class and physics properties set up)*
- [X] Create placeholder assets for development *(Ship placeholder PNG created)*

### Week 2: Tether Mechanics and Salvage
- [ ] Implement the tether system physics
- [ ] Create salvage items with different properties
- [ ] Implement collision detection between ship and salvage
- [ ] Create parent ship and deposit mechanics

### Week 3: Game Flow Refinement, Controls & UI
- [ ] Implement main menu, gameplay, and game over scenes *(Refine existing placeholders)*
- [ ] Create/Refine React components for UI overlays
- [ ] Implement EventBus communication for UI updates (Score, etc.)
- [ ] Implement player controls (Keyboard essential, Mouse/Touch optional for Phase 1/2)
- [ ] Add exit button and menu navigation *(Basic exit implemented)*

### Week 4: Polishing and Testing
- [ ] Refine physics and movement feel
- [ ] Integrate final placeholder art and sound *(If available)*
- [ ] Test on different devices and input methods
- [ ] Fix bugs and optimize performance

## Technical Considerations

### Physics Implementation
- [X] Use Phaser's Arcade Physics for ship movement
- [ ] Implement custom physics for the tether system using point-to-point constraints *(Arcade physics approach started in Tether placeholder, needs refinement)*
- [ ] Handle mass and inertia calculations for realistic movement *(Basic drag/mass concepts introduced)*

### Input Handling
- [ ] Create adaptable control scheme that works across devices *(Pending Phase 2)*
- [ ] Implement touch controls that mirror keyboard/mouse functionality *(Pending Phase 2)*
- [ ] Use EventBus to communicate input changes between React and Phaser *(Optional, depending on control implementation)*

### Performance Optimization
- [ ] Limit particle effects and complex physics calculations *(Ongoing consideration)*
- [ ] Implement object pooling for frequently created/destroyed objects *(Consider for Salvage in Week 2/3)*
- [ ] Ensure responsive design works on various screen sizes *(Basic setup, needs testing)*

## Next Steps After Phase 1

- Enhance tether physics with more realistic behavior
- Add multiple levels with increasing difficulty
- Implement the upgrade system for ship improvements
- Create more diverse salvage types and obstacles
- Refine art style and add more visual polish

## Conclusion

This implementation plan provides a roadmap for developing Phase 1 of AstroHauler, focusing on the core mechanics and game flow. **Week 1 tasks are complete**, establishing the project structure, basic scenes, and the player object with initial physics. The next steps involve implementing the core tether and salvage mechanics in Week 2. 