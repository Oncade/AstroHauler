import React from 'react';

// Placeholder for the In-Game UI React Component

interface GameUIProps {
    score: number;
    // Add other UI elements as needed (e.g., health, fuel, tether status)
}

export const GameUI: React.FC<GameUIProps> = ({ score }) => {
    console.log('React GameUI component rendered with score:', score);
    // This component overlays the Phaser GameScene to display HUD elements
    return (
        <div style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '5px',
            fontFamily: 'Arial, sans-serif',
            fontSize: '24px'
        }}>
            Score: {score}
        </div>
    );
}; 