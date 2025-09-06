import React from 'react';
import styles from '../../styles/game-ui.module.css';
import { useGameState, useUIAnimations } from './hooks/useGameState';
import { useResponsiveUI } from './hooks/useResponsiveUI';

interface GameButtonsProps {
  className?: string;
}

export const GameButtons: React.FC<GameButtonsProps> = ({ className = '' }) => {
  const { gameState, actions } = useGameState();
  const { isMobile } = useResponsiveUI();
  const { getTransition } = useUIAnimations();

  const handleExitClick = () => {
    actions.endHaul();
  };

  const handleHelpClick = () => {
    actions.toggleInstructions();
  };

  const buttonStyle = {
    transition: getTransition('all', 150),
  };

  return (
    <div className={`${styles.buttonGroup} ${styles.buttonsArea} ${className}`}>
      {/* Exit Button */}
      <button
        className={`${styles.button} ${styles.exitButton}`}
        onClick={handleExitClick}
        style={buttonStyle}
        aria-label="End haul and return to base"
        title="End Haul"
      >
        EXIT
      </button>

      {/* Help Button */}
      <button
        className={`${styles.button} ${styles.helpButton}`}
        onClick={handleHelpClick}
        style={buttonStyle}
        aria-label={gameState.showInstructions ? 'Hide instructions' : 'Show instructions'}
        title="Toggle Help"
      >
        HELP
      </button>

    </div>
  );
};
