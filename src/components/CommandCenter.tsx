import React, { useEffect, useMemo, useState } from 'react';
import styles from '../styles/game-ui.module.css';
import { EventBus } from '../game/EventBus';

type Upgrades = { thrusters: number; tether: number; hull: number };

interface CommandCenterState {
    totalSpaceBucks: number;
    upgrades: Upgrades;
    nextCosts: Upgrades;
    selectedShipId: string;
    shipIndex: number;
    shipCount: number;
    ship: { id: string; name: string; description: string; cost: number; owned: boolean };
    level: { name: string; salvageSpawnCount: number };
}

const planetVideos = ['/assets/video/Planet1991.mp4', '/assets/video/Planet4626.mp4', '/assets/video/Planet8631.mp4'];

export const CommandCenter: React.FC = () => {
    const [state, setState] = useState<CommandCenterState | null>(null);

    useEffect(() => {
        const onState = (s: CommandCenterState) => setState(s);
        EventBus.on('commandcenter-state-changed', onState);
        // Request initial state
        EventBus.emit('ui-command-request-state');
        return () => {
            EventBus.off('commandcenter-state-changed', onState);
        };
    }, []);

    const videoSrc = useMemo(() => planetVideos[Math.floor(Math.random() * planetVideos.length)], []);

    const startHaul = () => EventBus.emit('ui-command-start-haul');
    const returnToMenu = () => EventBus.emit('ui-command-return');
    const upgrade = (key: 'thrusters'|'tether'|'hull') => EventBus.emit('ui-command-upgrade', { key });
    const prevShip = () => EventBus.emit('ui-command-ship-prev');
    const nextShip = () => EventBus.emit('ui-command-ship-next');
    const selectShip = () => EventBus.emit('ui-command-ship-select');

    if (!state) return null;

    const canAfford = {
        thrusters: state.totalSpaceBucks >= state.nextCosts.thrusters,
        tether: state.totalSpaceBucks >= state.nextCosts.tether,
        hull: state.totalSpaceBucks >= state.nextCosts.hull,
    };

    return (
        <div className={styles.commandCenterOverlay}>
            <div className={styles.ccLayout}>
                <header className={styles.ccHeader}>
                    <div className={styles.ccTitle}>Command Center</div>
                    <div className={styles.ccBucksBadge} aria-live="polite">
                        SpaceBucks: <span className={styles.ccBucksValue}>{state.totalSpaceBucks}</span>
                    </div>
                </header>

                <section className={`${styles.ccCard} ${styles.ccShipPanel}`} aria-labelledby="cc-ship-title">
                    <div id="cc-ship-title" className={styles.ccSectionTitle}>Ship</div>
                    <img className={styles.ccShipArt} src="/assets/images/ship.png" alt="Selected ship" />
                    <div className={styles.ccShipStats}>
                        <div className={styles.ccStatRow}><span>Selected</span><span>{state.selectedShipId.toUpperCase()}</span></div>
                        <div className={styles.ccStatRow}><span>Thrusters</span><span>Lv.{state.upgrades.thrusters}</span></div>
                        <div className={styles.ccStatRow}><span>Tether Stability</span><span>Lv.{state.upgrades.tether}</span></div>
                        <div className={styles.ccStatRow}><span>Hull</span><span>Lv.{state.upgrades.hull}</span></div>
                    </div>
                    <div className={styles.ccShipCarousel}>
                        <button className={`${styles.button} ${styles.ccShipNavBtn}`} onClick={prevShip} aria-label="Previous ship">&#8249;</button>
                        <div className={styles.ccShipSummary}>
                            <div className={styles.ccShipName}>{state.ship.name}</div>
                            <div className={styles.ccShipDesc}>{state.ship.description}</div>
                            <div className={styles.ccShipCost}>{state.ship.owned ? 'Owned' : `Cost: ${state.ship.cost}`}</div>
                        </div>
                        <button className={`${styles.button} ${styles.ccShipNavBtn}`} onClick={nextShip} aria-label="Next ship">&#8250;</button>
                    </div>
                    <button className={`${styles.button} ${styles.ccPrimary} ${styles.ccFullButton}`} onClick={selectShip}>
                        {state.ship.owned ? 'Select Ship' : 'Buy & Select'}
                    </button>
                </section>

                <section className={`${styles.ccCard} ${styles.ccViewportPanel}`} aria-labelledby="cc-viewport-title">
                    <div id="cc-viewport-title" className={styles.ccSectionTitle}>Operations</div>
                    <div className={styles.ccViewportFrame}>
                        <video className={styles.ccViewportVideo} src={videoSrc} autoPlay loop muted playsInline />
                    </div>
                    <div className={styles.ccMissionBody}>
                        <div className={styles.ccMissionRow}><span>Sector</span><span>{state.level.name}</span></div>
                        <div className={styles.ccMissionRow}><span>Objective</span><span>Salvage Collection</span></div>
                        <div className={styles.ccMissionRow}><span>Threat Level</span><span>Rising</span></div>
                        <div className={styles.ccMissionRow}><span>Est. Salvage</span><span>{state.level.salvageSpawnCount}</span></div>
                    </div>
                    <div className={styles.ccActions}>
                        <button className={`${styles.button} ${styles.ccActionStart} ${styles.ccFullButton}`} onClick={startHaul}>Start Haul</button>
                        <button className={`${styles.button} ${styles.ccActionReturn} ${styles.ccFullButton}`} onClick={returnToMenu}>Return to Base</button>
                    </div>
                </section>

                <section className={`${styles.ccCard} ${styles.ccUpgradesPanel}`} aria-labelledby="cc-upgrades-title">
                    <div id="cc-upgrades-title" className={styles.ccSectionTitle}>Upgrades</div>
                    <div className={styles.ccUpgradeList}>
                        <button
                            className={`${styles.button} ${styles.ccUpgradeBtn}`}
                            onClick={() => upgrade('thrusters')}
                            disabled={!canAfford.thrusters}
                        >
                            Upgrade Thrusters (Lv.{state.upgrades.thrusters + 1}) − {state.nextCosts.thrusters}
                        </button>
                        <button
                            className={`${styles.button} ${styles.ccUpgradeBtn}`}
                            onClick={() => upgrade('tether')}
                            disabled={!canAfford.tether}
                        >
                            Upgrade Tether (Lv.{state.upgrades.tether + 1}) − {state.nextCosts.tether}
                        </button>
                        <button
                            className={`${styles.button} ${styles.ccUpgradeBtn}`}
                            onClick={() => upgrade('hull')}
                            disabled={!canAfford.hull}
                        >
                            Upgrade Hull (Lv.{state.upgrades.hull + 1}) − {state.nextCosts.hull}
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};