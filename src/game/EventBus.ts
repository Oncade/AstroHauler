import { Events } from 'phaser';

/**
 * Global EventBus for React ⇄ Phaser communication.
 * Canonical events and payloads:
 *
 * UI → Phaser (intents)
 * - 'ui-end-haul'                          ()
 * - 'ui-minimap-toggle'                    (visible: boolean)
 * - 'ui-tether-toggle'                     ()
 * - 'ui-thrust-control'                    ({ active: boolean; force?: number })
 * - 'ui-rotation-control'                  ({ angle: number; strength?: number })
 *
 * Phaser → UI (state updates)
 * - 'current-scene-ready'                  (scene: Phaser.Scene)
 * - 'score-updated'                        (score: number)
 * - 'spacebucks-updated'                   (total: number)
 * - 'tether-state-changed'                 (active: boolean)
 * - 'minimap-state-changed'                (visible: boolean)
 * - 'game-pause-changed'                   (paused: boolean)
 * - 'player-exit-zone-changed'             (eligible: boolean)
 */
export const EventBus = new Events.EventEmitter();