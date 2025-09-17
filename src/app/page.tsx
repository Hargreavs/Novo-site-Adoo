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
import TestModal from '@/components/TestModal';
import ContactSalesModal from '@/components/ContactSalesModal';

export default function Home() {
  const heroRef = useRef<HTMLElement>(null);
  const parallaxImageRef = useRef<HTMLDivElement>(null);
  const [isHeroVisible, setIsHeroVisible] = useState(true);
  const [trialForm, setTrialForm] = useState({ name: '', email: '' });
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isContactSalesModalOpen, setIsContactSalesModalOpen] = useState(false);
  
  // Estados para busca
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tudo');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [showScrollCue, setShowScrollCue] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredLine, setHoveredLine] = useState<string | null>(null);
  const [glowIntensity, setGlowIntensity] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const handleTrialSubmit = () => {
    console.log('Button clicked - opening modal');
    setIsTestModalOpen(true);
  };

  const handlePricingTrialSubmit = () => {
    console.log('Pricing button clicked - opening modal with pre-filled data');
    setIsTestModalOpen(true);
  };

  // Cleanup do timer
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  // Sugestões mockadas para autocomplete
  const mockSuggestions = [
    'concurso público',
    'concurso TRT',
    'concurso federal',
    'concurso estadual',
    'concurso municipal',
    'licitação pública',
    'licitação federal',
    'licitação estadual',
    'licitação municipal',
    'edital de concurso',
    'edital de licitação',
    'processo administrativo',
    'processo judicial',
    'STF',
    'STJ',
    'TST',
    'TRT',
    'Prefeitura de São Paulo',
    'Governo Federal',
    'Assembleia Legislativa'
  ];

  // Função para filtrar sugestões com debounce
  const filterSuggestions = (term: string) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      if (term.length >= 2) {
        const filtered = mockSuggestions
          .filter(suggestion => 
            suggestion.toLowerCase().includes(term.toLowerCase())
          )
          .slice(0, 6);
        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 150);

    setDebounceTimer(timer);
  };

  // Função para lidar com mudança no input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSelectedIndex(-1);
    filterSuggestions(value);
  };

  // Função para lidar com foco no input
  const handleInputFocus = () => {
    if (searchTerm.length >= 2 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Função para selecionar sugestão
  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    // Executar busca automaticamente
    handleSearch();
  };

  // Função para fechar sugestões
  const closeSuggestions = () => {
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  // Função para limpar input
  const clearInput = () => {
    setSearchTerm('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  // Função para navegação por teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        e.preventDefault();
        closeSuggestions();
        break;
    }
  };

  // Função de busca
  const handleSearch = () => {
    if (searchTerm.trim()) {
      console.log('Buscando por:', searchTerm);
      setShowSuggestions(false);
      // Aqui você pode implementar a lógica de busca
      // Por exemplo, redirecionar para a página de resultados
    }
  };

  // Função para lidar com Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  const [selectedContext, setSelectedContext] = useState<string>('concurso');
  const animatedLinesRef = useRef<HTMLDivElement>(null);
  const [hoveredPricingLine, setHoveredPricingLine] = useState<string | null>(null);
  const [pricingGlowIntensity, setPricingGlowIntensity] = useState(0);
  const [isHoveringPricing, setIsHoveringPricing] = useState(false);
  const pricingLinesRef = useRef<HTMLDivElement>(null);
  const [isMouseOverPricing, setIsMouseOverPricing] = useState(false);
  const [glowPosition, setGlowPosition] = useState({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | null>(null);

  // Helper functions para gerar filtros de brilho
  const getMainGlowFilter = () => "drop-shadow(0 0 20px rgba(59,130,246,0.8)) drop-shadow(0 0 40px rgba(139,92,246,0.6)) drop-shadow(0 0 60px rgba(168,85,247,0.4)) drop-shadow(0 0 80px rgba(236,72,153,0.2))";
  const getLeftGlowFilter = () => "drop-shadow(0 0 20px rgba(139,92,246,0.8)) drop-shadow(0 0 40px rgba(59,130,246,0.6)) drop-shadow(0 0 60px rgba(168,85,247,0.4)) drop-shadow(0 0 80px rgba(236,72,153,0.2))";
  const getTopGlowFilter = () => "drop-shadow(0 0 20px rgba(236,72,153,0.8)) drop-shadow(0 0 40px rgba(139,92,246,0.6)) drop-shadow(0 0 60px rgba(168,85,247,0.4)) drop-shadow(0 0 80px rgba(59,130,246,0.2))";
  const getRightGlowFilter = () => "drop-shadow(0 0 16px rgba(139,92,246,0.8)) drop-shadow(0 0 32px rgba(59,130,246,0.6)) drop-shadow(0 0 48px rgba(168,85,247,0.4))";



  // Mouse glow effect - Efeito de brilho que percorre as linhas
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (animatedLinesRef.current) {
        const rect = animatedLinesRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setMousePosition({ x, y });

        // Detecção mais precisa baseada na proximidade das linhas
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const viewportWidth = rect.width;
        const viewportHeight = rect.height;
        const scaleX = viewportWidth / 1920;
        const scaleY = viewportHeight / 1080;
        
        let detectedLine = null;
        let intensity = 0;

        // Pontos dos contornos (em coordenadas do viewBox 1920x1080)
        const contourLines = [
          {
            id: 'contour-main',
            points: [
              { x: 220, y: 560 },
              { x: 1505, y: 360 },
              { x: 1855, y: 1040 },
              { x: 140, y: 1040 }
            ]
          },
          {
            id: 'contour-left',
            points: [
              { x: 0, y: 140 },
              { x: 700, y: 10 },
              { x: 630, y: 170 },
              { x: 120, y: 380 }
            ]
          },
          {
            id: 'contour-top',
            points: [
              { x: 1040, y: 10 },
              { x: 1910, y: 150 },
              { x: 1760, y: 320 },
              { x: 900, y: 250 }
            ]
          },
          {
            id: 'contour-right',
            points: [
              { x: 1290, y: 440 },
              { x: 1635, y: 380 },
              { x: 1918, y: 1080 },
              { x: 1490, y: 1080 }
            ]
          }
        ];

        let closestLine = null;
        let minDistance = Infinity;

        contourLines.forEach(line => {
          // Calcular distância mínima do mouse para a linha
          let lineMinDistance = Infinity;
          // Escalar pontos do viewBox para pixels atuais
          const scaledPoints = line.points.map(p => ({ x: p.x * scaleX, y: p.y * scaleY }));

          for (let i = 0; i < scaledPoints.length; i++) {
            const p1 = scaledPoints[i];
            const p2 = scaledPoints[(i + 1) % scaledPoints.length]; // fecha o polígono
            
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

        // Ativar hover se estiver próximo o suficiente
        const detectionRadius = 200; // Aumentei o raio de detecção
        if (minDistance < detectionRadius) {
          // Intensidade aumenta conforme o mouse se aproxima da linha (distância menor = brilho maior)
          intensity = Math.max(0, (1 - (minDistance / detectionRadius)) * 1.2); // Aumentei a intensidade máxima
          detectedLine = closestLine;
        }
        
        setHoveredLine(detectedLine);
        setGlowIntensity(intensity);
        setIsHovering(intensity > 0);
      }
    };

    const handleMouseLeave = () => {
      setMousePosition({ x: -100, y: -100 });
      setHoveredLine(null);
      setGlowIntensity(0);
      setIsHovering(false);
    };

    const linesContainer = animatedLinesRef.current;
    if (linesContainer) {
      linesContainer.addEventListener('mousemove', handleMouseMove);
      linesContainer.addEventListener('mouseleave', handleMouseLeave);
      return () => {
        linesContainer.removeEventListener('mousemove', handleMouseMove);
        linesContainer.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, []);


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


  const features = [
    {
      icon: DocumentTextIcon,
      title: 'Radar IA',
      description: 'Nossa inteligência artificial lê os editais e já entrega o resumo mastigado, com os principais pontos que você precisa saber.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Alertas personalizados',
      description: 'Cadastre alertas (concursos, licitações, nomes, CNPJs) e seja avisado na hora em que forem publicadas nos diários oficiais de seu interesse.'
    },
    {
      icon: ClockIcon,
      title: 'Central unificada',
      description: 'Pesquise em diferentes diários oficiais em um só lugar, sem precisar abrir dezenas de sites.'
    },
    {
      icon: CloudIcon,
      title: 'Notificação em tempo real',
      description: 'Receba alertas por e-mail, SMS e push assim que seu alerta for publicada.'
    }
  ];


  return (
    <div className="bg-transparent">
      <TransparentHeader 
        currentPage="" 
        onTrialClick={() => setIsTestModalOpen(true)} 
      />

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
          ref={animatedLinesRef}
          className="absolute inset-0 pointer-events-auto overflow-hidden"
          style={{ zIndex: 20 }}
        >
          <svg 
            className="absolute inset-0 w-full h-full" 
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1920 1080"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            {/* Gradientes para as linhas da hero section */}
            <defs>
              {/* Gradientes sutis das linhas da hero section */}
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(59, 130, 246, 0)" />
                <stop offset="20%" stopColor="rgba(59, 130, 246, 0.15)" />
                <stop offset="50%" stopColor="rgba(139, 92, 246, 0.25)" />
                <stop offset="80%" stopColor="rgba(59, 130, 246, 0.15)" />
                <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
              </linearGradient>

              <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(139, 92, 246, 0)" />
                <stop offset="30%" stopColor="rgba(139, 92, 246, 0.1)" />
                <stop offset="60%" stopColor="rgba(59, 130, 246, 0.2)" />
                <stop offset="100%" stopColor="rgba(139, 92, 246, 0)" />
              </linearGradient>

              <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(236, 72, 153, 0)" />
                <stop offset="25%" stopColor="rgba(236, 72, 153, 0.1)" />
                <stop offset="75%" stopColor="rgba(139, 92, 246, 0.15)" />
                <stop offset="100%" stopColor="rgba(236, 72, 153, 0)" />
              </linearGradient>


            </defs>

            {/* Overlay de contornos dos jornais */}
            <g style={{ mixBlendMode: 'screen', opacity: 0.8 }}>
              {/* CONTORNO PRINCIPAL – jornal grande central (parte inferior) */}
              <path
                id="contour-main"
                d="
                  M220,560
                  L1505,360
                  L1855,1040
                  L140,1040
                  Z
                "
                fill="none"
                transform="translate(0, 10)"
                stroke="url(#gradient1)"
                strokeWidth={hoveredLine === 'contour-main' ? 2.5 : 1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  pointerEvents: 'stroke',
                  vectorEffect: 'non-scaling-stroke',
                  // linha contínua (sem dash)
                  opacity: hoveredLine === 'contour-main' ? 0.95 : 0.65,
                  filter: hoveredLine === 'contour-main' ? getMainGlowFilter() : "none",
                  transition: "all .2s ease"
                }}
                onMouseEnter={() => setHoveredLine('contour-main')}
                onMouseLeave={() => setHoveredLine(null)}
              />

              {/* CONTORNO SUPERIOR-ESQUERDO – jornal ao topo esquerdo */}
              <path
                id="contour-left"
                d="
                  M0,140
                  L700,10
                  L630,170
                  L120,380
                  Z
                "
                fill="none"
                transform="translate(-10, -10)"
                stroke="url(#gradient2)"
                strokeWidth={hoveredLine === 'contour-left' ? 2.5 : 1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  pointerEvents: 'stroke',
                  vectorEffect: 'non-scaling-stroke',
                  // linha contínua (sem dash)
                  opacity: hoveredLine === 'contour-left' ? 0.95 : 0.6,
                  filter: hoveredLine === 'contour-left' ? getLeftGlowFilter() : "none",
                  transition: "all .2s ease"
                }}
                onMouseEnter={() => setHoveredLine('contour-left')}
                onMouseLeave={() => setHoveredLine(null)}
              />

              {/* CONTORNO SUPERIOR – jornal de fundo no topo */}
              <path
                id="contour-top"
                d="
                  M1040,10
                  L1910,150
                  L1760,320
                  L900,250
                  Z
                "
                fill="none"
                transform="translate(0, -18)"
                stroke="url(#gradient3)"
                strokeWidth={hoveredLine === 'contour-top' ? 2.5 : 1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  pointerEvents: 'stroke',
                  vectorEffect: 'non-scaling-stroke',
                  // linha contínua (sem dash)
                  opacity: hoveredLine === 'contour-top' ? 0.95 : 0.6,
                  filter: hoveredLine === 'contour-top' ? getTopGlowFilter() : "none",
                  transition: "all .2s ease"
                }}
                onMouseEnter={() => setHoveredLine('contour-top')}
                onMouseLeave={() => setHoveredLine(null)}
              />

              {/* CONTORNO DIREITO – jornal grande à direita */}
              <path
                id="contour-right"
                d="
                  M1290,440
                  L1635,380
                  L1918,1080
                  L1490,1080
                  Z
                "
                fill="none"
                transform="translate(-8, 0)"
                stroke="url(#gradient2)"
                strokeWidth={hoveredLine === 'contour-right' ? 2.5 : 1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  pointerEvents: 'stroke',
                  vectorEffect: 'non-scaling-stroke',
                  // linha contínua (sem dash)
                  opacity: hoveredLine === 'contour-right' ? 0.95 : 0.6,
                  filter: hoveredLine === 'contour-right' ? getRightGlowFilter() : "none",
                  transition: "all .2s ease"
                }}
                onMouseEnter={() => setHoveredLine('contour-right')}
                onMouseLeave={() => setHoveredLine(null)}
              />
            </g>


          </svg>
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
                  Pesquise em todos os <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400" style={{ lineHeight: '1.2', paddingBottom: '2px' }}>Diários Oficiais</span> do Brasil
                </h1>
                <p className="text-xs leading-5 text-gray-300 sm:text-sm sm:leading-6 md:text-base max-w-xl mx-auto">
                  Digite um termo e encontre publicações em mais de 2.500 diários oficiais, em todas as esferas e poderes.
                </p>
                
                {/* Componentes Soltos na Hero Section - Estilo Jusbrasil */}
                <div className="mt-10 max-w-4xl mx-auto sm:mt-12 space-y-6" style={{ pointerEvents: 'auto' }}>
                  {/* Campo de Busca Principal Integrado - Solto */}
                  <div className="relative max-w-2xl mx-auto">
                    <div className="relative w-full">
                      <input
                        type="text"
                        placeholder="Digite nome, CPF, processo ou termo..."
                        value={searchTerm}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onFocus={handleInputFocus}
                        onBlur={() => setTimeout(closeSuggestions, 200)}
                        className="w-full pl-4 pr-24 py-4 bg-white/10 border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400/60 focus:border-blue-400/40 focus:shadow-lg focus:shadow-blue-400/20 transition-all duration-200 text-base sm:text-lg"
                        style={{ pointerEvents: 'auto' }}
                        autoComplete="off"
                        role="combobox"
                        aria-expanded={showSuggestions}
                        aria-haspopup="listbox"
                        aria-autocomplete="list"
                      />
                      
                      {/* Botão de Limpar */}
                      {searchTerm && (
                        <button 
                          onClick={clearInput}
                          className="absolute top-1/2 right-14 transform -translate-y-1/2 w-7 h-7 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-200 group flex items-center justify-center"
                          style={{ pointerEvents: 'auto' }}
                          type="button"
                          aria-label="Limpar busca"
                        >
                          <svg className="h-3 w-3 text-gray-300 group-hover:text-white transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                      
                      {/* Botão de Busca Discreto - Estilo Escavador */}
                      <button 
                        onClick={handleSearch}
                        className="absolute top-1/2 right-3 transform -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-200 group flex items-center justify-center"
                        style={{ pointerEvents: 'auto' }}
                        type="button"
                        aria-label="Buscar"
                      >
                        <svg className="h-4 w-4 text-gray-300 group-hover:text-white group-hover:scale-110 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Menu Suspenso de Sugestões */}
                    {showSuggestions && suggestions.length > 0 && (
                      <div 
                        className="absolute top-full left-0 right-0 mt-2 bg-gray-900/90 backdrop-blur-sm border border-white/30 rounded-2xl shadow-2xl z-50 max-h-60 overflow-y-auto"
                        role="listbox"
                        aria-label="Sugestões de busca"
                      >
                        {suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className={`w-full px-4 py-3 text-left text-white transition-all duration-200 flex items-center gap-3 first:rounded-t-2xl last:rounded-b-2xl ${
                              selectedIndex === index 
                                ? 'bg-blue-500/30 border-l-2 border-blue-400' 
                                : 'hover:bg-blue-500/20'
                            }`}
                            role="option"
                            aria-selected={selectedIndex === index}
                          >
                            <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <span className="flex-1">
                              {suggestion.split(new RegExp(`(${searchTerm})`, 'gi')).map((part, i) => 
                                part.toLowerCase() === searchTerm.toLowerCase() ? (
                                  <strong key={i} className="text-blue-300">{part}</strong>
                                ) : (
                                  <span key={i}>{part}</span>
                                )
                              )}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Categorias de Busca */}
                  <div className="flex flex-wrap justify-center gap-3 mt-6" style={{ transform: 'translateZ(0)' }}>
                    {['Tudo', 'Diários Oficiais', 'Processos'].map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => {
                          console.log('Categoria selecionada:', category);
                          setSelectedCategory(category);
                        }}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 cursor-pointer relative z-10 ${
                          selectedCategory === category
                            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                            : 'bg-white/10 text-gray-300 border border-white/20 hover:bg-blue-500/20 hover:border-blue-400 hover:text-white'
                        }`}
                        style={{ 
                          pointerEvents: 'auto',
                          willChange: 'auto'
                        }}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
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
                opacity: hoveredPricingLine === 'pricingLine1' ? 1.0 : 0.8,
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
                opacity: hoveredPricingLine === 'pricingLine2' ? 1.0 : 0.8,
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
                opacity: hoveredPricingLine === 'pricingLine3' ? 1.0 : 0.8,
                transition: "all 0.3s ease-in-out"
              }}
            />
            
            {/* Gradients */}
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(59, 130, 246, 0.5)" />
                <stop offset="50%" stopColor="rgba(139, 92, 246, 0.7)" />
                <stop offset="100%" stopColor="rgba(59, 130, 246, 0.5)" />
              </linearGradient>
              <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(139, 92, 246, 0.5)" />
                <stop offset="50%" stopColor="rgba(168, 85, 247, 0.7)" />
                <stop offset="100%" stopColor="rgba(139, 92, 246, 0.5)" />
              </linearGradient>
              <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(168, 85, 247, 0.5)" />
                <stop offset="50%" stopColor="rgba(59, 130, 246, 0.7)" />
                <stop offset="100%" stopColor="rgba(168, 85, 247, 0.5)" />
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
              <h1 className="text-xl font-bold leading-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 sm:text-2xl lg:text-3xl" style={{ lineHeight: '1.2', paddingBottom: '2px' }}>Preços</h1>
              <p className="mt-3 mb-8 text-xl font-bold tracking-tight text-white sm:text-2xl lg:text-3xl">
                Experimente antes de você pagar
              </p>
            </div>
          </RevealWrapper>
          
          {/* Formulário de Teste Gratuito */}
          <RevealWrapper delay={200}>
            <div className="mx-auto max-w-4xl">
              <div className="bg-white/3 backdrop-blur-sm border border-blue-400/30 rounded-2xl p-8 hover:border-blue-400/50 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04),0_0_20px_rgba(59,130,246,0.1)] group relative overflow-hidden">
                {/* Efeito de brilho interno no hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-indigo-400/10 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                <div className="flex flex-col sm:flex-row gap-4 items-end relative z-10">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nome
                    </label>
                    <input
                      type="text"
                      value={trialForm.name}
                      onChange={(e) => setTrialForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors text-white placeholder-gray-400"
                      placeholder="Seu nome completo"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      E-mail
                    </label>
                    <input
                      type="email"
                      value={trialForm.email}
                      onChange={(e) => setTrialForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors text-white placeholder-gray-400"
                      placeholder="seu@email.com"
                    />
                  </div>
                  <button
                    onClick={handlePricingTrialSubmit}
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Iniciar teste gratuito
                  </button>
                </div>
                <p className="text-sm text-gray-400 mt-4 text-center relative z-10">
                  Todos os nossos recursos ficam disponíveis no plano gratuito por <strong>7 dias</strong>. Depois escolha o plano ideal para as suas necessidades.
                </p>
              </div>
            </div>
          </RevealWrapper>

          <div className="mx-auto mt-12 grid max-w-none grid-cols-1 gap-6 lg:grid-cols-4 px-4" style={{ zIndex: 2, position: 'relative' }}>
            {/* Plano Gratuito */}
            <RevealWrapper delay={200}>
              <div className="relative bg-white/3 backdrop-blur-sm border border-blue-400/30 rounded-2xl p-8 min-h-[500px] flex flex-col hover:border-blue-400/50 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04),0_0_20px_rgba(59,130,246,0.1)]">
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
                        <div className="w-5 h-5 bg-gray-500/20 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-3 flex items-center gap-2">
                        <div className="relative inline-block group">
                          <span className="text-sm text-gray-300 cursor-help underline decoration-dashed decoration-white" style={{ textUnderlineOffset: '1px' }}>
                            1 alerta <span className="font-bold text-white">(7 dias)</span>
                          </span>
                          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-4 py-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 pointer-events-none w-64 border border-gray-600/30" style={{ zIndex: 99999 }}>
                            <div className="text-center">
                              <p className="font-medium text-yellow-400 mb-1 text-sm">Limitação de 7 dias</p>
                              <p className="text-gray-400 leading-relaxed text-xs">
                                Alertas e contextos do Radar IA serão desativados após 7 dias. Ative um plano pago para continuar usando.
                              </p>
                            </div>
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-5 h-5 bg-gray-500/20 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-3 flex items-center gap-2">
                        <div className="relative inline-block group">
                          <span className="text-sm text-gray-300 cursor-help underline decoration-dashed decoration-white" style={{ textUnderlineOffset: '1px' }}>
                            1 contexto no Radar IA <span className="font-bold text-white">(7 dias)</span>
                          </span>
                          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-4 py-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 pointer-events-none w-64 border border-gray-600/30" style={{ zIndex: 99999 }}>
                            <div className="text-center">
                              <p className="font-medium text-yellow-400 mb-1 text-sm">Limitação de 7 dias</p>
                              <p className="text-gray-400 leading-relaxed text-xs">
                                Alertas e contextos do Radar IA serão desativados após 7 dias. Ative um plano pago para continuar usando.
                              </p>
                            </div>
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
                </div>
              </div>
            </RevealWrapper>

            {/* Plano Básico */}
            <RevealWrapper delay={300}>
              <div className="relative bg-white/3 backdrop-blur-sm border border-blue-400/30 rounded-2xl p-8 min-h-[500px] flex flex-col hover:border-blue-400/50 transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-[0_15px_35px_-5px_rgba(0,0,0,0.1),0_15px_15px_-5px_rgba(0,0,0,0.04),0_0_30px_rgba(59,130,246,0.2)] ring-1 ring-blue-400/20">
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
                      <span className="ml-3 text-sm text-gray-300">Até 10 alertas</span>
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
                </div>
              </div>
            </RevealWrapper>

            {/* Plano Premium */}
            <RevealWrapper delay={400}>
              <div className="relative bg-white/3 backdrop-blur-sm border border-blue-400/30 rounded-2xl p-8 min-h-[500px] flex flex-col hover:border-blue-400/50 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04),0_0_20px_rgba(59,130,246,0.1)]">
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
                      <span className="ml-3 text-sm text-gray-300">Até 20 alertas</span>
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
                        <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <span className="ml-3 text-sm text-gray-300">Suporte: Prioritário</span>
                    </li>
                  </ul>
                </div>
              </div>
            </RevealWrapper>

            {/* Plano Empresarial */}
            <RevealWrapper delay={500}>
              <div className="relative bg-white/3 backdrop-blur-sm border border-blue-400/30 rounded-2xl p-8 min-h-[500px] flex flex-col hover:border-blue-400/50 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04),0_0_20px_rgba(59,130,246,0.1)]">
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
                      <span className="ml-3 text-sm text-gray-300">Alertas ilimitados</span>
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
                    <button 
                      onClick={() => setIsContactSalesModalOpen(true)}
                      className="w-full bg-indigo-600 text-white hover:bg-indigo-500 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200"
                    >
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
            <h1 className="text-xl font-bold leading-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 sm:text-2xl lg:text-3xl" style={{ lineHeight: '1.2', paddingBottom: '2px' }}>Depoimentos</h1>
            <p className="mt-2 text-xl font-bold tracking-tight text-white sm:text-2xl lg:text-3xl">
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
              <div className="mt-8 flex justify-center sm:mt-10">
                <Link
                  href="/radar-ia?onboarding=1"
                  className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-4 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:px-8 sm:py-4"
                  style={{ pointerEvents: 'auto' }}
                >
                  <svg className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Ativar Radar IA grátis
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-20"></div>
                </Link>
              </div>
            </div>
          </RevealWrapper>
        </div>
      </div>

      {/* Test Modal */}
      <TestModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        preFilledData={trialForm.name && trialForm.email ? {
          name: trialForm.name,
          email: trialForm.email
        } : undefined}
      />

      {/* Contact Sales Modal */}
      <ContactSalesModal
        isOpen={isContactSalesModalOpen}
        onClose={() => setIsContactSalesModalOpen(false)}
      />

    </div>
  );
}