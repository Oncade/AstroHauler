import Phaser from 'phaser';
import Player from './Player';
import ParentShip from './ParentShip';
import Salvage from './Salvage';
import { ParentShipConfig, PlayerConfig } from '../config/GameConfig';

interface MinimapOptions {
    worldWidth: number;
    worldHeight: number;
    hasDebrisMap: boolean;
    isMobileDevice: boolean;
}

export default class Minimap {
    private scene: Phaser.Scene;
    private options: MinimapOptions;

    private container?: Phaser.GameObjects.Container;
    private dimBackground?: Phaser.GameObjects.Graphics;
    private panelBackground?: Phaser.GameObjects.Graphics;
    private salvageGraphics?: Phaser.GameObjects.Graphics;
    private playerMarker?: Phaser.GameObjects.Rectangle;
    private parentMarker?: Phaser.GameObjects.Ellipse;
    private parentMini?: Phaser.GameObjects.Image;
    private playerMini?: Phaser.GameObjects.Image;
    private updater?: Phaser.Time.TimerEvent;
    private depositGraphics?: Phaser.GameObjects.Graphics;
    private depositLabel?: Phaser.GameObjects.Text;

    private player?: Player;
    private parentShip?: ParentShip;
    private salvageGroup?: Phaser.Physics.Arcade.Group;

    private minimapScale: number = 1;
    private offsetX: number = 0;
    private offsetY: number = 0;
    private frameMargin: number = 24;
    private visible: boolean = false;

    constructor(scene: Phaser.Scene, options: MinimapOptions) {
        this.scene = scene;
        this.options = options;
    }

    start(player: Player, parentShip: ParentShip, salvageGroup: Phaser.Physics.Arcade.Group) {
        this.player = player;
        this.parentShip = parentShip;
        this.salvageGroup = salvageGroup;

        const { width: screenW, height: screenH } = this.scene.scale;

        // Fullscreen overlay container (top-left origin)
        this.container = this.scene.add.container(0, 0).setScrollFactor(0).setDepth(1100);

        // Dim the whole screen
        this.dimBackground = this.scene.add.graphics();
        this.dimBackground.fillStyle(0x000000, 0.6);
        this.dimBackground.fillRect(0, 0, screenW, screenH);
        this.container.add(this.dimBackground);

        // Panel frame for the map
        const frameX = this.frameMargin;
        const frameY = this.frameMargin;
        const frameW = screenW - this.frameMargin * 2;
        const frameH = screenH - this.frameMargin * 2;

        this.panelBackground = this.scene.add.graphics();
        this.panelBackground.fillStyle(0x0a0a10, 0.85);
        this.panelBackground.fillRoundedRect(frameX, frameY, frameW, frameH, 12);
        this.panelBackground.lineStyle(3, 0x00ffcc, 0.7);
        this.panelBackground.strokeRoundedRect(frameX, frameY, frameW, frameH, 12);
        this.container.add(this.panelBackground);

        // Scale to world to fit inside the frame
        const scaleX = frameW / this.options.worldWidth;
        const scaleY = frameH / this.options.worldHeight;
        this.minimapScale = Math.min(scaleX, scaleY);
        const mapDrawW = this.options.worldWidth * this.minimapScale;
        const mapDrawH = this.options.worldHeight * this.minimapScale;
        this.offsetX = Math.floor(frameX + (frameW - mapDrawW) / 2);
        this.offsetY = Math.floor(frameY + (frameH - mapDrawH) / 2);

        // Optional debris miniature as background
        if (this.options.hasDebrisMap) {
            const debrisMini = this.scene.add.image(this.offsetX, this.offsetY, 'debris_map')
                .setOrigin(0, 0);
            debrisMini.displayWidth = mapDrawW;
            debrisMini.displayHeight = mapDrawH;
            this.container.add(debrisMini);
        }

        // Markers
        // Optional tiny marker (kept as fallback); will be hidden when mini sprite is used
        this.parentMarker = this.scene.add.ellipse(0, 0, 8, 8, 0xffff00, 1);
        this.parentMarker.setStrokeStyle(1, 0x222222, 1).setVisible(false);
        this.playerMarker = this.scene.add.rectangle(0, 0, 6, 6, 0x00ff00, 1).setVisible(false);
        this.container.add([this.parentMarker, this.playerMarker]);

        // Miniature parent ship sprite, scaled to world size
        try {
            this.parentMini = this.scene.add.image(0, 0, ParentShipConfig.texture).setOrigin(0.5, 0.5);
            this.container.add(this.parentMini);
        } catch (e) {
            // Fallback to the ellipse marker if texture not available
            this.parentMarker?.setVisible(true);
        }

        // Miniature player ship sprite
        try {
            this.playerMini = this.scene.add.image(0, 0, PlayerConfig.textureKey).setOrigin(0.5, 0.5);
            this.container.add(this.playerMini);
        } catch (e) {
            // Fallback to rectangle marker if texture not available
            this.playerMarker?.setVisible(true);
        }

        // Salvage layer
        this.salvageGraphics = this.scene.add.graphics();
        this.container.add(this.salvageGraphics);

        // Deposit zone graphics and label
        this.depositGraphics = this.scene.add.graphics();
        this.container.add(this.depositGraphics);
        this.depositLabel = this.scene.add.text(0, 0, 'DEPOSIT', {
            fontFamily: 'Arial, sans-serif',
            fontSize: Math.max(12, Math.floor(screenH * 0.02)) + 'px',
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 3,
            fontStyle: 'bold'
        }).setOrigin(0.5, 0.5);
        this.container.add(this.depositLabel);

        // Initial draw + schedule updates
        this.update();
        this.updater = this.scene.time.addEvent({ delay: 200, loop: true, callback: this.update, callbackScope: this });

        // Start hidden
        this.hide();
    }

