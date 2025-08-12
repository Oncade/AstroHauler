import { PlayerConfig, TetherConfig, SalvageConfig } from './GameConfig';

// Simple meta-game definitions and helpers with localStorage persistence

export type UpgradeKey = 'thrusters' | 'tether' | 'hull';

export interface UpgradesState {
  thrusters: number; // increases thrustForce/maxVelocity
  tether: number; // improves tow damping (stabilization)
  hull: number; // reserved for future collisions/damage
}

export interface MetaProgress {
  totalSpaceBucks: number;
  upgrades: UpgradesState;
  selectedShipId: string;
  ownedShips: string[];
  levelIndex: number;
}

export interface ShipDef {
  id: string;
  name: string;
  description: string;
  thrustMultiplier: number;
  maxVelocityMultiplier: number;
  cost: number; // 0 if starter
}

export interface LevelConfigDef {
  id: string;
  name: string;
  description: string;
  salvageSpawnCount: number;
}

// Capture base values to avoid cumulative mutation across scene loads
const BASE_VALUES = {
  thrustForce: PlayerConfig.thrustForce,
  maxVelocity: PlayerConfig.maxVelocity,
  towDamping: TetherConfig.towDamping,
  salvageSpawnCount: SalvageConfig.spawnCount,
};

export const Ships: Record<string, ShipDef> = {
  scout: {
    id: 'scout',
    name: 'Scout',
    description: 'Agile frame with boosted thrust.',
    thrustMultiplier: 1.15,
    maxVelocityMultiplier: 1.1,
    cost: 0,
  },
  hauler: {
    id: 'hauler',
    name: 'Hauler',
    description: 'Stable platform tuned for towing.',
    thrustMultiplier: 1.0,
    maxVelocityMultiplier: 1.0,
    cost: 600,
  },
  ranger: {
    id: 'ranger',
    name: 'Ranger',
    description: 'Balanced long-range explorer.',
    thrustMultiplier: 1.08,
    maxVelocityMultiplier: 1.15,
    cost: 900,
  },
};

export const Levels: LevelConfigDef[] = [
  { id: 'zone-a', name: 'Debris Drift', description: 'Low threat, sparse debris.', salvageSpawnCount: 12 },
  { id: 'zone-b', name: 'Wreck Belt', description: 'Medium density salvage.', salvageSpawnCount: 18 },
  { id: 'zone-c', name: 'Forgotten Yard', description: 'Heavy clutter, higher reward.', salvageSpawnCount: 24 },
];

const STORAGE_KEYS = {
  progress: 'metaProgress',
  // Existing key 'totalSpaceBucks' remains for backward compatibility
};

export function loadProgress(): MetaProgress {
  // Try new structure
  const raw = localStorage.getItem(STORAGE_KEYS.progress);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as MetaProgress;
      return normalizeProgress(parsed);
    } catch {}
  }

  // Backward compatibility: seed from existing SpaceBucks
  const oldBucks = localStorage.getItem('totalSpaceBucks');
  const totalSpaceBucks = oldBucks ? parseInt(oldBucks, 10) || 0 : 0;

  const seed: MetaProgress = {
    totalSpaceBucks,
    upgrades: { thrusters: 0, tether: 0, hull: 0 },
    selectedShipId: 'scout',
    ownedShips: ['scout'],
    levelIndex: 0,
  };
  saveProgress(seed);
  return seed;
}

export function saveProgress(progress: MetaProgress) {
  localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(progress));
  // Keep legacy in sync so existing UI continues to work
  localStorage.setItem('totalSpaceBucks', String(progress.totalSpaceBucks));
}

function normalizeProgress(p: MetaProgress): MetaProgress {
  const clean: MetaProgress = {
    totalSpaceBucks: Math.max(0, p.totalSpaceBucks || 0),
    upgrades: {
      thrusters: clampInt(p.upgrades?.thrusters ?? 0, 0, 3),
      tether: clampInt(p.upgrades?.tether ?? 0, 0, 3),
      hull: clampInt(p.upgrades?.hull ?? 0, 0, 3),
    },
    selectedShipId: Ships[p.selectedShipId]?.id || 'scout',
    ownedShips: Array.isArray(p.ownedShips) ? p.ownedShips.filter((id) => !!Ships[id]) : ['scout'],
    levelIndex: clampInt(p.levelIndex ?? 0, 0, Levels.length - 1),
  };
  if (!clean.ownedShips.includes(clean.selectedShipId)) {
    clean.selectedShipId = 'scout';
  }
  if (!clean.ownedShips.includes('scout')) clean.ownedShips.push('scout');
  return clean;
}

