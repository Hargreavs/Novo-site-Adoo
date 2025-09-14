'use client';

import { useEffect, useRef, useState } from 'react';
import { StarIcon } from '@heroicons/react/24/outline';

export default function TestimonialsCarousel() {
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const testimonials = [
    {
      name: 'Carlos Mendes',
      role: 'Advogado',
      content: 'Consegui acompanhar todas as mudanças na legislação trabalhista em tempo real. O Radar IA me notificou sobre alterações que eu teria perdido nos sites oficiais.',
      rating: 5
    },
    {
      name: 'Ana Paula Silva',
      role: 'Empresária',
      content: 'Acompanho licitações do governo há anos, mas nunca foi tão fácil. Recebo alertas personalizados e resumos que me poupam horas de leitura.',
      rating: 5
    },
    {
      name: 'Roberto Santos',
      role: 'Concurseiro',
      content: 'Fui nomeado no concurso da Receita Federal! Descobri o edital no mesmo dia da publicação graças aos alertas do Adoo.',
      rating: 5
    },
    {
      name: 'Mariana Costa',
      role: 'Concurseira',
      content: 'Os novos editais chegam com todos os detalhes já resumidos. Não preciso mais ficar lendo páginas e páginas de texto técnico.',
      rating: 5
    },
    {
      name: 'João Oliveira',
      role: 'Jornalista',
      content: 'Acompanho publicações oficiais do governo diariamente. O Adoo me ajuda a não perder nenhuma informação importante para minhas reportagens.',
      rating: 5
    },
    {
      name: 'Patricia Lima',
      role: 'Gestora Pública',
      content: 'Como secretária municipal, preciso estar sempre atualizada. O Radar IA me entrega resumos das publicações que realmente importam para nossa cidade.',
      rating: 5
    },
    {
      name: 'Fernando Rocha',
      role: 'Contador',
      content: 'Acompanho mudanças na legislação tributária e fiscal. O Adoo me notifica sobre portarias e instruções normativas que afetam meus clientes.',
      rating: 5
    },
    {
      name: 'Lucia Ferreira',
      role: 'Procuradora',
      content: 'Trabalho com licitações e contratos públicos. O sistema de alertas me mantém sempre informada sobre novas normas e jurisprudências.',
      rating: 5
    },
    {
      name: 'Marcos Alves',
      role: 'Estudante de Direito',
      content: 'Estou me preparando para a OAB e o Adoo me ajuda a acompanhar as mudanças na legislação que caem nas provas.',
      rating: 5
    },
    {
      name: 'Cristina Souza',
      role: 'Assessora Jurídica',
      content: 'Trabalho em um escritório que atende empresas públicas. O Adoo me mantém atualizada sobre todas as publicações relevantes para nossos clientes.',
      rating: 5
    }
  ];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scrollSpeed = 1; // pixels por frame - aumentado para ser mais visível
    let animationId: number;
    let running = true;
    let originalWidth = 0;

    const recalc = () => {
      // Como duplicamos a lista, a metade é o conjunto original
      originalWidth = Math.max(0, container.scrollWidth / 2);
      console.log('Testimonials - Original width:', originalWidth, 'Scroll width:', container.scrollWidth);
    };

    // Recalcula em resize
    const ro = new ResizeObserver(recalc);
    ro.observe(container);
    
    // Recalcula imediatamente
    setTimeout(recalc, 100);

    const scroll = () => {
      if (!isPaused && running && container) {
        container.scrollLeft += scrollSpeed;
        
        // Reset scroll quando chegar ao final do primeiro conjunto
        if (originalWidth > 0 && container.scrollLeft >= originalWidth) {
          container.scrollLeft -= originalWidth;
        }
      }
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);

    return () => {
      running = false;
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      ro.disconnect();
    };
  }, [isPaused]);

  return (
    <div className="carousel-fade-container relative">
      <div
        ref={containerRef}
        className="flex carousel-scroll scrollbar-hide gap-4 sm:gap-6 py-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Duplicar os depoimentos para loop contínuo */}
        {[...testimonials, ...testimonials].map((testimonial, index) => (
          <div
            key={`${testimonial.name}-${index}`}
            className="carousel-item group flex-none w-72 sm:w-80 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4 sm:p-6 shadow-lg/10 hover:bg-white/7.5 hover:shadow-xl/20 hover:scale-105 hover:border-blue-400/30 transition-all duration-500 cursor-pointer"
          >
            <div className="flex flex-col h-full group-hover:transform group-hover:translate-y-[-4px] transition-transform duration-500">
              <blockquote className="text-white flex-1 group-hover:text-blue-100 transition-colors duration-300">
                <p className="text-xs sm:text-sm leading-relaxed">&ldquo;{testimonial.content}&rdquo;</p>
              </blockquote>
              <figcaption className="mt-3 sm:mt-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white text-xs sm:text-sm group-hover:text-blue-200 transition-colors duration-300">{testimonial.name}</div>
                  <div className="text-gray-300 text-xs group-hover:text-gray-200 transition-colors duration-300">{testimonial.role}</div>
                </div>
                <div className="flex text-blue-400 group-hover:text-blue-300 transition-colors duration-300">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="h-3 w-3 sm:h-4 sm:w-4 fill-current group-hover:scale-110 transition-transform duration-300" />
                  ))}
                </div>
              </figcaption>
            </div>
          </div>
        ))}
      </div>
      
      {/* Indicador de pausa */}
      {isPaused && (
        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm z-20">
          Pausado
        </div>
      )}
    </div>
  );
}
