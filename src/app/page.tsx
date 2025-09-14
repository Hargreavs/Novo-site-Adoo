'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { 
  DocumentTextIcon, 
  ShieldCheckIcon, 
  ClockIcon, 
  CloudIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import TransparentHeader from '@/components/TransparentHeader';
import RevealWrapper from '@/components/RevealWrapper';
import Personas from '@/components/Personas';
import TestimonialsCarousel from '@/components/TestimonialsCarousel';
import BenefitsSection from '@/components/BenefitsSection';
import HeroSection from '@/components/HeroSection';

export default function Home() {
  const heroRef = useRef<HTMLElement>(null);
  const parallaxImageRef = useRef<HTMLDivElement>(null);
  const [isHeroVisible, setIsHeroVisible] = useState(true);
  const [showScrollCue, setShowScrollCue] = useState(true);
  const [selectedContext, setSelectedContext] = useState<string>('concurso');
  const [hoveredPricingLine, setHoveredPricingLine] = useState<string | null>(null);
  const [pricingGlowIntensity, setPricingGlowIntensity] = useState(0);
  const [isHoveringPricing, setIsHoveringPricing] = useState(false);
  const pricingLinesRef = useRef<HTMLDivElement>(null);
  const [isMouseOverPricing, setIsMouseOverPricing] = useState(false);
  const [glowPosition, setGlowPosition] = useState({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | null>(null);



  // Mouse glow effect para seção de preços - Efeito de brilho que segue o cursor
  useEffect(() => {
    const handlePricingMouseMove = (e: MouseEvent) => {
      console.log('Pricing mouse move event triggered!');
      if (pricingLinesRef.current) {
        const rect = pricingLinesRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        console.log(`Pricing mouse position: ${mouseX}, ${mouseY}`);
        const viewportWidth = rect.width;
        const viewportHeight = rect.height;
        
        // Atualizar posição do mouse em tempo real
        // setMousePosition({ x: mouseX, y: mouseY });
        setIsMouseOverPricing(true);
        
        // Detecção baseada em pontos das linhas (igual à hero section)
        let detectedLine = null;
        let intensity = 0;

        // Definir pontos das linhas de preços baseados no SVG
        const pricingLinePoints = [
          {
            id: 'pricingLine1',
            // SVG: M0 200 Q300 150 600 200 T1200 200
            points: [
              {x: 0, y: 200}, // M0 200
              {x: 150, y: 175}, // Interpolação
              {x: 300, y: 150}, // Q300 150
              {x: 450, y: 175}, // Interpolação
              {x: 600, y: 200}, // Q600 200
              {x: 750, y: 200}, // T (reflexo)
              {x: 900, y: 200}, // T (reflexo)
              {x: 1200, y: 200} // T1200 200
            ]
          },
          {
            id: 'pricingLine2',
            // SVG: M0 400 Q400 350 800 400 T1200 400
            points: [
              {x: 0, y: 400}, // M0 400
              {x: 200, y: 375}, // Interpolação
              {x: 400, y: 350}, // Q400 350
              {x: 600, y: 375}, // Interpolação
              {x: 800, y: 400}, // Q800 400
              {x: 1000, y: 400}, // T (reflexo)
              {x: 1200, y: 400} // T1200 400
            ]
          },
          {
            id: 'pricingLine3',
            // SVG: M0 600 Q200 550 400 600 Q600 650 800 600 Q1000 550 1200 600
            points: [
              {x: 0, y: 600}, // M0 600
              {x: 100, y: 575}, // Interpolação
              {x: 200, y: 550}, // Q200 550
              {x: 300, y: 575}, // Interpolação
              {x: 400, y: 600}, // Q400 600
              {x: 500, y: 625}, // Interpolação
              {x: 600, y: 650}, // Q600 650
              {x: 700, y: 625}, // Interpolação
              {x: 800, y: 600}, // Q800 600
              {x: 900, y: 575}, // Interpolação
              {x: 1000, y: 550}, // Q1000 550
              {x: 1100, y: 575}, // Interpolação
              {x: 1200, y: 600} // Q1200 600
            ]
          }
        ];

        let closestLine = null;
        let minDistance = Infinity;

        pricingLinePoints.forEach(line => {
          // Calcular distância mínima do mouse para a linha
          let lineMinDistance = Infinity;
          
          for (let i = 0; i < line.points.length - 1; i++) {
            const p1 = line.points[i];
            const p2 = line.points[i + 1];
            
            // Distância do ponto à linha (aproximação)
            const A = mouseX - p1.x;
            const B = mouseY - p1.y;
            const C = p2.x - p1.x;
            const D = p2.y - p1.y;

            const dot = A * C + B * D;
            const lenSq = C * C + D * D;
            let param = -1;
            
            if (lenSq !== 0) {
              param = dot / lenSq;
            }

            let xx, yy;
            if (param < 0) {
              xx = p1.x;
              yy = p1.y;
            } else if (param > 1) {
              xx = p2.x;
              yy = p2.y;
            } else {
              xx = p1.x + param * C;
              yy = p1.y + param * D;
            }

            const dx = mouseX - xx;
            const dy = mouseY - yy;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            lineMinDistance = Math.min(lineMinDistance, distance);
          }

          if (lineMinDistance < minDistance) {
            minDistance = lineMinDistance;
            closestLine = line.id;
          }
        });

        // Ativar hover se estiver próximo o suficiente (raio de 200px para cobrir toda a área)
        const detectionRadius = 200;
        if (minDistance < detectionRadius) {
          // Intensidade aumenta conforme o mouse se aproxima da linha (distância menor = brilho maior)
          intensity = Math.max(0, (1 - (minDistance / detectionRadius)) * 0.8);
          detectedLine = closestLine;
          
          // Debug: mostrar distância e intensidade
          console.log(`Pricing - Distância: ${minDistance.toFixed(2)}, Intensidade: ${intensity.toFixed(2)}, Linha: ${detectedLine}`);
        }
        
        // Aplicar intensidade mínima para garantir que sempre ative quando estiver na faixa
        if (detectedLine && intensity < 0.1) {
          intensity = 0.1;
        }
        
        // Reduzir intensidade máxima do brilho
        intensity = intensity * 0.3;
        
        setHoveredPricingLine(detectedLine);
        setPricingGlowIntensity(intensity);
        setIsHoveringPricing(intensity > 0);
      }
    };

    const handlePricingMouseLeave = () => {
      setHoveredPricingLine(null);
      setPricingGlowIntensity(0);
      setIsHoveringPricing(false);
      setIsMouseOverPricing(false);
    };

    const pricingLinesContainer = pricingLinesRef.current;
    if (pricingLinesContainer) {
      pricingLinesContainer.addEventListener('mousemove', handlePricingMouseMove);
      pricingLinesContainer.addEventListener('mouseleave', handlePricingMouseLeave);
      return () => {
        pricingLinesContainer.removeEventListener('mousemove', handlePricingMouseMove);
        pricingLinesContainer.removeEventListener('mouseleave', handlePricingMouseLeave);
      };
    }
  }, []);

  // Animação suave do brilho que segue o cursor
  useEffect(() => {
    const animateGlow = () => {
      if (isMouseOverPricing) {
        setGlowPosition(prev => {
          // Interpolação suave para seguir o cursor
          const lerpFactor = 0.15;
          return {
            x: prev.x,
            y: prev.y
          };
        });
        
        animationFrameRef.current = requestAnimationFrame(animateGlow);
      }
    };

    if (isMouseOverPricing) {
      animationFrameRef.current = requestAnimationFrame(animateGlow);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isMouseOverPricing]);

  // Parallax effect - Zoom in on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (parallaxImageRef.current) {
        const scrolled = window.pageYOffset;
        const maxScroll = window.innerHeight; // Altura da viewport
        const scrollProgress = Math.min(scrolled / maxScroll, 1); // Progresso de 0 a 1
        
        // Zoom de 1.0 (100%) até 1.2 (120%) baseado no scroll
        const scale = 1 + (scrollProgress * 0.2);
        
        parallaxImageRef.current.style.transform = `scale(${scale})`;
      }
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', throttledScroll);
    };
  }, []);

  // Hero visibility detection
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const isVisible = rect.bottom > 0 && rect.top < window.innerHeight;
        setIsHeroVisible(isVisible);
      }
    };

    // Initial check
    handleScroll();
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);


  // Scroll cue visibility control
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const threshold = 100; // Hide after 100px of scroll
      setShowScrollCue(scrolled < threshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Smooth scroll to next section
  const scrollToNextSection = () => {
    console.log('Scroll cue clicked!');
    
    // Método mais direto: scroll por altura da viewport
    const scrollAmount = window.innerHeight;
    console.log('Scrolling by:', scrollAmount);
    
    window.scrollBy({
      top: scrollAmount,
      behavior: 'smooth'
    });
    
    // Também tenta o método por elemento (como backup)
    setTimeout(() => {
      console.log('Looking for features section...');
      const nextSection = document.getElementById('features');
      console.log('Features section found:', nextSection);
      
      if (nextSection) {
        console.log('Scrolling to features section');
        nextSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  };

  // Função para gerar descrições dinâmicas do contexto
  const getContextDescription = (context: string) => {
    const descriptions: { [key: string]: string } = {
      'concurso': 'Novos editais de concurso público',
      'licitacao': 'Novas licitações e pregões',
      'legislacao': 'Novas leis e decretos'
    };
    return descriptions[context] || '';
  };

  const features = [
    {
      icon: DocumentTextIcon,
      title: 'Radar IA',
      description: 'Nossa inteligência artificial lê os editais e já entrega o resumo mastigado, com os principais pontos que você precisa saber.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Alertas personalizados',
      description: 'Cadastre palavras-chave (concursos, licitações, nomes, CNPJs) e seja avisado na hora em que forem publicadas nos diários oficiais de seu interesse.'
    },
    {
      icon: ClockIcon,
      title: 'Central unificada',
      description: 'Pesquise em diferentes diários oficiais em um só lugar, sem precisar abrir dezenas de sites.'
    },
    {
      icon: CloudIcon,
      title: 'Notificação em tempo real',
      description: 'Receba alertas por e-mail, SMS e push assim que sua palavra-chave for publicada.'
    }
  ];


  return (
    <div className="bg-transparent">
      <TransparentHeader currentPage="" />

      {/* Hero Section */}
      <section ref={heroRef} className="relative isolate overflow-hidden h-screen flex items-center justify-center">
        {/* Gradiente base (fallback) */}
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
        </div>
        
        {/* Imagem de fundo - Fallback para gradiente se imagem não existir */}
        <div ref={parallaxImageRef} className="parallax-container absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
          <Image
            src="/images/Imagem Diário Oficial.png"
            alt="Jornais do Diário Oficial"
            fill
            priority
            fetchPriority="high"
            quality={85}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            className="object-cover object-center md:object-[50%_35%] w-full h-full"
            style={{ 
              filter: 'brightness(0.7) contrast(1.05) saturate(0.8) blur(0.5px)',
              willChange: 'transform'
            }}
          />
        </div>

        {/* Animated Lines Effect - Hero Section */}
        <div 
          className="absolute inset-0 pointer-events-auto overflow-hidden"
          style={{ zIndex: 20 }}
        >
          <HeroSection />
        </div>

        {/* Overlay 1 - Escuro para legibilidade */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/75 via-[#0a0a0f]/70 to-[#1c1a4a]/75" style={{ zIndex: 1 }} />

        {/* Blobs radiais discretos */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
          <div className="blob-1 absolute w-96 h-96 rounded-full opacity-20 blur-3xl"></div>
          <div className="blob-2 absolute w-80 h-80 rounded-full opacity-15 blur-3xl"></div>
          <div className="blob-3 absolute w-72 h-72 rounded-full opacity-18 blur-3xl"></div>
        </div>

        {/* Spotlight effect - Fixed center */}
        <div className="spotlight-fixed absolute inset-0 pointer-events-none" style={{ zIndex: 3 }} />

        {/* Overlay 2 - Vignette para focar no título */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 70% at 50% 30%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.65) 100%)',
            zIndex: 4
          }}
        />

        {/* Degradê de transição para próxima seção */}
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#0a0a0f] to-transparent pointer-events-none" style={{ zIndex: 4 }} />

        {/* Scroll cue indicator */}
        {showScrollCue && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2" style={{ zIndex: 50 }}>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Button clicked!');
                scrollToNextSection();
              }}
              onMouseDown={(e) => {
                console.log('Button mouse down!');
                e.preventDefault();
              }}
              className="scroll-cue group flex flex-col items-center text-white/70 hover:text-white transition-colors duration-300 focus:outline-none focus:text-white cursor-pointer"
              aria-label="Rolar para próxima seção"
              style={{ pointerEvents: 'auto' }}
            >
              <span className="text-xs font-medium mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Descobrir mais
              </span>
              <div className="scroll-cue-arrow">
                <svg 
                  className="w-4 h-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M19 14l-7 7m0 0l-7-7m7 7V3" 
                  />
                </svg>
              </div>
            </button>
          </div>
        )}




        {/* Conteúdo do Hero */}
        <div className="relative px-4 sm:px-6 lg:px-8 w-full max-w-6xl mx-auto hero-content" style={{ zIndex: 25, pointerEvents: 'none' }}>
          <div className="flex items-center justify-center h-full">
            <div className="w-full text-center space-y-6 sm:space-y-8">
              <div className="hidden sm:mb-4 sm:flex sm:justify-center sm:pt-4 fade-in-delay-1">
                <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-300 ring-1 ring-white/20 hover:ring-white/30 backdrop-blur-[1px]">
                  Nova versão disponível{' '}
                </div>
              </div>
              <div className="text-center max-w-4xl mx-auto space-y-0 sm:space-y-1 fade-in-delay-2">
                <h1 className="text-lg font-bold tracking-tight text-white sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl leading-tight">
                  Deixe a IA monitorar as <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400" style={{ lineHeight: '1.2', paddingBottom: '2px' }}>publicações</span> por você
                </h1>
                <p className="text-xs leading-5 text-gray-300 sm:text-sm sm:leading-6 md:text-base max-w-xl mx-auto">
                  Receba só o que importa, sem perder horas filtrando publicações.
                </p>
                
                {/* Card central premium estilo Apple/Linear */}
                <div className="mt-10 max-w-lg mx-auto sm:mt-12">
                  <div className="radar-card rounded-2xl p-2 sm:p-3 md:p-4 lg:p-6 mx-1 sm:mx-0" style={{ pointerEvents: 'auto' }}>
                    {/* Cabeçalho com hierarquia clara */}
                    <div className="radar-header mb-2 sm:mb-3">
                      <div className="radar-title-row">
                        <h3 className="radar-title-main">Radar IA</h3>
                        <span className="new-chip-small">Novo ✨</span>
                      </div>
                      <p className="radar-subtitle-secondary">
                        Configure seu monitoramento inteligente
                      </p>
                    </div>
                    
                    <div className="space-y-2 sm:space-y-2 md:space-y-3">
                      {/* Campo Contexto com ícone */}
                      <div className="select-container">
                        <label htmlFor="contexto" className="text-sm sm:text-base">
                          Contexto
                        </label>
                        <div className="select-wrapper">
                          <span className="select-icon">📌</span>
                          <select 
                            id="contexto" 
                            className="rotating-placeholder text-sm sm:text-base" 
                            value={selectedContext}
                            onChange={(e) => setSelectedContext(e.target.value)}
                            style={{ pointerEvents: 'auto' }}
                          >
                            <option value="concurso">Concurso público</option>
                            <option value="licitacao">Licitação</option>
                            <option value="legislacao">Legislação</option>
                          </select>
                        </div>
                        
                        {/* Descrição dinâmica */}
                        <p className="text-sm text-gray-300 italic mt-2 text-left">
                          {getContextDescription(selectedContext)}
                        </p>
                      </div>
                      
                      {/* Botão principal premium */}
                      <button className="radar-button text-sm sm:text-base" style={{ pointerEvents: 'auto' }}>
                        <svg className="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Ativar Radar IA grátis
                      </button>
                      
                      {/* CTA secundário */}
                      <div className="w-full">
                        <a href="#features" className="ghost-button text-sm sm:text-base w-full" style={{ pointerEvents: 'auto' }}>
                          Saiba mais sobre o Radar IA
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  {/* Texto de confiança */}
                  <p className="mt-2 sm:mt-3 text-xs text-gray-400 text-center px-2">
                    Já são mais de 40 mil usuários acompanhando concursos, licitações e atos oficiais com o Adoo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </section>

      {/* Benefits Section - Nova implementação inspirada no Devin.ai */}
      <BenefitsSection />

      {/* Personas Section */}
      <div className="py-16 sm:py-24 lg:py-32">
        <Personas />
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="py-16 sm:py-24 lg:py-32 relative overflow-hidden" style={{ zIndex: 10 }}>
        {/* Animated Lines Background */}
        <div ref={pricingLinesRef} className="absolute inset-0 pointer-events-auto" style={{ zIndex: 1 }}>
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
            viewBox="0 0 1200 800"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >

            {/* Line 1 */}
            <path
              d="M0 200 Q300 150 600 200 T1200 200"
              stroke="url(#gradient1)"
              strokeWidth="2"
              fill="none"
              filter={hoveredPricingLine === 'pricingLine1' ? "url(#pricingHoverGlowFilter)" : "url(#pricingGlowFilter)"}
              style={{
                strokeDasharray: "10 5",
                animation: "dash 3s linear infinite",
                opacity: hoveredPricingLine === 'pricingLine1' ? 0.8 : 0.6,
                transition: "all 0.3s ease-in-out"
              }}
            />
            {/* Line 2 */}
            <path
              d="M0 400 Q400 350 800 400 T1200 400"
              stroke="url(#gradient2)"
              strokeWidth="2"
              fill="none"
              filter={hoveredPricingLine === 'pricingLine2' ? "url(#pricingHoverGlowFilter)" : "url(#pricingGlowFilter)"}
              style={{
                strokeDasharray: "15 8",
                animation: "dash 4s linear infinite reverse",
                opacity: hoveredPricingLine === 'pricingLine2' ? 0.8 : 0.6,
                transition: "all 0.3s ease-in-out"
              }}
            />
            {/* Line 3 */}
            <path
              d="M0 600 Q200 550 400 600 Q600 650 800 600 Q1000 550 1200 600"
              stroke="url(#gradient3)"
              strokeWidth="2"
              fill="none"
              filter={hoveredPricingLine === 'pricingLine3' ? "url(#pricingHoverGlowFilter)" : "url(#pricingGlowFilter)"}
              style={{
                strokeDasharray: "12 6",
                animation: "dash 5s linear infinite",
                opacity: hoveredPricingLine === 'pricingLine3' ? 0.8 : 0.6,
                transition: "all 0.3s ease-in-out"
              }}
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
              <filter id="pricingGlowFilter" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feGaussianBlur stdDeviation="8" result="coloredBlur2"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur2"/>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              
              <filter id="pricingHoverGlowFilter" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feGaussianBlur stdDeviation="4" result="coloredBlur2"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur2"/>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>

            </defs>
          </svg>
        </div>
        
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          <RevealWrapper delay={100}>
            <div className="mx-auto max-w-2xl lg:text-center">
              <h1 className="text-2xl font-bold leading-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 sm:text-3xl lg:text-4xl" style={{ lineHeight: '1.2', paddingBottom: '2px' }}>Preços</h1>
              <p className="mt-3 mb-20 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                Escolha o plano ideal para suas necessidades
              </p>
            </div>
          </RevealWrapper>
          
          <div className="mx-auto mt-12 grid max-w-lg grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-4" style={{ zIndex: 2, position: 'relative' }}>
            {/* Plano Gratuito */}
            <RevealWrapper delay={200}>
              <div className="relative bg-white/5 backdrop-blur-sm border border-blue-400/30 rounded-2xl p-8 min-h-[500px] flex flex-col hover:border-blue-400/50 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04),0_0_20px_rgba(59,130,246,0.1)]">
                <div className="flex-1 flex flex-col">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-white">Gratuito</h3>
                    <p className="mt-4 flex items-baseline justify-center">
                      <span className="text-4xl font-bold tracking-tight text-white">R$ 0,00</span>
                    </p>
                    <p className="mt-6 text-sm text-gray-300">Ideal para experimentar</p>
                  </div>
                  <ul className="flex-1 mt-8 space-y-3">
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <span className="ml-3 text-sm text-gray-300">Buscar termos ilimitado</span>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <span className="ml-3 text-sm text-gray-300">Download ilimitado de diários oficiais</span>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-5 h-5 bg-amber-500/20 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-3 flex items-center gap-2">
                        <span className="text-sm text-gray-300">1 palavra-chave (7 dias)</span>
                        <div className="relative inline-block group">
                          <div className="inline-flex items-center justify-center w-4 h-4 bg-amber-500/20 text-amber-400 rounded-full cursor-help transition-all duration-200 hover:bg-amber-500/30">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none w-64 z-50">
                            <p className="text-center">
                              <strong>Informativo:</strong> Palavras-chave e contextos do Radar IA serão desativados após 7 dias. Ative um plano pago para continuar usando.
                            </p>
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-5 h-5 bg-amber-500/20 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-3 flex items-center gap-2">
                        <span className="text-sm text-gray-300">1 contexto no Radar IA (7 dias)</span>
                        <div className="relative inline-block group">
                          <div className="inline-flex items-center justify-center w-4 h-4 bg-amber-500/20 text-amber-400 rounded-full cursor-help transition-all duration-200 hover:bg-amber-500/30">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none w-64 z-50">
                            <p className="text-center">
                              <strong>Informativo:</strong> Palavras-chave e contextos do Radar IA serão desativados após 7 dias. Ative um plano pago para continuar usando.
                            </p>
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <span className="ml-3 text-sm text-gray-300">Suporte: Padrão</span>
                    </li>
                  </ul>
                  <div className="mt-auto">
                    <button className="w-full bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:border-white/30 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200">
                      Começar grátis
                    </button>
                  </div>
                </div>
              </div>
            </RevealWrapper>

            {/* Plano Básico */}
            <RevealWrapper delay={300}>
              <div className="relative bg-white/5 backdrop-blur-sm border border-blue-400/30 rounded-2xl p-8 min-h-[500px] flex flex-col hover:border-blue-400/50 transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-[0_15px_35px_-5px_rgba(0,0,0,0.1),0_15px_15px_-5px_rgba(0,0,0,0.04),0_0_30px_rgba(59,130,246,0.2)] ring-1 ring-blue-400/20">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">Mais Popular</span>
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-white">Básico</h3>
                    <p className="mt-4 flex items-baseline justify-center">
                      <span className="text-4xl font-bold tracking-tight text-white">R$ 29,90</span>
                      <span className="text-sm text-gray-300 ml-1">/mês</span>
                    </p>
                    <p className="mt-6 text-sm text-gray-300">Para profissionais individuais</p>
                  </div>
                  <ul className="flex-1 mt-8 space-y-3">
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <span className="ml-3 text-sm text-gray-300">Buscar termos ilimitado</span>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <span className="ml-3 text-sm text-gray-300">Download ilimitado de diários oficiais</span>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <span className="ml-3 text-sm text-gray-300">Até 10 palavras-chave</span>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <span className="ml-3 text-sm text-gray-300">1 contexto ativo no Radar IA</span>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <span className="ml-3 text-sm text-gray-300">Suporte: Padrão</span>
                    </li>
                  </ul>
                  <div className="mt-auto">
                    <button className="w-full bg-blue-600 text-white hover:bg-blue-500 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200">
                      Assinar Básico
                    </button>
                  </div>
                </div>
              </div>
            </RevealWrapper>

            {/* Plano Premium */}
            <RevealWrapper delay={400}>
              <div className="relative bg-white/5 backdrop-blur-sm border border-blue-400/30 rounded-2xl p-8 min-h-[500px] flex flex-col hover:border-blue-400/50 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04),0_0_20px_rgba(59,130,246,0.1)]">
                <div className="flex-1 flex flex-col">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-white">Premium</h3>
                    <p className="mt-4 flex items-baseline justify-center">
                      <span className="text-4xl font-bold tracking-tight text-white">R$ 39,90</span>
                      <span className="text-sm text-gray-300 ml-1">/mês</span>
                    </p>
                    <p className="mt-6 text-sm text-gray-300">Para equipes pequenas</p>
                  </div>
                  <ul className="flex-1 mt-8 space-y-3">
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <span className="ml-3 text-sm text-gray-300">Buscar termos ilimitado</span>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <span className="ml-3 text-sm text-gray-300">Download ilimitado de diários oficiais</span>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <span className="ml-3 text-sm text-gray-300">Até 20 palavras-chave</span>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <span className="ml-3 text-sm text-gray-300">Até 3 contextos ativos no Radar IA</span>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-5 h-5 bg-purple-500/20 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <span className="ml-3 text-sm text-gray-300">Suporte: Prioritário</span>
                    </li>
                  </ul>
                  <div className="mt-auto">
                    <button className="w-full bg-blue-600 text-white hover:bg-blue-500 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200">
                      Assinar Premium
                    </button>
                  </div>
                </div>
              </div>
            </RevealWrapper>

            {/* Plano Empresarial */}
            <RevealWrapper delay={500}>
              <div className="relative bg-white/5 backdrop-blur-sm border border-blue-400/30 rounded-2xl p-8 min-h-[500px] flex flex-col hover:border-blue-400/50 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04),0_0_20px_rgba(59,130,246,0.1)]">
                <div className="flex-1 flex flex-col">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-white">Empresarial</h3>
                    <p className="mt-4 flex items-baseline justify-center">
                      <span className="text-4xl font-bold tracking-tight text-white">Personalizado</span>
                    </p>
                    <p className="mt-6 text-sm text-gray-300">Para grandes organizações</p>
                  </div>
                  <ul className="flex-1 mt-8 space-y-3">
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <span className="ml-3 text-sm text-gray-300">Buscar termos ilimitado</span>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <span className="ml-3 text-sm text-gray-300">Download ilimitado de diários oficiais</span>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <span className="ml-3 text-sm text-gray-300">Palavras-chave ilimitadas</span>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <span className="ml-3 text-sm text-gray-300">Contextos ilimitados no Radar IA</span>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <span className="ml-3 text-sm text-gray-300">Suporte: Dedicado</span>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <span className="ml-3 text-sm text-gray-300">Acesso via API</span>
                    </li>
                  </ul>
                  <div className="mt-auto">
                    <button className="w-full bg-indigo-600 text-white hover:bg-indigo-500 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200">
                      Contatar Vendas
                    </button>
                  </div>
                </div>
              </div>
            </RevealWrapper>
          </div>
          
          {/* Rodapé com informação sobre pagamentos */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-400">
              Pagamentos recorrentes até que sejam cancelados na nossa própria plataforma.
            </p>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div id="testimonials" className="py-16 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-xl text-center mb-12 sm:mb-16">
            <h1 className="text-2xl font-bold leading-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 sm:text-3xl lg:text-4xl" style={{ lineHeight: '1.2', paddingBottom: '2px' }}>Depoimentos</h1>
            <p className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
              O que nossos clientes dizem
            </p>
          </div>
          <TestimonialsCarousel />
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600/20 backdrop-blur-sm ring-1 ring-blue-400/30">
        <div className="px-6 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <RevealWrapper delay={100}>
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                Pronto para usar inteligência artificial no monitoramento dos diários oficiais?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-200 sm:text-lg sm:leading-8 sm:mt-6">
                Experimente a nossa mais nova e poderosa ferramenta Radar IA e receba editais e publicações já resumidas para você focar no que realmente importa.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6 sm:mt-10">
                <a
                  href="#contact"
                  className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-4 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:px-8 sm:py-4"
                  style={{ pointerEvents: 'auto' }}
                >
                  <svg className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Ativar Radar IA grátis
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-20"></div>
                </a>
                <Link href="/precos" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm px-6 py-4 text-base font-semibold text-white transition-all duration-300 hover:border-blue-400/50 hover:bg-white/10 hover:text-blue-300 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:px-8 sm:py-4" style={{ pointerEvents: 'auto' }}>
                  Ver planos 
                  <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </RevealWrapper>
        </div>
      </div>

      

    </div>
  );
}