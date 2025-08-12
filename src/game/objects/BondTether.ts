import Phaser from 'phaser';
import Player from './Player';
import Salvage from './Salvage';
import Tether from './Tether';
import { TetherConfig, PlayerConfig } from '../config/GameConfig';
import { ITether } from './TetherFactory';

// BondTether manages a chain of Salvage pieces bonded together.
// One selected piece is attached to the Player via an internal Tether instance.
export default class BondTether implements ITether {
  private scene: Phaser.Scene;
  private player: Player;
  private chain: Salvage[] = [];
  private attachedIndex: number = 0; // which chain node is attached to the ship
  private shipLink: Tether; // visual + physics link between player and attached salvage

  private bondsGraphics: Phaser.GameObjects.Graphics; // visual bonds between salvage
  private debugGraphics: Phaser.GameObjects.Graphics; // optional debug lines
  private debugTextObj: Phaser.GameObjects.Text | null = null; // optional debug text
  private debugEnabled: boolean = true; // default on per request
  private debugLinesEnabled: boolean = true;

  constructor(scene: Phaser.Scene, player: Player, startSalvage: Salvage) {
    this.scene = scene;
    this.player = player;

    // initialize chain with first salvage
    this.chain.push(startSalvage);
    this.attachedIndex = 0;

    // create ship link to first salvage using existing tether visuals/logic
    this.shipLink = new Tether(scene, player, startSalvage);

    // create graphics for bonds and debug
    this.bondsGraphics = scene.add.graphics();
    this.debugGraphics = scene.add.graphics();
    this.createOrUpdateDebugText();
  }

  // --- public API ---
  update(delta: number): void {
    // update ship link physics/visuals
    this.shipLink.update(delta);

    // simplify rotation on all chain pieces to avoid excessive spin
    this.chain.forEach((s) => s.setAngularVelocity(0));

    // enforce constraints between consecutive chain pieces
    this.enforceChainConstraints(delta);

    // redraw bonds
    this.renderBonds();

    // update debug
    if (this.debugEnabled) this.updateDebugText();
  }

  // Called when a salvage in the chain is deposited. If the deposited salvage is
  // somewhere between the ship-attached node and the chain tail, drop the far side
  // so only the segment between ship and deposited piece remains (excluding the
  // deposited piece itself).
  onSalvageDeposited?(salvage: Salvage): void {
    const idx = this.chain.indexOf(salvage);
    if (idx === -1) return; // Not part of this chain

    // If the deposited piece is the one attached to the ship, let scene logic
    // handle tether destruction; nothing to trim here.
    if (idx === this.attachedIndex) return;

    // Determine which side to keep so that the segment between ship and deposit remains.
    if (idx > this.attachedIndex) {
      // Keep [attachedIndex .. idx-1]; rebase attached to index 0.
      const kept = this.chain.slice(this.attachedIndex, idx);
      // End any lingering tether indicators on pieces we drop
      for (let i = idx; i < this.chain.length; i++) {
        const s = this.chain[i];
        if (s && s.isTethered) s.endTether();
      }
      this.chain = kept;
      this.attachedIndex = 0;
    } else {
      // idx < attachedIndex
      // Keep [idx+1 .. attachedIndex]; attached becomes last index.
      const kept = this.chain.slice(idx + 1, this.attachedIndex + 1);
      for (let i = 0; i <= idx; i++) {
        const s = this.chain[i];
        if (s && s.isTethered) s.endTether();
      }
      this.chain = kept;
      this.attachedIndex = this.chain.length - 1;
    }

    // Ensure only the currently attached salvage shows a tether indicator
    for (let i = 0; i < this.chain.length; i++) {
      if (i !== this.attachedIndex && this.chain[i].isTethered) {
        this.chain[i].endTether();
      }
    }

    // If the ship link target no longer matches the chain's attached node (e.g.,
    // if the previously attached salvage was removed from chain somehow), rebuild it.
    const attached = this.chain[this.attachedIndex];
    if (attached && this.shipLink.getAttachedSalvage() !== attached) {
      this.shipLink.destroy();
      this.shipLink = new Tether(this.scene, this.player, attached);
    }

    this.logDebug(`Chain trimmed due to deposit. New length=${this.chain.length}, attachedIndex=${this.attachedIndex}`);
  }

  destroy(): void {
    this.shipLink.destroy();
    this.bondsGraphics.destroy();
    this.debugGraphics.destroy();
    if (this.debugTextObj) this.debugTextObj.destroy();
  }

  getAttachedSalvage(): Salvage {
    return this.chain[this.attachedIndex];
  }

