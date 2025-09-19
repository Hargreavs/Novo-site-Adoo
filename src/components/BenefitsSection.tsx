'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Benefit } from '@/types/benefits';
import BenefitMainCard from './BenefitMainCard';
import BenefitRail from './BenefitRail';
import RevealWrapper from './RevealWrapper';
import MockBuscaDeTermos from './mocks/MockBuscaDeTermos';
import MockCentral from './mocks/MockCentral';
import MockAlertas from './mocks/MockAlertas';
import MockNotificacoes from './mocks/MockNotificacoes';

// Ícones (você pode substituir por ícones do Heroicons ou similar)
const SparklesIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const FolderIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const BellIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
  </svg>
);

const BENEFITS: Benefit[] = [
  {
    id: 'radar',
    label: 'Radar IA',
    icon: <SparklesIcon className="h-5 w-5" />,
    title: 'Radar IA',
    description: 'Nossa inteligência artificial lê o conteúdo de diferentes fontes e entrega a informação já analisada, com os principais pontos que você precisa saber.',
    bullets: [
      'Reconhecimento de Linguagem Natural',
      'Análise profunda do conteúdo',
      'Treinadas para cada contexto'
    ],
    media: <MockBuscaDeTermos />,
    gradient: { from: '#3B82F6', via: '#8B5CF6', to: '#22D3EE' }
  },
  {
    id: 'central',
    label: 'Central',
    icon: <FolderIcon className="h-5 w-5" />,
    title: 'Central Unificada',
    description: 'Pesquise em diferentes diários oficiais em um só lugar, sem precisar abrir dezenas de sites.',
    bullets: [
      'Mais de 2500 diários oficiais',
      'Todos os poderes e esferas',
      'Atualizados em tempo real'
    ],
    media: <MockCentral />,
    gradient: { from: '#22D3EE', to: '#3B82F6' }
  },
  {
    id: 'alertas',
    label: 'Alertas',
    icon: <SearchIcon className="h-5 w-5" />,
    title: 'Alertas personalizados',
    description: 'Cadastre palavras-chave (concursos, licitações, nomes, CNPJs) e seja avisado na hora em que forem publicadas nos diários oficiais de seu interesse.',
    bullets: [
      'Monitore novos editais',
      'Monitore nomeações',
      'Monitore novas legislações'
    ],
    media: <MockAlertas />,
    gradient: { from: '#8B5CF6', to: '#EC4899' }
  },
  {
    id: 'notificacoes',
    label: 'Notificações',
    icon: <BellIcon className="h-5 w-5" />,
    title: 'Notificação em tempo real',
    description: 'Receba alertas por e-mail, SMS e push assim que sua palavra-chave for publicada.',
    bullets: [
      'Não perca nenhum aviso',
      'Ative todas as notificações'
    ],
    media: <MockNotificacoes />,
    gradient: { from: '#10B981', to: '#3B82F6' }
  }
];

export default function BenefitsSection() {
  const [activeId, setActiveId] = useState(BENEFITS[0].id);
  const active = useMemo(() => BENEFITS.find(b => b.id === activeId)!, [activeId]);

  return (
    <section id="features" className="relative z-0 bg-transparent">
      <div className="py-16 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative overflow-hidden">
          <RevealWrapper delay={0}>
            <header className="mb-12 text-center">
              <h1 className="text-xl font-bold leading-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 sm:text-2xl lg:text-3xl" style={{ lineHeight: '1.2', paddingBottom: '2px' }}>Benefícios</h1>
              <h2 className="mt-2 text-xl font-bold tracking-tight text-white sm:text-2xl lg:text-3xl">
                Tudo que você precisa para acompanhar publicações com praticidade
              </h2>
            </header>
          </RevealWrapper>

          {/* Desktop Layout */}
          <div className="hidden lg:grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] items-stretch">
            {/* Card principal */}
            <RevealWrapper delay={200}>
              <BenefitMainCard benefit={active} />
            </RevealWrapper>

            {/* Rail de mini-cards */}
            <RevealWrapper delay={400}>
              <BenefitRail
                items={BENEFITS}
                activeId={activeId}
                onSelect={setActiveId}
              />
            </RevealWrapper>
          </div>

          {/* Tablet Layout */}
          <div className="hidden md:block lg:hidden">
            <div className="space-y-8">
              {/* Card principal */}
              <RevealWrapper delay={200}>
                <BenefitMainCard benefit={active} />
              </RevealWrapper>

              {/* Grid de mini-cards */}
              <RevealWrapper delay={400}>
                <div className="grid grid-cols-2 gap-3">
                  {BENEFITS.map((item) => {
                    const isActive = item.id === activeId;
                      return (
                        <motion.button
                          key={item.id}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => setActiveId(item.id)}
                    className={`
                      flex items-center gap-3 rounded-xl border px-4 py-4 transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-blue-500/50
                      ${isActive 
                        ? 'ring-1 ring-blue-400/40 bg-white/[0.06] border-blue-400/20' 
                        : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
                      }
                    `}
                    aria-pressed={isActive}
                  >
                    <div className={`
                      flex-shrink-0 transition-colors duration-200
                      ${isActive ? 'text-blue-300' : 'text-gray-400'}
                    `}>
                      {item.icon}
                    </div>
                    <span className={`
                      text-sm font-medium transition-colors duration-200
                      ${isActive ? 'text-white' : 'text-gray-300'}
                    `}>
                      {item.label}
                    </span>
                  </motion.button>
                      );
                    })}
                </div>
            </RevealWrapper>
          </div>
        </div>

        {/* Mobile Layout - Tabs */}
        <div className="md:hidden">
          <div className="space-y-6">
            {/* Tabs */}
            <RevealWrapper delay={200}>
              <div className="flex space-x-1 overflow-x-auto pb-2 scrollbar-hide">
              {BENEFITS.map((item) => {
                const isActive = item.id === activeId;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveId(item.id)}
                    className={`
                      flex-shrink-0 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200
                      ${isActive 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                      }
                    `}
                    aria-pressed={isActive}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                );
              })}
              </div>
            </RevealWrapper>

            {/* Card principal */}
            <RevealWrapper delay={400}>
              <BenefitMainCard benefit={active} />
            </RevealWrapper>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}