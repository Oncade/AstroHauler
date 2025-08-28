import React from 'react';

// Responsive UI helper
const useResponsiveUI = () => {
    const isMobile = window.innerWidth < 768;
    const isPortrait = window.innerHeight > window.innerWidth;
    

    
    return { isMobile, isPortrait };
};

interface GameUIProps {
    score: number;
    totalSpaceBucks: number;
    // Add other UI elements as needed (e.g., health, fuel, tether status)
}

export const GameUI: React.FC<GameUIProps> = ({ score, totalSpaceBucks }) => {
    const { isMobile, isPortrait } = useResponsiveUI();
    

    
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