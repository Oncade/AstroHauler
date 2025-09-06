import React from 'react';
import styles from '../styles/game-ui.module.css';
import { EventBus } from '../game/EventBus';

export const MainMenu: React.FC = () => {
    const handleStart = () => {
        EventBus.emit('ui-start-game');
    };

    return (
        <div 
            className={styles.mainMenuOverlay}
            style={{ backgroundImage: `url(/assets/bg.png)` }}
        >
            <div className={styles.brandRow}>
                <img className={styles.astroLogo} src="/assets/AstroHaulerLogo.png" alt="AstroHauler" />
            </div>

            <div className={styles.menuActions}>
                <button className={styles.button} onClick={handleStart}>Start Game</button>
            </div>

            <img className={styles.bottomLogo} src="/assets/logo.png" alt="Boot Logo" />
        </div>
    );
};