'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import TransparentHeader from '@/components/TransparentHeader';
import TestModal from '@/components/TestModal';
import RevealWrapper from '@/components/RevealWrapper';

export default function ExplorarPage() {
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'tudo';

  return (
    <div className="bg-transparent min-h-screen">
      <TransparentHeader 
        currentPage="explorar" 
        onTrialClick={() => setIsTestModalOpen(true)} 
      />
      
      {/* Hero Section */}
      <section className="relative isolate overflow-hidden h-screen flex items-center justify-center">
        {/* Gradiente base (fallback) */}
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
        </div>
        
        {/* Gradiente principal */}
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
        </div>

        {/* Conteúdo principal */}
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <RevealWrapper>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                  Explorar
                </span>
              </h1>
            </RevealWrapper>
            
            <RevealWrapper delay={200}>
              <p className="mt-6 text-lg leading-8 text-gray-300 max-w-2xl mx-auto">
                Descubra informações, dados e insights de forma inteligente. 
                Navegue por diferentes fontes e encontre exatamente o que você procura.
              </p>
            </RevealWrapper>

            <RevealWrapper delay={400}>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <button
                  onClick={() => setIsTestModalOpen(true)}
                  className="rounded-md bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:from-blue-600 hover:to-purple-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all duration-200"
                >
                  Começar a explorar
                </button>
                <a href="#recursos" className="text-sm font-semibold leading-6 text-white hover:text-blue-400 transition-colors">
                  Saiba mais <span aria-hidden="true">→</span>
                </a>
              </div>
            </RevealWrapper>
          </div>
        </div>
      </section>

      {/* Seção de Recursos */}
      <section id="recursos" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <RevealWrapper>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Recursos de Exploração
              </h2>
            </RevealWrapper>
            <RevealWrapper delay={200}>
              <p className="mt-6 text-lg leading-8 text-gray-300">
                Ferramentas poderosas para descobrir e analisar informações de forma eficiente.
              </p>
            </RevealWrapper>
          </div>

          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <div className="grid max-w-xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
              <RevealWrapper delay={100}>
                <div className="flex flex-col bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-200">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-lg mb-6">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">Busca Inteligente</h3>
                  <p className="text-gray-300">
                    Encontre informações precisas usando nossa tecnologia de busca avançada com IA.
                  </p>
                </div>
              </RevealWrapper>

              <RevealWrapper delay={200}>
                <div className="flex flex-col bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-200">
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-500/20 rounded-lg mb-6">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">Análise de Dados</h3>
                  <p className="text-gray-300">
                    Visualize e analise dados de forma interativa com gráficos e relatórios detalhados.
                  </p>
                </div>
              </RevealWrapper>

              <RevealWrapper delay={300}>
                <div className="flex flex-col bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-200">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-lg mb-6">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">Exploração Rápida</h3>
                  <p className="text-gray-300">
                    Acesse informações instantaneamente com nossa interface otimizada e responsiva.
                  </p>
                </div>
              </RevealWrapper>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de CTA */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <RevealWrapper>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Pronto para começar?
              </h2>
            </RevealWrapper>
            <RevealWrapper delay={200}>
              <p className="mt-6 text-lg leading-8 text-gray-300">
                Comece a explorar agora mesmo e descubra o poder da busca inteligente.
              </p>
            </RevealWrapper>
            <RevealWrapper delay={400}>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <button
                  onClick={() => setIsTestModalOpen(true)}
                  className="rounded-md bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:from-blue-600 hover:to-purple-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all duration-200"
                >
                  Criar conta
                </button>
                <a href="#recursos" className="text-sm font-semibold leading-6 text-white hover:text-blue-400 transition-colors">
                  Ver recursos <span aria-hidden="true">→</span>
                </a>
              </div>
            </RevealWrapper>
          </div>
        </div>
      </section>

      {/* Modal de teste */}
      <TestModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
      />
    </div>
  );
}