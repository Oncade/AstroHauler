# Astro Hauler: Salvage Pieces Art Bible

This Art Bible defines the visual language, style, and technical guidelines for all **salvage pieces** in **Astro Hauler**, the core collectible items that drive gameplay progression and risk–reward decisions citeturn3file0.

---

## 1. Introduction
Salvage pieces are scattered throughout cosmic junkfields, each category offering different mass, inertia, and value. Visually, they must read clearly at small sprite sizes, convey rarity, and integrate seamlessly with the tether–drag mechanic.

---

## 2. Categories & Rarity
| Rarity        | Icon Color    | Mass & Inertia         | Value Multiplier |
|---------------|---------------|------------------------|------------------|
| **Common**      | Steel Gray    | Low (easy drag)        | ×1               |
| **Rare**        | Cosmic Cyan   | Medium (noticeable lag)| ×3               |
| **Ultra-Rare**  | Neon Magenta  | High (heavy swing)     | ×5               |

> **Note:** Value scaling balances gameplay risk; higher inertia demands better ship upgrades.

---

## 3. Shape Language
- **Silhouette:** Distinct geometric forms—cubes, cylinders, shards—ensuring 90% silhouette readability at 32×32 px.
- **Edge Treatment:** Rough, chipped edges on common pieces; smoother, faceted planes on rare; crystalline spikes on ultra-rare.
- **Orientation:** Default orientation with longest axis horizontal; allow ±30° rotation for scatter variation.

---

## 4. Color & Shading Palette
| Component       | Common        | Rare           | Ultra-Rare    |
|-----------------|---------------|----------------|---------------|
| **Base Fill**     | #7A7A7A       | #00FFD1        | #FF00FF       |
| **Shading**       | #5E5E5E (–20%)| #00C1AA (–20%) | #C100C1 (–20%)|
| **Highlight**     | #A0A0A0 (+20%)| #33FFE0 (+20%) | #FF33FF (+20%)|
| **Outline**       | #2E2E38       | #2E2E38        | #2E2E38       |

> **Technique:** Use 3‑tone shading (fill, shade, highlight) with 1‑pixel border in Deep Purple for consistency.

---

## 5. Detail & Effects
- **Facets & Crevices:** Add 1–2 pixel interior lines to suggest panels (for rare/ultra-rare).
- **Glow Accents:** Ultra-rare pieces emit a 1‑pixel neon magenta inner glow every 3 seconds (2‑frame pulse).
- **Particle Dust:** On detach, spawn 3–5 tiny dust particles (#A3D5FF for rare, #FF77FF for ultra) with 4‑frame fade.

---

## 6. Sprite Specifications
- **Size:** 32×32 px primary; 64×64 px hi-res for shop icons and promotional art.
- **Alignment:** Center pivot at geometric centroid; ensure tether attaches at consistent anchor point on top center.
- **Format:** PNG-24 with alpha; named `salvage_{rarity}_{index}.png` (e.g., `salvage_rare_03.png`).

---

## 7. Animation Guidelines
- **Rotation Loop:** 4‑frame spin (0°, 90°, 180°, 270°) at 3 FPS for all rarities.
- **Twinkle Effect (Rare & Ultra):** 2‑frame highlight flicker on one corner pixel at 1 FPS.
- **Detach Spark:** Single-frame spark (#7FFF00) at tether break point when dropping.

---

## 8. Level Integration
- **Placement:** Random scatter with 10–20% rotation variance; depth parallax on debris layer.
- **Collision Buffer:** Extend 2 px transparent padding around sprite for smooth physics detection.
- **UI Icon Use:** Scale hi-res sprite to 24×24 px, add 1 px neon accent border for menus.

---

## 9. Technical & Performance
- **Atlas Packing:** Group by rarity into separate texture atlases to optimize GPU fetch.
- **VRAM Budget:** Keep total salvage sprite memory < 2 MB; reuse common palette entries.
- **Metadata:** JSON file listing sprite anchors, rarity, and value for runtime lookup.

---

*End of Salvage Pieces Art Bible.*

