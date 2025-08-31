import { useState, useEffect, useCallback } from 'react';
import { EventBus } from '../../../game/EventBus';

export interface GameUIState {
  score: number;
  totalSpaceBucks: number;
  showInstructions: boolean;
  showExitPrompt: boolean;
  showMinimap: boolean;
  isPaused: boolean;
  gameScene: Phaser.Scene | null;
  tetherActive: boolean;
  playerInExitZone: boolean;
}

export interface TouchControlState {
  joystickVisible: boolean;
  joystickPosition: { x: number; y: number };
  thrustActive: boolean;
  tetherActive: boolean;
}

// Game state management hook
export const useGameState = () => {
  const [gameState, setGameState] = useState<GameUIState>({
    score: 0,
    totalSpaceBucks: 0,
    showInstructions: false,
    showExitPrompt: false,
    showMinimap: false,
    isPaused: false,
    gameScene: null,
    tetherActive: false,
    playerInExitZone: false,
  });

  // Update score
  const updateScore = useCallback((newScore: number) => {
    setGameState(prev => ({ ...prev, score: newScore }));
  }, []);

  // Update total SpaceBucks
  const updateTotalSpaceBucks = useCallback((total: number) => {
    setGameState(prev => ({ ...prev, totalSpaceBucks: total }));
  }, []);

  // Toggle instructions panel
  const toggleInstructions = useCallback(() => {
    setGameState(prev => ({ ...prev, showInstructions: !prev.showInstructions }));
  }, []);

  // Show/hide exit prompt
  const setExitPrompt = useCallback((show: boolean) => {
    setGameState(prev => ({ ...prev, showExitPrompt: show }));
  }, []);

  // Toggle minimap
  const toggleMinimap = useCallback(() => {
    setGameState(prev => ({ ...prev, showMinimap: !prev.showMinimap }));
    
    // Notify Phaser scene about minimap toggle
    if (gameState.gameScene) {
      EventBus.emit('ui-minimap-toggle', !gameState.showMinimap);
    }
  }, [gameState.gameScene, gameState.showMinimap]);

  // Set pause state
  const setPaused = useCallback((paused: boolean) => {
    setGameState(prev => ({ ...prev, isPaused: paused }));
  }, []);

  // Set tether state
  const setTetherActive = useCallback((active: boolean) => {
    setGameState(prev => ({ ...prev, tetherActive: active }));
  }, []);

  // Set player exit zone state
  const setPlayerInExitZone = useCallback((inZone: boolean) => {
    setGameState(prev => ({ ...prev, playerInExitZone: inZone }));
  }, []);

  // End current haul
  const endHaul = useCallback(() => {
    if (gameState.gameScene) {
      EventBus.emit('ui-end-haul');
    }
  }, [gameState.gameScene]);

  // Tether control functions
  const toggleTether = useCallback(() => {
    if (gameState.gameScene) {
      EventBus.emit('ui-tether-toggle');
    }
  }, [gameState.gameScene]);

  // Thrust control functions
  const setThrust = useCallback((active: boolean, force?: number) => {
    if (gameState.gameScene) {
      EventBus.emit('ui-thrust-control', { active, force });
    }
  }, [gameState.gameScene]);

  // Rotation control
  const setRotation = useCallback((angle: number, strength: number = 1.0) => {
    if (gameState.gameScene) {
      EventBus.emit('ui-rotation-control', { angle, strength });
    }
  }, [gameState.gameScene]);

  useEffect(() => {
    // Listen for game events
    const handleScoreUpdate = (score: number) => {
      updateScore(score);
    };

    const handleSpaceBucksUpdate = (total: number) => {
      updateTotalSpaceBucks(total);
    };

    const handleSceneReady = (scene: Phaser.Scene) => {
      setGameState(prev => ({ ...prev, gameScene: scene }));
    };

    const handleTetherStateChange = (active: boolean) => {
      setTetherActive(active);
    };

    const handleExitZoneChange = (inZone: boolean) => {
      setPlayerInExitZone(inZone);
    };

    const handleMinimapStateChange = (visible: boolean) => {
      setGameState(prev => ({ ...prev, showMinimap: visible }));
    };

    const handlePauseStateChange = (paused: boolean) => {
      setPaused(paused);
    };

    // Register event listeners
    EventBus.on('score-updated', handleScoreUpdate);
    EventBus.on('spacebucks-updated', handleSpaceBucksUpdate);
    EventBus.on('current-scene-ready', handleSceneReady);
    EventBus.on('tether-state-changed', handleTetherStateChange);
    EventBus.on('player-exit-zone-changed', handleExitZoneChange);
    EventBus.on('minimap-state-changed', handleMinimapStateChange);
    EventBus.on('game-pause-changed', handlePauseStateChange);

    // Cleanup
    return () => {
      EventBus.removeListener('score-updated', handleScoreUpdate);
      EventBus.removeListener('spacebucks-updated', handleSpaceBucksUpdate);
      EventBus.removeListener('current-scene-ready', handleSceneReady);
      EventBus.removeListener('tether-state-changed', handleTetherStateChange);
      EventBus.removeListener('player-exit-zone-changed', handleExitZoneChange);
      EventBus.removeListener('minimap-state-changed', handleMinimapStateChange);
      EventBus.removeListener('game-pause-changed', handlePauseStateChange);
    };
  }, [updateScore, updateTotalSpaceBucks, setTetherActive, setPlayerInExitZone, setPaused]);

  return {
    gameState,
    actions: {
      updateScore,
      updateTotalSpaceBucks,
      toggleInstructions,
      setExitPrompt,
      toggleMinimap,
      setPaused,
      setTetherActive,
      setPlayerInExitZone,
      endHaul,
      toggleTether,
      setThrust,
      setRotation,
    },
  };
};

