import { useRef, useState, useEffect } from 'react';
import { PhaserGame } from './game/PhaserGame';
import { EventBus } from './game/EventBus';
import { MainMenu } from './components/MainMenu';
import { CommandCenter } from './components/CommandCenter';
import { GameUI } from './components/GameUI';
import { GameOverScreen } from './components/GameOverScreen';

function App() {
    // Game state
    const phaserRef = useRef<any>();
    const [currentScene, setCurrentScene] = useState<string | null>(null);
    const [score, setScore] = useState(0);
    const [totalSpaceBucks, setTotalSpaceBucks] = useState(0);

    // Load total SpaceBucks on component mount
    useEffect(() => {
        const savedBucks = localStorage.getItem('totalSpaceBucks');
        if (savedBucks) {
            setTotalSpaceBucks(parseInt(savedBucks, 10));
        }
    }, []);

    // Listen to the state change from Phaser event
    const currentSceneActive = (scene: Phaser.Scene) => {
        console.log('React received scene ready: ', scene.scene.key);
        
        // Update current scene state
        setCurrentScene(scene.scene.key);

        // Handle scene-specific setup
        if (scene.scene.key === 'GameOverScene') {
            // Get final score and total SpaceBucks from the game over scene
            const scoreData = scene.registry.get('score') || 0;
            const buckData = scene.registry.get('totalSpaceBucks') || 0;
            setTotalSpaceBucks(buckData); // Update total SpaceBucks with latest value
            console.log(`GameOverScene data: score=${scoreData}, totalBucks=${buckData}`);
        }

        // Listener for score updates from Phaser
        const scoreUpdateListener = (newScore: number) => {
            setScore(newScore);
        };
        EventBus.on('score-updated', scoreUpdateListener);

        // Clean up listeners when scene changes
        scene.events.on('shutdown', () => {
            console.log(`React cleaning up listeners for ${scene.scene.key}`);
            EventBus.off('score-updated', scoreUpdateListener);
        });
    }

    // Render different React UI components based on the current Phaser scene key
    const renderUI = () => {
        console.log(`Rendering UI for scene: ${currentScene}`);
        
        switch (currentScene) {
            case 'MainMenuScene':
                return <MainMenu />;
            case 'CommandCenterScene':
                return <CommandCenter />;
            case 'GameScene':
                return <GameUI score={score} totalSpaceBucks={totalSpaceBucks} />;
            case 'GameOverScene':
                // Important: Return empty component to avoid duplication
                return <GameOverScreen />;
            default:
                return null;
        }
    }

    return (
        <div id="app">
            <PhaserGame ref={phaserRef} currentActiveScene={currentSceneActive} />
            <div>
                {renderUI()}
                {/* Original template example text - can be removed */}
                {/* <div>
                    <p>Sprite Position:</p>
                    <pre>{`{
  x: ${spritePosition.x}
  y: ${spritePosition.y}
}`}</pre>
                </div> */}
            </div>
        </div>
    )
}

export default App
