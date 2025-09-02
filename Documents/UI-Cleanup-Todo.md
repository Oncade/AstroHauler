### React–Phaser UI Cleanup Plan

This checklist consolidates gameplay logic in `src/game/scenes/GameScene.ts` and keeps React components as a thin UI layer that communicates via `src/game/EventBus.ts`. Goal: no duplicated UI/logic between React and Phaser, clear event boundaries, and responsive UX.

--- 

### Guiding Principles
- **Gameplay in Phaser**: All simulation, physics, spawning, scoring, deposits, minimap, fog, audio live in `GameScene.ts` and related Phaser classes.
- **UI in React**: React renders HUD, touch controls, buttons, and modals; it emits intents to Phaser via `EventBus` and subscribes to state updates emitted by Phaser.
- **Single Source of Truth**: No duplicated UI elements across React and Phaser. If React renders it, Phaser must not also render its own version of it.

---

### EventBus hygiene
- [x] Replace any incorrect listener removals with proper API usage (e.g., use `off(event, handler)` or `removeListener(event, handler)` instead of calling with only the event name) in `src/game/PhaserGame.tsx`.
- [ ] Document the canonical UI→Phaser events in code (`ui-end-haul`, `ui-minimap-toggle`, `ui-tether-toggle`, `ui-thrust-control`, `ui-rotation-control`).
- [ ] Document the canonical Phaser→UI events in code (`score-updated`, `spacebucks-updated`, `tether-state-changed`, `minimap-state-changed`, `game-pause-changed`, `player-exit-zone-changed`).
  - [x] Documented canonical events and payloads in `src/game/EventBus.ts` JSDoc.
- [x] Ensure all EventBus listeners are added once per scene lifecycle and cleaned up on scene shutdown.
  - [x] Remove scene gating from React UI emitters so intents always reach Phaser once ready.
  - [x] Guarded residual Phaser touch UI references (e.g., `thrustButton.setTint`) when Phaser touch UI is disabled.

---

- [x] Remove Phaser-drawn UI buttons (`createUIButtons`, `positionUIButtons`) and their usage; React `GameButtons` handles Exit/Help/Map.
- [x] Remove Phaser-drawn instructions panel (`showInstructionsPanel`, `hideInstructionsPanel`, `toggleInstructions`). React `InstructionsPanel` owns this UI.
- [x] Remove Phaser exit prompt (`showExitPrompt`, `hideExitPrompt`) and instead:
  - [x] Emit `player-exit-zone-changed` when player is eligible to exit (in zone and under velocity threshold) and when leaving the zone.
  - [x] Let React show `ExitPrompt`; on confirm, React emits `ui-end-haul` which `GameScene` handles via existing listener.
- [x] Keep minimap rendering in Phaser; remove any Phaser minimap button. React `MAP` button toggles via `ui-minimap-toggle`.
- [x] Remove in-Phaser touch UI (`createTouchControls` and related pointer handlers, tints, outlines). React `TouchControls` will emit `ui-thrust-control`, `ui-rotation-control`, and `ui-tether-toggle`.
- [x] Keep desktop inputs (keyboard, mouse left/right) in Phaser for convenience; ensure they don’t conflict with React events.
- [x] On load and after haul end, emit `spacebucks-updated` so React HUD reflects total SpaceBucks immediately.
- [x] Ensure `score-updated` is emitted on deposit; remove vestigial `scoreText` usage.

---

### React components alignment
- [ ] `GameHUD`: stays as the single mounted HUD during `GameScene`; ensure it subscribes only to EventBus events and emits intents—no direct DOM/canvas manipulation.
- [x] `TouchControls`: the only source of touch input; verify joystick/thrust/tether send `ui-rotation-control`, `ui-thrust-control`, `ui-tether-toggle` and do not try to mirror Phaser visuals.
  - [x] Prevented tether double-trigger by using touch-only handler with stopPropagation/preventDefault.
- [ ] `GameButtons`: Exit triggers confirmation flow in React (show `ExitPrompt`) or directly emits `ui-end-haul` per final UX decision; Help toggles `InstructionsPanel`; Map toggles minimap via EventBus.
- [ ] Remove legacy/empty React placeholders that are no longer needed (e.g., `CommandCenter`, `GameOverScreen`) or keep them explicitly as stubs with a clear comment until scenes are finalized.

---

- [x] In `PhaserGame.tsx`, fix cleanup for `current-scene-ready` by removing the exact handler (or using `removeAllListeners('current-scene-ready')`) to prevent leaks.
- [x] Keep a single, well-timed `current-scene-ready` emit (or retain the double-emit if required for race-free React mount) and document the rationale in code.
- [x] Confirm React `App.tsx` scene switch logic does not attach multiple score listeners across scene transitions.

---

### Assets & Preload
- [x] Remove unused touch button images from runtime if no longer shown by Phaser; keep assets if React uses emojis/icons instead.
- [x] Audit Preloader for assets that are now UI-only; ensure we don’t preload unused UI images.

---

- [ ] Replace console spam with guarded debug logs or a debug flag; keep high-signal logs (scene transitions, deposits, errors).
- [ ] Add minimal runtime checks to warn if both React and Phaser attempt to render the same UI element.

---

### Type safety & linting
- [ ] Type all EventBus payloads (create a shared types module for UI↔Phaser events).
- [ ] Run lints and fix new/affected files.

---

### Acceptance checklist (functional)
- [ ] Mobile: React `TouchControls` fully drive ship rotation and thrust; no Phaser touch UI appears.
- [ ] Desktop: Keyboard/mouse controls work; React buttons still emit correctly.
- [ ] Exit zone: entering slowly surfaces React `ExitPrompt`; confirming ends haul; leaving the zone hides prompt.
- [ ] Score and total SpaceBucks update in HUD without scene reloads.
- [ ] Minimap shows/hides via React button; physics pausing respects overlay visibility.

---

### Follow-ups (future chats)
- [ ] Consolidate event names and payloads into an enum/namespace and auto-generate type-safe hooks.
- [ ] Add feature flags for alternate control schemes and accessibility options.
- [ ] Consider migrating to a small state container (e.g., Zustand) for UI state derived from EventBus.


