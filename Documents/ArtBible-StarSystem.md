# Astro Hauler: Background & Star Systems Art Bible

This Art Bible defines the visual language, style, and technical guidelines for the **backgrounds** and **star systems** in **Astro Hauler**, ensuring immersive depth and consistent aesthetics across all levels.

---

## 1. Introduction
The background art sets the stage for every salvage run, combining layered starfields, drifting nebulas, and environmental hazards. It must convey vastness, depth, and subtle motion, supporting gameplay focus while reinforcing the retro‑futuristic arcade vibe citeturn3file0.

---

## 2. Visual Language Pillars

### 2.1 Parallax Depth
- **Layer Count:** 3–5 distinct planes (far background, mid nebula, star layer, debris scatter, foreground hazes).
- **Motion Speeds:** Slowest at back (10% ship speed), mid (25%), front (40–60%) to enhance depth perception.

### 2.2 Cosmic Variety
- **Nebula Shapes:** Organic, cloud‑like blobs with soft edges vs. sharp crystalline swathes for variety.
- **Starfield Density:** Sparse in deeper layers (5–10 stars per 100×100), denser near foreground (15–20 stars per 100×100).

### 2.3 Dynamic Subtlety
- **Drifting Particles:** Slow, random drifting dust (1–2 px vertical drift per second).
- **Twinkle & Glint:** Occasional 2‑frame brightness flicker on <10% of stars at 1–2 FPS.

---

## 3. Color Palette
| Role               | Hex       | Usage                                     |
|--------------------|-----------|-------------------------------------------|
| **Void Base**       | #14141E   | Deepest background plane                  |
| **Nebula Core**     | #5A8EB5   | Mid‑layer nebula fill                     |
| **Nebula Glow**     | #C19CFF   | Soft bloom on nebula edges                |
| **Star Primary**    | #FFFFFF   | Core star color                           |
| **Star Accent**     | #A3D5FF   | Secondary star glint                      |
| **Debris Silhouette** | #2E2E38 | Asteroid/large debris shapes              |
| **Hazard Highlight** | #FF77FF  | Warning cues (e.g., enemy drone glows)    |

---

## 4. Parallax Layer Guidelines
1. **Layer 1 (Furthest):** Static void (#14141E) with very faint, large‑scale gradient (1920×1080).
2. **Layer 2:** Nebula shapes—tileable 1024×1024 textures, 50–70% opacity, blurred edges.
3. **Layer 3:** Mid‑depth starfield—small, static star sprites randomized per scene.
4. **Layer 4:** Debris scatter—silhouetted asteroids and wireframe wreckage drifting slowly.
5. **Layer 5 (Fore):** Dust & particle overlays—transparent PNGs with 1‑2 px vertical drift.

---

## 5. Nebula Design
- **Form Language:** Soft, amorphous clusters with 50–80 px feature size at 1920×1080.
- **Edge Treatment:** Gaussian blur (radius 4–6 px) on nebula mask.
- **Color Transitions:** Gradient ramp from Nebula Core → Nebula Glow.

---

## 6. Starfield Art
- **Star Sizes:** 1×1 px (90%), 2×2 px (10%).
- **Distribution:** Poisson‑disc sampling to avoid clustering.
- **Twinkle VFX:** 2‑frame opacity cycle (100% → 40%), seeded per star.

---

## 7. Environmental Debris & Hazards
- **Asteroid Sprites:** 32×32 px tileable sprites, monochrome silhouette (#2E2E38).
- **Enemy Drone:** 48×48 px with Hazard Highlight glows (#FF77FF), animated rotor blur.
- **Floating Craft Wrecks:** 64×32 px broken hull pieces.

---

## 8. VFX & Animation
- **Dust Drift:** Particle layer of 256×256 px, tiled, alpha 20–30%, wyoming vertical scroll.
- **Shooting Stars:** Occasional 3–5 px streak, 3‑frame animation, #A3D5FF → #FFFFFF gradient.
- **Nebula Pulse:** Subtle opacity modulation (±10%) over 8–12 sec loop.

---

## 9. Technical Specifications
- **Resolution & Tileability:** Background textures at 2048×2048 px, seamlessly tileable horizontally.
- **File Formats:** PNG‑24 with alpha for layers; JSON atlas for star sprites.
- **Memory Budget:** Combine static layers into 1–2 texture atlases; keep total VRAM ≤ 8 MB.

---

## 10. Integration & Usage
- **PhaserJS Setup:** Use `tileSprite` for nebula & dust layers; `group` for star & debris sprites.
- **Scroll Speeds:** Configure per layer in scene update: `layer.tilePositionX += speed * dt;`.
- **Dynamic Hazard Activation:** Toggle Hazard Highlight glow on enemy drones when in range.

---

*End of Background & Star Systems Art Bible.*

