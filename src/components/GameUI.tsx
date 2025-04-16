import React from 'react';

// Placeholder for the In-Game UI React Component

interface GameUIProps {
    score: number;
    // Add other UI elements as needed (e.g., health, fuel, tether status)
}

export const GameUI: React.FC<GameUIProps> = ({ score }) => {
    console.log('React GameUI component rendered (placeholder)');
    // This component overlays the Phaser GameScene to display HUD elements
    return (
        <div style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            color: 'white',
            fontFamily: 'Arial, sans-serif',
            fontSize: '24px',
            textShadow: '1px 1px 2px black' // Make text more readable
        }}>
            <div>Score: {score}</div>
            {/* Add other HUD elements here later */}
            {/* <div>Health: 100%</div> */}
            {/* <div>Tether Status: Idle</div> */}
        </div>
    );
}; 