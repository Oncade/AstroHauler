import React from 'react';
import styles from '../../styles/game-ui.module.css';
import { useGameState } from './hooks/useGameState';
import { useResponsiveUI } from './hooks/useResponsiveUI';
import { ScoreDisplay } from './ScoreDisplay';
import { GameButtons } from './GameButtons';
import { TouchControls } from './TouchControls';
import { InstructionsPanel } from './InstructionsPanel';
import { ExitPrompt } from './ExitPrompt';

export const GameHUD: React.FC = () => {
  const { gameState } = useGameState();
  const { deviceType, screenOrientation, isTouchDevice } = useResponsiveUI();

  return (
    <div 
      className={styles.gameHUD}
      data-device={deviceType}
      data-orientation={screenOrientation}
    >
      {/* Score Display */}
      <ScoreDisplay 
        score={gameState.score} 
        totalSpaceBucks={gameState.totalSpaceBucks} 
      />

      {/* Game Control Buttons */}
      <GameButtons />

      {/* Touch Controls (mobile only) */}
      {isTouchDevice && <TouchControls />}

      {/* Modal Overlays */}
      {gameState.showInstructions && <InstructionsPanel />}
      {gameState.showExitPrompt && <ExitPrompt />}
    </div>
  );
};
