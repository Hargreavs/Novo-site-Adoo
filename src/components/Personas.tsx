'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  BriefcaseIcon,
  ScaleIcon,
  BellAlertIcon,
  NewspaperIcon,
} from '@heroicons/react/24/outline';

export default function Personas() {
  const sectionRef = useRef<HTMLElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);


  /* ========= CARROSSEL: loop contínuo e estável ========= */
  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;

    const SPEED = 1; // px/frame - aumentado para ser mais visível
    let rafId = 0;
    let running = true;
    let originalWidth = 0;

    const recalc = () => {
      // Como duplicamos a lista, a metade é o conjunto original
      originalWidth = Math.max(0, el.scrollWidth / 2);
      console.log('Personas - Original width:', originalWidth, 'Scroll width:', el.scrollWidth);
    };

    // Recalcula em resize/quando imagens terminam de carregar
    const ro = new ResizeObserver(recalc);
    ro.observe(el);

    // Recalcula imediatamente
    setTimeout(recalc, 100);

    const imgs = Array.from(el.querySelectorAll('img'));
    let pending = imgs.length;
    if (pending === 0) {
      setTimeout(recalc, 100);
    }
    imgs.forEach((img) => {
      const onDone = () => {
        pending -= 1;
        if (pending === 0) {
          setTimeout(recalc, 100);
        }
      };
      if ((img as HTMLImageElement).complete) onDone();
      else {
        img.addEventListener('load', onDone, { once: true });
        img.addEventListener('error', onDone, { once: true });
      }
    });

    const tick = () => {
      if (!isPaused && running && el) {
        el.scrollLeft += SPEED;
        if (originalWidth > 0 && el.scrollLeft >= originalWidth) {
          // volta um "conjunto" sem salto visual
          el.scrollLeft -= originalWidth;
        }
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, [isPaused]);

  const personas = [
    {
      key: 'gestora',
      title: 'Empresários',
      icon: BriefcaseIcon,
      alt: 'Empresário usando o Adoo no celular',
      src: '/personas/gestora.png',
      text:
        'Acompanham licitações, decisões e publicações relevantes em tempo real.',
      quote: 'Hoje eu recebo tudo resumido pelo Radar IA.',
    },
    {
      key: 'direito',
      title: 'Profissionais do direito',
      icon: ScaleIcon,
      alt: 'Profissional do direito usando o Adoo no celular',
      src: '/personas/direito.png',
      text:
        'Monitoram mudanças na legislação, prazos e publicações sem abrir dezenas de sites.',
      quote: 'Economizo horas graças aos resumos do Adoo.',
    },
    {
      key: 'concurseiro',
      title: 'Concurseiros',
      icon: BellAlertIcon,
      alt: 'Concurseiro estudando com notebook e usando o Adoo',
      src: '/personas/concurseiro.png',
      text: 'Recebem alertas no mesmo dia da publicação do edital.',
      quote: 'Descobri meu concurso assim que saiu o edital.',
    },
    {
      key: 'jornalista',
      title: 'Jornalistas',
      icon: NewspaperIcon,
      alt: 'Jornalista usando o Adoo no laptop',
      src: '/personas/jornalista.png',
      text:
        'Acompanham nomeações, exonerações e atos do governo publicados oficialmente.',
      quote: 'Antecipo notícias importantes antes da concorrência.',
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-16 md:py-24"
      aria-labelledby="personas-title"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Título e Subtítulo */}
        <div className="mx-auto max-w-2xl text-center mb-12 sm:mb-16">
          <h2
            id="personas-title"
            className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl"
          >
            Feito para quem não pode perder nenhuma publicação
          </h2>
          <p className="mt-3 text-base leading-7 text-gray-300 sm:text-lg sm:leading-8">
            O Adoo atende empresários, profissionais do direito, concurseiros e
            jornalistas que precisam acompanhar os Diários Oficiais com rapidez
            e segurança.
          </p>
        </div>

        {/* Carrossel */}
        <div className="carousel-fade-container relative">
          <div
            ref={carouselRef}
            className="flex carousel-scroll scrollbar-hide gap-4 sm:gap-6 md:gap-8 py-4"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              scrollBehavior: 'auto', // evita smooth involuntário
            }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* duplicamos os itens para o loop contínuo */}
            {[...personas, ...personas].map((persona, index) => {
              const Icon = persona.icon;
              return (
                <div
                  key={`${persona.key}-${index}`}
                  className="carousel-item flex-none w-72 sm:w-80 md:w-72 lg:w-80"
                >
                  <div className="group relative bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-blue-400/30 transition-all duration-500 cursor-pointer h-full overflow-hidden">
                    {/* Imagem */}
                    <div className="relative h-[320px] sm:h-[380px] md:h-[420px] lg:h-[440px] w-full ring-1 ring-white/5 rounded-t-2xl overflow-hidden">
                      <Image
                        src={persona.src}
                        alt={persona.alt}
                        fill
                        sizes="(max-width: 640px) 288px, (max-width: 768px) 320px, (max-width: 1024px) 288px, 320px"
                        className="object-contain transition-transform duration-500 group-hover:scale-105"
                        priority={persona.key === 'direito'}
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-blue-600/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>

                    {/* Conteúdo */}
                    <div className="p-4 sm:p-6 group-hover:-translate-y-1 transition-transform duration-500">
                      <div className="flex items-center gap-2 mb-3">
                        <Icon className="h-4 w-4 text-blue-400 flex-shrink-0 group-hover:text-blue-300 transition-colors duration-300" />
                        <h3 className="text-base sm:text-lg font-semibold text-white group-hover:text-blue-100 transition-colors duration-300">
                          {persona.title}
                        </h3>
                      </div>

                      <p className="text-gray-300 text-xs sm:text-sm leading-relaxed mb-4 line-clamp-2 group-hover:text-gray-200 transition-colors duration-300">
                        {persona.text}
                      </p>

                      <blockquote className="text-blue-400 text-xs sm:text-sm italic group-hover:text-blue-300 transition-colors duration-300">
                        "{persona.quote}"
                      </blockquote>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* badge de pausa */}
          {isPaused && (
            <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm z-20">
              Pausado
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
