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
│   │   ├── Player.ts       # Player ship class (created with physics, tether state added, range indicator added)
│   │   ├── Salvage.ts      # Salvage item class (implemented with mass, value, tether state)
│   │   ├── ParentShip.ts   # Parent ship class (implemented as static deposit point)
│   │   └── Tether.ts       # Tether physics system (implemented with Arcade physics simulation)
│   └── scenes/
│       ├── BootScene.ts      # Initial loading scene (created)
│       ├── PreloaderScene.ts # Asset preloading (created with placeholder assets)
│       ├── MainMenuScene.ts  # Main menu scene (created with placeholders)
│       ├── GameScene.ts      # Main gameplay scene (updated with controls, spawning, collisions, key-press tether logic)
│       └── GameOverScene.ts  # Game over scene (created with placeholders)
└── vite-env.d.ts           # Vite TypeScript declarations
```
*(Structure mostly follows the plan, relevant files implemented/updated for Weeks 1 & 2, Tether activation changed)*

## Core Mechanics Implementation

### 1. Ship Movement and Physics Setup

- Implement player ship with Phaser's Arcade Physics **(Done - Player class created)**
- Create responsive controls for keyboard, mouse, and touch inputs **(Keyboard Done - Week 2, Touch Implementation Added - Week 3)**
- Simulate low-gravity, inertia-driven movement **(Done - Zero-drag space physics implementation, objects maintain momentum)**
- Add ship sprites with proper animations for thrusting and rotation **(Done - Placeholder sprite added, animations pending assets)**

### 2. Tether System

- Create a physics-based tether connecting player ship to salvage **(Done - Week 2, Arcade physics simulation implemented in Tether class)**
- **(New)** Activate tether via key press ('t') when near salvage within a configurable range.
- **(New)** Display a visual indicator around the player showing the maximum tether attachment range.
- **(New)** Enhanced visual feedback for tether with stretch indicators and salvage highlighting.
- **(New)** Proper momentum preservation when tether is disconnected (zero-drag space physics).
- Implement realistic swing and momentum for tethered objects **(Partial - Week 2, Basic spring/damping forces added; full realism likely needs refinement/Matter.js)**
- Visualize tether as a line with proper tension representation **(Done - Week 2&3, Line drawn via Graphics with visual stretch indicators)**
- Handle collision detection between tethered salvage and environment **(Partial - Week 2, Salvage collides with world/other salvage, explicit tether collision not implemented)**

### 3. Salvage Collection and Haul System

- Create basic salvage item types with different mass properties **(Done - Week 2, Salvage class implemented with mass, value, and visual alpha cue)**
- Implement logic for attaching salvage to player ship **(Done - Tether initiated via key press 't' when near salvage)**
- Create the parent ship as a deposit point for collected salvage **(Done - Week 2, ParentShip class implemented and placed in GameScene)**
- Implement a simple scoring system based on deposited salvage **(Done - Week 2, Score updated on deposit in GameScene)**
- **(New)** Implement a "Haul" concept where each game session is a salvage run
- **(New)** Create an exit zone where players can end their Haul and return to base
- **(New)** Implement SpaceBucks persistence between Hauls using localStorage
- **(New)** Update UI to show both current Haul score and total SpaceBucks

## Game Flow

```
+-----------------+     +-----------------+     +-----------------+ 
| MainMenuScene   |---->| GameScene       |---->| GameOverScene   |
| (Phaser UI)     |     | (Gameplay)      |     | (Phaser UI)     |
| - Start Button  |     | - Exit Zone     |     | - New Haul      |
| - Settings (opt)|     | - Score Display |     | - Return to Base|
+-----------------+     +-----------------+     +-----------------+
                              |                        |
                              v                        v
                        [End Haul via]          [Total SpaceBucks 
                        [Exit Zone]              saved between hauls]
