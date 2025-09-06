import Phaser from 'phaser';

export interface CameraZoomOptions {
    minZoom?: number;
    maxZoom?: number;
    initialZoom?: number;
    wheelSensitivity?: number; // Higher = faster zoom with wheel
    smoothFactor?: number;     // 0..1 per second smoothing; higher is snappier
}

/**
 * CameraController manages smooth zooming with mouse wheel and mobile pinch.
 * It keeps the zoom anchored around the pointer/pinch center and eases toward a target value.
 */
export default class CameraController {
    private scene: Phaser.Scene;
    private camera: Phaser.Cameras.Scene2D.Camera;
    private targetZoom: number;
    private minZoom: number;
    private maxZoom: number;
    private wheelSensitivity: number;
    private smoothFactor: number;

    // Pinch state
    private isPinching: boolean = false;
    private pinchPointerIds: number[] = [];
    private pinchStartDistance: number = 0;
    private pinchStartZoom: number = 1;

    constructor(scene: Phaser.Scene, camera: Phaser.Cameras.Scene2D.Camera, options?: CameraZoomOptions) {
        this.scene = scene;
        this.camera = camera;

        this.minZoom = options?.minZoom ?? 0.6;
        this.maxZoom = options?.maxZoom ?? 2.2;
        this.wheelSensitivity = options?.wheelSensitivity ?? 0.0015; // tuned for smooth feel
        this.smoothFactor = options?.smoothFactor ?? 8; // per-second lerp factor

        // Initialize target/current zoom
        const initialZoom = Phaser.Math.Clamp(options?.initialZoom ?? camera.zoom, this.minZoom, this.maxZoom);
        this.camera.setZoom(initialZoom);
        this.targetZoom = initialZoom;

        this.attachInputHandlers();
    }

    update(deltaMs: number) {
        // Smoothly approach target zoom using exponential decay toward target
        const dt = Math.max(0, deltaMs) / 1000;
        const t = 1 - Math.exp(-this.smoothFactor * dt);
        const newZoom = Phaser.Math.Linear(this.camera.zoom, this.targetZoom, t);
        this.camera.setZoom(newZoom);
    }

    destroy() {
        // Remove input listeners
        this.scene.input.off('wheel', this.onWheel as any);
        this.scene.input.off('pointerdown', this.onPointerDown as any);
        this.scene.input.off('pointerup', this.onPointerUp as any);
        this.scene.input.off('pointermove', this.onPointerMove as any);
        this.scene.input.off('pointercancel', this.onPointerUp as any);
    }

    private attachInputHandlers() {
        this.scene.input.on('wheel', this.onWheel);
        this.scene.input.on('pointerdown', this.onPointerDown);
        this.scene.input.on('pointerup', this.onPointerUp);
        this.scene.input.on('pointermove', this.onPointerMove);
        this.scene.input.on('pointercancel', this.onPointerUp);
    }

    private onWheel = (pointer: Phaser.Input.Pointer, _objects: any, _dx: number, dy: number) => {
        // dy > 0 => zoom out, dy < 0 => zoom in
        const zoomFactor = Math.exp(-dy * this.wheelSensitivity);
        const desired = Phaser.Math.Clamp(this.targetZoom * zoomFactor, this.minZoom, this.maxZoom);
        this.setTargetZoomAtScreenPoint(desired, { x: pointer.x, y: pointer.y });
    };

    private onPointerDown = (pointer: Phaser.Input.Pointer) => {
        // Track up to two pointers for pinch
        if (this.pinchPointerIds.length < 2) {
            this.pinchPointerIds.push(pointer.id);
        }
        if (this.pinchPointerIds.length === 2 && !this.isPinching) {
            this.beginPinch();
        }
    };

    private onPointerUp = (pointer: Phaser.Input.Pointer) => {
        const idx = this.pinchPointerIds.indexOf(pointer.id);
        if (idx !== -1) this.pinchPointerIds.splice(idx, 1);
        if (this.pinchPointerIds.length < 2) {
            this.isPinching = false;
        }
    };

    private onPointerMove = (_pointer: Phaser.Input.Pointer) => {
        if (!this.isPinching) return;
        const pointers = this.getActivePinchPointers();
        if (pointers.length < 2) return;

        const currentDistance = Phaser.Math.Distance.Between(pointers[0].x, pointers[0].y, pointers[1].x, pointers[1].y);
        if (this.pinchStartDistance <= 0) return;

        const ratio = Phaser.Math.Clamp(currentDistance / this.pinchStartDistance, 0.2, 5);
        const desired = Phaser.Math.Clamp(this.pinchStartZoom * ratio, this.minZoom, this.maxZoom);

        const center = { x: (pointers[0].x + pointers[1].x) / 2, y: (pointers[0].y + pointers[1].y) / 2 };
        this.setTargetZoomAtScreenPoint(desired, center);
    };

    private beginPinch() {
        const pointers = this.getActivePinchPointers();
        if (pointers.length < 2) return;
        this.isPinching = true;
        this.pinchStartDistance = Phaser.Math.Distance.Between(pointers[0].x, pointers[0].y, pointers[1].x, pointers[1].y);
        this.pinchStartZoom = this.targetZoom;
    }

    private getActivePinchPointers(): Phaser.Input.Pointer[] {
        const active: Phaser.Input.Pointer[] = [];
        for (const id of this.pinchPointerIds) {
            const p = this.scene.input.pointers.find(ptr => ptr.id === id);
            if (p && p.isDown) active.push(p);
        }
        return active;
    }

    private setTargetZoomAtScreenPoint(desiredZoom: number, _screenPoint: { x: number; y: number }) {
        // Simpler behavior: adjust zoom target only. Let camera follow handle scroll.
        // This avoids transient pointer-to-world drift during smoothing.
        this.targetZoom = desiredZoom;
    }
}