  playReattachAnimation(): void {
    this.shipLink.playReattachAnimation();
  }

  updateTetherColor?(color: number): void {
    this.shipLink.updateTetherColor?.(color);
  }

  toggleColorCycling?(): boolean {
    return this.shipLink.toggleColorCycling?.() ?? false;
  }

  // Called by scene when tether button is pressed while this tether is active
  onTetherButtonPressed?(): boolean {
    // 1) If near a salvage already in the chain, reattach ship to it
    const nearExisting = this.findNearestSalvageInChainToPlayer();
    if (nearExisting && nearExisting.distanceSq <= TetherConfig.maxAttachDistance * TetherConfig.maxAttachDistance) {
      if (nearExisting.index !== this.attachedIndex) {
        this.attachShipToIndex(nearExisting.index);
        this.logDebug(`Reattached ship to chain index ${nearExisting.index}`);
        return true;
      }
    }

    // 2) Otherwise, if near an eligible new salvage, add it as new HEAD and attach ship to it
    const candidate = this.findNearestEligibleSalvageToPlayer();
    if (candidate) {
      this.addNewHeadAndAttach(candidate);
      this.logDebug(`Bonded new head salvage. Chain length: ${this.chain.length}, attachedIndex=${this.attachedIndex}`);
      return true;
    }

    // 3) Nothing handled; let scene do default detach if desired
    return false;
  }

  toggleDebug?(): void {
    this.debugEnabled = !this.debugEnabled;
    if (this.debugTextObj) this.debugTextObj.setVisible(this.debugEnabled);
    this.debugLinesEnabled = this.debugEnabled;
    this.debugGraphics.setVisible(this.debugLinesEnabled);
  }

  // --- internal helpers ---
  private attachShipToIndex(newIndex: number) {
    const current = this.chain[this.attachedIndex];
    const target = this.chain[newIndex];
    if (!current || !target) return;

    // destroy old ship link and create a new one
    this.shipLink.destroy();
    // Ensure only the target shows a tether indicator; clear others proactively
    for (let i = 0; i < this.chain.length; i++) {
      const s = this.chain[i];
      if (s !== target && s.isTethered) {
        s.endTether();
      }
    }

    this.shipLink = new Tether(this.scene, this.player, target);
    this.attachedIndex = newIndex;
  }

  private addNewHeadAndAttach(newSalvage: Salvage) {
    // Insert at head of chain
    this.chain.unshift(newSalvage);
    // Ship should attach to new head
    this.attachShipToIndex(0);
    // Stabilize initial rotation
    newSalvage.setAngularVelocity(0);
  }

  private enforceChainConstraints(delta: number) {
    const dt = delta / 1000;
    const maxLen = TetherConfig.maxLength;
    const damping = TetherConfig.towDamping;
    const pullStrength = TetherConfig.towForce;

    // from attached index outward forward
    for (let i = this.attachedIndex; i < this.chain.length - 1; i++) {
      this.applyBondConstraint(this.chain[i], this.chain[i + 1], maxLen, damping, pullStrength, dt);
    }
    // backward towards start
    for (let i = this.attachedIndex - 1; i >= 0; i--) {
      this.applyBondConstraint(this.chain[i + 1], this.chain[i], maxLen, damping, pullStrength, dt);
    }
  }

  private applyBondConstraint(anchor: Salvage, follower: Salvage, maxLen: number, damping: number, pullStrength: number, dt: number) {
    if (!anchor.body || !follower.body) return;
    const dx = anchor.x - follower.x;
    const dy = anchor.y - follower.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist <= maxLen) return; // only pull together if stretched

    const dirX = dx / dist;
    const dirY = dy / dist;

    // target position on the circle around anchor at maxLen
    const targetX = anchor.x - dirX * maxLen;
    const targetY = anchor.y - dirY * maxLen;
    const moveX = targetX - follower.x;
    const moveY = targetY - follower.y;

    // apply velocity towards target with damping to keep motion predictable
    const body = follower.body as Phaser.Physics.Arcade.Body;
    const newVelX = moveX * (pullStrength / Math.max(1, follower.mass)) * dt;
    const newVelY = moveY * (pullStrength / Math.max(1, follower.mass)) * dt;
    body.velocity.x = body.velocity.x * damping + newVelX * (1 - damping);
    body.velocity.y = body.velocity.y * damping + newVelY * (1 - damping);

