'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Benefit } from '@/types/benefits';
import { useState, useEffect } from 'react';

interface BenefitRailProps {
  items: Benefit[];
  activeId: string;
  onSelect: (id: string) => void;
}

export default function BenefitRail({ items, activeId, onSelect }: BenefitRailProps) {
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent, itemId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(itemId);
    }
  };

  const handleArrowKey = (e: React.KeyboardEvent) => {
    const currentIndex = items.findIndex(item => item.id === activeId);
    let newIndex = currentIndex;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      newIndex = (currentIndex + 1) % items.length;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      newIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
    }

    if (newIndex !== currentIndex) {
      onSelect(items[newIndex].id);
    }
  };

  return (
    <aside 
      className="h-full grid grid-rows-4 gap-3 min-h-[400px] overflow-visible"
      onKeyDown={handleArrowKey}
      role="tablist"
      aria-label="Benefícios disponíveis"
    >
      {items.map((item, index) => {
        const isActive = item.id === activeId;
        
        return (
          <motion.button
            key={item.id}
            role="tab"
            tabIndex={isActive ? 0 : -1}
            aria-selected={isActive}
            aria-controls={`benefit-panel-${item.id}`}
            aria-labelledby={`benefit-label-${item.id}`}
            onClick={() => onSelect(item.id)}
            onKeyDown={(e) => handleKeyDown(e, item.id)}
            className={`
              w-full h-full min-h-[80px] flex items-center gap-3 rounded-xl px-4 py-4
              focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer
              relative overflow-hidden transition-all duration-300
              bg-white/[0.03] backdrop-blur-[20px] border border-white/10
              hover:border-blue-400/30 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]
              ${isActive 
                ? 'border-blue-400/40 shadow-[0_0_30px_rgba(59,130,246,0.2)]' 
                : ''
              }
            `}
            whileHover={{}}
            whileFocus={{}}
          >
            
            {/* Content */}
            <div className="relative z-10 flex items-center gap-3 w-full">
              {/* Icon */}
              <div className={`
                flex-shrink-0 transition-colors duration-200
                ${isActive ? 'text-blue-300' : 'text-gray-400'}
              `}>
                {item.icon}
              </div>
              
              {/* Label */}
              <span
                id={`benefit-label-${item.id}`}
                className={`
                  text-sm font-medium transition-colors duration-200
                  ${isActive ? 'text-white' : 'text-gray-300'}
                `}
              >
                {item.label}
              </span>
            </div>
          </motion.button>
        );
      })}
    </aside>
  );
}