'use client';

import { useEffect, useRef } from 'react';

interface RevealOptions {
  threshold?: number;
  rootMargin?: string;
}

export function useRevealAnimation(options: RevealOptions = {}) {
  const { threshold = 0.1, rootMargin = '0px 0px -50px 0px' } = options;

  useEffect(() => {
    const revealElements = document.querySelectorAll('[data-reveal]');
    
    if (revealElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            const delay = element.getAttribute('data-reveal-delay') || '0';
            
            setTimeout(() => {
              element.style.opacity = '1';
              element.style.transform = 'translateY(0)';
            }, parseInt(delay));
            
            observer.unobserve(element);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    revealElements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      htmlElement.style.opacity = '0';
      htmlElement.style.transform = 'translateY(30px)';
      htmlElement.style.transition = 'opacity 700ms cubic-bezier(0.22, 1, 0.36, 1), transform 700ms cubic-bezier(0.22, 1, 0.36, 1)';
      observer.observe(htmlElement);
    });

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin]);
}

export default useRevealAnimation;

