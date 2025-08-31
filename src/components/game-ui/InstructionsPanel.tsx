import React from 'react';
import styles from '../../styles/game-ui.module.css';
import { useGameState, useUIAnimations } from './hooks/useGameState';
import { useResponsiveUI } from './hooks/useResponsiveUI';

export const InstructionsPanel: React.FC = () => {
  const { actions } = useGameState();
  const { isMobile, isTablet } = useResponsiveUI();
  const { getTransition } = useUIAnimations();

  const handleClose = () => {
    actions.toggleInstructions();
  };

  const controlsText = isMobile 
    ? 'TOUCH CONTROLS:\n• Hold thrust button (🚀) to move\n• Touch and drag to rotate ship\n• Tap tether button (⚓) to grab salvage'
    : 'KEYBOARD CONTROLS:\n• W/Up Arrow - Thrust forward\n• A/D or Left/Right Arrow - Rotate\n• Spacebar - Tether/Release salvage\n\nMOUSE CONTROLS:\n• Left Click - Thrust\n• Right Click - Tether\n• Move mouse to aim';

  const modalStyle = {
    transition: getTransition('opacity', 250),
  };

  const contentStyle = {
    transition: getTransition('transform', 250),
    width: isMobile ? '90vw' : isTablet ? '70vw' : '50vw',
    maxWidth: '600px',
  };

  return (
    <div className={styles.modalOverlay} style={modalStyle}>
      <div className={styles.modalContent} style={contentStyle}>
        <h2 className={styles.modalTitle}>GAME INSTRUCTIONS</h2>
        
        <div className={styles.modalText}>
          <pre style={{ whiteSpace: 'pre-line', fontFamily: 'inherit' }}>
            {controlsText}
          </pre>
        </div>
        
        <div className={styles.modalText}>
          <strong>HOW TO COLLECT SPACEBUCKS:</strong><br />
          • Salvage auto-collects when in the DEPOSIT ZONE<br />
          • Use tether to drag salvage pieces<br />
          • Move salvage into the deposit zone near your ship<br />
          • Watch for "DEPOSIT SUCCESS!" confirmation<br />
        </div>
        
        <div className={styles.modalText}>
          <strong>END YOUR HAUL:</strong><br />
          • Fly into the RED EXIT ZONE when ready<br />
          • Your SpaceBucks are automatically saved<br />
          • Return to base to purchase upgrades<br />
        </div>

        <div className={styles.modalText}>
          <strong>TIPS:</strong><br />
          • Use the minimap (MAP button) to navigate<br />
          • Larger salvage pieces are worth more SpaceBucks<br />
          • Plan your route to collect efficiently<br />
          • Watch your momentum - space physics apply!<br />
        </div>
        
        <div className={styles.modalButtons}>
          <button
            className={`${styles.button} ${styles.helpButton}`}
            onClick={handleClose}
            style={{ 
              width: 'auto', 
              padding: '12px 24px',
              ...{ transition: getTransition('all', 150) }
            }}
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
