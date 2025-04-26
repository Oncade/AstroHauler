import React, { useState, useEffect } from 'react';

// Placeholder for the In-Game UI React Component

interface GameUIProps {
    score: number;
    totalSpaceBucks: number;
    // Add other UI elements as needed (e.g., health, fuel, tether status)
}

export const GameUI: React.FC<GameUIProps> = ({ score, totalSpaceBucks }) => {
    const [showHelp, setShowHelp] = useState(true);
    const [showInstructions, setShowInstructions] = useState(false);
    
    // Auto-hide the help message after 15 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowHelp(false);
        }, 15000);
        
        return () => clearTimeout(timer);
    }, []);
    
    console.log('React GameUI component rendered with score:', score, 'total:', totalSpaceBucks);
    
    return (
        <div>
            {/* Score and SpaceBucks Display */}
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
                <div>Current Haul: <span style={{ color: '#00ff00' }}>{score}</span></div>
                <div style={{ fontSize: '16px', marginTop: '5px' }}>
                    Total SpaceBucks: <span style={{ color: '#ffff00' }}>{totalSpaceBucks}</span>
                </div>
            </div>
            
            {/* Instructions Button */}
            <div 
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    color: '#00ff00',
                    padding: '5px 15px',
                    borderRadius: '5px',
                    fontFamily: 'Arial, sans-serif',
                    cursor: 'pointer',
                    border: '1px solid #00ff00',
                    fontSize: '16px'
                }}
                onClick={() => setShowInstructions(!showInstructions)}
            >
                {showInstructions ? 'Hide Instructions' : 'Show Instructions'}
            </div>
            
            {/* Detailed Instructions Panel */}
            {showInstructions && (
                <div style={{
                    position: 'absolute',
                    top: '50px',
                    right: '10px',
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    color: 'white',
                    padding: '15px',
                    borderRadius: '5px',
                    fontFamily: 'Arial, sans-serif',
                    maxWidth: '400px',
                    fontSize: '16px',
                    border: '1px solid #00ff00',
                    zIndex: 1000
                }}>
                    <h3 style={{ color: '#00ff00', marginTop: 0 }}>Game Instructions</h3>
                    
                    <h4 style={{ color: '#ffff00', marginBottom: '5px' }}>Controls:</h4>
                    <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
                        <li>W/Up - Thrust forward</li>
                        <li>A/D or Left/Right - Rotate ship</li>
                        <li>T - Tether/Release salvage</li>
                    </ul>
                    
                    <h4 style={{ color: '#ffff00', marginBottom: '5px' }}>How to Collect SpaceBucks:</h4>
                    <ol style={{ marginTop: '5px', paddingLeft: '20px' }}>
                        <li>Salvage is automatically collected when it enters the <span style={{ color: '#00ff00' }}>GREEN DEPOSIT ZONE</span></li>
                        <li>You can use <b>T</b> to tether salvage and drag it to the deposit zone</li>
                        <li><b>Move salvage directly into the center</b> of the deposit zone</li>
                        <li>Watch for the <span style={{ color: '#00ffff' }}>DEPOSIT SUCCESS!</span> message</li>
                    </ol>
                    
                    <h4 style={{ color: '#ffff00', marginBottom: '5px' }}>End Your Haul:</h4>
                    <ol style={{ marginTop: '5px', paddingLeft: '20px' }}>
                        <li>Fly into the <span style={{ color: '#ff5555' }}>RED EXIT ZONE</span> to complete your haul</li>
                        <li>Your SpaceBucks will be added to your total</li>
                        <li>Return to base to spend SpaceBucks on upgrades</li>
                    </ol>
                    
                    <div style={{ borderTop: '1px solid #444', marginTop: '10px', paddingTop: '10px' }}>
                        <p style={{ color: '#ff9900', margin: 0 }}>Tip: The deposit zone will turn yellow when salvage is ready to be deposited!</p>
                    </div>
                    
                    <button 
                        onClick={() => setShowInstructions(false)}
                        style={{
                            marginTop: '10px',
                            backgroundColor: '#333',
                            color: 'white',
                            border: 'none',
                            padding: '5px 10px',
                            borderRadius: '3px',
                            cursor: 'pointer'
                        }}
                    >
                        Close
                    </button>
                </div>
            )}
            
            {/* Initial Help Text */}
            {showHelp && (
                <div style={{
                    position: 'absolute',
                    top: '80px',
                    left: '10px',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: '#00ff00',
                    padding: '15px',
                    borderRadius: '5px',
                    fontFamily: 'Arial, sans-serif',
                    maxWidth: '300px',
                    fontSize: '16px',
                    border: '1px solid #00ff00',
                    boxShadow: '0 0 10px #00ff00'
                }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#ffff00' }}>HOW TO COLLECT SPACEBUCKS:</h3>
                    <ol style={{ margin: '0', paddingLeft: '20px' }}>
                        <li>Any space junk will be collected when it enters the deposit zone</li>
                        <li>Use 'T' to tether space junk and drag it to the GREEN DEPOSIT ZONE</li>
                        <li><b>Move salvage FULLY INTO</b> the deposit zone</li>
                        <li>Watch for "<span style={{ color: '#00ffff' }}>DEPOSIT SUCCESS!</span>"</li>
                    </ol>
                    <p style={{ marginTop: '10px', color: '#ff5555'}}>
                        End your haul by flying into the RED EXIT ZONE
                    </p>
                    <button 
                        onClick={() => setShowHelp(false)}
                        style={{
                            marginTop: '10px',
                            backgroundColor: '#333',
                            color: 'white',
                            border: 'none',
                            padding: '5px 10px',
                            borderRadius: '3px',
                            cursor: 'pointer'
                        }}
                    >
                        Got it!
                    </button>
                </div>
            )}
        </div>
    );
}; 