# Astro Hauler: UI & Visual FX Art Bible

This Art Bible defines the visual language, style, and technical guidelines for all **UI elements** and **visual effects** in **Astro Hauler**. It ensures a cohesive retro-futuristic arcade experience across HUD, menus, pop‑ups, and in‑game FX.

---

## 1. Introduction
UI and VFX in Astro Hauler guide player attention, convey game states, and reinforce feedback loops. They must be pixel‑perfect, highly readable, and harmonize with the **Celestial Serenity** aesthetic citeturn3file0.

---

## 2. Visual Pillars
- **Retro-Futuristic:** Pixel art style, neon accents, slight CRT-inspired glow.
- **Clarity & Readability:** High contrast, minimal overlap, consistent iconography.
- **Rhythmic Motion:** Smooth loops (2–6 FPS) for pulsing, flicker, and pop‑in effects.
- **Feedback-First:** Immediate visual cues for player actions (collect, damage, upgrade).

---

## 3. Color & Typography

### 3.1 Palette
| Role           | Hex       | Usage                                    |
|----------------|-----------|------------------------------------------|
| **Primary UI**   | #C19CFF   | Frame borders, modal backgrounds         |
| **Secondary UI** | #A3D5FF   | Bar fills, lesser HUD elements           |
| **Accent**       | #FF77FF   | Button highlights, warnings              |
| **Feedback**     | #7FFF00   | Success pulses, health/fuel recovery     |
| **Text**         | #FFFFFF   | All UI text (pixel font)                |
| **Backdrop**     | #2E2E38   | Panel backplates (semi‑opaque)          |

### 3.2 Typography
- **Font:** Press Start 2P (8×8 or 16×16 grid).
- **Sizes:** 8×8 for HUD values; 16×16 for titles and menu headers.
- **Effects:** Outer 1px neon glow (#C19CFF) on menu titles; sub‑pixel aliasing disabled.

---

## 4. UI Layout & Components

### 4.1 Heads‑Up Display (In‑Game)
| Element              | Position        | Details                                                 |
|----------------------|-----------------|---------------------------------------------------------|
| **Spacebucks**         | Top‑left        | 1× value + icon; pastel pink hover glow                 |
| **Health Bar**         | Top‑right       | Gradient fill #7FFF00 → #A3D5FF; 4×16 px segments        |
| **Fuel Meter**         | Below Health    | Cyan fill; fuel drop animation (1px per 0.5s)           |
| **Tether Stability**   | Bottom‑center   | Circular gauge; needle glows in accent colors           |
| **Mini‑Map/Radar**     | Bottom‑left     | 64×64 px; outlines in neon pink, pings in white ✱       |

### 4.2 Menus & Pop‑Ups
- **Main Menu:** Full‑screen modal; breadcrumb nav bar; button hover scale‑up (1.1× over 4 frames).
- **Upgrade Screen:** Grid of module icons (3×3); locked tiers grayscale with cyan “locked” padlock icon.
- **Confirmation Dialog:** <br> • Yellow border flash (#FF77FF) on “Confirm” button<br> • 1px expansion animation on selection (4 frames)

---

## 5. Visual FX & Animations

### 5.1 Tether Effects
- **Idle Glow:** Continuous 2‑frame flicker of #A3D5FF & #C19CFF at 2 FPS.
- **Max‑Strain Spark:** Burst of 3 pixels in Stellar Lime (#7FFF00) along tether path (single-frame).

### 5.2 Thruster & Movement
- **Thruster Flicker:** 2‑frame loop; core glow cycles between accent and feedback colors at 4 FPS.
- **Boost Burst:** Quick 3‑frame expansion of flame sprite; colors from #FF77FF → transparent.

### 5.3 Pickup & Deposit
- **Salvage Pickup:** Starburst pop (5×5 px) in white and cyan; 3‑frame scale from 0.5× → 1×.
- **Deposit Pulse:** Circular ripple from docking port (16 px radius → 32 px, 4 frames) in Neon Pink.

### 5.4 Damage & Warning
- **Damage Flash:** Full‑screen 1px white overlay, 2 frames, then fade out.
- **Warning Shake:** UI panel shakes horizontally by ±2 px, 6‑frame cycle.

---

## 6. Technical Guidelines
- **Sprite Sheets:** Consolidate UI icons into a 256×256 atlas; 16×16 cells.
- **Frame Rates:** UI animations at 8–12 FPS; VFX loops at 2–6 FPS.
- **Export Format:** PNG‑24 with alpha; JSON metadata for frame timing and UV coords.
- **Naming Convention:** `ui_{component}_{state}.png` (e.g., `ui_button_hover.png`, `vfx_tether_spark_1.png`).

---

## 7. Integration in PhaserJS
```js
// Example: adding a flickering tether
this.load.spritesheet('tether_fx', 'vfx_tether.png', { frameWidth: 64, frameHeight: 4 });
this.anims.create({
  key: 'tetherGlow',
  frames: this.anims.generateFrameNumbers('tether_fx', { start: 0, end: 1 }),
  frameRate: 2,
  repeat: -1
});

const tether = this.add.sprite(x, y, 'tether_fx');
tether.play('tetherGlow');
```
- **Layer Order:** HUD above gameplay; pop‑ups above HUD; VFX tied to world, not UI.
- **Blend Modes:** Use `ADD` for glow effects; default for all others.

---

## 8. Accessibility & Localization
- **Color‑Blind Support:** Offer alternative palette toggle (e.g., replace neon pink with bright orange).
- **Text Scaling:** Menu fonts support 2× scaling for readability without breaking layout.
- **Localization:** UI panels with expandable bounds, accommodate up to 20 characters per label.

---

*End of UI & Visual FX Art Bible.*