// Touch controls state management
export const useTouchControls = () => {
  const [touchState, setTouchState] = useState<TouchControlState>({
    joystickVisible: false,
    joystickPosition: { x: 0, y: 0 },
    thrustActive: false,
    tetherActive: false,
  });

  const { gameState, actions } = useGameState();

  // Show joystick at position
  const showJoystick = useCallback((x: number, y: number) => {
    setTouchState(prev => ({
      ...prev,
      joystickVisible: true,
      joystickPosition: { x, y },
    }));
  }, []);

  // Hide joystick
  const hideJoystick = useCallback(() => {
    setTouchState(prev => ({
      ...prev,
      joystickVisible: false,
    }));
  }, []);

  // Update joystick input
  const updateJoystick = useCallback((angle: number, distance: number) => {
    if (distance > 0.1) { // Dead zone
      actions.setRotation(angle, distance);
    }
  }, [actions]);

  // Handle thrust button
  const setThrustButton = useCallback((active: boolean, force?: number) => {
    setTouchState(prev => ({ ...prev, thrustActive: active }));
    actions.setThrust(active, force);
  }, [actions]);

  // Handle tether button
  const setTetherButton = useCallback((active: boolean) => {
    setTouchState(prev => ({ ...prev, tetherActive: active }));
    if (active) {
      actions.toggleTether();
    }
  }, [actions]);

  return {
    touchState,
    actions: {
      showJoystick,
      hideJoystick,
      updateJoystick,
      setThrustButton,
      setTetherButton,
    },
    gameState: gameState,
  };
};

// Utility hook for handling UI animations
export const useUIAnimations = () => {
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  const getAnimationDuration = useCallback((baseDuration: number) => {
    return prefersReducedMotion ? 0 : baseDuration;
  }, [prefersReducedMotion]);

  const getTransition = useCallback((property: string, duration: number = 250) => {
    const actualDuration = getAnimationDuration(duration);
    return actualDuration > 0 ? `${property} ${actualDuration}ms var(--ease-in-out)` : 'none';
  }, [getAnimationDuration]);

  return {
    prefersReducedMotion,
    getAnimationDuration,
    getTransition,
  };
};
