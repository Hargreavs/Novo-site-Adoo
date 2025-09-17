'use client';

import React, { useState, useEffect } from 'react';

const AnimatedBackground = () => {
  const [particles, setParticles] = useState<Array<{left: number, top: number, delay: number}>>([]);

  useEffect(() => {
    // Gerar posições e delays apenas no cliente
    const generatedParticles = [...Array(20)].map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 5
    }));
    setParticles(generatedParticles);
  }, []);
  return (
    <>
      {/* Blobs animados */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Blob 1 - Azul */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-purple-500/30 rounded-full animate-float-1"></div>
        </div>
        
        {/* Blob 2 - Roxo */}
        <div className="absolute top-20 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/30 to-pink-500/30 rounded-full animate-float-2"></div>
        </div>
        
        {/* Blob 3 - Rosa */}
        <div className="absolute -bottom-40 left-1/4 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl animate-pulse-slow">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-400/30 to-blue-500/30 rounded-full animate-float-3"></div>
        </div>
        
        {/* Blob 4 - Ciano */}
        <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl animate-pulse-slow">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/30 to-blue-500/30 rounded-full animate-float-4"></div>
        </div>
      </div>

      {/* Linhas brilhantes animadas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1200 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Linha 1 */}
          <path
            d="M0,150 Q300,100 600,150 T1200,150"
            stroke="url(#gradient1)"
            strokeWidth="2"
            fill="none"
            className="animate-line-1"
            opacity="0.6"
          />
          
          {/* Linha 2 */}
          <path
            d="M0,300 Q400,250 800,300 T1200,300"
            stroke="url(#gradient2)"
            strokeWidth="1.5"
            fill="none"
            className="animate-line-2"
            opacity="0.4"
          />
          
          {/* Linha 3 */}
          <path
            d="M0,450 Q200,400 400,450 T800,450 T1200,450"
            stroke="url(#gradient3)"
            strokeWidth="1"
            fill="none"
            className="animate-line-3"
            opacity="0.3"
          />
          
          {/* Linha vertical */}
          <path
            d="M600,0 Q650,150 600,300 Q550,450 600,600"
            stroke="url(#gradient4)"
            strokeWidth="1"
            fill="none"
            className="animate-line-4"
            opacity="0.2"
          />
          
          {/* Gradientes */}
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0" />
              <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#EC4899" stopOpacity="0" />
            </linearGradient>
            
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0" />
              <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
            </linearGradient>
            
            <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EC4899" stopOpacity="0" />
              <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
            </linearGradient>
            
            <linearGradient id="gradient4" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0" />
              <stop offset="50%" stopColor="#EC4899" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Partículas flutuantes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 bg-white/20 rounded-full animate-particle-${(i % 4) + 1}`}
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Estilos CSS para animações */}
      <style jsx>{`
        @keyframes float-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(30px, -30px) scale(1.1); }
          50% { transform: translate(-20px, -60px) scale(0.9); }
          75% { transform: translate(40px, -20px) scale(1.05); }
        }
        
        @keyframes float-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(-40px, 20px) scale(0.95); }
          50% { transform: translate(20px, 40px) scale(1.1); }
          75% { transform: translate(-30px, 10px) scale(0.9); }
        }
        
        @keyframes float-3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(25px, 35px) scale(1.05); }
          50% { transform: translate(-35px, 15px) scale(0.95); }
          75% { transform: translate(15px, -25px) scale(1.1); }
        }
        
        @keyframes float-4 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(-25px, -40px) scale(0.9); }
          50% { transform: translate(40px, -15px) scale(1.1); }
          75% { transform: translate(-15px, 30px) scale(0.95); }
        }
        
        @keyframes line-1 {
          0% { stroke-dasharray: 0, 1000; }
          50% { stroke-dasharray: 500, 1000; }
          100% { stroke-dasharray: 1000, 1000; }
        }
        
        @keyframes line-2 {
          0% { stroke-dasharray: 0, 1000; }
          50% { stroke-dasharray: 300, 1000; }
          100% { stroke-dasharray: 1000, 1000; }
        }
        
        @keyframes line-3 {
          0% { stroke-dasharray: 0, 1000; }
          50% { stroke-dasharray: 200, 1000; }
          100% { stroke-dasharray: 1000, 1000; }
        }
        
        @keyframes line-4 {
          0% { stroke-dasharray: 0, 1000; }
          50% { stroke-dasharray: 400, 1000; }
          100% { stroke-dasharray: 1000, 1000; }
        }
        
        @keyframes particle-1 {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          50% { transform: translateY(-100px) translateX(50px); }
        }
        
        @keyframes particle-2 {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          50% { transform: translateY(-80px) translateX(-30px); }
        }
        
        @keyframes particle-3 {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          50% { transform: translateY(-120px) translateX(20px); }
        }
        
        @keyframes particle-4 {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
          25% { opacity: 1; }
          75% { opacity: 1; }
          50% { transform: translateY(-90px) translateX(-40px); }
        }
        
        .animate-float-1 { animation: float-1 8s ease-in-out infinite; }
        .animate-float-2 { animation: float-2 10s ease-in-out infinite; }
        .animate-float-3 { animation: float-3 12s ease-in-out infinite; }
        .animate-float-4 { animation: float-4 9s ease-in-out infinite; }
        
        .animate-line-1 { animation: line-1 6s linear infinite; }
        .animate-line-2 { animation: line-2 8s linear infinite; }
        .animate-line-3 { animation: line-3 10s linear infinite; }
        .animate-line-4 { animation: line-4 7s linear infinite; }
        
        .animate-particle-1 { animation: particle-1 4s ease-in-out infinite; }
        .animate-particle-2 { animation: particle-2 5s ease-in-out infinite; }
        .animate-particle-3 { animation: particle-3 6s ease-in-out infinite; }
        .animate-particle-4 { animation: particle-4 4.5s ease-in-out infinite; }
        
        .animate-pulse-slow {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </>
  );
};

export default AnimatedBackground;
