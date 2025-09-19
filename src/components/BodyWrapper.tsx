'use client';

import { useEffect } from 'react';

export default function BodyWrapper() {
  useEffect(() => {
    // Handle browser extension attributes that cause hydration mismatches
    const handleHydrationMismatch = () => {
      const body = document.body;
      
      // Remove common browser extension attributes that cause hydration issues
      const extensionAttributes = [
        'cz-shortcut-listen',
        'data-new-gr-c-s-check-loaded',
        'data-gr-ext-installed',
        'data-grammarly',
        'data-gramm_editor',
        'data-grammarly-shadow-root',
        'spellcheck'
      ];

      extensionAttributes.forEach(attr => {
        if (body.hasAttribute(attr)) {
          body.removeAttribute(attr);
        }
      });
    };

    // Run after hydration
    const timer = setTimeout(handleHydrationMismatch, 100);

    return () => clearTimeout(timer);
  }, []);

  return null;
}










