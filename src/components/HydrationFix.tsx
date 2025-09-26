'use client';

import { useEffect } from 'react';

export default function HydrationFix() {
  useEffect(() => {
    // Suppress hydration warnings for common browser extension attributes
    const originalError = console.error;
    
    console.error = (...args) => {
      if (
        typeof args[0] === 'string' &&
        args[0].includes('hydration') &&
        (args[0].includes('cz-shortcut-listen') ||
         args[0].includes('data-new-gr-c-s-check-loaded') ||
         args[0].includes('data-gr-ext-installed') ||
         args[0].includes('spellcheck') ||
         args[0].includes('data-grammarly'))
      ) {
        return;
      }
      originalError.apply(console, args);
    };

    // Clean up on unmount
    return () => {
      console.error = originalError;
    };
  }, []);

  return null;
}


















