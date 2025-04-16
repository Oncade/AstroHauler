import { useRef, useState } from 'react';
import { PhaserGame } from './game/PhaserGame';
import { EventBus } from './game/EventBus';
import { GameOverScreen } from './components/GameOverScreen';
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

        // Example of listening for game events (score updates, game over)
        EventBus.on('update-score', (newScore: number) => {
            setScore(newScore);
        });
        EventBus.on('game-over', (finalScore: number) => {
            console.log('React received game-over event with score:', finalScore);
            setScore(finalScore); // Ensure score is updated for game over screen
            setCurrentScene('GameOverScene'); // Explicitly set state for React UI
        });

        // Clean up listeners when scene changes
        // Note: This cleanup might need refinement depending on event lifecycle
        scene.events.on('shutdown', () => {
            console.log(`React cleaning up listeners for ${scene.scene.key}`);
            EventBus.off('update-score');
            EventBus.off('game-over');
        });
    }

    const handleRestart = () => {
        console.log('React handleRestart');
        setCurrentScene(null); // Reset scene state
        setScore(0);
        // Tell Phaser to restart the game scene
        EventBus.emit('restart-game'); 
    };

    const handleMainMenu = () => {
        console.log('React handleMainMenu');
        setCurrentScene(null); // Reset scene state
        setScore(0);
        // Tell Phaser to go to the main menu scene
        EventBus.emit('go-to-main-menu');
    };

    // Render different React UI components based on the current Phaser scene key
    const renderUI = () => {
        switch (currentScene) {
            case 'MainMenuScene':
                return <MainMenu />;
            case 'GameScene':
                return <GameUI score={score} />;
            case 'GameOverScene':
                return <GameOverScreen score={score} onRestart={handleRestart} onMainMenu={handleMainMenu} />;
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
