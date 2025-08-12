import React, { useState, useEffect } from 'react';

// Responsive UI helper
const useResponsiveUI = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);
    
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            setIsPortrait(window.innerHeight > window.innerWidth);
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    return { isMobile, isPortrait };
};

interface GameUIProps {
    score: number;
    totalSpaceBucks: number;
    // Add other UI elements as needed (e.g., health, fuel, tether status)
}

export const GameUI: React.FC<GameUIProps> = ({ score, totalSpaceBucks }) => {
    const [showHelp, setShowHelp] = useState(true);
    const [showInstructions, setShowInstructions] = useState(false);
    const { isMobile, isPortrait } = useResponsiveUI();
    
    // Auto-hide the help message after 15 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowHelp(false);
        }, 15000);
        
        return () => clearTimeout(timer);
    }, []);
    
    console.log('React GameUI component rendered with score:', score, 'total:', totalSpaceBucks);
    console.log('UI Responsive state:', { isMobile, isPortrait });
    
    // Responsive styles based on device
    const scoreContainerStyle = {
        position: 'absolute' as 'absolute',
        top: '10px',
        left: '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: isMobile ? '5px 10px' : '10px 20px',
        borderRadius: '5px',
        fontFamily: 'Arial, sans-serif',
        fontSize: isMobile ? '18px' : '24px',
        zIndex: 100,
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)'
    };
    
    const instructionsButtonStyle = {
        position: 'absolute' as 'absolute',
        top: '10px',
        right: '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: '#00ff00',
        padding: isMobile ? '8px 15px' : '5px 15px',
        borderRadius: '5px',
        fontFamily: 'Arial, sans-serif',
        cursor: 'pointer',
        border: '1px solid #00ff00',
        fontSize: isMobile ? '16px' : '16px',
        zIndex: 100,
        boxShadow: '0 0 8px rgba(0, 255, 0, 0.3)'
    };
    
    const instructionsPanelStyle = {
        position: 'absolute' as 'absolute',
        top: isMobile ? '55px' : '50px',
        right: '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        padding: '15px',
        borderRadius: '5px',
        fontFamily: 'Arial, sans-serif',
        maxWidth: isMobile && isPortrait ? '80%' : '400px',
        width: isMobile && isPortrait ? 'calc(100% - 40px)' : 'auto',
        fontSize: isMobile ? '14px' : '16px',
        border: '1px solid #00ff00',
        zIndex: 1000,
        boxShadow: '0 0 15px rgba(0, 0, 0, 0.7)'
    };
    
    const helpContainerStyle = {
        position: 'absolute' as 'absolute',
        top: isMobile && isPortrait ? '50px' : '80px',
        left: '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: '#00ff00',
        padding: isMobile ? '10px' : '15px',
        borderRadius: '5px',
        fontFamily: 'Arial, sans-serif',
        maxWidth: isMobile && isPortrait ? '80%' : '300px',
        width: isMobile && isPortrait ? 'calc(100% - 40px)' : 'auto',
        fontSize: isMobile ? '14px' : '16px',
        border: '1px solid #00ff00',
        boxShadow: '0 0 10px #00ff00',
        zIndex: 100
    };

    // Mobile orientation warning style (improved visibility)
    const orientationWarningStyle = {
        position: 'absolute' as 'absolute',
        bottom: '60px',  // Move up to avoid touch controls
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        color: '#ffff00',
        padding: '12px 15px',
        borderRadius: '8px',
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center' as 'center',
        maxWidth: '80%',
        fontSize: '14px',
        border: '2px solid #ffff00',
        zIndex: 120,
        boxShadow: '0 0 20px rgba(255, 255, 0, 0.4)'
    };
    
    // Avoid UI elements overlapping with touch controls on mobile
    if (isMobile) {
        // Check if in portrait mode and adjust positions
        if (isPortrait) {
            // Move score display down slightly in portrait mode
            scoreContainerStyle.top = '50px';
        } else {
            // In landscape mode, make sure score doesn't interfere with joystick
            scoreContainerStyle.top = '10px';
            scoreContainerStyle.left = '80px'; // Move right to avoid joystick area
        }
    }
    
    return (
        <div>
            {/* Score and SpaceBucks Display */}
            <div style={scoreContainerStyle}>
                <div>Current Haul: <span style={{ color: '#00ff00' }}>{score}</span></div>
                <div style={{ fontSize: isMobile ? '14px' : '16px', marginTop: '5px' }}>
                    Total SpaceBucks: <span style={{ color: '#ffff00' }}>{totalSpaceBucks}</span>
                </div>
            </div>
            
            {/* Instructions Button */}
            <div 
                style={instructionsButtonStyle}
                onClick={() => setShowInstructions(!showInstructions)}
            >
                {showInstructions ? 'Hide' : 'Help'}
            </div>
            
            {/* Detailed Instructions Panel */}
            {showInstructions && (
                <div style={instructionsPanelStyle}>
                    <h3 style={{ color: '#00ff00', marginTop: 0, fontSize: isMobile ? '16px' : '18px' }}>Game Instructions</h3>
                    
                    <h4 style={{ color: '#ffff00', marginBottom: '5px', fontSize: isMobile ? '14px' : '16px' }}>Controls:</h4>
                    <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
                        <li>{isMobile ? 'Hold the thrust button to move' : 'W/Up - Thrust forward'}</li>
                        <li>{isMobile ? 'Use the joystick to rotate' : 'A/D or Left/Right - Rotate ship'}</li>
                        <li>{isMobile ? 'Tap the tether button to tether/release' : 'Space - Tether/Release salvage'}</li>
                    </ul>
                    
                    <h4 style={{ color: '#ffff00', marginBottom: '5px', fontSize: isMobile ? '14px' : '16px' }}>How to Collect SpaceBucks:</h4>
                    <ol style={{ marginTop: '5px', paddingLeft: '20px' }}>
                        <li>Salvage is automatically collected when it enters the <span style={{ color: '#00ff00' }}>GREEN DEPOSIT ZONE</span></li>
                        <li>You can {isMobile ? 'use the tether button' : 'press Space'} to tether salvage and drag it to the deposit zone</li>
                        <li><b>Move salvage directly into the center</b> of the deposit zone</li>
                        <li>Watch for the <span style={{ color: '#00ffff' }}>DEPOSIT SUCCESS!</span> message</li>
                    </ol>
                    
                    <h4 style={{ color: '#ffff00', marginBottom: '5px', fontSize: isMobile ? '14px' : '16px' }}>End Your Haul:</h4>
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
                <div style={helpContainerStyle}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#ffff00', fontSize: isMobile ? '16px' : '18px' }}>HOW TO COLLECT SPACEBUCKS:</h3>
                    <ol style={{ margin: '0', paddingLeft: '20px' }}>
                        <li>Any space junk will be collected when it enters the deposit zone</li>
                        <li>{isMobile ? 'Use the tether button' : 'Press Space'} to tether space junk and drag it to the GREEN DEPOSIT ZONE</li>
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

            {/* Mobile Orientation Warning (shown only in mobile portrait mode) */}
            {isMobile && isPortrait && (
                <div style={orientationWarningStyle}>
                    <p style={{ margin: '0' }}>
                        <span style={{ fontSize: '16px' }}>📱 Rotate your device!</span><br />
                        For a better game experience, use landscape orientation.
                    </p>
                </div>
            )}
        </div>
    );
}; 