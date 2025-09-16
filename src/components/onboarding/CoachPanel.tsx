'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface CoachPanelProps {
  isVisible: boolean;
  currentStep: number;
  totalSteps: number;
  title: string;
  description: string;
  onPrevious: () => void;
  onNext: () => void;
  onSkip: () => void;
  onClose: () => void;
  canGoNext: boolean;
  nextLabel?: string;
  showPrevious?: boolean;
  showSkip?: boolean;
}

export default function CoachPanel({
  isVisible,
  currentStep,
  totalSteps,
  title,
  description,
  onPrevious,
  onNext,
  onSkip,
  onClose,
  canGoNext,
  nextLabel = 'Próximo',
  showPrevious = true,
  showSkip = true,
}: CoachPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Gerenciar foco para acessibilidade
  useEffect(() => {
    if (isVisible && panelRef.current) {
      const focusableElements = panelRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      if (firstElement) {
        firstElement.focus();
      }
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={panelRef}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed z-50 pointer-events-auto"
        style={{
          bottom: '1rem',
          right: '1rem',
        }}
        role="dialog"
        aria-labelledby="coach-title"
        aria-describedby="coach-description"
        aria-live="polite"
      >
        {/* Mobile: centralizar na parte inferior */}
        <div className="block md:hidden w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-4 w-full"
          >
            <CoachContent
              currentStep={currentStep}
              totalSteps={totalSteps}
              title={title}
              description={description}
              onPrevious={onPrevious}
              onNext={onNext}
              onSkip={onSkip}
              onClose={onClose}
              canGoNext={canGoNext}
              nextLabel={nextLabel}
              showPrevious={showPrevious}
              showSkip={showSkip}
            />
          </motion.div>
        </div>

        {/* Desktop: canto inferior direito */}
        <div className="hidden md:block">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-4 w-72"
            style={{ maxWidth: 'calc(100vw - 4rem)' }}
          >
            <CoachContent
              currentStep={currentStep}
              totalSteps={totalSteps}
              title={title}
              description={description}
              onPrevious={onPrevious}
              onNext={onNext}
              onSkip={onSkip}
              onClose={onClose}
              canGoNext={canGoNext}
              nextLabel={nextLabel}
              showPrevious={showPrevious}
              showSkip={showSkip}
            />
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function CoachContent({
  currentStep,
  totalSteps,
  title,
  description,
  onPrevious,
  onNext,
  onSkip,
  onClose,
  canGoNext,
  nextLabel,
  showPrevious,
  showSkip,
}: Omit<CoachPanelProps, 'isVisible'>) {
  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-md flex items-center justify-center">
              <span className="text-white text-xs font-semibold">{currentStep}</span>
            </div>
            <span className="text-xs text-gray-400">
              Passo {currentStep} de 2
            </span>
          </div>
          <h3 id="coach-title" className="text-base font-semibold text-white mb-1">
            {title}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded-lg transition-colors ml-2"
          aria-label="Fechar onboarding"
        >
          <XMarkIcon className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Description */}
      <p id="coach-description" className="text-gray-300 text-xs mb-4 leading-relaxed">
        {description}
      </p>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="h-1 bg-gray-700 rounded-full">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / 2) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2">
          {showPrevious && currentStep > 1 && (
            <button
              onClick={onPrevious}
              className="px-2.5 py-1.5 bg-gray-700/50 text-white rounded-md hover:bg-gray-600/50 transition-colors text-xs font-medium flex items-center gap-1.5"
            >
              <ChevronLeftIcon className="w-3 h-3" />
              Voltar
            </button>
          )}
          {showSkip && (
            <button
              onClick={onSkip}
              className="px-2.5 py-1.5 text-gray-400 hover:text-white transition-colors text-xs font-medium"
            >
              Ignorar
            </button>
          )}
        </div>

        {canGoNext && (
          <button
            onClick={onNext}
            className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105"
          >
            {nextLabel}
            <ChevronRightIcon className="w-3 h-3" />
          </button>
        )}
      </div>
    </>
  );
}
