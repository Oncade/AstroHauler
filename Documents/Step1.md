# AstroHauler - Phase 1 Implementation Plan

## Overview

This document outlines the implementation plan for Phase 1 of AstroHauler, focusing on prototyping and core mechanics as defined in the game design document. This phase will establish the foundation of the game with basic physics, ship movement, and the tether system for salvage dragging.

## Project Structure

Following the Phaser-React-TypeScript template structure:

```
public/                     # Static assets
├── assets/
│   ├── images/             # Game sprites and UI elements (ship.png, parent_ship.png, salvage_1.png to salvage_7.png, Starfield.png added)
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
│   │   └── GameConfig.ts   # Game configuration constants (created, expanded)
│   ├── objects/
│   │   ├── Player.ts       # Player ship class (created with physics, tether state added)
│   │   ├── Salvage.ts      # Salvage item class (implemented with mass, value, tether state)
│   │   ├── ParentShip.ts   # Parent ship class (implemented as static deposit point)
│   │   └── Tether.ts       # Tether physics system (implemented with Arcade physics simulation)
│   └── scenes/
│       ├── BootScene.ts      # Initial loading scene (created)
│       ├── PreloaderScene.ts # Asset preloading (created with placeholder assets)
│       ├── MainMenuScene.ts  # Main menu scene (created with placeholders)
│       ├── GameScene.ts      # Main gameplay scene (updated with controls, spawning, collisions, tether logic)
│       └── GameOverScene.ts  # Game over scene (created with placeholders)
└── vite-env.d.ts           # Vite TypeScript declarations
```
*(Structure mostly follows the plan, relevant files implemented/updated for Weeks 1 & 2)*

## Core Mechanics Implementation

### 1. Ship Movement and Physics Setup

- Implement player ship with Phaser's Arcade Physics **(Done - Player class created)**
- Create responsive controls for keyboard, mouse, and touch inputs **(Keyboard Done - Week 2, Mouse/Touch Deferred)**
- Simulate low-gravity, inertia-driven movement **(Done - Via Player physics properties & config)**
- Add ship sprites with proper animations for thrusting and rotation **(Done - Placeholder sprite added, animations pending assets)**

### 2. Tether System

- Create a physics-based tether connecting player ship to salvage **(Done - Week 2, Arcade physics simulation implemented in Tether class)**
- Implement realistic swing and momentum for tethered objects **(Partial - Week 2, Basic spring/damping forces added; full realism likely needs refinement/Matter.js)**
- Visualize tether as a line with proper tension representation **(Done - Week 2, Line drawn via Graphics, tension not visually represented yet)**
- Handle collision detection between tethered salvage and environment **(Partial - Week 2, Salvage collides with world/other salvage, explicit tether collision not implemented)**

### 3. Salvage Collection

- Create basic salvage item types with different mass properties **(Done - Week 2, Salvage class implemented with mass, value, and visual alpha cue)**
- Implement collision detection for attaching salvage to player ship **(Done - Week 2, Overlap check in GameScene initiates Tether)**
- Create the parent ship as a deposit point for collected salvage **(Done - Week 2, ParentShip class implemented and placed in GameScene)**
- Implement a simple scoring system based on deposited salvage **(Done - Week 2, Score updated on deposit in GameScene)**

## Game Flow

```
+-----------------+     +-----------------+     +-----------------+ 
| MainMenuScene   |---->| GameScene       |---->| GameOverScene   |
| (Phaser UI)     |     | (Gameplay)      |     | (Phaser UI)     |
| - Start Button  |     | - Exit Button   |     | - Restart Button|
| - Settings (opt)|     | - Score Display |     | - Menu Button   |
+-----------------+     +-----------------+     +-----------------+
```
*(Initial flow implemented using Phaser Scenes, GameScene mechanics added)*

### Main Menu Scene

- [X] Title and game logo (Text-based)
- [X] Start Game button
- [ ] Settings button (minimal implementation for Phase 1) - *(Deferred)*
- [ ] Animated background with space theme - *(Deferred)*

### Gameplay Scene

- [X] Player ship controls *(Keyboard WASD implemented Week 2 via GameScene)*
- [X] Simple level with scattered salvage items *(Random spawning implemented Week 2)*
- [X] Parent ship as deposit point *(Implemented Week 2)*
- [X] Basic physics and tether mechanics *(Arcade physics simulation implemented Week 2)*
- [X] Minimal HUD showing:
  - [X] Current score (Implemented Week 2)
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
- [X] Emit `score-updated` event from GameScene *(Implemented Week 2)*
- [ ] Implement UI overlays in React that respond to game state *(Placeholders created, actual implementation deferred)*
- [ ] Handle responsive design for different device sizes *(Partially handled by Phaser config, React UI needs testing)*

