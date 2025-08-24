import Phaser from 'phaser';
import { VisionConfig } from '../config/GameConfig';

export default class FogOfWar {
    private scene: Phaser.Scene;
    private worldWidth: number;
    private worldHeight: number;

    // Dynamic per-frame overlays
    private seenShadeRT: Phaser.GameObjects.RenderTexture; // shows dim on seen-but-not-current
    private fogRT: Phaser.GameObjects.RenderTexture;       // shows black on unseen

    // Persistent seen mask (white = seen)
    private seenMaskRT: Phaser.GameObjects.RenderTexture;

    private visionGraphics: Phaser.GameObjects.Graphics;
    private rectGraphics: Phaser.GameObjects.Graphics;

    private lastStampTime: number = 0;

    // Debris alpha map for LOS occlusion
    private debrisImageData?: Uint8ClampedArray;
    private debrisWidth: number = 0;
    private debrisHeight: number = 0;

    // Accumulate occluder interior fill points per update
    private pendingFillPoints: { x: number; y: number }[] = [];

    // Depths chosen to sit above game objects and below UI/minimap
    private exploredDepth: number = 800;
    private fogDepth: number = 850;

    constructor(scene: Phaser.Scene, worldWidth: number, worldHeight: number) {
        this.scene = scene;
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;

        // Persistent seen mask (kept offscreen visually under overlays)
        this.seenMaskRT = scene.add.renderTexture(0, 0, worldWidth, worldHeight)
            .setOrigin(0, 0)
            .setScrollFactor(1)
            .setDepth(this.exploredDepth)
            .setVisible(false);

        // Dynamic overlays
        this.seenShadeRT = scene.add.renderTexture(0, 0, worldWidth, worldHeight)
            .setOrigin(0, 0)
            .setScrollFactor(1)
            .setDepth(this.exploredDepth);

        // Dynamic fog layer (dark, fully resets each frame, drawn above seen shade)
        this.fogRT = scene.add.renderTexture(0, 0, worldWidth, worldHeight)
            .setOrigin(0, 0)
            .setScrollFactor(1)
            .setDepth(this.fogDepth);

        // Reusable graphics for drawing (hidden from display list)
        this.visionGraphics = scene.add.graphics();
        this.visionGraphics.setVisible(false);
        this.rectGraphics = scene.add.graphics();
        this.rectGraphics.setVisible(false);

        // No initial content; unseen is handled by fog overlay

        // Try to cache debris alpha for LOS
        const debrisTex = scene.textures.get('debris_map');
        const src = debrisTex && debrisTex.getSourceImage() as HTMLImageElement | HTMLCanvasElement | undefined;
        if (src) {
            const canvas = document.createElement('canvas');
            this.debrisWidth = (src as any).width || 0;
            this.debrisHeight = (src as any).height || 0;
            canvas.width = this.debrisWidth;
            canvas.height = this.debrisHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(src as CanvasImageSource, 0, 0);
                this.debrisImageData = ctx.getImageData(0, 0, this.debrisWidth, this.debrisHeight).data;
            }
        }
    }

    update(player: { x: number; y: number; rotation: number }, parent?: { x: number; y: number }) {
        if (!player) return;

        // Build current vision shape
        this.visionGraphics.clear();
        this.drawVisionShape(this.visionGraphics, player.x, player.y, player.rotation);
        if (parent) {
            this.drawParentVision(this.visionGraphics, parent.x, parent.y);
        }

        // Update unseen fog: redraw dark layer then erase current vision and any seen areas
        this.fogRT.clear();
        this.drawDimRect(this.fogRT, VisionConfig.fogAlpha);
        this.fogRT.erase(this.visionGraphics);
        this.fogRT.erase(this.seenMaskRT);

        // Update seen shade: redraw from mask, then remove current vision
        this.seenShadeRT.clear();
        this.seenShadeRT.draw(this.seenMaskRT, 0, 0);
        this.seenShadeRT.setTintFill(0x000000);
        this.seenShadeRT.setAlpha(VisionConfig.exploredAlpha);
        this.seenShadeRT.erase(this.visionGraphics);

        // Stamp seen mask at configured cadence
        const now = this.scene.time.now;
        if (VisionConfig.stampIntervalMs === 0 || (now - this.lastStampTime) >= VisionConfig.stampIntervalMs) {
            // Add current vision to seen mask
            this.seenMaskRT.draw(this.visionGraphics, 0, 0);
            // Also stamp occluder interior fill points
            if (this.pendingFillPoints.length > 0) {
                this.rectGraphics.clear();
                this.rectGraphics.fillStyle(0xffffff, 1);
                const r = Math.max(2, Math.floor(VisionConfig.rayStepPx / 2));
                for (const p of this.pendingFillPoints) {
                    this.rectGraphics.fillCircle(p.x, p.y, r);
                }
                this.seenMaskRT.draw(this.rectGraphics, 0, 0);
            }
            this.pendingFillPoints.length = 0;
            this.lastStampTime = now;
        }
    }

    destroy() {
        this.visionGraphics.destroy();
        this.rectGraphics.destroy();
        this.seenShadeRT.destroy();
        this.seenMaskRT.destroy();
        this.fogRT.destroy();
    }

    private drawDimRect(targetRT: Phaser.GameObjects.RenderTexture, alpha: number) {
        this.rectGraphics.clear();
        this.rectGraphics.fillStyle(0x000000, alpha);
        this.rectGraphics.fillRect(0, 0, this.worldWidth, this.worldHeight);
        targetRT.draw(this.rectGraphics);
    }

    private drawVisionShape(g: Phaser.GameObjects.Graphics, x: number, y: number, shipRotation: number) {
        const baseRadius = VisionConfig.baseRadius;
        const coneLen = VisionConfig.coneLength + baseRadius;
        const coneAngleRad = Phaser.Math.DEG_TO_RAD * VisionConfig.coneAngleDeg;

        // LOS-aware full circle around player
        this.drawFanLOS(g, x, y, 0, Math.PI * 2, baseRadius);

        // LOS-aware forward fan
        const forwardAngle = shipRotation - Math.PI / 2; // sprite faces up at 0
        const start = forwardAngle - coneAngleRad / 2;
        const end = forwardAngle + coneAngleRad / 2;
        this.drawFanLOS(g, x, y, start, end, coneLen);
    }

    private drawParentVision(g: Phaser.GameObjects.Graphics, x: number, y: number) {
        const radius = VisionConfig.parentRadius;
        this.drawFanLOS(g, x, y, 0, Math.PI * 2, radius);
    }

    private drawFanLOS(g: Phaser.GameObjects.Graphics, ox: number, oy: number, start: number, end: number, maxDist: number) {
        // Normalize ordering
        let a0 = start;
        let a1 = end;
        if (a1 < a0) {
            const tmp = a0; a0 = a1; a1 = tmp;
        }
        const step = Phaser.Math.DEG_TO_RAD * VisionConfig.rayStepDeg;
        g.fillStyle(0xffffff, 1);
        g.beginPath();
        let first = true;
        for (let a = a0; a <= a1 + 1e-4; a += step) {
            const d = this.castRay(ox, oy, a, maxDist);
            const ex = ox + Math.cos(a) * d;
            const ey = oy + Math.sin(a) * d;
            if (first) {
                g.moveTo(ex, ey);
                first = false;
            } else {
                g.lineTo(ex, ey);
            }
        }
        // Close back to origin to form a fan shape
        g.lineTo(ox, oy);
        g.closePath();
        g.fillPath();
    }

    private castRay(ox: number, oy: number, angle: number, maxDist: number): number {
        const step = VisionConfig.rayStepPx;
        if (!this.debrisImageData) {
            return maxDist;
        }
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        let hitDist: number | null = null;
        for (let d = 0; d <= maxDist; d += step) {
            const x = Math.round(ox + cos * d);
            const y = Math.round(oy + sin * d);
            if (x < 0 || y < 0 || x >= this.debrisWidth || y >= this.debrisHeight) {
                return Math.max(0, d);
            }
            const idx = (y * this.debrisWidth + x) * 4 + 3;
            const alpha = this.debrisImageData[idx] || 0;
            if (alpha >= VisionConfig.occlusionAlphaThreshold) {
                hitDist = Math.max(0, d);
                break;
            }
        }
        if (hitDist === null) {
            return maxDist;
        }
        // Schedule a fill into the occluder interior along this ray for a limited depth
        const fillDepth = VisionConfig.occluderFillDepthPx;
        const fillStep = VisionConfig.occluderFillStepPx;
        for (let fd = step; fd <= fillDepth; fd += fillStep) {
            const fx = Math.round(ox + cos * (hitDist + fd));
            const fy = Math.round(oy + sin * (hitDist + fd));
            if (fx < 0 || fy < 0 || fx >= this.debrisWidth || fy >= this.debrisHeight) {
                break;
            }
            const fIdx = (fy * this.debrisWidth + fx) * 4 + 3;
            const a = this.debrisImageData[fIdx] || 0;
            if (a >= VisionConfig.occlusionAlphaThreshold) {
                this.pendingFillPoints.push({ x: fx, y: fy });
            } else {
                // Reached back outside occluder; stop filling
                break;
            }
        }
        return hitDist;
    }
}


