import { Events } from 'phaser';

/**
 * Global EventBus for React ⇄ Phaser communication.
 * Canonical events and payloads:
 *
 * UI → Phaser (intents)
 * - 'ui-end-haul'                          ()
 * - 'ui-start-game'                        ()
 * - 'ui-minimap-toggle'                    (visible: boolean)
 * - 'ui-tether-toggle'                     ()
 * - 'ui-thrust-control'                    ({ active: boolean; force?: number })
 * - 'ui-rotation-control'                  ({ angle: number; strength?: number })
 *
 * Command Center (UI → Phaser)
 * - 'ui-command-start-haul'                ()
 * - 'ui-command-return'                    ()
 * - 'ui-command-upgrade'                   ({ key: 'thrusters'|'tether'|'hull' })
 * - 'ui-command-ship-prev'                 ()
 * - 'ui-command-ship-next'                 ()
 * - 'ui-command-ship-select'               ()
 * - 'ui-command-request-state'             ()
 *
 * Phaser → UI (state updates)
 * - 'current-scene-ready'                  (scene: Phaser.Scene)
 * - 'score-updated'                        (score: number)
 * - 'spacebucks-updated'                   (total: number)
 * - 'tether-state-changed'                 (active: boolean)
 * - 'minimap-state-changed'                (visible: boolean)
 * - 'game-pause-changed'                   (paused: boolean)
 * - 'player-exit-zone-changed'             (eligible: boolean)
 *
 * Command Center (Phaser → UI)
 * - 'commandcenter-state-changed'          ({
 *      totalSpaceBucks: number,
 *      upgrades: { thrusters: number; tether: number; hull: number },
 *      nextCosts: { thrusters: number; tether: number; hull: number },
 *      selectedShipId: string,
 *      shipIndex: number,
 *      shipCount: number,
 *      ship: { id: string; name: string; description: string; cost: number; owned: boolean },
 *      level: { name: string; salvageSpawnCount: number }
 *   })
 */
export const EventBus = new Events.EventEmitter();