## Asset Requirements (Minimum Viable Product - Phase 1, Week 1 & 2 Focus)

### Graphics
- [X] Player ship sprite (`ship.png`)
- [X] Parent ship sprite (`parent_ship.png`)
- [X] 1 salvage item sprite (`salvage_1.png`)
- [X] 3-5 different salvage item sprites *(Updated with 7 assets: `salvage_1.png` - `salvage_7.png`)*
- [X] Simple space background (`Starfield.png`)
- [X] UI elements (buttons, score display, etc.) *(Text-based placeholders implemented)*

### Audio
- [ ] Thruster sound effect *(Deferred)*
- [ ] Collision sound effect *(Deferred)*
- [ ] Tether attachment sound *(Deferred)*
- [ ] Salvage deposit sound *(Deferred)*
- [ ] Background music loop *(Deferred)*

## Implementation Tasks and Timeline *(Revised)*

**Note:** Focus is on core mechanics using Arcade Physics for Phase 1.

### Week 1: Project Setup and Basic Movement (Completed)
- [X] Create project structure following the template
- [X] Set up game scenes architecture
- [X] Implement basic ship movement with physics *(Player class and physics properties set up)*
- [X] Create placeholder assets for development *(Initial placeholders replaced with first assets)*

### Week 2: Player Controls, Tether & Salvage Mechanics (Completed)
- [X] **Implement player controls (Keyboard essential)** *(WASD implemented in GameScene)*
- [X] Implement the tether system physics (initial version) *(Arcade physics spring/damping simulation in Tether.ts)*
- [X] Create salvage items with different properties *(Salvage class with mass, value, alpha, and now uses multiple textures `salvage_1` to `salvage_7`)*
- [X] Implement collision detection between ship and salvage (for tether attachment) *(Overlap check added in GameScene)*
- [X] Create parent ship object *(ParentShip class created and added to GameScene)*
- [X] Implement salvage deposit mechanics (collision/overlap with parent ship) *(Overlap check and deposit logic added in GameScene)*

### Week 3: Game Flow Refinement & UI Hookup
- [ ] Refine main menu, gameplay, and game over scene interactions
- [ ] Create/Refine React components for UI overlays (e.g., score display using `score-updated` event)
- [ ] Implement EventBus communication for UI updates (Game over state, etc.)
- [ ] Add exit button functionality and basic menu navigation *(Exit button exists, ensure robust)*
- [ ] Implement basic scoring logic based on deposited salvage *(Base logic done, refine if needed)*

### Week 4: Polishing and Testing
- [ ] Refine physics and movement feel (based on playtesting)
- [ ] Refine tether mechanics (adjust spring/damping constants in `GameConfig.ts`, based on playtesting)
- [ ] Integrate final placeholder art and sound *(If available)*
- [ ] Test on different devices and input methods (focus on keyboard for Phase 1)
- [ ] Fix bugs and optimize performance (consider object pooling for salvage later)

## Technical Considerations

### Physics Implementation
- [X] Use Phaser's Arcade Physics for ship movement
- [X] Implement custom physics for the tether system using point-to-point constraints *(Simulated using Arcade spring/damping forces in Tether.ts for Phase 1)*
- [X] Handle mass and inertia calculations for realistic movement *(Basic mass/drag/force concepts implemented)*

### Input Handling
- [X] Create adaptable control scheme that works across devices *(Keyboard implemented Week 2 via config)*
- [ ] Implement touch controls that mirror keyboard/mouse functionality *(Deferred to Phase 2)*
- [X] Use EventBus to communicate input changes between React and Phaser *(Input handled in GameScene, EventBus used for score updates)*

### Performance Optimization
- [ ] Limit particle effects and complex physics calculations *(Ongoing consideration)*
- [ ] Implement object pooling for frequently created/destroyed objects *(Consider for Salvage in Week 4/Phase 2)*
- [ ] Ensure responsive design works on various screen sizes *(Basic setup, needs testing)*

## Next Steps After Phase 1

- Enhance tether physics with more realistic behavior (potentially explore Matter.js)
- Add multiple levels with increasing difficulty
- Implement the upgrade system for ship improvements
- Create more diverse salvage types and obstacles
- Refine art style and add more visual polish

## Conclusion

This implementation plan provides a roadmap for developing Phase 1 of AstroHauler. Weeks 1 and 2 tasks are complete, establishing the project structure, core objects (Player, Salvage, ParentShip), keyboard controls, basic UI, and the initial tether/salvage collection loop using an Arcade Physics simulation. **The next step (Week 3) will focus on refining the game flow between scenes and hooking up the React UI to display game state information like the score.** 