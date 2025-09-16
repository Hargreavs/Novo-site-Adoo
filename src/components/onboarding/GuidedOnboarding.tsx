'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CoachPanel from './CoachPanel';
import RegisterModal from '../RegisterModal';

interface GuidedOnboardingProps {
  hasExistingMonitorings: boolean;
  onComplete: () => void;
  onCreateMonitoring: () => Promise<void>;
  isConfigValid: () => boolean;
  onClearSelections?: () => void;
  onCloseConfig?: () => void;
}

type OnboardingStep = 1 | 2;
type OnboardingStatus = 'in-progress' | 'completed' | 'dismissed';

const STORAGE_KEY = 'radarOnboarding';
const VERSION = 'v1';

export default function GuidedOnboarding({
  hasExistingMonitorings,
  onComplete,
  onCreateMonitoring,
  isConfigValid,
  onClearSelections,
  onCloseConfig,
}: GuidedOnboardingProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1);
  const [selectedContext, setSelectedContext] = useState<string | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  console.log('GuidedOnboarding render:', { isActive, currentStep, hasExistingMonitorings });

  // Gerenciar estado do localStorage
  const updateStorage = useCallback((status: OnboardingStatus) => {
    localStorage.setItem(STORAGE_KEY, `${VERSION}:${status}`);
  }, []);

  const getStorageStatus = useCallback((): OnboardingStatus | null => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const [version, status] = stored.split(':');
    if (version !== VERSION) return null;
    
    return status as OnboardingStatus;
  }, []);

  const checkShouldStartOnboarding = useCallback((): boolean => {
    // Verificar parâmetro da URL
    const urlParams = new URLSearchParams(window.location.search);
    const hasOnboardingParam = urlParams.get('onboarding') === '1';
    
    // Verificar se já foi completado ou dispensado
    const storageStatus = getStorageStatus();
    const isCompleted = storageStatus === 'completed' || storageStatus === 'dismissed';
    
    console.log('checkShouldStartOnboarding:', { 
      hasOnboardingParam, 
      storageStatus, 
      isCompleted,
      shouldStart: hasOnboardingParam && !isCompleted 
    });
    
    // Iniciar se tem parâmetro de onboarding E não foi completado
    return hasOnboardingParam && !isCompleted;
  }, [getStorageStatus]);

  // Verificar se deve iniciar o onboarding
  useEffect(() => {
    const shouldStart = checkShouldStartOnboarding();
    console.log('Onboarding initialization check:', { shouldStart, hasExistingMonitorings });
    if (shouldStart) {
      console.log('Starting onboarding...');
      setIsActive(true);
      setCurrentStep(1);
    }
  }, [hasExistingMonitorings, checkShouldStartOnboarding]);

  // Configurações das etapas
  const stepConfig = {
    1: {
      title: 'Selecione o contexto que tem interesse',
      description: 'Escolha uma das opções abaixo para começar a monitorar com inteligência artificial.',
      canGoNext: false, // Não mostrar botão "Próximo" no passo 1
      nextLabel: 'Próximo',
      showPrevious: false,
      showSkip: true,
    },
    2: {
      title: 'Configure seu monitoramento',
      description: 'Preencha os campos obrigatórios para configurar seu monitoramento personalizado e, em seguida, clique em criar monitoramento de contexto.',
      canGoNext: true, // Sempre permitir avançar
      nextLabel: 'Finalizar',
      showPrevious: true,
      showSkip: true,
    },
  };

  const currentConfig = {
    ...stepConfig[currentStep],
    canGoNext: stepConfig[currentStep].canGoNext
  };

  // Handlers
  const handleNext = useCallback(() => {
    if (currentStep < 2) {
      setCurrentStep((prev) => (prev + 1) as OnboardingStep);
    } else {
      handleCreateMonitoring();
    }
  }, [currentStep]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep as OnboardingStep);
      
      // Limpar seleções ao voltar para o passo 2
      if (newStep === 2 && onClearSelections) {
        onClearSelections();
      }
      
      // Fechar janela de configuração ao voltar do passo 2 para 1
      if (newStep === 1) {
        // Fechar a janela de configuração independente do contexto
        if (onCloseConfig) {
          onCloseConfig();
        }
        
        // Simular clique no botão de fechar da configuração se existir
        const closeButton = document.querySelector('#context-config-panel button[aria-label="Fechar"], #context-config-panel button svg');
        if (closeButton && closeButton instanceof HTMLElement) {
          closeButton.click();
        }
        
        // Scroll para cima para mostrar os cards de contexto
        setTimeout(() => {
          const cardsContainer = document.querySelector('#context-cards-container');
          if (cardsContainer) {
            cardsContainer.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center',
              inline: 'center'
            });
          }
        }, 100);
      }
      
      // Fazer scroll para o elemento correto do passo anterior
      setTimeout(() => {
        if (newStep === 2) {
          // Voltar para o painel de configuração
          const configPanel = document.getElementById('context-config-panel');
          if (configPanel) {
            configPanel.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center',
              inline: 'center'
            });
          }
        }
      }, 100);
    }
  }, [currentStep, onClearSelections, onCloseConfig]);

  const handleSkip = useCallback(() => {
    updateStorage('dismissed');
    setIsActive(false);
  }, [updateStorage]);

  const handleClose = useCallback(() => {
    updateStorage('dismissed');
    setIsActive(false);
  }, [updateStorage]);

  const handleCreateMonitoring = useCallback(async () => {
    try {
      setIsCreating(true);
      
      // Verificar se todos os campos obrigatórios estão preenchidos
      if (!isConfigValid()) {
        // Mostrar mensagem de erro
        alert('Finalize toda a configuração para criar o monitoramento');
        return;
      }
      
      // Verificar se usuário está logado (simulação)
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      
      if (!isLoggedIn) {
        // Sempre abrir modal de cadastro se não estiver logado
        setIsRegisterModalOpen(true);
        return;
      }
      
      // Se logado, criar monitoramento diretamente
      await onCreateMonitoring();
      handleComplete();
    } catch (error) {
      console.error('Erro ao criar monitoramento:', error);
    } finally {
      setIsCreating(false);
    }
  }, [onCreateMonitoring, isConfigValid]);

  const handleRegistrationSuccess = useCallback(async () => {
    setIsRegisterModalOpen(false);
    
    // Marcar usuário como logado
    localStorage.setItem('isLoggedIn', 'true');
    
    try {
      await onCreateMonitoring();
      handleComplete();
    } catch (error) {
      console.error('Erro ao criar monitoramento após cadastro:', error);
    }
  }, [onCreateMonitoring]);

  const handleComplete = useCallback(() => {
    updateStorage('completed');
    setIsActive(false);
    onComplete();
    
    // Mostrar toast de sucesso
    // Aqui você pode implementar um toast personalizado
    console.log('Monitoramento criado! Agora é só aguardar que nós cuidamos de tudo.');
  }, [updateStorage, onComplete]);

  // Adicionar classe de brilho aos elementos ativos
  useEffect(() => {
    if (!isActive) return;

    const addGlowClass = () => {
      const elements = document.querySelectorAll('.onb-glow');
      elements.forEach(el => el.classList.remove('onb-glow'));
      
      if (currentStep === 1) {
        // Adicionar brilho aos cards de contexto
        const contextCards = document.querySelectorAll('[id^="context-card-"]');
        contextCards.forEach(card => card.classList.add('onb-glow'));
      } else if (currentStep === 2) {
        // Adicionar brilho ao painel de configuração
        const configPanel = document.querySelector('#context-config-panel');
        if (configPanel) configPanel.classList.add('onb-glow');
        
        // Adicionar brilho ao botão de criar monitoramento
        const createBtn = document.querySelector('#btn-criar-monitoramento');
        if (createBtn) createBtn.classList.add('onb-glow');
      }
    };

    // Adicionar brilho após um pequeno delay para garantir que os elementos existam
    const timeoutId = setTimeout(addGlowClass, 100);
    
    return () => {
      clearTimeout(timeoutId);
      // Remover todas as classes de brilho ao desmontar
      const elements = document.querySelectorAll('.onb-glow');
      elements.forEach(el => el.classList.remove('onb-glow'));
    };
  }, [isActive, currentStep]);

  // Interceptar cliques nos cards de contexto na etapa 1
  useEffect(() => {
    if (!isActive || currentStep !== 1) return;

    const handleContextClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const contextCard = target.closest('[id^="context-card-"]');
      
      if (contextCard) {
        // Não prevenir o clique original, apenas atualizar o estado
        const contextId = contextCard.id.replace('context-card-', '');
        setSelectedContext(contextId);
        
        // Avançar para o passo 2 após um pequeno delay para permitir que o clique original processe
        setTimeout(() => {
          setCurrentStep(2);
          
          // Fazer scroll para centralizar a configuração
          const configPanel = document.getElementById('context-config-panel');
          if (configPanel) {
            configPanel.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center',
              inline: 'center'
            });
          }
        }, 100);
      }
    };

    document.addEventListener('click', handleContextClick, true);
    return () => document.removeEventListener('click', handleContextClick, true);
  }, [isActive, currentStep]);


  // Listener para forçar avanço manual (debug)
  useEffect(() => {
    const handleForceAdvance = () => {
      if (currentStep === 2) {
        setCurrentStep(3);
      }
    };

    window.addEventListener('forceOnboardingAdvance', handleForceAdvance);
    return () => window.removeEventListener('forceOnboardingAdvance', handleForceAdvance);
  }, [currentStep]);


  if (!isActive) return null;

  return (
    <>
      <CoachPanel
        isVisible={isActive}
        currentStep={currentStep}
        totalSteps={3}
        title={currentConfig.title}
        description={currentConfig.description}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSkip={handleSkip}
        onClose={handleClose}
        canGoNext={currentConfig.canGoNext}
        nextLabel={currentConfig.nextLabel}
        showPrevious={currentConfig.showPrevious}
        showSkip={currentConfig.showSkip}
      />

      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSuccess={handleRegistrationSuccess}
        title="Mas antes disso, vamos realizar um cadastro rápido!"
        subtitle="Crie sua conta para começar a usar o Radar IA e receber notificações personalizadas."
      />

      {/* Loading overlay para criação de monitoramento */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl border border-white/20 p-8 text-center"
            >
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white font-medium">Criando seu monitoramento...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
