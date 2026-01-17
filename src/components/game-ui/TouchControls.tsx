import React, { useRef, useEffect, useCallback, useState } from 'react';
import styles from '../../styles/game-ui.module.css';
import { useTouchControls, useUIAnimations } from './hooks/useGameState';
import { useResponsiveUI } from './hooks/useResponsiveUI';

interface JoystickState {
  active: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  angle: number;
  distance: number;
}

export const TouchControls: React.FC = () => {
  const { touchState, actions, gameState } = useTouchControls();
  const { isTouchDevice } = useResponsiveUI();
  const { getTransition } = useUIAnimations();
  
  const joystickRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const directionRef = useRef<HTMLDivElement>(null);
  const joystickTouchIdRef = useRef<number | null>(null);
  const joystickActiveRef = useRef(false);
  const joystickStartRef = useRef({ x: 0, y: 0 });
  
  const [joystick, setJoystick] = useState<JoystickState>({
    active: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    angle: 0,
    distance: 0,
  });

  const [thrustForce, setThrustForce] = useState(0);
  const thrustTweenRef = useRef<number | null>(null);

  // Constants
  const JOYSTICK_RADIUS = 40; // Half of joystick size
  const MAX_DISTANCE = 30; // Maximum inner joystick movement
  const DEAD_ZONE = 5; // Minimum movement before registering input

  // Calculate joystick values
  const calculateJoystick = useCallback((clientX: number, clientY: number, startX: number, startY: number) => {
    const deltaX = clientX - startX;
    const deltaY = clientY - startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const angle = Math.atan2(deltaY, deltaX);
    
    // Limit distance to max radius
    const limitedDistance = Math.min(distance, MAX_DISTANCE);
    const normalizedDistance = limitedDistance / MAX_DISTANCE;
    
    return {
      angle,
      distance: limitedDistance,
      normalizedDistance,
      deltaX: Math.cos(angle) * limitedDistance,
      deltaY: Math.sin(angle) * limitedDistance,
    };
  }, []);

  // Handle joystick touch start
  const handleJoystickStart = useCallback((clientX: number, clientY: number, touchId?: number) => {
    // Show joystick at touch position
    actions.showJoystick(clientX, clientY);
    joystickActiveRef.current = true;
    joystickTouchIdRef.current = typeof touchId === 'number' ? touchId : null;
    joystickStartRef.current = { x: clientX, y: clientY };
    
    setJoystick(prev => ({
      ...prev,
      active: true,
      startX: clientX,
      startY: clientY,
      currentX: clientX,
      currentY: clientY,
    }));
  }, [actions]);

  // Handle joystick movement
  const handleJoystickMove = useCallback((clientX: number, clientY: number) => {
    if (!joystickActiveRef.current || !innerRef.current || !directionRef.current) return;

    const { angle, distance, normalizedDistance, deltaX, deltaY } = calculateJoystick(
      clientX, 
      clientY, 
      joystickStartRef.current.x, 
      joystickStartRef.current.y
    );

    // Update inner joystick position
    innerRef.current.style.transform = `translate(-50%, -50%) translate(${deltaX}px, ${deltaY}px)`;
    
    // Update direction indicator
    if (distance > DEAD_ZONE) {
      const angleDegrees = (angle * 180 / Math.PI) + 90; // Convert to degrees and adjust for CSS rotation
      directionRef.current.style.transform = `translate(-50%, -100%) rotate(${angleDegrees}deg)`;
      directionRef.current.style.opacity = '0.7';
      
      // Send rotation input to game
      actions.updateJoystick(angle + Math.PI / 2, normalizedDistance); // Adjust angle for game coordinates
    } else {
      directionRef.current.style.opacity = '0';
      actions.updateJoystick(angle + Math.PI / 2, 0);
    }

    setJoystick(prev => ({
      ...prev,
      currentX: clientX,
      currentY: clientY,
      angle,
      distance,
    }));
  }, [calculateJoystick, actions]);

  // Handle joystick end
  const handleJoystickEnd = useCallback(() => {
    if (!innerRef.current || !directionRef.current) return;

    // Reset joystick position
    innerRef.current.style.transform = 'translate(-50%, -50%)';
    directionRef.current.style.opacity = '0';
    
    actions.hideJoystick();
    actions.updateJoystick(joystick.angle + Math.PI / 2, 0);
    joystickActiveRef.current = false;
    joystickTouchIdRef.current = null;
    
    setJoystick(prev => ({
      ...prev,
      active: false,
      currentX: prev.startX,
      currentY: prev.startY,
      angle: 0,
      distance: 0,
    }));
  }, [actions, joystick.angle]);

  // Handle thrust button press
  const handleThrustStart = useCallback((event?: React.TouchEvent | React.MouseEvent) => {
    event?.preventDefault();
    event?.stopPropagation();
    actions.setThrustButton(true);
    
    // Gradual thrust increase
    setThrustForce(20); // Initial force
    
    if (thrustTweenRef.current) {
      cancelAnimationFrame(thrustTweenRef.current);
    }
    
    const startTime = performance.now();
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / 1500, 1); // 1.5 seconds to full thrust
      const newForce = 20 + (100 - 20) * progress; // From 20 to 100
      
      setThrustForce(newForce);
      actions.setThrustButton(true, newForce);
      
      if (progress < 1) {
        thrustTweenRef.current = requestAnimationFrame(animate);
      }
    };
    
    thrustTweenRef.current = requestAnimationFrame(animate);
  }, [actions]);

  // Handle thrust button release
  const handleThrustEnd = useCallback((event?: React.TouchEvent | React.MouseEvent) => {
    event?.preventDefault();
    event?.stopPropagation();
    if (thrustTweenRef.current) {
      cancelAnimationFrame(thrustTweenRef.current);
      thrustTweenRef.current = null;
    }
    
    setThrustForce(0);
    actions.setThrustButton(false);
  }, [actions]);

  // Handle tether button
  const handleTetherClick = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    actions.setTetherButton(true);
  }, [actions]);

  // Touch event handlers
  useEffect(() => {
    if (!isTouchDevice) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (joystickActiveRef.current) return;

      const touches = Array.from(e.changedTouches);
      const buttonSafeZone = 100;
      const rightEdge = window.innerWidth - buttonSafeZone;
      const bottomEdge = window.innerHeight - buttonSafeZone;

      const touchToUse = touches.find((touch) => {
        const element = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement | null;
        if (element?.closest(`.${styles.touchButton}`)) {
          return false;
        }

        if (element?.closest(`.${styles.touchControlsRight}`)) {
          return false;
        }

        return touch.clientX < rightEdge && touch.clientY < bottomEdge;
      });

      if (touchToUse) {
        e.preventDefault();
        handleJoystickStart(touchToUse.clientX, touchToUse.clientY, touchToUse.identifier);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!joystickActiveRef.current) return;

      const activeTouch = Array.from(e.touches).find(
        (touch) => touch.identifier === joystickTouchIdRef.current
      );

      if (!activeTouch) return;
      
      e.preventDefault();
      handleJoystickMove(activeTouch.clientX, activeTouch.clientY);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!joystickActiveRef.current) return;

      const ended = Array.from(e.changedTouches).some(
        (touch) => touch.identifier === joystickTouchIdRef.current
      );

      if (!ended) return;

      e.preventDefault();
      handleJoystickEnd();
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
    document.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [isTouchDevice, handleJoystickStart, handleJoystickMove, handleJoystickEnd]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (thrustTweenRef.current) {
        cancelAnimationFrame(thrustTweenRef.current);
      }
    };
  }, []);

  if (!isTouchDevice) {
    return null;
  }

  const transitionStyle = {
    transition: getTransition('all', 150),
  };

  return (
    <>
      {/* Virtual Joystick */}
      <div 
        className={`${styles.joystickContainer} ${touchState.joystickVisible ? styles.visible : ''} ${styles.touchControlsLeft}`}
        ref={joystickRef}
        style={{
          position: 'fixed',
          left: `${touchState.joystickPosition.x - 40}px`,
          top: `${touchState.joystickPosition.y - 40}px`,
          ...transitionStyle,
        }}
      >
        <div className={styles.joystickOuter}>
          <div 
            className={styles.joystickInner}
            ref={innerRef}
          />
          <div 
            className={styles.directionIndicator}
            ref={directionRef}
          />
        </div>
      </div>

      {/* Touch Control Buttons */}
      <div className={styles.touchControlsRight}>
        {/* Thrust Button */}
        <button
          className={`${styles.touchButton} ${styles.thrustButton} ${touchState.thrustActive ? styles.active : ''}`}
          onTouchStart={handleThrustStart}
          onTouchEnd={handleThrustEnd}
          onMouseDown={handleThrustStart}
          onMouseUp={handleThrustEnd}
          onMouseLeave={handleThrustEnd}
          style={transitionStyle}
          aria-label="Thrust"
        >
          🚀
        </button>

        {/* Tether Button */}
        <button
          className={`${styles.touchButton} ${styles.tetherButton} ${gameState.tetherActive ? styles.active : ''}`}
          onTouchStart={handleTetherClick}
          style={transitionStyle}
          aria-label="Toggle tether"
        >
          ⚓
        </button>
      </div>
    </>
  );
};
