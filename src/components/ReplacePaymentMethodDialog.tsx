'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { PaymentMethod, Subscription } from '@/types/payment';
import { BRAND } from '@/utils/brand';
import { BrandBadge } from '@/components/PaymentMethodComponents';

interface ReplacePaymentMethodDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onReplaceAndRemove: (oldCardId: string, newCardId: string, affected: Subscription[]) => Promise<void>;
  onAddNewCard: () => void;
  cardToRemove: PaymentMethod | null;
  linkedSubscriptions: Subscription[];
  availableCards: PaymentMethod[];
  isLoading?: boolean;
}

export default function ReplacePaymentMethodDialog({
  isOpen,
  onClose,
  onReplaceAndRemove,
  onAddNewCard,
  cardToRemove,
  linkedSubscriptions,
  availableCards,
  isLoading = false
}: ReplacePaymentMethodDialogProps) {
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [showAddCardForm, setShowAddCardForm] = useState(false);

  // Controlar overflow do body quando modal está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup ao desmontar
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !cardToRemove) return null;

  const handleConfirm = async () => {
    if (!selectedCardId) return;
    await onReplaceAndRemove(cardToRemove.id, selectedCardId, linkedSubscriptions);
  };

  const handleAddNewCard = () => {
    onAddNewCard();
    onClose();
  };

  const handleAddNewCardInline = () => {
    setShowAddCardForm(true);
  };

  const handleNewCardAdded = (newCard: PaymentMethod) => {
    // Adicionar novo cartão à lista e selecionar como padrão
    setSelectedCardId(newCard.id);
    setShowAddCardForm(false);
  };

  // Filtrar cartões diferentes do atual (incluindo o padrão)
  const otherCards = availableCards.filter(card => card.id !== cardToRemove.id);
  const hasOtherCards = otherCards.length > 0;
  
  // Obter nome da assinatura (primeira assinatura vinculada)
  const subscriptionName = linkedSubscriptions[0]?.name || 'assinatura';
  
  // Calcular valor correto baseado no plano e período
  const getCorrectPrice = (planName: string, billing: string) => {
    if (planName === 'Premium' && billing === 'Anual') {
      return 'R$ 383,04'; // Valor total anual
    } else if (planName === 'Premium' && billing === 'Mensal') {
      return 'R$ 39,90'; // Valor mensal
    } else if (planName === 'Básico' && billing === 'Anual') {
      return 'R$ 287,04'; // Valor total anual
    } else if (planName === 'Básico' && billing === 'Mensal') {
      return 'R$ 29,90'; // Valor mensal
    }
    return linkedSubscriptions[0]?.price || 'R$ 0,00';
  };

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop - sempre visível quando modal está aberto */}
      <div 
        className="absolute inset-0 bg-black/70"
      />
      
      <div className="relative bg-gradient-to-br from-gray-900/98 to-gray-800/95 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Botão de fechar */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 z-10"
          aria-label="Fechar modal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header com ícone e gradiente */}
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-500/20 to-blue-600/30 rounded-2xl flex items-center justify-center ring-1 ring-blue-500/20">
            <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-2xl font-bold text-white mb-3 bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
              Trocar método de pagamento
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Este cartão é usado na assinatura <span className="font-semibold text-white bg-slate-800/50 px-2 py-1 rounded-md">{subscriptionName}</span>. Para removê-lo, escolha um cartão substituto.
            </p>
          </div>
        </div>

        {/* Informação da assinatura destacada com gradiente */}
        {linkedSubscriptions[0] && (
          <div className="bg-gradient-to-r from-blue-500/15 to-blue-600/10 border border-blue-500/30 rounded-2xl p-5 mb-6 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full shadow-sm"></div>
              <div className="flex-1">
                <span className="text-sm font-semibold text-blue-200">
                  {linkedSubscriptions[0].planName} - {getCorrectPrice(linkedSubscriptions[0].planName, linkedSubscriptions[0].billing)}
                </span>
                <span className="text-xs text-blue-300/80 ml-2 px-2 py-1 bg-blue-500/20 rounded-full">
                  {linkedSubscriptions[0].billing}
                </span>
              </div>
              <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Cartão padrão atual */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <h4 className="text-sm font-semibold text-slate-200">Cartão padrão atual</h4>
            <div className="h-px bg-gradient-to-r from-slate-600/50 to-transparent flex-1"></div>
          </div>
          
          <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/30 border border-slate-600/30 rounded-2xl p-5">
            <div className="flex items-center gap-4">
              <BrandBadge brand={cardToRemove.brand} />
              <div className="flex-1">
                <div className="text-white font-semibold text-base">
                  {BRAND[cardToRemove.brand]?.label || 'Cartão'} •••• {cardToRemove.last4}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Expira em {cardToRemove.expiry}
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-full font-medium">
                Padrão
              </span>
            </div>
          </div>
        </div>

        {/* Escolha do cartão substituto */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h4 className="text-sm font-semibold text-slate-200">Escolha um cartão substituto</h4>
            <div className="h-px bg-gradient-to-r from-slate-600/50 to-transparent flex-1"></div>
          </div>
          
          {showAddCardForm ? (
            <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h5 className="text-white font-semibold">Adicionar novo cartão</h5>
              </div>
              <p className="text-slate-300 text-sm mb-4">
                O formulário de cadastro será aberto. Após salvar, o novo cartão será selecionado automaticamente.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleAddNewCard}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors duration-200 cursor-pointer"
                >
                  Abrir formulário
                </button>
                <button
                  onClick={() => setShowAddCardForm(false)}
                  className="px-4 py-2 ring-1 ring-white/20 text-slate-300 hover:bg-white/5 text-sm font-medium rounded-lg transition-colors duration-200 cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : hasOtherCards ? (
            <div className="space-y-3">
              {otherCards.map((card) => (
                <label
                  key={card.id}
                  className={`group flex items-center p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${
                    selectedCardId === card.id
                      ? 'border-blue-500 bg-gradient-to-r from-blue-500/10 to-blue-600/5 ring-2 ring-blue-500/40 shadow-xl shadow-blue-500/10'
                      : 'border-white/10 hover:border-white/25 hover:bg-gradient-to-r hover:from-white/5 hover:to-white/2'
                  }`}
                >
                  <input
                    type="radio"
                    name="substituteCard"
                    value={card.id}
                    checked={selectedCardId === card.id}
                    onChange={(e) => setSelectedCardId(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-4 flex-1">
                    <div className="relative">
                      <BrandBadge brand={card.brand} />
                      {selectedCardId === card.id && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-semibold text-base">
                        {BRAND[card.brand].label} •••• {card.last4}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        Expira em {card.expiry}
                      </div>
                    </div>
                  </div>
                </label>
              ))}
              
              {/* Botão para adicionar novo cartão */}
              <button
                onClick={handleAddNewCardInline}
                className="w-full p-5 rounded-2xl border-2 border-dashed border-white/20 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all duration-300 group cursor-pointer"
              >
                <div className="flex items-center justify-center gap-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors duration-200">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <span className="text-slate-300 font-medium group-hover:text-white transition-colors duration-200">
                    Adicionar novo cartão
                  </span>
                </div>
              </button>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-slate-800/60 to-slate-700/40 rounded-3xl flex items-center justify-center mx-auto mb-6 ring-1 ring-slate-600/30">
                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h5 className="text-slate-200 text-base font-semibold mb-2">
                Nenhum cartão adicional cadastrado
              </h5>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto mb-6">
                Adicione um novo cartão para poder trocar o método de pagamento de forma segura
              </p>
              <button
                onClick={handleAddNewCardInline}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors duration-200 cursor-pointer"
              >
                Adicionar primeiro cartão
              </button>
            </div>
          )}
        </div>

        {/* Ações com divisor melhorado */}
        <div className="pt-6">
          <div className="h-px bg-gradient-to-r from-slate-600/50 to-transparent mb-6"></div>
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="h-12 px-6 text-sm font-semibold rounded-2xl ring-1 ring-white/20 text-slate-200 hover:bg-gradient-to-r hover:from-white/10 hover:to-white/5 hover:ring-white/30 transition-all duration-300 disabled:opacity-60 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading || !selectedCardId}
              className="h-12 px-6 text-sm font-bold rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Trocando...
                </div>
              ) : (
                'Trocar e remover'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}