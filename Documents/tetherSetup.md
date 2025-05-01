Below is a complete plan for the tether's VFX—covering asset specs, animation states, and how to drive it dynamically in PhaserJS to reflect real-time physics tension and attachment. All art and behavior guidelines are drawn from the Astro Hauler design doc and Tether Visual FX Art Bible .

---

## 1. Sprite & Color Specification

- **Segment Tile**  
  - **Size:** 16×2 px  
  - **Core (1 px):** #2E2E38 (Deep Purple)  
  - **Outline/Glow (2 px):** #A3D5FF at 60% opacity   
- **Spark Sprite**  
  - **Size:** 8×8 px  
  - **Color:** #7FFF00 (Stellar Lime) for max-strain flash   
- **Break Frames**  
  - **3 frames** of segment scaling from 1 → 0 with a 1 px white flash at endpoints   
- **Reattach Wiggle**  
  - **4 frames** scaling endpoint from 0.9×→1.1×→1.0× for bounce feedback   

Export all frames in a single atlas `tether_atlas.png` with accompanying JSON UV data. - DONE

---

## 2. Animation States

| State            | Frames | Behavior                                                                          |
|------------------|--------|-----------------------------------------------------------------------------------|
| **Idle Glow**      | 2      | Alternate between base glow (#A3D5FF) and highlight (#C19CFF) at 2 FPS, looped.   |
| **Max-Strain Spark** | 1      | Single-frame bright spark on the segment nearest the ship when tension > 90%.     |
| **Break Snap**      | 3      | Rapid shrink of all segments with a white flash on the endpoints.                |
| **Reattach Bounce** | 4      | Scale-wiggle of the segment at the docking point when salvage reattaches.         |

---

## 3. Dynamic Tether Construction

Use Phaser's **Graphics** or **TileSprite**+**Curve** approach to draw a smooth, physics-driven tether each frame:

```js
// 1. Load assets in preload()
this.load.atlas('tether', 'assets/vfx/tether_atlas.png', 'assets/vfx/tether_atlas.json');

// 2. Create glow animation
this.anims.create({
  key: 'tetherGlow',
  frames: [
    { key: 'tether', frame: 'segment_0' },
    { key: 'tether', frame: 'segment_1' }
  ],
  frameRate: 2,
  repeat: -1
});
this.anims.create({
  key: 'tetherSpark',
  frames: [{ key: 'tether', frame: 'strain_spark' }],
  frameRate: 1,
  repeat: 0
});
// (Similarly define 'tetherBreak' and 'tetherReattach')

// 3. On each update(), rebuild the rope:
update() {
  const start = ship.getCenter();
  const end   = salvage.getCenter();
  const points = Phaser.Curves.Spline.GetControlPoints([ start, end ], 10);

  // Remove old segments
  this.tetherGroup.clear(true, true);

  // For each segment along the curve:
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i+1];
    const angle = Phaser.Math.Angle.Between(p0.x, p0.y, p1.x, p1.y);
    const segment = this.add.sprite(p0.x, p0.y, 'tether', 'segment_0');
    segment.setRotation(angle);
    segment.play('tetherGlow');
    segment.setBlendMode(Phaser.BlendModes.ADD);
    this.tetherGroup.add(segment);
  }

  // 4. Check tension
  const tension = Phaser.Math.Distance.Between(start.x, start.y, end.x, end.y) / maxTetherLength;
  if (tension > 0.9 && !this.sparkPlayed) {
    const spark = this.add.sprite(points[Math.floor(points.length/2)].x,
                                  points[Math.floor(points.length/2)].y,
                                  'tether', 'strain_spark')
                       .play('tetherSpark');
    this.sparkPlayed = true;
    spark.once('animationcomplete', () => this.sparkPlayed = false);
  }
}
```

- **Curve Sampling:** Break the Bézier/spline into ~10 segments for smooth curvature .  
- **Rotation & Blend:** Align each tile with its neighbor vector; use `ADD` blend for glow.  
- **Tension Trigger:** When `distance/maxLength > 0.9`, fire the spark animation once.

---

## 4. Break & Reattach Logic

- **On Break:**  
  ```js
  this.tetherGroup.children.each(seg => seg.play('tetherBreak'));
  ```
  After the 3-frame break, destroy all segments and spawn a burst of micro-particles from the ship's tether port.

- **On Reattach:**  
  Once the salvage re-anchors, play:
  ```js
  const endSeg = this.add.sprite(end.x, end.y, 'tether', 'segment_0')
                   .play('tetherReattach');
  ```
  Then resume dynamic construction in `update()`.

---

## 5. Particle Enhancements (Optional)

Attach a small particle emitter at the ship end for extra feedback:

```js
this.particles = this.add.particles('tinyDust');
this.emitter = this.particles.createEmitter({
  frame: ['dust1', 'dust2'],
  speed: { min: 10, max: 30 },
  lifespan: 500,
  quantity: 2,
  on: false
});

// Trigger on break
this.emitter.explode(5, ship.x, ship.y);
```

This reinforces the high-strain snap visually.

---

## 6. Implementation Plan

Based on the current state of the game and the design specifications above, here's the plan for implementing the enhanced tether VFX:

### Phase 1: Asset Integration (Already Done)
- ✅ Create tether_atlas.png and tether_atlas.json with all animation frames
- ✅ Place assets in public/assets/vfx folder

### Phase 2: Update Preloader (Estimated: 15 minutes)
1. Modify the PreloaderScene.ts to load the tether atlas:
```js
// In PreloaderScene.ts preload() method
this.load.atlas('tether', 'assets/vfx/tether_atlas.png', 'assets/vfx/tether_atlas.json');
```

### Phase 3: Tether Class Refactoring (Estimated: 2 hours)
1. Refactor the Tether.ts class to use sprites instead of graphics:
   - Replace the simple line with animated segments
   - Create a container to hold all tether segments
   - Add a particle emitter for break/reattach effects

2. Create the animation definitions:
```js
// In Tether constructor after assets are loaded
this.scene.anims.create({
  key: 'tetherGlow',
  frames: [
    { key: 'tether', frame: 'segment_0' },
    { key: 'tether', frame: 'segment_1' }
  ],
  frameRate: 2,
  repeat: -1
});

this.scene.anims.create({
  key: 'tetherSpark',
  frames: [{ key: 'tether', frame: 'strain_spark' }],
  frameRate: 1,
  repeat: 0
});

this.scene.anims.create({
  key: 'tetherBreak',
  frames: [
    { key: 'tether', frame: 'break_0' },
    { key: 'tether', frame: 'break_1' },
    { key: 'tether', frame: 'break_2' }
  ],
  frameRate: 12,
  repeat: 0
});

this.scene.anims.create({
  key: 'tetherReattach',
  frames: [
    { key: 'tether', frame: 'reattach_0' },
    { key: 'tether', frame: 'reattach_1' },
    { key: 'tether', frame: 'reattach_2' },
    { key: 'tether', frame: 'reattach_3' }
  ],
  frameRate: 12,
  repeat: 0
});
```

3. Implement curve-based segment placement:
```js
// Replace graphics.lineBetween with dynamic segments
updateTetherSegments() {
  // Clear old segments
  this.tetherGroup.clear(true, true);

  // Get start and end points
  const start = { x: this.player.x, y: this.player.y };
  const end = { x: this.salvage.x, y: this.salvage.y };
  
  // Calculate distance to determine tension
  const distance = Phaser.Math.Distance.Between(start.x, start.y, end.x, end.y);
  const tension = distance / TetherConfig.maxLength;
  
  // Create a spline curve with control points
  const points = Phaser.Curves.Spline.GetPoints([ start, end ], 10);
  
  // Add segments along curve
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i+1];
    const angle = Phaser.Math.Angle.Between(p0.x, p0.y, p1.x, p1.y);
    const segment = this.scene.add.sprite(p0.x, p0.y, 'tether', 'segment_0');
    
    // Set rotation, scaling and blend mode
    segment.setRotation(angle);
    segment.setOrigin(0, 0.5);
    segment.play('tetherGlow');
    segment.setBlendMode(Phaser.BlendModes.ADD);
    
    // Add to group for easy management
    this.tetherGroup.add(segment);
  }
  
  // Add tension visuals when needed
  if (tension > 0.9 && !this.sparkPlayed) {
    // Add spark at midpoint
    const midIndex = Math.floor(points.length/2);
    const spark = this.scene.add.sprite(
      points[midIndex].x, 
      points[midIndex].y, 
      'tether', 
      'strain_spark'
    );
    spark.play('tetherSpark');
    spark.setBlendMode(Phaser.BlendModes.ADD);
    this.sparkPlayed = true;
    
    // Reset after animation completes
    spark.once('animationcomplete', () => {
      this.sparkPlayed = false;
      spark.destroy();
    });
  }
}
```

### Phase 4: Break & Reattach Effects (Estimated: 1 hour)
1. Implement break animation:
```js
playBreakAnimation() {
  // Get positions for break effect
  const start = { x: this.player.x, y: this.player.y };
  const end = { x: this.salvage.x, y: this.salvage.y };
  
  // Play break animation on all segments
  this.tetherGroup.children.each(segment => {
    segment.play('tetherBreak');
    segment.once('animationcomplete', () => segment.destroy());
  });
  
  // Add particle burst at endpoints
  this.emitBreakParticles(start.x, start.y);
  this.emitBreakParticles(end.x, end.y);
}

emitBreakParticles(x, y) {
  // Create temporary particle emitter for break effect
  const particles = this.scene.add.particles('tether', 'segment_0');
  const emitter = particles.createEmitter({
    x: x,
    y: y,
    speed: { min: 20, max: 50 },
    angle: { min: 0, max: 360 },
    scale: { start: 0.5, end: 0 },
    lifespan: 500,
    blendMode: Phaser.BlendModes.ADD,
    quantity: 5
  });
  
  // Emit once then destroy
  emitter.explode(10, x, y);
  this.scene.time.delayedCall(500, () => particles.destroy());
}
```

2. Implement reattach animation:
```js
playReattachAnimation() {
  const end = { x: this.salvage.x, y: this.salvage.y };
  
  // Create reattach effect at salvage point
  const reattach = this.scene.add.sprite(end.x, end.y, 'tether', 'reattach_0');
  reattach.play('tetherReattach');
  reattach.setBlendMode(Phaser.BlendModes.ADD);
  
  // Clean up after animation
  reattach.once('animationcomplete', () => reattach.destroy());
  
  // Start building tether segments after animation
  this.scene.time.delayedCall(250, () => this.createSegments());
}
```

### Phase 5: Tether Configuration (Estimated: 30 minutes)
1. Update TetherConfig in GameConfig.ts with new visual parameters:
```js
// In GameConfig.ts
export const TetherConfig = {
  // Existing physics properties
  maxLength: 150,
  maxAttachDistance: 150,
  towForce: 100,
  towDamping: 0.1,
  
  // Visual properties
  lineWidth: 2,
  lineColor: 0x00ff00,
  segments: 10,           // Number of segments to create
  glowColor: 0xA3D5FF,    // Base glow color
  highlightColor: 0xC19CFF, // Secondary glow color
  strainThreshold: 0.9,   // Tension threshold for strain effects (0.0-1.0)
  sparkColor: 0x7FFF00,   // Color for max-strain spark
  blendMode: 'ADD',      // Blend mode for segments
  
  // Animation properties
  glowFrameRate: 2,      // Frames per second for glow animation
  breakFrameRate: 12,    // Frames per second for break animation
  reattachFrameRate: 12, // Frames per second for reattach animation
};
```

### Phase 6: Testing & Optimization (Estimated: 1 hour)
1. Test performance on both desktop and mobile devices
2. Optimize the number of segments based on device performance
3. Fine-tune animation timings and visual effects
4. Ensure proper cleanup of all sprites and particles to prevent memory leaks

### Phase 7: Polish & Final Adjustments (Estimated: 30 minutes)
1. Add audio cues for tether effects (if audio assets are available)
2. Adjust colors and animation speeds based on gameplay feedback
3. Add haptic feedback for mobile devices when tether experiences strain

### Total Estimated Time: ~5 hours

---

### Summary

With these assets, animations, and runtime integration:

- **Idle**: Neon flicker keeps the tether "alive."  
- **Strain**: A bright spark warns you're pushing the limit.  
- **Break**: A crisp snap animation and particles signal failure.  
- **Reattach**: A satisfying bounce draws you back in.  

Combined, they create a dynamic, readable tether system that reflects real-time physics and pulls players deeper into the stakes of every salvage run.