    update() {
        if (!this.container) return;

        if (this.parentShip) {
            const px = this.offsetX + this.parentShip.x * this.minimapScale;
            const py = this.offsetY + this.parentShip.y * this.minimapScale;
            if (this.parentMini) {
                // Scale miniature to ship display size
                const miniW = (this.parentShip.displayWidth || this.parentShip.width) * this.minimapScale;
                const miniH = (this.parentShip.displayHeight || this.parentShip.height) * this.minimapScale;
                this.parentMini.setPosition(px, py);
                this.parentMini.displayWidth = Math.max(6, miniW);
                this.parentMini.displayHeight = Math.max(6, miniH);
            } else if (this.parentMarker) {
                this.parentMarker.setPosition(px, py);
            }
        }

        if (this.player) {
            const sx = this.offsetX + this.player.x * this.minimapScale;
            const sy = this.offsetY + this.player.y * this.minimapScale;
            if (this.playerMini) {
                const miniW = (this.player.displayWidth || (this.player as any).width || 32) * this.minimapScale;
                const miniH = (this.player.displayHeight || (this.player as any).height || 32) * this.minimapScale;
                this.playerMini.setPosition(sx, sy);
                this.playerMini.displayWidth = Math.max(6, miniW);
                this.playerMini.displayHeight = Math.max(6, miniH);
                this.playerMini.setRotation((this.player as any).rotation || 0);
            } else if (this.playerMarker) {
                this.playerMarker.setPosition(sx, sy);
            }
        }

        if (this.salvageGraphics && this.salvageGroup) {
            this.salvageGraphics.clear();
            this.salvageGraphics.fillStyle(0xccccff, 1);
            this.salvageGroup.getChildren().forEach(child => {
                const salvage = child as Salvage;
                if (!salvage.active) return;
                const x = this.offsetX + salvage.x * this.minimapScale;
                const y = this.offsetY + salvage.y * this.minimapScale;
                this.salvageGraphics?.fillRect(x - 1, y - 1, 2, 2);
            });
        }

        // Draw deposit zone with correct size
        if (this.depositGraphics && this.parentShip) {
            const depositPos = (this.parentShip as ParentShip).getDepositZonePosition();
            const x = this.offsetX + depositPos.x * this.minimapScale;
            const y = this.offsetY + depositPos.y * this.minimapScale;
            const worldRadius = (ParentShipConfig.depositZoneRadius || 120) * (this.options.isMobileDevice ? 1.2 : 1.0);
            const r = worldRadius * this.minimapScale;
            this.depositGraphics.clear();
            this.depositGraphics.lineStyle(2, 0xffff00, 1);
            this.depositGraphics.strokeCircle(x, y, r);
            this.depositGraphics.fillStyle(0xffff00, 0.08);
            this.depositGraphics.fillCircle(x, y, r);
            if (this.depositLabel) {
                this.depositLabel.setPosition(x, y + r + 12);
            }
        }
    }

    destroy() {
        if (this.updater) {
            this.updater.remove(false);
            this.updater = undefined;
        }
        this.container?.destroy(true);
        this.container = undefined;
        this.dimBackground = undefined;
        this.panelBackground = undefined;
        this.salvageGraphics = undefined;
        this.playerMarker = undefined;
        this.parentMarker = undefined;
        if (this.parentMini) {
            this.parentMini.destroy();
            this.parentMini = undefined;
        }
        if (this.playerMini) {
            this.playerMini.destroy();
            this.playerMini = undefined;
        }
        this.depositGraphics = undefined;
        this.depositLabel?.destroy();
        this.depositLabel = undefined;
    }

    handleResize(isMobileDevice?: boolean) {
        if (typeof isMobileDevice === 'boolean') {
            this.options.isMobileDevice = isMobileDevice;
        }
        if (this.player && this.parentShip && this.salvageGroup) {
            // Rebuild the minimap with current screen size
            this.destroy();
            this.start(this.player, this.parentShip, this.salvageGroup);
        }
    }

    show() {
        if (this.container) {
            this.container.setVisible(true);
            this.visible = true;
        }
    }

    hide() {
        if (this.container) {
            this.container.setVisible(false);
            this.visible = false;
        }
    }

    toggle(): boolean {
        if (this.visible) {
            this.hide();
        } else {
            this.show();
        }
        return this.visible;
    }

    isVisible(): boolean {
        return this.visible;
    }
}


