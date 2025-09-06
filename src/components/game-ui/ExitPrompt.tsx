import React from 'react';
import styles from '../../styles/game-ui.module.css';
import { useGameState, useUIAnimations } from './hooks/useGameState';
import { useResponsiveUI } from './hooks/useResponsiveUI';

export const ExitPrompt: React.FC = () => {
  const { gameState, actions } = useGameState();
  const { isMobile } = useResponsiveUI();
  const { getTransition } = useUIAnimations();

  const handleConfirm = () => {
    actions.endHaul();
  };

  const handleCancel = () => {
    actions.setExitPrompt(false);
  };

  const modalStyle = {
    transition: getTransition('opacity', 250),
  };

  const contentStyle = {
    transition: getTransition('transform', 250),
    width: isMobile ? '90vw' : '400px',
    maxWidth: '90vw',
  };

  const buttonStyle = {
    transition: getTransition('all', 150),
  };

  return (
    <div className={styles.modalOverlay} style={modalStyle}>
      <div className={styles.modalContent} style={contentStyle}>
        <h2 className={styles.modalTitle}>END HAUL</h2>
        
        <div className={styles.modalText}>
          Are you sure you want to end this haul and return to base?
        </div>

        <div className={styles.modalText}>
          <strong>Current Haul: {gameState.score.toLocaleString()} SpaceBucks</strong><br />
          This will be added to your total.
        </div>
        
        <div className={styles.modalButtons}>
          <button
            className={`${styles.button} ${styles.helpButton}`}
            onClick={handleConfirm}
            style={{ 
              width: 'auto', 
              padding: '12px 24px',
              backgroundColor: 'rgba(0, 255, 0, 0.1)',
              ...buttonStyle
            }}
          >
            YES, END HAUL
          </button>
          
          <button
            className={`${styles.button} ${styles.exitButton}`}
            onClick={handleCancel}
            style={{ 
              width: 'auto', 
              padding: '12px 24px',
              backgroundColor: 'rgba(255, 51, 0, 0.1)',
              ...buttonStyle
            }}
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
};
