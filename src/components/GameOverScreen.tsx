import React from 'react';

interface GameOverScreenProps {
    score: number;
    onRestart: () => void;
    onMainMenu: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, onRestart, onMainMenu }) => {
    console.log('React GameOverScreen component rendered (placeholder)');
    return (
        <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            fontFamily: 'Arial, sans-serif'
        }}>
            <h1>Game Over</h1>
            <h2>Final Score: {score}</h2>
            <button onClick={onRestart} style={{ padding: '10px 20px', fontSize: '18px', margin: '10px', cursor: 'pointer' }}>
                Restart
            </button>
            <button onClick={onMainMenu} style={{ padding: '10px 20px', fontSize: '18px', margin: '10px', cursor: 'pointer' }}>
                Main Menu
            </button>
        </div>
    );
}; 