function clampInt(n: number, min: number, max: number): number {
  const v = Math.floor(Number.isFinite(n) ? n : 0);
  return Math.min(max, Math.max(min, v));
}

export function getCurrentLevel(progress?: MetaProgress): LevelConfigDef {
  const p = progress ?? loadProgress();
  return Levels[Math.min(Levels.length - 1, Math.max(0, p.levelIndex))];
}

export function nextLevel() {
  const p = loadProgress();
  if (p.levelIndex < Levels.length - 1) {
    p.levelIndex += 1;
    saveProgress(p);
  }
}

export function addSpaceBucks(amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) return;
  const p = loadProgress();
  p.totalSpaceBucks += Math.floor(amount);
  saveProgress(p);
}

export function purchaseUpgrade(key: UpgradeKey): { ok: boolean; newProgress: MetaProgress } {
  const p = loadProgress();
  const current = p.upgrades[key];
  const max = 3;
  if (current >= max) return { ok: false, newProgress: p };
  const cost = getUpgradeCost(key, current + 1);
  if (p.totalSpaceBucks < cost) return { ok: false, newProgress: p };
  p.totalSpaceBucks -= cost;
  p.upgrades[key] = current + 1;
  saveProgress(p);
  return { ok: true, newProgress: p };
}

export function getUpgradeCost(key: UpgradeKey, level: number): number {
  const base = { thrusters: 120, tether: 150, hull: 100 }[key];
  // simple exponential growth
  return Math.floor(base * Math.pow(2, level - 1));
}

export function purchaseShip(shipId: string): { ok: boolean; newProgress: MetaProgress } {
  const ship = Ships[shipId];
  if (!ship) return { ok: false, newProgress: loadProgress() };
  const p = loadProgress();
  if (p.ownedShips.includes(shipId)) {
    p.selectedShipId = shipId;
    saveProgress(p);
    return { ok: true, newProgress: p };
  }
  if (p.totalSpaceBucks < ship.cost) return { ok: false, newProgress: p };
  p.totalSpaceBucks -= ship.cost;
  p.ownedShips.push(shipId);
  p.selectedShipId = shipId;
  saveProgress(p);
  return { ok: true, newProgress: p };
}

// Apply ship and upgrade multipliers to runtime config objects.
// This resets mutated values back to base first, then reapplies modifiers.
export function applyMetaToRuntimeConfigs(progress?: MetaProgress) {
  const p = progress ?? loadProgress();
  const ship = Ships[p.selectedShipId] ?? Ships.scout;

  // Reset to base before applying modifiers
  PlayerConfig.thrustForce = BASE_VALUES.thrustForce;
  PlayerConfig.maxVelocity = BASE_VALUES.maxVelocity;
  TetherConfig.towDamping = BASE_VALUES.towDamping;

  // Multipliers
  const thrusterMult = 1 + 0.12 * p.upgrades.thrusters; // up to +36%
  const tetherDampingBonus = 0.05 * p.upgrades.tether; // up to +0.15

  PlayerConfig.thrustForce = Math.round(BASE_VALUES.thrustForce * ship.thrustMultiplier * thrusterMult);
  PlayerConfig.maxVelocity = Math.round(BASE_VALUES.maxVelocity * ship.maxVelocityMultiplier * (1 + 0.05 * p.upgrades.thrusters));

  // Increase tow damping for more stabilization with upgrades
  TetherConfig.towDamping = Math.min(0.45, Number((BASE_VALUES.towDamping + tetherDampingBonus).toFixed(3)));
}

// Convenience for scenes to get per-haul parameters
export function getHaulParams() {
  const p = loadProgress();
  const level = getCurrentLevel(p);
  return {
    salvageSpawnCount: level.salvageSpawnCount,
    level,
    progress: p,
  };
}


