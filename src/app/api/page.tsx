'use client';

import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import TransparentHeader from "@/components/TransparentHeader";
import RevealWrapper from "@/components/RevealWrapper";
import TestModal from "@/components/TestModal";

// Lazy load heavy components
const AnimatedBackground = lazy(() => import("@/components/ui/AnimatedBackground"));
import { 
  CodeBracketIcon, 
  DocumentTextIcon, 
  CloudIcon, 
  ShieldCheckIcon,
  RocketLaunchIcon,
  CpuChipIcon,
  GlobeAltIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  PlayIcon
} from "@heroicons/react/24/outline";

// Componente de seção animada
function AnimatedSection({ id, className, children }: { id: string; className?: string; children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      id={id}
      className={`${className} transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {children}
    </div>
  );
}

// Componente para o menu de navegação
function NavigationMenu({ isModalOpen }: { isModalOpen: boolean }) {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const elementPosition = element.offsetTop;
      const offsetPosition = elementPosition - 120; // 120px de offset para mostrar o título
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  if (isModalOpen) return null; // Hide menu if modal is open

  return (
    <div className="sticky top-32 z-40 py-6 mb-8">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <RevealWrapper delay={100}>
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => scrollToSection('comecar')}
              className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-all duration-200"
            >
              Começar
            </button>
            <button
              onClick={() => scrollToSection('autenticacao')}
              className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-all duration-200"
            >
              Autenticação
            </button>
            <button
              onClick={() => scrollToSection('ambientes')}
              className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-all duration-200"
            >
              Ambientes
            </button>
            <button
              onClick={() => scrollToSection('referencia-api')}
              className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-all duration-200"
            >
              Referência API
            </button>
            <button
              onClick={() => scrollToSection('webhooks')}
              className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-all duration-200"
            >
              Webhooks
            </button>
            <button
              onClick={() => scrollToSection('codigos-erro')}
              className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-all duration-200"
            >
              Códigos de Erro
            </button>
          </div>
        </RevealWrapper>
      </div>
    </div>
  );
}

export default function API() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: 'Ola,\n\nTenho interesse em obter uma API key gratuita do Adoo para\nrealizar meu teste de 7 dias. Entrem em contato comigo.\n\nObrigado(a)!'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simular envio do formulário
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Aqui você integraria com seu backend para enviar o email
    console.log('Dados do formulário:', formData);
    
    // Reset do formulário
    setFormData({
      name: '',
      email: '',
      message: 'Ola,\n\nTenho interesse em obter uma API key gratuita do Adoo para\nrealizar meu teste de 7 dias. Entrem em contato comigo.\n\nObrigado(a)!'
    });
    
    setIsSubmitting(false);
    setIsModalOpen(false);
    
    // Scroll para o topo da página após o envio
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenForm = () => {
    setIsModalOpen(true);
    // Scroll para o formulário após um pequeno delay para garantir que ele foi renderizado
    setTimeout(() => {
      const formElement = document.getElementById('api-form');
      if (formElement) {
        const elementPosition = formElement.offsetTop;
        const menuHeight = 80; // Altura aproximada do menu sticky
        window.scrollTo({
          top: elementPosition - menuHeight,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  const handleCancelForm = () => {
    setIsModalOpen(false);
    // Scroll para a seção final (CTA) após cancelar
    const ctaElement = document.getElementById('comecar');
    if (ctaElement) {
      window.scrollTo({
        top: ctaElement.offsetTop,
        behavior: 'smooth'
      });
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };


  return (
    <div className="bg-transparent min-h-screen">
      <TransparentHeader 
        currentPage="api" 
        onTrialClick={() => setIsTestModalOpen(true)} 
      />

      {/* Hero Section */}
      <section className="relative isolate px-6 pt-14 lg:px-8 overflow-hidden">
        {/* Background animado */}
        <Suspense fallback={<div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20"></div>}>
          <AnimatedBackground />
        </Suspense>
        
        <div className="relative z-10 mx-auto max-w-6xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-lg font-bold tracking-tight text-white sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl leading-tight fade-in-delay-1">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400" style={{ lineHeight: '1.2', paddingBottom: '2px' }}>API de Integração</span>
            </h1>
            <p className="mt-3 text-base text-gray-300 max-w-3xl mx-auto sm:text-lg sm:mt-4 fade-in-delay-2">
              Integre nossos serviços de diários oficiais diretamente em seus sistemas com nossa API robusta, bem documentada e de alta performance
            </p>
            
            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => {
                  const element = document.getElementById('comecar');
                  if (element) {
                    window.scrollTo({
                      top: element.offsetTop - 120,
                      behavior: 'smooth'
                    });
                  }
                }}
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <PlayIcon className="w-4 h-4 mr-2" />
                Começar Agora
                <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => {
                  const element = document.getElementById('referencia-api');
                  if (element) {
                    window.scrollTo({
                      top: element.offsetTop - 120,
                      behavior: 'smooth'
                    });
                  }
                }}
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-300 border border-gray-600 rounded-lg hover:text-white hover:border-gray-400 transition-all duration-200"
              >
                <DocumentTextIcon className="w-4 h-4 mr-2" />
                Ver Documentação
              </button>
            </div>
          </div>
        </div>
      </section>

      <NavigationMenu isModalOpen={isModalOpen} />

      {/* Features Grid */}
      <AnimatedSection id="recursos" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <RevealWrapper delay={100}>
            <div className="text-center">
              <h2 className="text-base font-semibold leading-7 text-blue-400">Recursos</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Tudo que você precisa
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-300">
                Uma API completa e robusta para integração com diários oficiais.
              </p>
            </div>
          </RevealWrapper>
          
          <RevealWrapper>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 group">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <CodeBracketIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">API REST Completa</h3>
                <p className="text-gray-300 leading-relaxed">
                  Interface REST completa e intuitiva para integração com seus sistemas existentes.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 group">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <DocumentTextIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Documentação Interativa</h3>
                <p className="text-gray-300 leading-relaxed">
                  Documentação detalhada com exemplos práticos, SDKs e playground interativo.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 group">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <CloudIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Notificações em Tempo Real</h3>
                <p className="text-gray-300 leading-relaxed">
                  Receba notificações instantâneas sobre publicações e atualizações nos diários.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 group">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <ShieldCheckIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Segurança Avançada</h3>
                <p className="text-gray-300 leading-relaxed">
                  API Keys, OAuth2, rate limiting e criptografia end-to-end para máxima segurança.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 group">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <RocketLaunchIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Alta Performance</h3>
                <p className="text-gray-300 leading-relaxed">
                  Infraestrutura otimizada para garantir resposta rápida e disponibilidade 99.9%.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 group">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <CpuChipIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">SDKs Múltiplas Linguagens</h3>
                <p className="text-gray-300 leading-relaxed">
                  SDKs oficiais para JavaScript, Python, PHP, Java e outras linguagens populares.
                </p>
              </div>
            </div>
          </RevealWrapper>
        </div>
      </AnimatedSection>

      {/* API Endpoints */}
      <AnimatedSection id="endpoints" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <RevealWrapper delay={100}>
            <div className="text-center">
              <h2 className="text-base font-semibold leading-7 text-blue-400">Endpoints</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Principais Endpoints
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-300">
                Endpoints RESTful para todas as operações com diários oficiais.
              </p>
            </div>
          </RevealWrapper>
          
          <div className="mt-16 space-y-8">
            {[
              {
                method: 'GET',
                path: '/api/v1/diarios',
                description: 'Buscar diários oficiais com filtros avançados',
                color: 'text-green-400'
              },
              {
                method: 'POST',
                path: '/api/v1/diarios',
                description: 'Publicar novo diário oficial',
                color: 'text-blue-400'
              },
              {
                method: 'GET',
                path: '/api/v1/alertas',
                description: 'Configurar e gerenciar alertas personalizados',
                color: 'text-yellow-400'
              },
              {
                method: 'POST',
                path: '/api/v1/webhooks',
                description: 'Registrar webhooks para notificações',
                color: 'text-purple-400'
              }
            ].map((endpoint, index) => (
              <RevealWrapper key={`${endpoint.method}-${endpoint.path}`} delay={100 + index * 100}>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-[20px] p-6 hover:bg-white/[0.05] transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${endpoint.color} bg-white/10`}>
                      {endpoint.method}
                    </span>
                    <code className="text-white font-mono text-lg">{endpoint.path}</code>
                  </div>
                  <p className="mt-3 text-gray-300">{endpoint.description}</p>
                </div>
              </RevealWrapper>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Code Examples */}
      <AnimatedSection id="exemplos" className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <RevealWrapper delay={100}>
            <div className="text-center">
              <h2 className="text-base font-semibold leading-7 text-blue-400">Exemplos</h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Exemplos de Código
                </p>
                <p className="mt-6 text-lg leading-8 text-gray-300">
                Exemplos práticos em múltiplas linguagens para você começar rapidamente.
                </p>
              </div>
            </RevealWrapper>
          
          <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {[
              {
                language: 'JavaScript',
                code: `// Instalar SDK
npm install @diarios-oficiais/sdk

// Configurar cliente
import { DiariosAPI } from '@diarios-oficiais/sdk';

const api = new DiariosAPI({
  apiKey: 'sua-api-key-aqui',
  baseURL: 'https://api.diariosoficiais.com.br'
});

// Buscar diarios
const diarios = await api.diarios.buscar({
  data: '2024-01-15',
  orgao: 'prefeitura',
  palavrasChave: ['licitacao', 'concurso']
});

console.log(diarios);`
              },
              {
                language: 'Python',
                code: `# Instalar via pip
pip install diarios-oficiais-sdk

# Configurar cliente
from diarios_oficiais import DiariosAPI

api = DiariosAPI(
    api_key='sua-api-key-aqui',
    base_url='https://api.diariosoficiais.com.br'
)

# Buscar diarios
diarios = api.diarios.buscar(
    data='2024-01-15',
    orgao='prefeitura',
    palavras_chave=['licitacao', 'concurso']
)

print(diarios)`
              },
              {
                language: 'PHP',
                code: `<?php
// Instalar via Composer
composer require diarios-oficiais/sdk

// Configurar cliente
use DiariosOficiais\\SDK\\DiariosAPI;

$api = new DiariosAPI([
    'api_key' => 'sua-api-key-aqui',
    'base_url' => 'https://api.diariosoficiais.com.br'
]);

// Buscar diarios
$diarios = $api->diarios->buscar([
    'data' => '2024-01-15',
    'orgao' => 'prefeitura',
    'palavras_chave' => ['licitacao', 'concurso']
]);

var_dump($diarios);
?>`
              }
            ].map((example, index) => (
              <RevealWrapper key={example.language} delay={100 + index * 100}>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-[20px] p-6 h-[500px] flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">{example.language}</h3>
                    <button
                      onClick={() => copyToClipboard(example.code, `example-${example.language}`)}
                      className="text-gray-400 hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-white/10"
                      title={copiedCode === `example-${example.language}` ? "Copiado!" : "Copiar código"}
                    >
                      {copiedCode === `example-${example.language}` ? (
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <pre className="text-sm text-gray-300 overflow-hidden flex-1">
                    <code className="whitespace-pre-wrap">{example.code}</code>
                  </pre>
                    </div>
                  </RevealWrapper>
                ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Getting Started */}
      <AnimatedSection id="comecar" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <RevealWrapper delay={100}>
            <div className="text-center">
              <h2 className="text-base font-semibold leading-7 text-blue-400">Começando</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Primeiros Passos
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-300">
                Comece a integrar nossa API em menos de 5 minutos.
              </p>
            </div>
          </RevealWrapper>
          
          <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
            <RevealWrapper delay={200}>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-[20px] p-8">
                <h3 className="text-xl font-semibold text-white mb-4">1. Crie sua Conta</h3>
                <p className="text-gray-300 mb-4">
                  Registre-se gratuitamente e obtenha acesso imediato a nossa API.
                </p>
                <div className="bg-gray-800/50 rounded-lg p-4 mb-4 relative group">
                  <code className="text-green-400">
                    POST https://api.diariosoficiais.com.br/v1/auth/register
                  </code>
                  <button
                    onClick={() => copyToClipboard('POST https://api.diariosoficiais.com.br/v1/auth/register', 'register-endpoint')}
                    className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors duration-200 p-1 rounded opacity-0 group-hover:opacity-100"
                    title={copiedCode === 'register-endpoint' ? "Copiado!" : "Copiar"}
                  >
                    {copiedCode === 'register-endpoint' ? (
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Criar Conta
                </button>
              </div>
            </RevealWrapper>
            
            <RevealWrapper delay={300}>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-[20px] p-8">
                <h3 className="text-xl font-semibold text-white mb-4">2. Obtenha sua API Key</h3>
                <p className="text-gray-300 mb-4">
                  Acesse seu dashboard e gere sua chave de API personalizada.
                </p>
                <div className="bg-gray-800/50 rounded-lg p-4 mb-4 relative group">
                  <code className="text-blue-400">
                    GET https://api.diariosoficiais.com.br/v1/auth/keys
                  </code>
                  <button
                    onClick={() => copyToClipboard('GET https://api.diariosoficiais.com.br/v1/auth/keys', 'keys-endpoint')}
                    className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors duration-200 p-1 rounded opacity-0 group-hover:opacity-100"
                    title={copiedCode === 'keys-endpoint' ? "Copiado!" : "Copiar"}
                  >
                    {copiedCode === 'keys-endpoint' ? (
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  Gerar API Key
                </button>
              </div>
            </RevealWrapper>
          </div>
        </div>
      </AnimatedSection>

      {/* Authentication */}
      <AnimatedSection id="autenticacao" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <RevealWrapper delay={100}>
            <div className="text-center">
              <h2 className="text-base font-semibold leading-7 text-blue-400">Autenticação</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Segurança e Acesso
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-300">
                Nossa API utiliza autenticação baseada em API Keys para máxima segurança.
              </p>
            </div>
          </RevealWrapper>
          
          <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
            <RevealWrapper delay={200}>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-[20px] p-8">
                <h3 className="text-xl font-semibold text-white mb-4">API Key Authentication</h3>
                <p className="text-gray-300 mb-4">
                  Inclua sua API Key no header de todas as requisicoes.
                </p>
                <div className="bg-gray-800/50 rounded-lg p-4 relative group">
                  <pre className="text-sm text-gray-300">
{`curl -X GET \\
  'https://api.diariosoficiais.com.br/v1/diarios' \\
  -H 'Authorization: Bearer sua-api-key-aqui' \\
  -H 'Content-Type: application/json'`}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(`curl -X GET \\
  'https://api.diariosoficiais.com.br/v1/diarios' \\
  -H 'Authorization: Bearer sua-api-key-aqui' \\
  -H 'Content-Type: application/json'`, 'curl-example')}
                    className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors duration-200 p-1 rounded opacity-0 group-hover:opacity-100"
                    title={copiedCode === 'curl-example' ? "Copiado!" : "Copiar"}
                  >
                    {copiedCode === 'curl-example' ? (
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </RevealWrapper>
            
            <RevealWrapper delay={300}>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-[20px] p-8">
                <h3 className="text-xl font-semibold text-white mb-4">Rate Limiting</h3>
                <p className="text-gray-300 mb-4">
                  Limites de requisicoes por minuto baseados no seu plano.
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-gray-300">Plano Gratuito</span>
                    <span className="text-white font-semibold">100 req/min</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-gray-300">Plano Pro</span>
                    <span className="text-white font-semibold">1,000 req/min</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-300">Plano Enterprise</span>
                    <span className="text-white font-semibold">10,000 req/min</span>
            </div>
          </div>
        </div>
            </RevealWrapper>
          </div>
        </div>
      </AnimatedSection>

      {/* Environments */}
      <AnimatedSection id="ambientes" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <RevealWrapper delay={100}>
            <div className="text-center">
              <h2 className="text-base font-semibold leading-7 text-blue-400">Ambientes</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Desenvolvimento e Producao
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-300">
                Diferentes ambientes para desenvolvimento, teste e producao.
              </p>
            </div>
          </RevealWrapper>
          
          <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
            <RevealWrapper delay={200}>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-[20px] p-8 text-center h-80 flex flex-col justify-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <CheckCircleIcon className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">Produção</h3>
                <p className="text-gray-300 mb-4">
                  Ambiente estável para aplicações em produção.
                </p>
                <div className="bg-gray-800/50 rounded-lg p-3 relative group">
                  <code className="text-green-400">
                    https://api.diariosoficiais.com.br
                  </code>
                  <button
                    onClick={() => copyToClipboard('https://api.diariosoficiais.com.br', 'prod-url')}
                    className="absolute top-1 right-1 text-gray-400 hover:text-white transition-colors duration-200 p-1 rounded opacity-0 group-hover:opacity-100"
                    title={copiedCode === 'prod-url' ? "Copiado!" : "Copiar"}
                  >
                    {copiedCode === 'prod-url' ? (
                      <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </RevealWrapper>
            
            <RevealWrapper delay={300}>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-[20px] p-8 text-center h-80 flex flex-col justify-center">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <RocketLaunchIcon className="w-6 h-6 text-yellow-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">Desenvolvimento</h3>
                <p className="text-gray-300 mb-4">
                  Ambiente de teste para desenvolvimento e validação.
                </p>
                <div className="bg-gray-800/50 rounded-lg p-3 relative group">
                  <code className="text-yellow-400">
                    https://dev-api.diariosoficiais.com.br
                  </code>
                  <button
                    onClick={() => copyToClipboard('https://dev-api.diariosoficiais.com.br', 'dev-url')}
                    className="absolute top-1 right-1 text-gray-400 hover:text-white transition-colors duration-200 p-1 rounded opacity-0 group-hover:opacity-100"
                    title={copiedCode === 'dev-url' ? "Copiado!" : "Copiar"}
                  >
                    {copiedCode === 'dev-url' ? (
                      <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </RevealWrapper>
            
            <RevealWrapper delay={400}>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-[20px] p-8 text-center h-80 flex flex-col justify-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <CloudIcon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">Staging</h3>
                <p className="text-gray-300 mb-4">
                  Ambiente de pré-produção para testes finais.
                </p>
                <div className="bg-gray-800/50 rounded-lg p-3 relative group">
                  <code className="text-blue-400">
                    https://staging-api.diariosoficiais.com.br
                  </code>
                  <button
                    onClick={() => copyToClipboard('https://staging-api.diariosoficiais.com.br', 'staging-url')}
                    className="absolute top-1 right-1 text-gray-400 hover:text-white transition-colors duration-200 p-1 rounded opacity-0 group-hover:opacity-100"
                    title={copiedCode === 'staging-url' ? "Copiado!" : "Copiar"}
                  >
                    {copiedCode === 'staging-url' ? (
                      <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </RevealWrapper>
          </div>
        </div>
      </AnimatedSection>

      {/* API Reference */}
      <AnimatedSection id="referencia-api" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <RevealWrapper delay={100}>
            <div className="text-center">
              <h2 className="text-base font-semibold leading-7 text-blue-400">Referência da API</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Documentação Completa
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-300">
                Todos os endpoints, parâmetros e exemplos de uso da nossa API.
              </p>
            </div>
          </RevealWrapper>
          
          <div className="mt-16 space-y-12">
            {/* Diarios Endpoints */}
            <RevealWrapper delay={200}>
              <div>
                <h3 className="text-2xl font-bold text-white mb-8" id="diarios">Diarios Oficiais</h3>
                
                <div className="space-y-8">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-[20px] p-8">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="px-3 py-1 rounded-full text-sm font-semibold text-green-400 bg-green-500/20">
                        GET
                      </span>
                      <code className="text-white font-mono text-lg">/v1/diarios</code>
                    </div>
                    <p className="text-gray-300 mb-4">Lista todos os diarios oficiais com filtros opcionais.</p>
                    
                    <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                      <pre className="text-sm text-gray-300">
{`GET /v1/diarios?data=2024-01-15&orgao=prefeitura&palavras_chave=licitacao

Resposta:
{
  "data": [
    {
      "id": "12345",
      "titulo": "Edital de Licitacao",
      "orgao": "Prefeitura Municipal",
      "data_publicacao": "2024-01-15",
      "conteudo": "Conteudo do diario...",
      "url": "https://diario.prefeitura.com.br/12345"
    }
  ],
  "total": 1,
  "pagina": 1,
  "limite": 50
}`}
                      </pre>
                    </div>
                  </div>
                  
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-[20px] p-8">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="px-3 py-1 rounded-full text-sm font-semibold text-blue-400 bg-blue-500/20">
                        POST
                      </span>
                      <code className="text-white font-mono text-lg">/v1/diarios</code>
                    </div>
                    <p className="text-gray-300 mb-4">Publica um novo diario oficial.</p>
                    
                    <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                      <pre className="text-sm text-gray-300">
{`POST /v1/diarios
Content-Type: application/json
Authorization: Bearer sua-api-key

{
  "titulo": "Edital de Licitacao",
  "conteudo": "Conteudo do diario...",
  "orgao": "Prefeitura Municipal",
  "data_publicacao": "2024-01-15"
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </RevealWrapper>
            
            {/* Alertas Endpoints */}
            <RevealWrapper delay={300}>
              <div>
                <h3 className="text-2xl font-bold text-white mb-8" id="alertas">Alertas</h3>
                
                <div className="space-y-8">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-[20px] p-8">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="px-3 py-1 rounded-full text-sm font-semibold text-green-400 bg-green-500/20">
                        GET
                      </span>
                      <code className="text-white font-mono text-lg">/v1/alertas</code>
                    </div>
                    <p className="text-gray-300 mb-4">Lista todos os alertas configurados.</p>
                    
                    <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
              <pre className="text-sm text-gray-300">
{`GET /v1/alertas

Resposta:
{
  "data": [
    {
      "id": "alert_123",
      "nome": "Licitacoes Prefeitura",
      "palavras_chave": ["licitacao", "edital"],
      "orgao": "prefeitura",
      "ativo": true,
      "criado_em": "2024-01-01T00:00:00Z"
    }
  ]
}`}
                      </pre>
                    </div>
                  </div>
                  
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-[20px] p-8">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="px-3 py-1 rounded-full text-sm font-semibold text-blue-400 bg-blue-500/20">
                        POST
                      </span>
                      <code className="text-white font-mono text-lg">/v1/alertas</code>
                    </div>
                    <p className="text-gray-300 mb-4">Cria um novo alerta personalizado.</p>
                    
                    <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                      <pre className="text-sm text-gray-300">
{`POST /v1/alertas
Content-Type: application/json
Authorization: Bearer sua-api-key

{
  "nome": "Licitacoes Prefeitura",
  "palavras_chave": ["licitacao", "concurso"],
  "orgao": "prefeitura",
  "webhook_url": "https://seu-site.com/webhook"
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </RevealWrapper>
          </div>
        </div>
      </AnimatedSection>

      {/* Webhooks */}
      <AnimatedSection id="webhooks" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <RevealWrapper delay={100}>
            <div className="text-center">
              <h2 className="text-base font-semibold leading-7 text-blue-400">Webhooks</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Notificacoes em Tempo Real
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-300">
                Receba notificacoes instantaneas quando novos diarios forem publicados.
              </p>
            </div>
          </RevealWrapper>
          
          <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
            <RevealWrapper delay={200}>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-[20px] p-8">
                <h3 className="text-xl font-semibold text-white mb-4">Configuração de Webhook</h3>
                <p className="text-gray-300 mb-4">
                  Configure seu endpoint para receber notificações automáticas.
                </p>
                <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                  <pre className="text-sm text-gray-300">
{`POST /v1/webhooks
Content-Type: application/json
Authorization: Bearer sua-api-key

{
  "url": "https://seu-site.com/webhook",
  "eventos": ["diario.publicado", "diario.atualizado"],
  "filtros": {
    "orgao": "prefeitura",
    "palavras_chave": ["licitacao"]
  }
}`}
                  </pre>
                </div>
                <div className="text-sm text-gray-400 space-y-1">
                  <p>• URL deve ser HTTPS</p>
                  <p>• Deve responder com status 200</p>
                  <p>• Timeout de 30 segundos</p>
                </div>
              </div>
            </RevealWrapper>
            
            <RevealWrapper delay={300}>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-[20px] p-8">
                <h3 className="text-xl font-semibold text-white mb-4">Estrutura da Notificação</h3>
                <p className="text-gray-300 mb-4">
                  Estrutura da notificação enviada para seu endpoint.
                </p>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <pre className="text-sm text-gray-300">
{`{
  "evento": "diario.publicado",
  "timestamp": "2024-01-15T10:30:00Z",
  "dados": {
    "id": "12345",
    "titulo": "Edital de Licitacao",
    "orgao": "Prefeitura Municipal",
    "data_publicacao": "2024-01-15",
    "url": "https://diario.prefeitura.com.br/12345"
  }
}`}
              </pre>
            </div>
              </div>
            </RevealWrapper>
          </div>
        </div>
      </AnimatedSection>

      {/* Error Codes */}
      <AnimatedSection id="codigos-erro" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <RevealWrapper delay={100}>
            <div className="text-center">
              <h2 className="text-base font-semibold leading-7 text-blue-400">Códigos de Erro</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Debug Eficiente
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-300">
                Códigos de status HTTP e mensagens de erro para debug eficiente.
              </p>
          </div>
        </RevealWrapper>

          <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <RevealWrapper delay={200}>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-[20px] p-8">
                <h3 className="text-xl font-semibold text-red-400 mb-4">4xx - Erros do Cliente</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-gray-300">400</span>
                    <span className="text-white">Bad Request</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-gray-300">401</span>
                    <span className="text-white">Unauthorized</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-gray-300">403</span>
                    <span className="text-white">Forbidden</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-300">404</span>
                    <span className="text-white">Not Found</span>
                  </div>
                </div>
              </div>
            </RevealWrapper>
            
            <RevealWrapper delay={300}>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-[20px] p-8">
                <h3 className="text-xl font-semibold text-yellow-400 mb-4">5xx - Erros do Servidor</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-gray-300">500</span>
                    <span className="text-white">Internal Server Error</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-gray-300">502</span>
                    <span className="text-white">Bad Gateway</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-gray-300">503</span>
                    <span className="text-white">Service Unavailable</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-300">504</span>
                    <span className="text-white">Gateway Timeout</span>
                  </div>
                </div>
              </div>
            </RevealWrapper>
            
            <RevealWrapper delay={400}>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-[20px] p-8">
                <h3 className="text-xl font-semibold text-green-400 mb-4">2xx - Sucesso</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-gray-300">200</span>
                    <span className="text-white">OK</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-gray-300">201</span>
                    <span className="text-white">Created</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-gray-300">204</span>
                    <span className="text-white">No Content</span>
                  </div>
                </div>
              </div>
            </RevealWrapper>
          </div>
          
          <div className="mt-12">
            <RevealWrapper delay={500}>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-[20px] p-8">
                <h3 className="text-xl font-semibold text-white mb-4">Exemplo de Resposta de Erro</h3>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <pre className="text-sm text-gray-300">
{`{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "O parâmetro 'data' é obrigatório",
    "details": {
      "field": "data",
      "expected": "YYYY-MM-DD"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "request_id": "req_123456789"
}`}
                  </pre>
                </div>
            </div>
          </RevealWrapper>
        </div>
      </div>
      </AnimatedSection>

      {/* Stats Section */}
      <AnimatedSection id="estatisticas" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <RevealWrapper delay={100}>
            <div className="text-center">
              <h2 className="text-base font-semibold leading-7 text-blue-400">Estatísticas</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Performance e Confiabilidade
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-300">
                Nossa infraestrutura garante alta disponibilidade e performance otimizada.
              </p>
            </div>
          </RevealWrapper>
          
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: GlobeAltIcon, label: 'Uptime', value: '99.9%', color: 'text-green-400' },
              { icon: ClockIcon, label: 'Latência Média', value: '< 200ms', color: 'text-blue-400' },
              { icon: ChartBarIcon, label: 'Requisições/min', value: '10,000+', color: 'text-purple-400' },
              { icon: CheckCircleIcon, label: 'Suporte', value: '24/7', color: 'text-yellow-400' }
            ].map((stat, index) => (
              <RevealWrapper key={stat.label} delay={100 + index * 100}>
                <div className="text-center">
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 mb-4`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className={`text-3xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
                  <div className="text-gray-300">{stat.label}</div>
                </div>
              </RevealWrapper>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* CTA Section */}
      <AnimatedSection id="comecar" className="py-16 sm:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <RevealWrapper delay={100}>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent sm:text-4xl mb-6">
              Pronto para começar?
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Obtenha sua API Key gratuita e comece a integrar em menos de 5 minutos.
            </p>
            <div className="flex justify-center">
              <button
                onClick={handleOpenForm}
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <RocketLaunchIcon className="w-5 h-5 mr-2" />
                Obter API Key Gratuita
                <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </RevealWrapper>
        </div>
      </AnimatedSection>

      {/* Inline Form Section */}
      {isModalOpen && (
        <AnimatedSection id="api-form" className="py-8">
          <div className="mx-auto max-w-2xl">
            <div className="bg-white/[0.08] backdrop-blur-[20px] border border-white/20 rounded-2xl p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">Solicitar API Key Gratuita</h3>
                <button
                  onClick={handleCancelForm}
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Seu nome completo"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    E-mail
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="seu@email.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                    Mensagem
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={6}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="Ola, Tenho interesse em obter uma API key gratuita do Adoo para realizar meu teste de 7 dias. Entrem em contato comigo. Obrigado!"
                  />
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={handleCancelForm}
                    className="flex-1 px-6 py-3 text-gray-300 border border-gray-600 rounded-lg hover:text-white hover:border-gray-400 transition-all duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar Solicitacao'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* Test Modal */}
      <TestModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
      />

    </div>
  );
}
