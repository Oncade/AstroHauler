import React from 'react';
import styles from '../../styles/game-ui.module.css';
import { useUIAnimations } from './hooks/useGameState';

interface ScoreDisplayProps {
  score: number;
  totalSpaceBucks: number;
  className?: string;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  score,
  totalSpaceBucks,
  className = '',
}) => {
  const { getTransition } = useUIAnimations();

  return (
    <div 
      className={`${styles.scoreDisplay} ${styles.scoreArea} ${className}`}
      style={{
        transition: getTransition('transform', 200),
      }}
    >
      <div>
        Current Haul: <span className={styles.scoreValue}>{score.toLocaleString()}</span>
      </div>
      <div>
        SpaceBucks: <span className={styles.spaceBucksValue}>{totalSpaceBucks.toLocaleString()}</span>
      </div>
    </div>
  );
};
