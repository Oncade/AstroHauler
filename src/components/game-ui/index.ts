// Game UI Components
export { GameHUD } from './GameHUD';
export { ScoreDisplay } from './ScoreDisplay';
export { GameButtons } from './GameButtons';
export { TouchControls } from './TouchControls';
export { InstructionsPanel } from './InstructionsPanel';
export { ExitPrompt } from './ExitPrompt';

// Hooks
export { useGameState, useTouchControls, useUIAnimations } from './hooks/useGameState';
export { useResponsiveUI, useResponsiveSize, useMediaQuery, usePrefersReducedMotion, usePrefersHighContrast } from './hooks/useResponsiveUI';

// Types
export type { GameUIState, TouchControlState } from './hooks/useGameState';
export type { ResponsiveUIState, DeviceType, ScreenOrientation } from './hooks/useResponsiveUI';
