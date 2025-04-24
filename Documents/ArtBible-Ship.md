# Astro Hauler: Ship Progression Art Bible

This Art Bible defines the visual language and progression for the player’s ship in **Astro Hauler**, guiding designers and artists through each upgrade tier.

---

## 1. Introduction

The player begins with a simple **Basic Hauler** and earns Spacebucks to upgrade through 10 distinct tiers, culminating in the **Galactic Salvager**. Each tier adds silhouette complexity, accent hues, and pixel details to communicate power and progression.

---

## 2. Visual Language Pillars

### 2.1 Silhouette Evolution
- **Tier 1**: Single‐pod core, rounded hull, no external modules.
- **Tiers 2–4**: Add 1–2 cargo pods or struts under the belly and sides.
- **Tiers 5–7**: Introduce stabilizer fins and side/back boosters.
- **Tiers 8–10**: Full winglets, dorsal spine rails, multi‐nozzle thrusters.

> **Designer Tip:** Keep each silhouette change bold and easily readable at 32×32 or 64×64 sprite scale.

### 2.2 Accent Color Hierarchy
- **Base Hull:** Gradient from **Space Gray** (#2E2E38) → **Deep Purple** (#1A1A2E).
- **Primary Accent:** **Cosmic Cyan** (#00FFD1) for core contours (cockpit, frame).
- **Upgrade Accent:** Varies by tier:
  - Tiers 2–4: **Neon Pink** (#FF77FF)
  - Tiers 5–7: **Stellar Lime** (#7FFF00)
  - Tiers 8–10: Animated mix of Pink & Lime (flicker effect)

> **Usage:** Reserve accents for new modules, glowing conduits, and thruster cores.

### 2.3 Detail Layers
- **Tier 1–3:** Flat surfaces, outline width 1 px, minimal shading.
- **Tier 4–6:** Add panel lines (1–2 px), small rivet/bolt pixels for texture.
- **Tier 7–10:** Incorporate glowing energy conduits, animated thruster flickers, and subtle specular highlights.

> **Note:** Use only the palette colors plus black to maintain consistency.

### 2.4 Modular Attachments
- All modules (pods, fins, boosters) slot into fixed **mount points** on the hull. This modularity allows mix‐and‐match and smooth animations.
- **Modules by Tier:**
  1. —
  2. Rear cargo pod
  3. Twin side pods
  4. Stabilizer fins
  5. Dual boosters
  6. Shield dome
  7. Cargo claw & plating
  8. Mini radar array
  9. Spine rails
  10. Wing‐pod array & triple thrusters

> **Implementation:** Export each module as a separate sprite layer to enable dynamic assembly in‐game.

---

## 3. Tier Progression Overview

| Tier | Title               | Silhouette Change              | Accent Color       | Key Pixel Detail                         |
|:---:|---------------------|--------------------------------|--------------------|------------------------------------------|
|  1  | Basic Hauler        | Single pod, rounded cockpit    | Cyan               | Flat hull, 1 px outline                  |
|  2  | Cargo Mk I          | + Rear cargo pod               | Neon Pink          | Pink stripe on pod                       |
|  3  | Cargo Mk II         | + Twin side pods               | Neon Pink          | Panel lines, small rivets                |
|  4  | Stabilizer          | + Horizontal stabilizers       | Stellar Lime       | Lime‐tipped fins                         |
|  5  | Booster II          | + Dual side boosters           | Stellar Lime       | Glowing booster nozzles                  |
|  6  | Shielded Hauler     | + Dorsal shield dome           | Neon Pink          | Dome edge glow                           |
|  7  | Heavy Lifter        | + Cargo claw & plating         | Stellar Lime       | Plating edges highlighted                |
|  8  | Scout‑Hauler         | + Sleek winglets & radar       | Neon Pink          | Pixel antenna & signal flickers          |
|  9  | Aurora Runner       | + Spine rails                  | Stellar Lime       | Cyan conduit line on rail                |
| 10  | Galactic Salvager   | Full wing‑pod array            | Pink & Lime mix    | Animated energy conduits and thrusters   |

---

## 4. Technical Guidelines

- **Sprite Size:** 64×64 px (low), 128×128 px (high) for UI zoom.
- **Palette:** 6 colors + transparency: Space Gray, Deep Purple, Cosmic Cyan, Neon Pink, Stellar Lime, Black.
- **Export:** PNG with alpha channel. Name convention: `ship_tier{n}.png` and module layers as `ship_tier{n}_{module}.png`.
- **Animation:** 2‐frame thruster glow, 4‐frame conduit flicker at 4 FPS.

---

## 5. Usage Examples

- **In‐Game HUD:** Display ship icon from current tier next to player name.
- **Upgrade Menu:** Show side‐by‐side tier icons with grayscale fallback for locked tiers.
- **Promotional:** Render full 3D mockup or parallax background with the current ship tier in focus.

---

*End of Art Bible.*