    // clamp speed to avoid whipping; base it on player's current speed with sensible bounds
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    const playerSpeed = playerBody ? Math.hypot(playerBody.velocity.x, playerBody.velocity.y) : PlayerConfig.maxVelocity;
    const baselineCap = PlayerConfig.maxVelocity; // config cap for the ship
    // allow chain to go up to 90% of current player speed, but never below 50% of baseline and never above baseline
    const dynamicCap = Math.max(baselineCap * 0.5, playerSpeed * 0.9);
    const maxSpeed = Math.min(baselineCap, dynamicCap);
    const speed = Math.hypot(body.velocity.x, body.velocity.y);
    if (speed > maxSpeed) {
      const scale = maxSpeed / speed;
      body.velocity.x *= scale;
      body.velocity.y *= scale;
    }
  }

  private renderBonds() {
    // bonds: simple visual line between each pair in chain
    this.bondsGraphics.clear();
    this.bondsGraphics.lineStyle(2, TetherConfig.glowColor, 0.8);
    for (let i = 0; i < this.chain.length - 1; i++) {
      const a = this.chain[i];
      const b = this.chain[i + 1];
      this.bondsGraphics.beginPath();
      this.bondsGraphics.moveTo(a.x, a.y);
      this.bondsGraphics.lineTo(b.x, b.y);
      this.bondsGraphics.strokePath();
    }

    // optional debug lines in a contrasting color
    this.debugGraphics.clear();
    if (this.debugLinesEnabled) {
      this.debugGraphics.lineStyle(1, 0xff00ff, 0.7);
      // ship to attached
      const attached = this.chain[this.attachedIndex];
      this.debugGraphics.beginPath();
      this.debugGraphics.moveTo(this.player.x, this.player.y);
      this.debugGraphics.lineTo(attached.x, attached.y);
      this.debugGraphics.strokePath();

      for (let i = 0; i < this.chain.length - 1; i++) {
        const a = this.chain[i];
        const b = this.chain[i + 1];
        this.debugGraphics.beginPath();
        this.debugGraphics.moveTo(a.x, a.y);
        this.debugGraphics.lineTo(b.x, b.y);
        this.debugGraphics.strokePath();
      }
    }
  }

  private findNearestEligibleSalvageToPlayer(): Salvage | null {
    const maxDistSq = TetherConfig.maxAttachDistance * TetherConfig.maxAttachDistance;
    let nearest: Salvage | null = null;
    let best = Infinity;

    this.scene.children.each((obj: Phaser.GameObjects.GameObject) => {
      if (obj instanceof Salvage && obj.active && obj.body && !obj.isTethered && !this.isInChain(obj)) {
        const dx = obj.x - this.player.x;
        const dy = obj.y - this.player.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < best && d2 <= maxDistSq) {
          best = d2;
          nearest = obj;
        }
      }
    });

    return nearest;
  }

  private findNearestSalvageInChainToPlayer(): { index: number; distanceSq: number } | null {
    const maxDistSq = TetherConfig.maxAttachDistance * TetherConfig.maxAttachDistance;
    let nearestIndex = -1;
    let best = Infinity;
    for (let i = 0; i < this.chain.length; i++) {
      const s = this.chain[i];
      const dx = s.x - this.player.x;
      const dy = s.y - this.player.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < best && d2 <= maxDistSq) {
        best = d2;
        nearestIndex = i;
      }
    }
    return nearestIndex >= 0 ? { index: nearestIndex, distanceSq: best } : null;
  }

  private isInChain(salvage: Salvage): boolean {
    return this.chain.includes(salvage);
  }

  private createOrUpdateDebugText() {
    if (!this.debugEnabled) return;
    const style = { fontSize: '14px', color: '#00ffcc' } as Phaser.Types.GameObjects.Text.TextStyle;
    if (!this.debugTextObj) {
      this.debugTextObj = this.scene.add.text(16, 248, '', style).setScrollFactor(0).setDepth(1001);
    }
    this.updateDebugText();
  }

  private updateDebugText() {
    if (!this.debugTextObj) return;
    const attached = this.chain[this.attachedIndex];
    const parts = [
      `BondTether: len=${this.chain.length} attachedIndex=${this.attachedIndex}`,
      `Attached salvage @(${attached.x.toFixed(0)},${attached.y.toFixed(0)})`,
    ];
    // distances between bonds
    for (let i = 0; i < this.chain.length - 1; i++) {
      const a = this.chain[i];
      const b = this.chain[i + 1];
      const d = Phaser.Math.Distance.Between(a.x, a.y, b.x, b.y).toFixed(1);
      parts.push(`bond[${i}-${i + 1}] d=${d}`);
    }
    this.debugTextObj.setText(parts.join('\n'));
  }

  private logDebug(msg: string) {
    if (!this.debugEnabled) return;
    console.log(`[BondTether] ${msg}`);
  }
}


