import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Load assets needed for the PreloaderScene display
        this.load.image('bootBackground', 'assets/bg.png');
        this.load.image('bootLogo', 'assets/logo.png');
        this.load.image('AstroHaulerLogo', 'assets/AstroHaulerLogo.png');
        this.load.image('wanderers_white', 'assets/wanderers_white.png');
        // console.log('BootScene preload');

    }

    create() {
        console.log('BootScene create - Starting PreloaderScene');
        this.scene.start('PreloaderScene');
    }
} 