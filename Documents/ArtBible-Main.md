# Astro Hauler: Comprehensive Art Bible

This master Art Bible provides overarching visual direction for **Astro Hauler**, tying together individual Art Bibles into a unified reference. It outlines key pillars and links to detailed guides for each subsystem, ensuring coherence across all game art elements.

---

## 1. Core Vision & Pillars

Astro Hauler blends **retro pixel art** with **neon-futuristic accents**, framed by a **Celestial Serenity** aesthetic. All visual assets should uphold the following high-level principles:

- **Exploration & Discovery:** Convey wonder through vibrant backgrounds and dynamic VFX.
- **Risk vs. Reward:** Tether and salvage visuals emphasize tension and physics-driven challenges.
- **Progression & Power:** Ship and upgrade designs evolve visibly, reinforcing player growth.
- **Cohesion & Readability:** Consistent palette, modularity, and pixel-perfect clarity at all scales.

---

## 2. Art Bible References

1. **Ship Progression Art Bible** (`ArtBible-Ship.md`)
   - Defines silhouette evolution, accent hierarchy, detail layers, and modular attachments for the player’s ship across 10 tiers.  
2. **Parent Ship Art Bible** (`ArtBible-Parentship.md`)
   - Guides design of the larger docking hub, including silhouette, material palette, modules, and VFX.  
3. **Background & Star Systems Art Bible** (`ArtBible-StarSystem.md`)
   - Covers parallax layering, nebula art, starfield generation, environmental debris, and level depth effects.  
4. **UI & Visual FX Art Bible** (`ArtBible-UI-VFX.md`)
   - Details HUD layout, UI components, typography, and feedback-driven VFX across menus and in-game overlays.  
5. **Salvage Pieces Art Bible** (`ArtBible-Salvage.md`)
   - Specifies forms, rarity color schemes, sprite guidelines, and particle effects for collectible salvage items.  
6. **Logo Art Bible** (`ArtBible-Logo.md`)
   - Defines the primary wordmark, logomark, color usage, clear space, and adaptable logo variants for branding.  
7. **Currency Art Bible** (`ArtBible-SpaceBucks.md`)
   - Outlines Spacebucks iconography, animation sequences, UI integration, and feedback messaging for in-game currency.  
8. **Tether Visual FX Art Bible** (`ArtBible-Tether.md`)
   - Prescribes tether appearance, animation states (idle, strain, break), sprite assets, and PhaserJS integration patterns.

---

## 3. Unified Palette & Typography

While each subsystem has specialized palettes, the **core game palette** and typography ensure visual unity:

- **Palette Core:**
  - **Space Gray:** #14141E / #2E2E38 (backgrounds, outlines)
  - **Cosmic Cyan:** #00FFD1 (primary accents)
  - **Neon Pink:** #FF77FF (upgrade accents)
  - **Stellar Lime:** #7FFF00 (feedback accents)
  - **Nebula Purple:** #5A8EB5 / #C19CFF (environmental glows)

- **Font:** Press Start 2P for all UI and logo wordmarks, ensuring pixel alignment and no sub-pixel aliasing.

---

## 4. Modular & Layered Approach

- **Asset Modularity:** Separate sprite layers for core forms, accents, and glow elements to facilitate dynamic assembly & animation.
- **Layer Ordering:** (1) Backgrounds → (2) Debris & Salvage → (3) Ships → (4) Tethers → (5) UI & HUD → (6) Overlays & VFX.
- **Atlas Strategy:** Group related assets into texture atlases by subsystem to optimize draw calls and VRAM usage.

---

## 5. Technical Integration

- **Engine:** PhaserJS (Arcade Physics + TileSprite for parallax).  
- **Naming Conventions:**
  - `ship_tier{n}.png`, `parentship_base.png`, `bg_nebula_layer1.png`, `ui_button_idle.png`, `salvage_rare_01.png`, `logo_primary.png`, `currency_coin_16.png`, `tether_segment.png`, etc.
- **Animations:** Defined frame rates per subsystem (e.g., tether flicker @2 FPS; thruster glow @4 FPS; UI hover @8 FPS).
- **Performance Targets:** Maintain total VRAM under 32 MB; combine static layers where possible.

---

## 6. Accessibility & Variants

- **Color-Blind Options:** Alternate accent hues (e.g., Neon Pink → Bright Orange) via a global palette swap.
- **High-Contrast Mode:** Boost glow opacities and use white outlines for critical UI elements.
- **Localization Support:** Expandable UI bounds; work with wordmarks only when necessary.

---

## 7. Review & Iteration Workflow

1. **Prototype Phase:** Assemble placeholder sprites to validate color consistency and layering.  
2. **Art Pass:** Replace placeholders with polished assets following subsystem bibles.  
3. **Feedback Loops:** Use “Keep / Iterate / Fix” checks per asset category.  
4. **Integration Tests:** Verify legibility at target resolutions (32×32, 64×64, 128×128).  
5. **Polish & Optimizations:** Adjust glow thresholds, palette harmonics, and atlas packing.

---

*This comprehensive guide anchors all subsystem Art Bibles into a unified visual direction for Astro Hauler. For detailed specifications, please refer to each linked document.*

