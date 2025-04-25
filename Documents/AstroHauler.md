# AstroHauler  
*A 2D Space Salvage Arcade Game in PhaserJS*

---

## 1. Game Overview

**Concept:**  
AstroHauler casts you as a daring interstellar salvager navigating a hazardous cosmic junkyard. Your mission is to collect scattered salvage pieces, convert them into "SpaceBucks," and upgrade your ship for deeper, riskier excursions. Each salvage mission, known as a "Haul," allows you to collect SpaceBucks that persist between games. Inspired by classics like Solar Jet Man, the game blends retro arcade physics with modern multi-input control schemes (keyboard, mouse, and touch), enhanced by a unique salvage dragging mechanic.

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
Deep in space, the relics of forgotten civilizations float among cosmic debris. As a resourceful salvage pilot, you venture out on "Hauls" to recover these lost fragments only to face an additional challenge: every piece must be physically dragged back to your larger parent ship using a tether system. This tether introduces realistic inertia and swing dynamics, so you must weigh the benefit of each salvage against the burden it may impose. Successfully navigating these challenges rewards you with "SpaceBucks" that persist between Hauls, allowing you to upgrade your vessel and push even further into the unknown.

**Core Themes:**  
- **Exploration and Discovery:** Safely navigate hazardous environments to uncover mysterious relics during your Hauls.  
- **Progression and Upgrade:** Exchange salvage for currency to enhance your ship's performance at your home base between Hauls.  
- **Risk and Reward:** Choose wisely which salvage to pursue, and decide when to end your Haul to safely bank your earned SpaceBucks.

---

## 3. Gameplay Mechanics

### Core Loop

1. **Start Game & Enter Command Center:**
   - From the main menu, players enter their ship's command center, where they can see their current ship, total SpaceBucks, and mission details.

2. **Preparation & Launch:**
   - Review ship stats and available SpaceBucks in the command center.
   - Choose to start a new Haul when ready to deploy.

3. **Exploration (Haul):**  
   - Pilot your agile ship through side-scrolling space zones filled with debris, obstacles, and scattered salvage pieces.

4. **Collection & Tethered Drag:**  
   - When you come near a salvage item, you can attach it to your ship via a tether.
   - **Tether Mechanic:** Instead of automatically storing the item, you must navigate back to your larger parent ship to drag it in. The tether behaves realistically—introducing lag, swing, and potential collisions—that can complicate flight control.

5. **Deposit & Accumulate:**  
   - Once at the parent ship, the tethered salvage is automatically deposited, converting its value into SpaceBucks for the current Haul.

6. **End Haul & Return to Base:**
   - When ready, fly to the exit zone to end your current Haul and return to base with your accumulated SpaceBucks.

7. **Review Haul & Return to Command Center:**
   - View a summary of your completed Haul, including earned SpaceBucks.
   - Return to the command center to prepare for your next Haul or make upgrades.

### Physics and Environment

- **Physics Engine:**  
  Use Phaser's Arcade Physics to simulate low-gravity, inertia-driven movement with added tether dynamics. The tethered salvage behaves like a damped pendulum, introducing realistic swing and momentum challenges.
- **Collision Detection:**  
  Fine-tune collisions between your ship, swinging salvage, and environmental hazards.
- **Obstacles:**  
  Include dynamic obstacles like shifting debris fields, moving asteroids, and enemy drones that increase the challenge of safely navigating while dragging salvage.

### Salvage & Currency System

- **Salvage Pieces:**  
  - Different categories (common, rare, ultra-rare) with varying mass and inertia, making some items trickier to drag.
- **SpaceBucks:**  
  - Earned by depositing salvage at the parent ship during Hauls.
  - **Persistence:** SpaceBucks accumulate across multiple Hauls and are only lost if the player crashes during a Haul.
- **Upgrade Options:**  
  - Spend SpaceBucks at your base between Hauls on:
    - **Improved Thrusters:** Better acceleration and ability to counter tether drag.
    - **Enhanced Shields & Durability:** For absorbing impacts from swinging salvage.
    - **Special Abilities:** Like temporary stabilization of the tether.

### Game Flow

```
+----------------+     +-------------------+     +--------------+     +----------------+
| Main Menu      |---->| Command Center   |---->| Gameplay     |---->| Haul Complete  |
| - Start Game   |     | - Ship Status    |     | - Salvage    |     | - Results      |
| - Exit         |     | - SpaceBucks     |     | - Deposit    |     | - SpaceBucks   |
+----------------+     | - Start Haul     |     | - Exit Haul  |     +-------+--------+
                       | - Return to Base  |     +--------------+             |
                       +-------------------+             ^                    |
                              ^                          |                    |
                              |                          |                    |
                              +--------------------------+--------------------+
```

