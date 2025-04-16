import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Optional: Load minimal assets needed for the PreloaderScene itself
        // console.log('BootScene preload');
    }

    create() {
        console.log('BootScene create - Starting PreloaderScene');
        this.scene.start('PreloaderScene');
    }
} 