'use client';

import { ReactNode } from 'react';
import useRevealAnimation from '@/hooks/useRevealAnimation';

interface RevealWrapperProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export default function RevealWrapper({ 
  children, 
  delay = 0, 
  className = '' 
}: RevealWrapperProps) {
  useRevealAnimation();

  return (
    <div 
      data-reveal 
      data-reveal-delay={delay}
      className={className}
    >
      {children}
    </div>
  );
}

