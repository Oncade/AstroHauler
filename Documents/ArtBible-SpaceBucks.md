# Astro Hauler: Spacebucks Currency Art Bible

This Art Bible defines the visual identity, icons, animations, and usage guidelines for **Spacebucks**—the in‑game currency—for **Astro Hauler**. It ensures consistency across HUD displays, pickup effects, store interfaces, and messaging systems.

---

## 1. Role & Importance
Spacebucks represent the player’s progress and purchasing power. They appear in the HUD, upgrade screens, pop‑ups, and confirmation dialogs. The currency icon and related effects must be instantly recognizable, legible at small sizes, and reinforce the retro‑futuristic aesthetic.

---

## 2. Visual Pillars
- **Iconic & Simple:** Single‑glow coin or credit symbol with strong silhouette.
- **Neon Accent:** High‑contrast neon glow to differentiate from other UI elements.
- **Retro Pixel Charm:** Pixel‑perfect design that reads at 16×16 or 32×32 pixels.
- **Feedback‑Driven:** Sparkle, pop, and pulse animations on acquisition or spending.

---

## 3. Icon Design

### 3.1 Base Shape
- **Form:** Rounded hexagonal “coin” to suggest tech‑credit rather than metal.
- **Silhouette:** Clean, 1‑pixel outline in **Space Gray** (#2E2E38).

### 3.2 Color & Shading
| Layer           | Hex       | Usage                                   |
|-----------------|-----------|-----------------------------------------|
| **Fill**          | #FFB600   | Main coin face (bright gold)            |
| **Shading**       | #CC9400   | Lower hemisphere shadow (–20%)           |
| **Highlight**     | #FFE566   | Upper hemisphere specular (+20%)         |
| **Accent Glow**   | #C19CFF   | Soft neon aura around coin (2‑px bloom) |

> **Tip:** Use a 3‑tone gradient with radial shading for depth.

### 3.3 Symbol Overlay
- **Motif:** Stylized “₿”‑inspired “₿S” glyph centered on coin (2×2 px strokes).
- **Color:** **Cosmic Cyan** (#00FFD1) for the glyph, 1‑px outline in Space Gray.

---

## 4. Sprite & Size Guidelines
- **HUD Icon:** 16×16 px, standalone coin with 1 px glow.
- **Menu Icon:** 32×32 px, larger glow and visible SB glyph.
- **Pickup Effect:** 24×24 px, includes coin + sparkle overlay.
- **Naming:** `currency_coin.png`, `currency_coin_32.png`, `currency_pickup_1.png`, etc.

---

## 5. Animation & VFX
| Action            | Frames | Details                                                                        |
|-------------------|--------|--------------------------------------------------------------------------------|
| **Pickup Sparkle**   | 4      | Coin scales from 0.8×→1×, sparkle pixels (white & cyan) fade out (8 FPS).         |
| **Deposit Pulse**    | 3      | Coin icon in HUD emits glow pulse: 2‑px radius → 4‑px → 2‑px (4 FPS, loop once).   |
| **Balance Change**   | 2      | Coin icon briefly shifts hue to **Neon Pink** (#FF77FF) then back (2 FPS).      |

> **Implementation:** Store frames in a single spritesheet with JSON metadata.

---

## 6. UI Integration
- **HUD Placement:** Top‑left, coin icon left of numeric value; 4 px spacing.
- **Font:** Press Start 2P, 8×8 px, white (#FFFFFF), 1 px cyan outline.
- **Menu Lists:** Use 32×32 icon left of option text; active selection highlights coin glow.
- **Pop‑Up Dialogs:** Embed coin icon in confirmation dialogs for purchase costs.

---

## 7. Messaging & Feedback
- **Gain Notification:** On salvage deposit, show “+X SB” text in **Cosmic Cyan**, 3‑frame pop‑up above ship.
- **Spend Confirmation:** Dim coin icon, flash **Neon Pink** border, then revert in 6 frames.
- **Insufficient Funds:** Shake coin icon (±2 px horizontal, 6 frames) and flash red (#FF0000) on glyph.

---

## 8. Technical Specs
- **File Format:** PNG-24 with alpha for all static assets; spritesheet PNG for animations.
- **Palette:** Use only the specified hex colors plus black and white.
- **Memory Budget:** Keep all currency assets ≤ 512 KB total.
- **Naming Conventions:** `wp_currency_coin_{size|action}_{frame}.png`.

---

## 9. Accessibility & Variants
- **Color‑Blind Mode:** Alternative accent glow in **Bright Orange** (#FFA500).
- **Monochrome Variant:** Black‑and‑white version for print or high‑contrast contexts.
- **Localization:** Numeric suffixes use localized digits but retain coin icon.

---

*End of Spacebucks Currency Art Bible.*