```
*(Updated flow implemented to support the Haul concept)*

### Main Menu Scene

- [X] Title and game logo (Text-based)
- [X] Start New Haul button
- [ ] Settings button (minimal implementation for Phase 1) - *(Deferred)*
- [ ] Animated background with space theme - *(Deferred)*

### Gameplay Scene

- [X] Player ship controls *(Keyboard WASD implemented Week 2 via GameScene)*
- [X] **(New)** Tether activation/release control *(Keyboard 't' implemented)*
- [X] **(New)** Touch controls with virtual joystick and tether button *(Week 3)*
- [X] Simple level with scattered salvage items *(Random spawning implemented Week 2)*
- [X] Parent ship as deposit point *(Implemented Week 2)*
- [X] Basic physics and tether mechanics *(Zero-drag space physics implemented for realistic momentum preservation)*
- [X] **(New)** Exit zone for ending the current Haul
- [X] **(New)** SpaceBucks persistence between Hauls
- [X] Minimal HUD showing:
  - [X] Current Haul score (Implemented Week 2)
  - [X] Total SpaceBucks (Implemented Week 3)
  - [X] Exit button (returns to main menu)
  - [ ] Basic ship status indicators *(Deferred)*

### Game Over Scene

- [X] Display Haul complete message
- [X] Display SpaceBucks earned in the Haul
- [X] Display total SpaceBucks
- [X] Option to start a new Haul
- [X] Option to return to base (main menu)
- [ ] Brief animation or effect to signify Haul ending *(Deferred)*

## React-Phaser Integration

- [X] Use EventBus for communication between React components and Phaser scenes *(Setup in template, placeholder components created)*
- [X] Emit `current-scene-ready` events from each Phaser scene *(Implemented in created scenes)*
- [X] Emit `score-updated` event from GameScene *(Implemented Week 2)*
- [X] Update React UI components to display both current Haul score and total SpaceBucks
- [ ] Handle responsive design for different device sizes *(Partially handled by Phaser config, React UI needs testing)*

## Asset Requirements (Minimum Viable Product - Phase 1, Week 1 & 2 Focus)

### Graphics
- [X] Player ship sprite (`ship.png`)
- [X] Parent ship sprite (`parent_ship.png`)
- [X] 1 salvage item sprite (`salvage_1.png`)
- [X] 3-5 different salvage item sprites *(Updated with 7 assets: `salvage_1.png` - `salvage_7.png`)*
- [X] Simple space background (`Starfield.png`)
- [X] **(New)** Exit zone visual indicator
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

### Week 2: Player Controls, Tether & Salvage Mechanics (Completed, Tether Revised)
- [X] Implement player controls (Keyboard essential - WASD) *(WASD implemented in GameScene)*
- [X] Implement the tether system physics (initial version) *(Arcade physics spring/damping simulation in Tether.ts)*
- [X] **(Revised)** Implement tether activation via key press ('t') with range limit and visual indicator.
- [X] Create salvage items with different properties *(Salvage class with mass, value, alpha, and now uses multiple textures `salvage_1` to `salvage_7`)*
- [X] Create parent ship object *(ParentShip class created and added to GameScene)*
- [X] Implement salvage deposit mechanics (overlap with parent ship) *(Overlap check and deposit logic added in GameScene)*

### Week 3: Game Flow Refinement & UI Hookup
- [X] Refine main menu, gameplay, and game over scene interactions *(Scene transitions verified)*
- [X] Create/Refine React components for UI overlays *(Implemented GameUI.tsx)*
- [X] Implement EventBus communication for UI updates *(Implemented for score)*
- [X] Add exit button functionality and basic menu navigation *(Confirmed functional)*
- [X] Implement basic scoring logic based on deposited salvage *(Confirmed functional)*
- [X] **(New)** Implement touch controls with virtual joystick and tether button
- [X] **(New)** Implement zero-drag space physics for realistic momentum preservation when tether is disconnected
- [X] **(New)** Add enhanced visual feedback for tether with stretch indicators and salvage highlighting
- [X] **(New)** Implement "Haul" concept with exit zone for ending current Haul
- [X] **(New)** Add SpaceBucks persistence between Hauls using localStorage
- [X] **(New)** Update UI to display both current Haul score and total SpaceBucks

### Week 4: Polishing and Testing
- [ ] Refine physics and movement feel (based on playtesting)
- [ ] Refine tether mechanics (adjust spring/damping constants in `GameConfig.ts`, test attach/detach feel)
- [ ] Integrate final placeholder art and sound *(If available)*
- [ ] Test on different devices and input methods (focus on keyboard for Phase 1)
- [ ] Fix bugs and optimize performance (consider object pooling for salvage later)
- [ ] Test SpaceBucks persistence between Hauls
- [ ] Refine exit zone user experience

## Technical Considerations

### Physics Implementation
- [X] Use Phaser's Arcade Physics for ship movement
- [X] Implement custom physics for the tether system using point-to-point constraints *(Simulated using Arcade spring/damping forces in Tether.ts for Phase 1)*
- [X] Handle mass and inertia calculations for realistic movement *(Basic mass/drag/force concepts implemented with zero drag for space physics)*
- [X] **(New)** Implement proper momentum preservation when tether is disconnected (zero-drag, zero-friction space physics)

### Input Handling
- [X] Create adaptable control scheme that works across devices *(Keyboard WASD + T implemented Week 2/3 via config, touch controls added Week 3)*
- [X] **(New)** Implement touch controls that mirror keyboard/mouse functionality *(Added virtual joystick and tether button)*
- [X] Use EventBus to communicate input changes between React and Phaser *(Input handled in GameScene, EventBus used for score updates)*

### Performance Optimization
- [ ] Limit particle effects and complex physics calculations *(Ongoing consideration)*
- [ ] Implement object pooling for frequently created/destroyed objects *(Consider for Salvage in Week 4/Phase 2)*
- [ ] Ensure responsive design works on various screen sizes *(Basic setup, needs testing)*

### Data Persistence
- [X] **(New)** Use localStorage to persist SpaceBucks between Hauls
- [X] **(New)** Implement loading/saving of player progress

## Next Steps After Phase 1

- Enhance tether physics with more realistic behavior (potentially explore Matter.js)
- Add multiple levels with increasing difficulty
- Implement the upgrade system for ship improvements
- Create more diverse salvage types and obstacles
- Refine art style and add more visual polish
- Expand the base (MainMenu) to allow SpaceBucks spending on upgrades

## Conclusion

This implementation plan provides a roadmap for developing Phase 1 of AstroHauler. Weeks 1 and 2 tasks are complete, establishing the project structure, core objects, keyboard controls, basic UI, and the initial salvage collection loop. **The tether system has been updated to use a key press ('t') for activation/deactivation, targeting the nearest salvage within a configurable range, which is now visually indicated.**

**Week 3 updates include:**
1. Implementing zero-drag space physics for proper momentum preservation when tether is disconnected
2. Adding enhanced visual feedback for the tether with stretch indicators and salvage highlighting
3. Implementing touch controls with a virtual joystick and tether button
4. Ensuring player and salvage maintain their velocity when the tether is disconnected
5. Implementing the "Haul" concept where each game session is a salvage mission
6. Adding an exit zone where players can end their current Haul and return to base
7. Implementing SpaceBucks persistence between Hauls using localStorage
8. Updating UI to show both current Haul score and total SpaceBucks

The next step (Week 4) focuses on polishing and testing the game mechanics, refining the physics feel, and optimizing performance across different devices. 


TODO: 
Get parent ship in the correct position

Position exit on parent ship
Position Deposit on parent ship

Handle damage
Handle parent ship collision
Handle collisions

damage VFX
Deposit VFX

Need to setup background, some parralax

Setup control room

