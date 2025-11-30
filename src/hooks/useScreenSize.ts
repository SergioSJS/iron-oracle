import { useState, useEffect } from 'react';

const BREAKPOINT_SMALL = 968;

export function useScreenSize() {
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < BREAKPOINT_SMALL);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return { isSmallScreen };
}

