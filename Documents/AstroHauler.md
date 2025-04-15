```markdown
# AstroHauler  
*A 2D Space Salvage Arcade Game in PhaserJS*

---

## 1. Game Overview

**Concept:**  
AstroHauler casts you as a daring interstellar salvager navigating a hazardous cosmic junkyard. Your mission is to collect scattered salvage pieces, convert them into "spacebucks," and upgrade your ship for deeper, riskier excursions. Inspired by classics like Solar Jet Man, the game blends retro arcade physics with modern multi-input control schemes (keyboard, mouse, and touch), enhanced by a unique salvage dragging mechanic.

**Genre:**  
- Arcade  
- Action  
- Platformer

**Platform:**  
- Web (developed in PhaserJS; deployable on desktop and mobile browsers)

**Art Style:**  
- Retro pixel art  
- Neon and futuristic elements  
- Vibrant starfields, glowing ship upgrades, and detailed salvage debris

**Target Audience:**  
- Casual gamers  
- Retro gaming enthusiasts  
- Fans of physics-based arcade challenges

---

## 2. Story & Theme

**Narrative:**  
Deep in space, the relics of forgotten civilizations float among cosmic debris. As a resourceful salvage pilot, you recover these lost fragments only to face an additional challenge: every piece must be physically dragged back to your larger parent ship using a tether system. This tether introduces realistic inertia and swing dynamics, so you must weigh the benefit of each salvage against the burden it may impose. Successfully navigating these challenges rewards you with "spacebucks" that allow you to upgrade your vessel and push even further into the unknown.

**Core Themes:**  
- **Exploration and Discovery:** Safely navigate hazardous environments to uncover mysterious relics.  
- **Progression and Upgrade:** Exchange salvage for currency to enhance your ship’s performance—essential for managing heavier or awkward salvage pieces.  
- **Risk and Reward:** Choose wisely which salvage to pursue, as each item affects your ship’s handling and adds physics-based challenges.

---

## 3. Gameplay Mechanics

### Core Loop

1. **Exploration:**  
   - Pilot your agile ship through side-scrolling space zones filled with debris, obstacles, and scattered salvage pieces.
2. **Collection & Tethered Drag:**  
   - When you come into contact with a salvage item, it attaches to your ship via a tether.
   - **Tether Mechanic:** Instead of automatically storing the item, you must navigate back to your larger parent ship to drag it in. The tether behaves realistically—introducing lag, swing, and potential collisions—that can complicate flight control.
3. **Exchange & Upgrade:**  
   - Once at the parent ship, the tethered salvage is automatically deposited, converting its value into spacebucks.
   - Use spacebucks to upgrade your ship, improving attributes such as thrust, maneuverability, shield durability, or unlocking special abilities.
4. **Challenge & Progression:**  
   - Later levels present heavier, more awkward salvage pieces alongside increased environmental hazards (e.g., asteroids, enemy drones), pushing players to balance the risk of dragging salvage against potential rewards.

### Physics and Environment

- **Physics Engine:**  
  Use Phaser’s Arcade Physics to simulate low-gravity, inertia-driven movement with added tether dynamics. The tethered salvage behaves like a damped pendulum, introducing realistic swing and momentum challenges.
- **Collision Detection:**  
  Fine-tune collisions between your ship, swinging salvage, and environmental hazards.
- **Obstacles:**  
  Include dynamic obstacles like shifting debris fields, moving asteroids, and enemy drones that increase the challenge of safely navigating while dragging salvage.

### Salvage & Currency System

- **Salvage Pieces:**  
  - Different categories (common, rare, ultra-rare) with varying mass and inertia, making some items trickier to drag.
- **Spacebucks:**  
  - Earned by depositing salvage at the parent ship. Heavier or more cumbersome items might offer greater rewards.
- **Upgrade Options:**  
  - Spend spacebucks on:
    - **Improved Thrusters:** Better acceleration and ability to counter tether drag.
    - **Enhanced Shields & Durability:** For absorbing impacts from swinging salvage.
    - **Special Abilities:** Like temporary stabilization of the tether.

---

## 4. Control Schemes

### Keyboard Controls

- **Movement:**  
  - Use Arrow Keys or WASD for directional thrust (up for boost; left/right for lateral movement).
- **Action Buttons:**  
  - Space Bar: Secondary boost or activating a special ability (e.g., temporary tether stabilization).  
  - `E` or `F`: Interact with salvage hubs or initiate ship upgrades.

### Mouse Controls

- **Navigation & Interaction:**  
  - Employ click-and-drag mechanics to adjust direction or force to counteract tether swings.  
  - Click on salvage pieces or upgrade icons to trigger collection or open upgrade menus.

### Touch Controls (Mobile)

- **Virtual Joystick:**  
  - On-screen joystick for directional input, positioned conveniently on one side.
- **Action Buttons:**  
  - On-screen buttons for boosting, stabilizing the tether (if available), or interacting with salvage.
- **Gestures:**  
  - Tap to engage with salvage pieces.  
  - Swipe to apply directional thrust adjustments, especially during tether management.

**Customization:**  
- Options for remapping controls and adjusting sensitivity settings across keyboard, mouse, and touch inputs for optimal performance on all devices.

---

## 5. User Interface (UI) & Heads-Up Display (HUD)

### Main Menu

- **Options Include:**  
  - Start Game  
  - Upgrade Ship  
  - Leaderboards  
  - Settings (with control customization for all input types)  
  - Credits

### In-Game HUD

- **Currency Display:**  
  - Prominent display of the current spacebucks balance.
- **Ship & Tether Status:**  
  - Indicators for ship health, fuel levels, and visual cues for tethered salvage (e.g., mass, swing amplitude, risk factor).
- **Mini-Map/Radar:**  
  - Shows nearby hazards and salvage opportunities.
- **Upgrade Prompt:**  
  - Notifications for salvage hubs or available upgrades.
- **Pause/Settings:**  
  - Easily accessible pause button leading to settings and adjustments.

### Upgrade Interface

- **Upgrade Menu:**  
  - Visual representation of available upgrades—especially those mitigating tether challenges (e.g., stabilization modules)—with associated spacebuck costs.
- **Confirmation Dialogs:**  
  - User-friendly steps to prevent accidental purchases.

---

## 6. Art & Audio Design

### Visual Assets

- **Spaceship & Parent Ship:**  
  - Distinct pixel art designs representing your agile salvage ship and the larger parent ship (the collection hub).
- **Tether Visuals:**  
  - A dynamic, glowing tether effect that simulates tension, swing, and drag.
- **Backgrounds:**  
  - Parallax scrolling starfields, nebulas, and distant celestial bodies for enhanced depth and immersion.
- **Salvage Pieces & Obstacles:**  
  - Diverse sprites that reflect different salvage types, with animations indicating weight and inertia.
- **UI Elements:**  
  - Retro-style fonts and HUD icons that align with the overall space salvage aesthetic.

### Audio Assets

- **Sound Effects:**  
  - Engine thrust sounds  
  - Tether drag effects (e.g., futuristic creaks or strain noises)  
  - Collision impacts  
  - Collection confirmation cues
- **Background Music:**  
  - Synthwave or chiptune tracks that complement the retro arcade vibe.
- **Dynamic Audio Cues:**  
  - Adaptive sound feedback for changes in speed, collisions, or significant tether movements.

---

## 7. Technical Architecture

### Game Engine & Framework

- **PhaserJS:**  
  - Leverage Phaser’s Arcade Physics to simulate low gravity, inertia, and tether dynamics.
- **HTML5 & JavaScript:**  
  - Utilize standard web technologies for cross-browser compatibility.
- **Responsive Design:**  
  - Ensure that all gameplay elements—including the tether dragging mechanic—scale well across different screen sizes.
- **Asset Management:**  
  - Efficient preloading of sprites, audio files, and physics data for smooth transitions and gameplay.

### Code Structure

- **Modular Codebase:**  
  - Separate modules for ship control, tether physics, UI interactions, and level management.
- **State Management:**  
  - Use Phaser’s scene management to handle transitions between different game states (menus, gameplay, upgrades).
- **Event Handling:**  
  - Organize event handlers for keyboard, mouse, and touch inputs, with dedicated routines for tether stabilization and drag physics.
- **Data Persistence:**  
  - Save player progress, upgrades, and high scores using local storage or appropriate web APIs.

---

## 8. Level Design & Progression

### Level Structure

- **Tutorial Level:**  
  - Introduce basic movement and salvage collection while emphasizing the tethered drag mechanic in a low-risk setting.
- **Progressive Difficulty:**  
  - Gradually increase challenge by introducing heavier salvage pieces and dynamic hazards.
- **Zone Themes:**  
  - Create unique themes (e.g., asteroid belts, abandoned stations, dense debris fields) that test various aspects of ship handling and tether management.

### Replayability & Challenges

- **Score Challenges:**  
  - Integrate leaderboards and daily challenges for mastering navigation and tether control.
- **Risk-Reward Decisions:**  
  - Each salvage collection is a strategic choice, with some items offering higher rewards at the cost of more complex physics challenges.
- **Power-Ups & Bonuses:**  
  - Occasional boosts such as temporary tether stabilization or reduced drag add variety to the gameplay.
- **Boss Encounters:**  
  - Feature scenarios where managing multiple tethers (e.g., against large salvage clusters or enemy drones) tests the player’s control finesse.

---

## 9. Development Roadmap

1. **Phase 1: Prototyping & Core Mechanics**
   - Implement basic physics, ship movement in PhaserJS, and establish the tether system for salvage dragging.
   - Create a simple level demonstrating salvage collection, tether dynamics, and deposit functionality into the parent ship.

2. **Phase 2: Controls & UI Integration**
   - Integrate multi-input control schemes (keyboard, mouse, and touch) with specialized routines for tether dynamics.
   - Develop a functional HUD that provides real-time feedback on tether status, ship condition, and salvage progress.

3. **Phase 3: Level Design & Asset Integration**
   - Create multiple levels featuring diverse salvage weights and environmental hazards.
   - Integrate art assets, animate tether behavior, and tie dynamic audio effects to the dragging mechanic.

4. **Phase 4: Upgrades & Advanced Features**
   - Build a detailed upgrade system allowing investment in improvements (e.g., enhanced thrusters, stabilization modules) to counter tether challenges.
   - Refine physics interactions and introduce power-ups that temporarily reduce drag complications.

5. **Phase 5: Testing & Deployment**
   - Conduct thorough testing on desktop and mobile devices.
   - Optimize performance, gather player feedback, and finalize deployment strategies.

---

## 10. Future Enhancements

- **Multiplayer or Co-Op Mode:**  
  - Introduce cooperative or competitive play where players coordinate salvage collection and manage shared tether dynamics.
- **Advanced Customizations:**  
  - Offer cosmetic upgrades or customizable tether styles to reflect player progress and skill.
- **Online Leaderboards & Achievements:**  
  - Incorporate social features to reward skillful salvage collection and physics management.
- **Dynamic Events:**  
  - Implement time-limited events (e.g., solar flares affecting tether stability) that introduce additional challenges and variation.

---

## Conclusion

AstroHauler redefines the classic salvage arcade experience by integrating a challenging tether dragging mechanic. Players must balance risk, reward, and physics-driven movement as they gather salvage and upgrade their ship to explore the farthest reaches of space. Leveraging PhaserJS and modern input methods, AstroHauler offers a nostalgic yet innovative challenge where every salvage run demands strategic physics management and skillful navigation.

*Happy coding—and may your journey through the cosmos be filled with rewarding hauls!*
```