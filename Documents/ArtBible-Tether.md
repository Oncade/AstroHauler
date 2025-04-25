# Astro Hauler: Tether Visual FX Art Bible

This Art Bible defines the look, behavior, and technical guidelines for the **tether** mechanic in **Astro Hauler**, synthesizing insights from the design document citeturn4file0 and existing art bibles to ensure consistent, readable, and impactful visual feedback.

---

## 1. Role & Importance
The tether visually links the player’s ship to salvage pieces, conveying physics-driven swing dynamics, tension states, and risk–reward trade-offs. It must remain clear at various resolutions, integrate with background and ship art, and provide immediate feedback on strain and stability.

---

## 2. Visual Pillars
- **Retro-Neon Aesthetic:** Pixel-perfect line work with neon glow, echoing the Celestial Serenity palette.
- **Clarity & Readability:** Maintain consistent thickness and contrast so the tether is visible against nebula backdrops and debris.
- **Dynamic Feedback:** Use color and animation to signal idle, tension, and overload states.
- **Seamless Integration:** Blend tether segments so the line appears continuous, even when using discrete sprite parts.

---

## 3. Color & Shading
| State              | Color (Hex)  | Usage                               |
|--------------------|--------------|-------------------------------------|
| **Base Glow**        | #A3D5FF      | Idle tether glow                    |
| **Pulse Highlight**  | #C19CFF      | Subtle flicker animation            |
| **Strain Spark**     | #7FFF00      | Single-frame spark at max tension   |
| **Outline / Core**   | #2E2E38      | 1 px inner core for contrast        |

> **Tip:** Keep base glow at 60% opacity; highlight flickers at 80% for visibility without overpowering.

---

## 4. Shape & Form
- **Line Thickness:** 2 px neon outline, 1 px dark core.  
- **Segment Length:** Modular 16×2 px sprite tiles for easy tiling and rotation.  
- **Curvature:** Always interpolate between ship and salvage anchor points with smooth Bézier curves in-engine; sprite art approximates curve using 3–5 segment rotations.

---

## 5. Animation & Effects
| Effect             | Frames | Details                                                                                   |
|--------------------|--------|-------------------------------------------------------------------------------------------|
| **Idle Glow Flicker** | 2      | Alternate between Base Glow (#A3D5FF) and Pulse Highlight (#C19CFF) at 2 FPS, looped.     |
| **Max-Strain Spark**  | 1      | Single-frame bright spark (#7FFF00) along tether when tension > 90%.                     |
| **Break Snap**        | 3      | Rapid shrink of tether: segments scale 1×→0 over 3 frames with white flash on endpoints.  |
| **Reattach Bounce**   | 4      | Quick scale wiggle of tether endpoint (0.9×→1.1×→1×) when salvage reattaches at ship.     |

> **Implementation:** Store these as separate spritesheets or generate procedurally using primary color parameters.

---

## 6. Technical Specifications
- **Sprite Assets:**  
  - `tether_segment.png` (16×2 px tile)  
  - `tether_highlight_2f.png` (2 frames, 16×2 px each)  
  - `tether_strain_spark.png` (8×8 px centered spark)  
  - `tether_break_3f.png` (3 frames map)  
- **Atlas Packing:** Group tether assets into `tether_atlas.png` with JSON UV mapping.
- **Blend Mode:** Use **ADD** for neon glow layers; default for core.
- **Memory Budget:** ≤ 256 KB for all tether assets.

---

## 7. Integration Guidelines
- **PhaserJS Example:**
  ```js
  // Load atlas
  this.load.atlas('tether', 'assets/tether_atlas.png', 'assets/tether_atlas.json');

  // Create animated flicker
  this.anims.create({
    key: 'tetherGlow',
    frames: this.anims.generateFrameNames('tether', { prefix: 'segment_highlight_', start: 0, end: 1 }),
    frameRate: 2,
    repeat: -1
  });

  // In update loop: draw tether via curves and play glow
  tetherSprite.play('tetherGlow');
  tetherSprite.setBlendMode(Phaser.BlendModes.ADD);
  ```
- **Layering:**  
  1. Background
  2. Salvage pieces
  3. Tether core (default)
  4. Tether glow (ADD)
  5. Ship & ship particles

---

## 8. Accessibility & Variants
- **Color-Blind Mode:** Replace Strain Spark with **Bright Orange** (#FFA500) for distinctiveness.  
- **High-Contrast Option:** Increase Base Glow to 100% opacity; outline in pure white for visibility in low-light.

---

*End of Astro Hauler Tether Visual FX Art Bible.*

