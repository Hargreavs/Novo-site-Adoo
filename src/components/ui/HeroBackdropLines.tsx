'use client';

import { useState, useRef } from 'react';

interface HeroBackdropLinesProps {
  className?: string;
}

/**
 * Componente reutilizável para linhas decorativas curvadas/pontilhadas
 * Usado na seção de preços e outras seções hero
 */
export default function HeroBackdropLines({ className = '' }: HeroBackdropLinesProps) {
  const [hoveredLine, setHoveredLine] = useState<string | null>(null);
  const pricingLinesRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={pricingLinesRef} className={`absolute inset-0 pointer-events-none ${className}`} style={{ zIndex: 1 }}>
      <style jsx>{`
        @keyframes dash {
          0% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: 100;
          }
        }
      `}</style>
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1200 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Line 1 - Centralizada acima do título */}
        <path
          d="M200 100 Q400 80 600 100 T1000 100"
          stroke="url(#gradient1)"
          strokeWidth="2"
          fill="none"
          filter={hoveredLine === 'line1' ? "url(#hoverGlowFilter)" : "url(#glowFilter)"}
          style={{
            strokeDasharray: "10 5",
            animation: "dash 3s linear infinite",
            opacity: hoveredLine === 'line1' ? 0.8 : 0.6,
            transition: "all 0.3s ease-in-out"
          }}
          onMouseEnter={() => setHoveredLine('line1')}
          onMouseLeave={() => setHoveredLine(null)}
        />
        {/* Line 2 - Centralizada no meio */}
        <path
          d="M150 150 Q350 130 550 150 T950 150"
          stroke="url(#gradient2)"
          strokeWidth="2"
          fill="none"
          filter={hoveredLine === 'line2' ? "url(#hoverGlowFilter)" : "url(#glowFilter)"}
          style={{
            strokeDasharray: "15 8",
            animation: "dash 4s linear infinite reverse",
            opacity: hoveredLine === 'line2' ? 0.8 : 0.6,
            transition: "all 0.3s ease-in-out"
          }}
          onMouseEnter={() => setHoveredLine('line2')}
          onMouseLeave={() => setHoveredLine(null)}
        />
        {/* Line 3 - Centralizada abaixo */}
        <path
          d="M100 200 Q200 180 300 200 Q400 220 500 200 Q600 180 700 200 Q800 220 900 200 Q1000 180 1100 200"
          stroke="url(#gradient3)"
          strokeWidth="2"
          fill="none"
          filter={hoveredLine === 'line3' ? "url(#hoverGlowFilter)" : "url(#glowFilter)"}
          style={{
            strokeDasharray: "12 6",
            animation: "dash 5s linear infinite",
            opacity: hoveredLine === 'line3' ? 0.8 : 0.6,
            transition: "all 0.3s ease-in-out"
          }}
          onMouseEnter={() => setHoveredLine('line3')}
          onMouseLeave={() => setHoveredLine(null)}
        />
        
        {/* Gradients */}
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.3)" />
            <stop offset="50%" stopColor="rgba(139, 92, 246, 0.5)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0.3)" />
          </linearGradient>
          <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(139, 92, 246, 0.3)" />
            <stop offset="50%" stopColor="rgba(168, 85, 247, 0.5)" />
            <stop offset="100%" stopColor="rgba(139, 92, 246, 0.3)" />
          </linearGradient>
          <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(168, 85, 247, 0.3)" />
            <stop offset="50%" stopColor="rgba(59, 130, 246, 0.5)" />
            <stop offset="100%" stopColor="rgba(168, 85, 247, 0.3)" />
          </linearGradient>
          
          {/* Gradientes de brilho para hover */}
          <linearGradient id="pricingGlow1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.8)" />
            <stop offset="20%" stopColor="rgba(59, 130, 246, 1)" />
            <stop offset="50%" stopColor="rgba(139, 92, 246, 1)" />
            <stop offset="80%" stopColor="rgba(59, 130, 246, 1)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0.8)" />
          </linearGradient>
          <linearGradient id="pricingGlow2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(139, 92, 246, 0.8)" />
            <stop offset="30%" stopColor="rgba(139, 92, 246, 1)" />
            <stop offset="60%" stopColor="rgba(168, 85, 247, 1)" />
            <stop offset="100%" stopColor="rgba(139, 92, 246, 0.8)" />
          </linearGradient>
          <linearGradient id="pricingGlow3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(168, 85, 247, 0.8)" />
            <stop offset="25%" stopColor="rgba(168, 85, 247, 1)" />
            <stop offset="75%" stopColor="rgba(59, 130, 246, 1)" />
            <stop offset="100%" stopColor="rgba(168, 85, 247, 0.8)" />
          </linearGradient>
          
          {/* Filtros para efeito de brilho */}
          <filter id="glowFilter" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feGaussianBlur stdDeviation="8" result="coloredBlur2"/>
            <feMerge> 
              <feMergeNode in="coloredBlur2"/>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          <filter id="hoverGlowFilter" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
            <feGaussianBlur stdDeviation="12" result="coloredBlur2"/>
            <feMerge> 
              <feMergeNode in="coloredBlur2"/>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      </svg>
    </div>
  );
}