---

## 4. Control Schemes

### Keyboard Controls

- **Movement:**  
  - Use Arrow Keys or WASD for directional thrust (up for boost; left/right for lateral movement).
- **Action Buttons:**  
  - Space Bar: Secondary boost or activating a special ability (e.g., temporary tether stabilization).  
  - `T`: Activate/deactivate tether to nearest salvage piece.
  - `E` or `F`: Interact with salvage hubs or initiate ship upgrades.

### Mouse Controls

- **Navigation & Interaction:**  
  - Employ click-and-drag mechanics to adjust direction or force to counteract tether swings.  
  - Click on salvage pieces or upgrade icons to trigger collection or open upgrade menus.

### Touch Controls (Mobile)

- **Virtual Joystick:**  
  - On-screen joystick for directional input, positioned conveniently on one side.
- **Action Buttons:**  
  - On-screen buttons for boosting, activating/deactivating the tether, or interacting with salvage.
- **Gestures:**  
  - Tap to engage with salvage pieces.  
  - Swipe to apply directional thrust adjustments, especially during tether management.

**Customization:**  
- Options for remapping controls and adjusting sensitivity settings across keyboard, mouse, and touch inputs for optimal performance on all devices.

---

## 5. User Interface (UI) & Heads-Up Display (HUD)

### Main Menu

- **Options Include:**  
  - Start Game (leads to Command Center)
  - Settings (with control customization for all input types)  
  - Credits

### Command Center

- **Ship Status Display:**
  - Visual representation of the player's current ship
  - Ship stats and capabilities
  - Current SpaceBucks total
- **Mission Briefing:**
  - Information about the next Haul's difficulty and potential rewards
- **Action Buttons:**
  - Start Haul (launches the player into gameplay)
  - Return to Base (returns to main menu)
  - Ship Upgrades (future implementation)

### In-Game HUD

- **Currency Display:**  
  - Prominent display of the current Haul's SpaceBucks and total SpaceBucks balance.
- **Ship & Tether Status:**  
  - Indicators for ship health, fuel levels, and visual cues for tethered salvage (e.g., mass, swing amplitude, risk factor).
- **Mini-Map/Radar:**  
  - Shows nearby hazards and salvage opportunities.
- **Exit Indicator:**
  - Visual cue showing the location of the exit zone to end the current Haul.
- **Pause/Settings:**  
  - Easily accessible pause button leading to settings and adjustments.

### Haul Complete Screen

- **Results Summary:**
  - SpaceBucks earned during the Haul
  - Total SpaceBucks available
- **Action Buttons:**
  - Return to Command Center (to prepare for next Haul)
  - Return to Base (return to main menu)

### Upgrade Interface (Future)

- **Upgrade Menu:**  
  - Visual representation of available upgrades—especially those mitigating tether challenges (e.g., stabilization modules)—with associated SpaceBuck costs.
- **Confirmation Dialogs:**  
  - User-friendly steps to prevent accidental purchases.

---

## 6. Art & Audio Design

### Visual Assets

- **Spaceship & Parent Ship:**  
  - Distinct pixel art designs representing your agile salvage ship and the larger parent ship (the collection hub).
- **Command Center Interior:**
  - Futuristic command room with screens showing ship status, mission data, and SpaceBucks counter
  - Control panels and interactive displays
- **Tether Visuals:**  
  - A dynamic, glowing tether effect that simulates tension, swing, and drag.
- **Exit Zone:**
  - Visually distinct area indicating where players can end their Haul and return to base.
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
  - Command center interface sounds (button clicks, screen transitions)
- **Background Music:**  
  - Synthwave or chiptune tracks that complement the retro arcade vibe.
  - Different themes for main menu, command center, and gameplay
- **Dynamic Audio Cues:**  
  - Adaptive sound feedback for changes in speed, collisions, or significant tether movements.

---

## 7. Technical Architecture

### Game Engine & Framework

- **PhaserJS:**  
  - Leverage Phaser's Arcade Physics to simulate low gravity, inertia, and tether dynamics.
- **HTML5 & JavaScript:**  
  - Utilize standard web technologies for cross-browser compatibility.
