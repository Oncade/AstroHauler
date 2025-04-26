# Astro Hauler: Parent Ship Art Bible

This Art Bible defines the visual language, style, and technical guidelines for the **Parent Ship**—the central salvage hub—in **Astro Hauler**, ensuring consistency and clarity across all art assets.

---

## 1. Role & Importance

The Parent Ship serves as the player’s home base: the docking point where tethered salvage is delivered and converted into Spacebucks. It must read as sturdy, high-tech, and iconic, contrasting with the agile player ship and reinforcing the progression loop.

- **Primary Functions:** Salvage deposit hub, upgrade station, visual focal point at level edges.
- **Narrative Weight:** Symbolizes safety and progress; each visit rewards the player and showcases upgrades.

---

## 2. Visual Language Pillars

### 2.1 Silhouette & Scale
- **Massive Profile:** Wide, multi‑segment hull suggesting heavy mass and stability.
- **Key Segments:** Central command dome, cargo intake bay (tether docking port), engine thruster banks, strut framework.
- **Readability:** Must remain clear at distances and in side‑scroll view; silhouette recognizable at 128×64 sprite scale.

### 2.2 Color & Material Palette
| Element               | Color (Hex) | Usage                                 |
|-----------------------|-------------|---------------------------------------|
| **Hull Base**         | #14141E     | Deep space gray, primary structure    |
| **Panel Highlights**  | #2E2E38     | Secondary plating, panel outlines     |
| **Tech Accents**      | #00FFD1     | Piping, conduits, docking port glow   |
| **Warning Stripes**   | #FF77FF     | Edges of intake bay, caution markings |
| **Engine Glow**       | #7FFF00     | Thruster nozzles, reactor cores       |

> **Tip:** Leverage subtle gradients between base and highlights to avoid flatness.

### 2.3 Architectural Detail
- **Surface Texturing:** Modular panel lines (2‑pixel wide), rivet dots, and vent grills.
- **Glow Effects:** Soft pixelated blooms on docking port and reactor cores; 1–2 pixel aura.
- **Scale Cues:** Small lights and windows to imply large scale.

### 2.4 Functional Modules
- **Docking Bays:** Multiple tether docking points—visual tubes and clamps extending outward.
- **Cargo Containers:** Visible crates and cargo lockers along belly of ship.
- **Engine Arrays:** Array of 4–6 thruster nozzles, each with inner glow.
- **Communication Arrays:** Antenna masts and radar dishes on top of command dome.

> **Implementation:** Export modules on separate layers for dynamic scene assembly and animation.

---

## 3. Animation & VFX
- **Docking Sequence:** Aperture opening animation (3 frames), clamp lights flicker (#00FFD1).
- **Engine Idle Loop:** Subtle pulsing of thruster glow at 2–4 FPS.
- **Warning Flash:** Occasional blink of warning stripes (#FF77FF) when salvage bay is full or overloaded.

---

## 4. Technical Specifications
- **Sprite Size:** 256×128 px for in‑game view; 512×256 px for promotional renders.
- **Palette Constraints:** Use only defined palette colors plus black; avoid blending outside the set.
- **Export Format:** PNG with alpha channel, separate layers as `parentship_base.png`, `parentship_glow.png`, `parentship_modules.png`.

---

## 5. Usage Guidelines
- **Scene Layout:** Position at right edge of level; anchor parallax background behind it.
- **Scaling:** Maintain pixel‑perfect alignment at all zoom levels; avoid dynamic scaling that blurs edges.
- **Interaction Cues:** When player approaches docking port, add UI highlight and docking animation overlay.

---

## 6. Consistency & Iteration
- Ensure the Parent Ship’s style aligns with the player ship progression art Bible.
- Iterate on silhouette and detail density to maintain readability at small scales.

---

*End of Parent Ship Art Bible.*

