import { useState, useEffect, useCallback } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type ScreenOrientation = 'portrait' | 'landscape';

export interface ResponsiveUIState {
  deviceType: DeviceType;
  screenOrientation: ScreenOrientation;
  screenWidth: number;
  screenHeight: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isPortrait: boolean;
  isLandscape: boolean;
  isTouchDevice: boolean;
  pixelRatio: number;
  safeAreaInsets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

// Breakpoints matching CSS variables
const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
} as const;

// Detect device type based on screen size
const getDeviceType = (width: number): DeviceType => {
  if (width <= BREAKPOINTS.mobile) return 'mobile';
  if (width <= BREAKPOINTS.tablet) return 'tablet';
  return 'desktop';
};

// Detect screen orientation
const getScreenOrientation = (width: number, height: number): ScreenOrientation => {
  return width > height ? 'landscape' : 'portrait';
};

// Detect touch device capability
const detectTouchDevice = (): boolean => {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore - for older browsers
    navigator.msMaxTouchPoints > 0
  );
};

// Get safe area insets (for devices with notches, etc.)
const getSafeAreaInsets = () => {
  const computedStyle = getComputedStyle(document.documentElement);
  
  return {
    top: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)') || '0', 10),
    bottom: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)') || '0', 10),
    left: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)') || '0', 10),
    right: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)') || '0', 10),
  };
};

// Debounce utility for resize events
const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const useResponsiveUI = (): ResponsiveUIState => {
  const [state, setState] = useState<ResponsiveUIState>(() => {
    // Initial state calculation
    const width = window.innerWidth;
    const height = window.innerHeight;
    const deviceType = getDeviceType(width);
    const screenOrientation = getScreenOrientation(width, height);
    const isTouchDevice = detectTouchDevice();
    
    return {
      deviceType,
      screenOrientation,
      screenWidth: width,
      screenHeight: height,
      isMobile: deviceType === 'mobile',
      isTablet: deviceType === 'tablet',
      isDesktop: deviceType === 'desktop',
      isPortrait: screenOrientation === 'portrait',
      isLandscape: screenOrientation === 'landscape',
      isTouchDevice,
      pixelRatio: window.devicePixelRatio || 1,
      safeAreaInsets: getSafeAreaInsets(),
    };
  });

  const updateState = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const deviceType = getDeviceType(width);
    const screenOrientation = getScreenOrientation(width, height);
    const isTouchDevice = detectTouchDevice();

    setState({
      deviceType,
      screenOrientation,
      screenWidth: width,
      screenHeight: height,
      isMobile: deviceType === 'mobile',
      isTablet: deviceType === 'tablet',
      isDesktop: deviceType === 'desktop',
      isPortrait: screenOrientation === 'portrait',
      isLandscape: screenOrientation === 'landscape',
      isTouchDevice,
      pixelRatio: window.devicePixelRatio || 1,
      safeAreaInsets: getSafeAreaInsets(),
    });
  }, []);

  useEffect(() => {
    // Debounced resize handler to prevent excessive updates
    const debouncedUpdate = debounce(updateState, 150);
    
    // Listen for resize events
    window.addEventListener('resize', debouncedUpdate);
    
    // Listen for orientation change events
    window.addEventListener('orientationchange', () => {
      // Small delay to ensure dimensions are updated after orientation change
      setTimeout(updateState, 100);
    });

    // Listen for pixel ratio changes (zoom, display changes)
    const mediaQuery = window.matchMedia('(min-resolution: 2dppx)');
    const handlePixelRatioChange = () => {
      setTimeout(updateState, 50);
    };
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handlePixelRatioChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handlePixelRatioChange);
    }

    // Cleanup
    return () => {
      window.removeEventListener('resize', debouncedUpdate);
      window.removeEventListener('orientationchange', updateState);
      
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handlePixelRatioChange);
      } else {
        mediaQuery.removeListener(handlePixelRatioChange);
      }
    };
  }, [updateState]);

  return state;
};

// Additional utility hooks

// Hook for getting responsive sizes
export const useResponsiveSize = (
  baseSize: number,
  mobileFactor: number = 1.2,
  tabletFactor: number = 1.1
) => {
  const { deviceType } = useResponsiveUI();
  
  switch (deviceType) {
    case 'mobile':
      return baseSize * mobileFactor;
    case 'tablet':
      return baseSize * tabletFactor;
    default:
      return baseSize;
  }
};

// Hook for responsive breakpoint matching
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [query]);

  return matches;
};

// Hook for detecting reduced motion preference
export const usePrefersReducedMotion = (): boolean => {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
};

// Hook for detecting high contrast preference
export const usePrefersHighContrast = (): boolean => {
  return useMediaQuery('(prefers-contrast: high)');
};