- **Responsive Design:**  
  - Ensure that all gameplay elements—including the tether dragging mechanic—scale well across different screen sizes.
- **Asset Management:**  
  - Efficient preloading of sprites, audio files, and physics data for smooth transitions and gameplay.

### Code Structure

- **Scene Management:**
  - MainMenuScene: Entry point with Start Game button
  - CommandCenterScene: Hub for viewing ship status and launching hauls
  - GameScene: Main gameplay where hauls take place
  - GameOverScene: Summary screen after completing a haul
- **Modular Codebase:**  
  - Separate modules for ship control, tether physics, UI interactions, and level management.
- **State Management:**  
  - Use Phaser's scene management to handle transitions between different game states.
- **Event Handling:**  
  - Organize event handlers for keyboard, mouse, and touch inputs, with dedicated routines for tether stabilization and drag physics.
- **Data Persistence:**  
  - Save player progress, SpaceBucks, upgrades, and ship status using local storage between sessions.

---

## 8. Level Design & Progression

### Level Structure

- **Tutorial Level:**  
  - Introduce basic movement and salvage collection while emphasizing the tethered drag mechanic in a low-risk setting.
- **Progressive Difficulty:**  
  - Gradually increase challenge by introducing heavier salvage pieces and dynamic hazards in later Hauls.
- **Zone Themes:**  
  - Create unique themes (e.g., asteroid belts, abandoned stations, dense debris fields) that test various aspects of ship handling and tether management.

### Replayability & Challenges

- **Progressive Hauls:**
  - Each successful Haul allows players to upgrade their ship, enabling them to take on more challenging areas with higher rewards.
- **Score Challenges:**  
  - Integrate leaderboards and daily challenges for mastering navigation and tether control.
- **Risk-Reward Decisions:**  
  - Each salvage collection is a strategic choice, with some items offering higher rewards at the cost of more complex physics challenges.
  - Deciding when to end a Haul and bank SpaceBucks versus continuing for more rewards becomes a key strategic decision.
- **Power-Ups & Bonuses:**  
  - Occasional boosts such as temporary tether stabilization or reduced drag add variety to the gameplay.
- **Boss Encounters:**  
  - Feature scenarios where managing multiple tethers (e.g., against large salvage clusters or enemy drones) tests the player's control finesse.

---

## 9. Development Roadmap

1. **Phase 1: Prototyping & Core Mechanics**
   - Implement basic physics, ship movement in PhaserJS, and establish the tether system for salvage dragging.
   - Create a simple level demonstrating salvage collection, tether dynamics, and deposit functionality into the parent ship.
   - Add an exit zone for ending the current Haul and returning to base.
   - Implement SpaceBucks persistence between Hauls.

2. **Phase 2: Command Center & UI Integration**
   - Create the Command Center scene as the hub between the main menu and gameplay.
   - Integrate multi-input control schemes (keyboard, mouse, and touch) with specialized routines for tether dynamics.
   - Develop a functional HUD that provides real-time feedback on tether status, ship condition, and salvage progress.
   - Add UI elements showing current Haul score and total SpaceBucks.

3. **Phase 3: Level Design & Asset Integration**
   - Create multiple levels featuring diverse salvage weights and environmental hazards.
   - Integrate art assets, animate tether behavior, and tie dynamic audio effects to the dragging mechanic.
   - Enhance the Command Center with more visual feedback and information.

4. **Phase 4: Upgrades & Advanced Features**
   - Build a detailed upgrade system allowing investment of SpaceBucks in improvements (e.g., enhanced thrusters, stabilization modules) to counter tether challenges.
   - Refine physics interactions and introduce power-ups that temporarily reduce drag complications.
   - Implement the ship upgrade functionality in the Command Center.

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
- **Expanded Command Center:**
  - Add more interactive elements to the Command Center, including ship customization, crew management, and mission selection.

---

## Conclusion

AstroHauler redefines the classic salvage arcade experience by integrating a challenging tether dragging mechanic and the strategic "Haul" system. Players must balance risk, reward, and physics-driven movement as they gather salvage and decide when to end their Haul to safely bank their SpaceBucks. The Command Center serves as the hub where players can view their ship's status, track their SpaceBucks, and prepare for their next Haul. Leveraging PhaserJS and modern input methods, AstroHauler offers a nostalgic yet innovative challenge where every Haul demands strategic physics management and skillful navigation.

*Happy coding—and may your journey through the cosmos be filled with rewarding hauls!*
```