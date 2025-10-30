## Chunked Map (Simple Plan)

Goal: Replace the single giant map image with many smaller images (debris tiles) placed across a very large, configurable world. Keep current collision behavior by generating static colliders from each image’s alpha. Keep starfield efficient. Start with one test object in a huge space.

### Assets to use (debris pieces)
- Debirs_05.png
- Debris_01.png, Debris_02.png, Debris_03.png, Debris_07.png, Debris_08.png,
  Debris_11.png, Debris_12.png, Debris_13.png, Debris_14.png

Starfield: continue using `Starfield.png`.

### World size (config-first)
- Add to `WorldConfig`:
  - `dimensions?: { width: number; height: number }` (optional hard size)
  - `sizeMode: 'byDimensions' | 'byViewportMultiplier'` (default stays multiplier)
- When `byDimensions`, set world bounds directly via `dimensions` (e.g., 20000 x 20000).

### Debris pieces (render + collision)
1) Preload each debris image in `PreloaderScene`.
2) Create a small helper that places a debris image and builds its static collision from alpha, reusing the current logic:
   - `spawnDebrisPiece(scene, textureKey, x, y, options?) -> { image, bodies }`
   - Internally call a generalized version of `buildDebrisCollisionFromAlpha(textureKey, tileSize, alphaThreshold, offsetX, offsetY)` where `offsetX/Y` shift bodies to the world position of the piece.
   - Use static Arcade bodies only (fast on mobile). Keep tileSize tunable (start 32).
3) Store spawned bodies in a `scene.debrisStaticGroup` (still one group) so existing collision hooks continue to work.

### Starfield (background)
- Keep the current screen-fixed `tileSprite` starfield (best perf on mobile).
- Optional later: add sparse starfield “chunk” sprites with small `scrollFactor` for parallax depth; also chunk/cull like debris if needed.

### Data layout (simple, no new file required yet)
Add an array near `GameScene` for now (later can move to JSON):

```ts
const MAP_PIECES = [
  // Example entries; coordinates in world units
  { key: 'Debris_01', x: 1000, y: 1200, r: 0, scale: 1 },
  { key: 'Debris_12', x: -800, y: 2300, r: 0.1, scale: 1 },
];
```

Spawn loop in `create()`:
```ts
MAP_PIECES.forEach(p => spawnDebrisPiece(this, p.key, p.x, p.y, { rotation: p.r, scale: p.scale }));
```

### Culling/chunking (simple first, optimize later)
- Start simple: spawn only what’s listed; no chunking yet.
- Next step (if needed): grid chunk size 2048–4096. Only spawn pieces whose center is within camera view + margin. Destroy or pool when far away.

### Collisions (same behavior as current)
- Keep Arcade collisions: `player ↔ debrisStaticGroup` and `salvageGroup ↔ debrisStaticGroup`.
- Reuse the same alpha-threshold-to-tiles approach per piece. Bodies are translated by piece position.
- Debug toggle stays on F1.

### First test build (single object in large space)
1) World: set `WorldConfig.sizeMode = 'byDimensions'` and `dimensions = { width: 20000, height: 20000 }`.
2) Preload debris textures.
3) Comment out the giant `debris_map` image usage.
4) Spawn exactly one debris piece at `{ x: 10000, y: 10000 }` using `Debris_01` (or any from the list).
5) Verify:
   - Player can travel far; camera follows; world bounds correct.
   - Collisions work against that one piece.
   - Starfield remains smooth (tileSprite anchored to screen).

### Minimal code changes (when implementing)
- `src/game/scenes/PreloaderScene.ts`: preload the 10 debris images.
- `src/game/scenes/GameScene.ts`:
  - Add `MAP_PIECES` array and call `spawnDebrisPiece` for each (start with one).
  - Generalize `buildDebrisCollisionFromAlpha` to accept a `textureKey` and `offsetX/Y`.
  - Keep `debrisStaticGroup` for all piece bodies.
- `src/game/config/GameConfig.ts`: add `WorldConfig.sizeMode` and optional `dimensions`.

### Performance notes
- Prefer static bodies for debris; avoid dynamic bodies for scenery.
- Keep tile size at 32 or higher; raise if too many bodies.
- Consider pooling static rectangles if frequently spawning/despawning.
- Combine debris textures into an atlas later if memory becomes tight.

That’s it. Start with the single-piece test. If perf is solid, scale up by placing more pieces and (optionally) add simple grid chunking.


