import { useRef, useState } from 'react';
import { PhaserGame } from './game/PhaserGame';
import { EventBus } from './game/EventBus';
import { MainMenu } from './components/MainMenu';
import { GameUI } from './components/GameUI';

function App() {
    // The sprite positions
    const [spritePosition, setSpritePosition] = useState({ x: 0, y: 0 });
    const phaserRef = useRef<any>();
    const [currentScene, setCurrentScene] = useState<string | null>(null);
    const [score, setScore] = useState(0);

    // Listen to the state change from Phaser event
    const currentSceneActive = (scene: Phaser.Scene) => {
        console.log('React received scene ready: ', scene.scene.key);
        setCurrentScene(scene.scene.key); // Store scene key

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
        switch (currentScene) {
            case 'MainMenuScene':
                // Optional: Render MainMenu React component if needed for complex UI
                // return <MainMenu />;
                return null; // Keep simple for now, Phaser scene handles menu
            case 'GameScene':
                return <GameUI score={score} />;
            case 'GameOverScene':
                // Phaser scene GameOverScene handles its own UI
                return null;
            default:
                return null; // Or a loading indicator
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
