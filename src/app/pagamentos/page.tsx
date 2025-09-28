'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import EciooLogo from "@/components/EciooLogo";
import PlanCard from "@/components/PlanCard";
import PaymentStep from "@/components/PaymentStep";
import { detectBrand, BRAND } from '@/utils/brand';
import { BrandBadge, BadgeDefault } from '@/components/PaymentMethodComponents';
import PaymentMethodDropdown from '@/components/PaymentMethodDropdown';
import { PaymentMethod, Subscription } from '@/types/payment';
import { CouponValidationResponse, BillingCycle } from '@/types/billing';
import AlertDialog from '@/components/AlertDialog';
import ReplacePaymentMethodDialog from '@/components/ReplacePaymentMethodDialog';
import Toast from '@/components/Toast';
import CouponInput from '@/components/billing/CouponInput';
import { formatBRL, toCents } from '@/utils/money';
import { applyCoupon, Coupon } from '@/pricing/coupon';
import { findCoupon } from '@/lib/coupons';
import SuccessBadge from '@/components/SuccessBadge';
import ErrorBadge from '@/components/ErrorBadge';
import { 
  getPaymentMethods, 
  savePaymentMethods, 
  addPaymentMethod, 
  removePaymentMethod,
  getSubscriptions,
  saveSubscriptions,
  updateSubscriptionPaymentMethod,
  getCurrentPlan,
  saveCurrentPlan,
  generateId
} from '@/utils/paymentStorage';
import { saveSubscription, saveUserSubscription } from '@/lib/billing/subscription';
import jsPDF from 'jspdf';

// Componente CardPickerPopover
function CardPickerPopover({ 
  anchorEl, 
  cards, 
  currentId, 
  defaultId, 
  onSelect, 
  onClose 
}: {
  anchorEl: HTMLElement;
  cards: PaymentMethod[];
  currentId: string;
  defaultId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const r = anchorEl.getBoundingClientRect();
  
  useEffect(() => {
    const onDoc = (e: MouseEvent) => { 
      const target = e.target as Node;
      const popover = document.getElementById('card-picker-popover');
      
      // Só fecha se o clique foi fora do popover e fora do botão que o abriu
      if (popover && !popover.contains(target) && !anchorEl.contains(target)) {
        onClose(); 
      }
    };
    const onKey = (e: KeyboardEvent) => { 
      if (e.key === "Escape") onClose(); 
    };
    
    // Usar um pequeno delay para evitar fechamento imediato
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", onDoc); 
    }, 100);
    
    document.addEventListener("keydown", onKey);
    
    return () => { 
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", onDoc); 
      document.removeEventListener("keydown", onKey); 
    };
  }, [anchorEl, onClose]);

  const others = cards.filter(c => c.id !== currentId);

  return (
    <div
      id="card-picker-popover"
      role="listbox"
      className="fixed z-[1000] rounded-xl ring-1 ring-white/10 bg-[#0f1623] shadow-xl p-2 min-h-[44px]"
      style={{ left: r.left, top: r.bottom + 8, width: Math.max(280, r.width) }}
    >
      {others.length > 0 ? (
        others.map(c => (
          <button 
            key={c.id} 
            role="option"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(c.id);
            }}
            className="w-full h-10 px-3 text-sm rounded-md flex items-center justify-between hover:bg-white/6 focus-visible:ring-2 focus-visible:ring-blue-500/40 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <BrandBadge brand={c.brand} />
              <span>{BRAND[c.brand]?.label || 'Cartão'} <span className="font-mono text-slate-300">•••• {c.last4}</span></span>
            </div>
            {c.id === defaultId && <span className="text-emerald-300 text-xs">✓ Padrão</span>}
          </button>
        ))
      ) : (
        /* Célula quando não há outros cartões disponíveis */
        <div className="w-full h-10 px-3 text-sm rounded-md flex items-center justify-center text-slate-400 bg-white/5 border border-white/10">
          Não há nenhum outro cartão disponível
        </div>
      )}
    </div>
  );
}

// Funções utilitárias para formatação e cálculo de preços
const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

type Periodo = "mensal" | "anual";

function resumoPreco({
  precoMensal,
  periodo,
  descontoAnual = 0,
}: {
  precoMensal: number;
  periodo: Periodo;
  descontoAnual?: number;
}) {
  const totalAnoBruto = precoMensal * 12;
  const totalAnoComDesc = +(totalAnoBruto * (1 - descontoAnual)).toFixed(2);

  if (periodo === "anual") {
    return {
      totalHoje: totalAnoComDesc,
      secundario: `Equivale a ${brl(totalAnoComDesc/12)}/mês • Cobrança anual`,
      badgePeriodo: descontoAnual ? `Anual • ${Math.round(descontoAnual*100)}% OFF` : "Anual",
    };
  }
  return {
    totalHoje: +precoMensal.toFixed(2),
    secundario: `Cobrança mensal • Total no ano ${brl(precoMensal*12)}`,
    badgePeriodo: "Mensal",
  };
}


export default function Pagamentos() {
  const [isAnnualPricing, setIsAnnualPricing] = useState(true);
  const [showPlanSelector, setShowPlanSelector] = useState(false);
  const [userCurrentPlan, setUserCurrentPlan] = useState('Gratuito'); // Plano atual do usuário
  
  // Estados do fluxo de assinatura
  const [subscriptionFlow, setSubscriptionFlow] = useState<'plans' | 'summary' | 'addCard' | 'processing' | 'success' | 'error'>('plans');
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<{
    name: string;
    price: string;
    billing: string;
  } | null>(null);
  const [animationDirection, setAnimationDirection] = useState<'left' | 'right'>('right');

  // Estados para gerenciamento de cartões (persistidos)
  const [savedCard, setSavedCard] = useState<PaymentMethod | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  
  // Estados para seleção vs. padrão
  const [defaultId, setDefaultId] = useState<string | null>(null);
  const [currentId, setCurrentId] = useState<string | null>(null);
  
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showEditCardModal, setShowEditCardModal] = useState(false);
  const [showCardEditor, setShowCardEditor] = useState(false);
  const [showAddCardEditor, setShowAddCardEditor] = useState(false);
  const [cardAnimationDirection, setCardAnimationDirection] = useState<'left' | 'right'>('right');
  
  // Estados para remoção de cartões
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [showReplaceDialog, setShowReplaceDialog] = useState(false);
  const [cardToRemove, setCardToRemove] = useState<PaymentMethod | null>(null);
  
  // Estados para cupons
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResponse | null>(null);
  const [couponCode, setCouponCode] = useState<string>('');
  const [isRemovingCard, setIsRemovingCard] = useState(false);
  
  // Estados para downgrade para gratuito
  const [showDowngradeDialog, setShowDowngradeDialog] = useState(false);
  const [isDowngrading, setIsDowngrading] = useState(false);

  // Controlar overflow do body quando modal de downgrade está aberto
  useEffect(() => {
    if (showDowngradeDialog) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup ao desmontar
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showDowngradeDialog]);
  
  // Estado para toast
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    isVisible: boolean;
  }>({
    message: '',
    type: 'success',
    isVisible: false
  });
  
  // Estados para assinaturas (persistidos)
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  
  // Estados para paginação do histórico
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Estados para troca de cartão no modal de resumo
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>('');
  const [makeDefault, setMakeDefault] = useState(false);
  const [openPicker, setOpenPicker] = useState(false);
  const trocarBtnRef = useRef<HTMLButtonElement>(null);

  // Dados dos planos com preços e descontos
  const planData = {
    'Básico': {
      monthlyPrice: 29.90,
      annualDiscount: 0.20, // 20% OFF
    },
    'Premium': {
      monthlyPrice: 39.90,
      annualDiscount: 0.20, // 20% OFF
    }
  };

  // Carregar dados persistidos na inicialização
  useEffect(() => {
    // Carregar dados do localStorage
    const savedPaymentMethods = getPaymentMethods();
    const savedSubscriptions = getSubscriptions();
    const currentPlan = getCurrentPlan();
    
    console.log('=== DEBUG INICIALIZAÇÃO ===');
    console.log('Cartões carregados:', savedPaymentMethods);
    console.log('Cartões com isDefault:', savedPaymentMethods.map(c => ({ id: c.id, brand: c.brand, isDefault: c.isDefault })));
    console.log('Assinaturas carregadas:', savedSubscriptions);
    console.log('Plano atual:', currentPlan);
    
    // Verificar se há assinatura Premium com desconto
    const premiumSubscription = savedSubscriptions.find(s => s.planName === 'Premium' && s.status === 'active');
    if (premiumSubscription) {
      console.log('=== DEBUG PREMIUM SUBSCRIPTION FOUND ===');
      console.log('premiumSubscription:', premiumSubscription);
      console.log('firstChargeAmountCents:', premiumSubscription.firstChargeAmountCents);
      console.log('priceAnnualCents:', premiumSubscription.priceAnnualCents);
    }
    
    setPaymentMethods(savedPaymentMethods);
    setSubscriptions(savedSubscriptions);
    setUserCurrentPlan(currentPlan);
    
    // Inicializar estados de seleção vs. padrão
    if (savedPaymentMethods.length > 0) {
      // Encontrar o cartão padrão (VISA)
      const defaultCard = savedPaymentMethods.find(card => card.isDefault);
      
      if (defaultCard) {
        // Definir o cartão padrão
        setDefaultId(defaultCard.id);
        setCurrentId(defaultCard.id); // Inicialmente, o selecionado é o padrão
        setSavedCard(defaultCard);
        setSelectedCardId(defaultCard.id);
      } else {
        // Se não houver padrão definido, usar o primeiro cartão
        const firstCard = savedPaymentMethods[0];
        setDefaultId(firstCard.id);
        setCurrentId(firstCard.id);
        setSavedCard(firstCard);
        setSelectedCardId(firstCard.id);
      }
    }
  }, []);

  // Atualizar cartão selecionado quando selectedCardId muda
  useEffect(() => {
    console.log('=== DEBUG USEEFFECT SELECTEDCARDID ===');
    console.log('selectedCardId:', selectedCardId);
    console.log('paymentMethods.length:', paymentMethods.length);
    console.log('paymentMethods:', paymentMethods);
    
    if (selectedCardId && paymentMethods.length > 0) {
      const selectedCard = paymentMethods.find(card => card.id === selectedCardId);
      console.log('Cartão encontrado:', selectedCard);
      if (selectedCard) {
        setSavedCard(selectedCard);
        console.log('savedCard atualizado para:', selectedCard);
      }
    }
  }, [selectedCardId, paymentMethods]);


  // Mock data para o plano atual (dinâmico)
  const getCurrentPlanData = () => {
    const planPrices = {
      'Gratuito': { price: 'R$ 0,00', billing: 'Sem cobrança', nextRenewal: 'N/A' },
      'Básico': { 
        price: isAnnualPricing ? 'R$ 287,04' : 'R$ 29,90', 
        billing: isAnnualPricing ? 'Cobrado anualmente' : 'Cobrado mensalmente',
        nextRenewal: isAnnualPricing ? '15/01/2025' : '15/02/2024'
      },
      'Premium': { 
        price: isAnnualPricing ? 'R$ 383,04' : 'R$ 39,90', 
        billing: isAnnualPricing ? 'Cobrado anualmente' : 'Cobrado mensalmente',
        nextRenewal: isAnnualPricing ? '15/01/2025' : '15/02/2024'
      }
    };
    
    // Debug específico para Premium
    if (userCurrentPlan === 'Premium') {
      console.log('=== DEBUG PREMIUM getCurrentPlanData ===');
      console.log('userCurrentPlan:', userCurrentPlan);
      console.log('isAnnualPricing:', isAnnualPricing);
      console.log('planPrices[Premium]:', planPrices['Premium']);
    }
    
    return {
      name: userCurrentPlan,
      ...planPrices[userCurrentPlan as keyof typeof planPrices]
    };
  };

  // Função para obter dados da assinatura atual com desconto
  const getCurrentSubscriptionData = () => {
    // Sempre buscar do localStorage para ter dados atualizados
    const currentSubscriptions = getSubscriptions();
    
    // Debug específico para Premium e Básico
    if (userCurrentPlan === 'Premium' || userCurrentPlan === 'Básico') {
      console.log(`=== DEBUG ${userCurrentPlan.toUpperCase()} SUBSCRIPTION ===`);
      console.log('userCurrentPlan:', userCurrentPlan);
      console.log('subscriptions state:', subscriptions);
      console.log('currentSubscriptions from localStorage:', currentSubscriptions);
      
      // Verificar todas as assinaturas ativas
      const activeSubscriptions = currentSubscriptions.filter(s => s.status === 'active');
      console.log('activeSubscriptions:', activeSubscriptions);
      
      // Verificar se há assinatura do plano ativa
      const planSubscriptions = currentSubscriptions.filter(s => s.planName === userCurrentPlan);
      console.log(`${userCurrentPlan} subscriptions:`, planSubscriptions);
    }
    
    const currentSubscription = currentSubscriptions.find(
      s => s.status === 'active' && s.planName === userCurrentPlan
    );
    
    // Debug específico para Premium e Básico
    if (userCurrentPlan === 'Premium' || userCurrentPlan === 'Básico') {
      console.log('currentSubscription found:', currentSubscription);
      console.log('firstChargeAmountCents:', currentSubscription?.firstChargeAmountCents);
      console.log('priceAnnualCents:', currentSubscription?.priceAnnualCents);
      
      if (currentSubscription) {
        console.log('Calculated price from firstChargeAmountCents:', 
          currentSubscription.firstChargeAmountCents ? 
            formatBRL(currentSubscription.firstChargeAmountCents) : 'N/A');
        console.log('Calculated original price from priceAnnualCents:', 
          currentSubscription.priceAnnualCents ? 
            formatBRL(currentSubscription.priceAnnualCents) : 'N/A');
      }
    }
    
    // Se não encontrou a assinatura no localStorage, tentar no estado local
    if (!currentSubscription && subscriptions.length > 0) {
      const stateSubscription = subscriptions.find(
        s => s.status === 'active' && s.planName === userCurrentPlan
      );
      
      if (stateSubscription) {
        console.log('Found subscription in state instead of localStorage:', stateSubscription);
        
        // Debug específico para Básico e Premium
        if (userCurrentPlan === 'Básico' || userCurrentPlan === 'Premium') {
          console.log(`=== DEBUG ${userCurrentPlan.toUpperCase()} STATE SUBSCRIPTION ===`);
          console.log('stateSubscription:', stateSubscription);
          console.log('firstChargeAmountCents:', stateSubscription.firstChargeAmountCents);
          console.log('priceAnnualCents:', stateSubscription.priceAnnualCents);
        }
        
        return {
          name: stateSubscription.planName,
          price: stateSubscription.firstChargeAmountCents ? 
            formatBRL(stateSubscription.firstChargeAmountCents) : 
            getCurrentPlanData().price,
          originalPrice: stateSubscription.priceAnnualCents ? 
            formatBRL(stateSubscription.priceAnnualCents) : 
            null,
          discount: stateSubscription.firstChargeAmountCents && stateSubscription.priceAnnualCents && 
            stateSubscription.firstChargeAmountCents < stateSubscription.priceAnnualCents ? 
            formatBRL(stateSubscription.priceAnnualCents - stateSubscription.firstChargeAmountCents) : 
            null,
          billing: stateSubscription.billing,
          nextRenewal: stateSubscription.renewsAt || getCurrentPlanData().nextRenewal
        };
      }
    }
    
    if (currentSubscription) {
      // Debug específico para Básico e Premium
      if (userCurrentPlan === 'Básico' || userCurrentPlan === 'Premium') {
        console.log(`=== DEBUG ${userCurrentPlan.toUpperCase()} LOCALSTORAGE SUBSCRIPTION ===`);
        console.log('currentSubscription:', currentSubscription);
        console.log('firstChargeAmountCents:', currentSubscription.firstChargeAmountCents);
        console.log('priceAnnualCents:', currentSubscription.priceAnnualCents);
        console.log('Calculated price:', currentSubscription.firstChargeAmountCents ? 
          formatBRL(currentSubscription.firstChargeAmountCents) : 'N/A');
        console.log('Calculated original price:', currentSubscription.priceAnnualCents ? 
          formatBRL(currentSubscription.priceAnnualCents) : 'N/A');
        
        // Verificar se há desconto
        if (currentSubscription.firstChargeAmountCents && currentSubscription.priceAnnualCents) {
          const discount = currentSubscription.priceAnnualCents - currentSubscription.firstChargeAmountCents;
          console.log('Calculated discount:', formatBRL(discount));
        }
      }
      
      return {
        name: currentSubscription.planName,
        price: currentSubscription.firstChargeAmountCents ? 
          formatBRL(currentSubscription.firstChargeAmountCents) : 
          getCurrentPlanData().price,
        originalPrice: currentSubscription.priceAnnualCents ? 
          formatBRL(currentSubscription.priceAnnualCents) : 
          null,
        discount: currentSubscription.firstChargeAmountCents && currentSubscription.priceAnnualCents && 
          currentSubscription.firstChargeAmountCents < currentSubscription.priceAnnualCents ? 
          formatBRL(currentSubscription.priceAnnualCents - currentSubscription.firstChargeAmountCents) : 
          null,
        billing: currentSubscription.billing,
        nextRenewal: currentSubscription.renewsAt || getCurrentPlanData().nextRenewal
      };
    }
    
    // Retornar dados padrão com propriedades opcionais
    const defaultData = getCurrentPlanData();
    
    // Debug específico para Básico e Premium quando não encontra assinatura
    if (userCurrentPlan === 'Básico' || userCurrentPlan === 'Premium') {
      console.log(`=== DEBUG ${userCurrentPlan.toUpperCase()} NO SUBSCRIPTION FOUND ===`);
      console.log('Using default data:', defaultData);
      console.log(`This means no active subscription was found for ${userCurrentPlan}`);
    }
    
    return {
      ...defaultData,
      originalPrice: null,
      discount: null
    };
  };

  // Mock data para histórico de pagamentos
  const allPaymentHistory = [
    {
      id: 1,
      date: '15/01/2024',
      value: 'R$ 0,00',
      billing: 'Sem cobrança',
      plan: 'Gratuito',
      receipt: null
    },
    {
      id: 2,
      date: '15/12/2023',
      value: 'R$ 383,04',
      billing: 'Anual',
      plan: 'Premium',
      receipt: 'receipt_20231215.pdf'
    },
    {
      id: 3,
      date: '15/11/2023',
      value: 'R$ 39,90',
      billing: 'Mensal',
      plan: 'Premium',
      receipt: 'receipt_20231115.pdf'
    },
    {
      id: 4,
      date: '15/10/2023',
      value: 'R$ 39,90',
      billing: 'Mensal',
      plan: 'Premium',
      receipt: 'receipt_20231015.pdf'
    },
    {
      id: 5,
      date: '15/09/2023',
      value: 'R$ 287,04',
      billing: 'Anual',
      plan: 'Básico',
      receipt: 'receipt_20230915.pdf'
    },
    {
      id: 6,
      date: '15/08/2023',
      value: 'R$ 29,90',
      billing: 'Mensal',
      plan: 'Básico',
      receipt: 'receipt_20230815.pdf'
    },
    {
      id: 7,
      date: '15/07/2023',
      value: 'R$ 0,00',
      billing: 'Sem cobrança',
      plan: 'Gratuito',
      receipt: null
    }
  ];

  // Cálculos de paginação
  const totalPages = Math.ceil(allPaymentHistory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paymentHistory = allPaymentHistory.slice(startIndex, endIndex);

  // Funções de paginação
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleBackToSite = () => {
    window.location.href = '/';
  };

  const handleChangePlan = () => {
    setShowPlanSelector(true);
    // Foco no novo título após a transição
    setTimeout(() => {
      const newTitle = document.querySelector('[data-plan-selector-title]');
      if (newTitle) {
        (newTitle as HTMLElement).focus();
      }
    }, 300);
  };

  const handleBackToCurrentPlan = () => {
    setShowPlanSelector(false);
    setSubscriptionFlow('plans');
    setSelectedPlan(null);
  };

  // Funções do fluxo de assinatura
  const handleSubscribe = (plan: { name: string; price: string; billing: string }) => {
    setSelectedPlan(plan);
    clearCoupon(); // Limpar cupom ao selecionar novo plano
    setAnimationDirection('right');
    
    // Se o plano é gratuito, abrir modal de downgrade
    if (plan.name === 'Gratuito') {
      setShowDowngradeDialog(true);
      return;
    }
    
    // Se já tem cartão cadastrado, vai direto para o resumo
    if (savedCard) {
      setSelectedPaymentMethodId(savedCard.id);
      setMakeDefault(false); // Sempre começar com checkbox desmarcado
      setSubscriptionFlow('summary');
    } else if (paymentMethods.length > 0) {
      // Se não tem savedCard mas tem cartões disponíveis, usar o primeiro
      setSelectedPaymentMethodId(paymentMethods[0].id);
      setMakeDefault(false);
      setSubscriptionFlow('summary');
    } else {
      setSubscriptionFlow('addCard');
    }
  };

  // Funções para gerenciar cupons
  const handleCouponApplied = (couponResponse: CouponValidationResponse) => {
    setAppliedCoupon(couponResponse);
    setCouponCode(couponResponse.coupon?.code || '');
  };

  const handleCouponRemoved = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const clearCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const getCurrentBillingCycle = (): BillingCycle => {
    return isAnnualPricing ? 'annual' : 'monthly';
  };

  const getCurrentPlanId = (): 'free' | 'basic' | 'premium' => {
    if (!selectedPlan) return 'free';
    const planName = selectedPlan.name;
    console.log('🔍 getCurrentPlanId:', planName, '->', 
      planName === 'Básico' ? 'basic' : 
      planName === 'Premium' ? 'premium' : 'free');
    
    if (planName === 'Básico') return 'basic';
    if (planName === 'Premium') return 'premium';
    return 'free';
  };

  const getPlanPrices = () => {
    if (!selectedPlan) return { monthlyCents: 0, annualCents: 0 };
    
    const plan = planData[selectedPlan.name as keyof typeof planData];
    if (!plan) return { monthlyCents: 0, annualCents: 0 };
    
    return {
      monthlyCents: toCents(plan.monthlyPrice),
      annualCents: toCents(plan.monthlyPrice * 12 * (1 - (plan.annualDiscount || 0)))
    };
  };

  const handlePaymentSuccess = (planName: string, cardData?: any, couponCode?: string) => {
    // Persistir plano atual
    saveCurrentPlan(planName);
    setUserCurrentPlan(planName);
    
    // Log do cupom se aplicado
    if (couponCode) {
      console.log('Cupom aplicado na assinatura:', couponCode);
    }
    
    // Debug para verificar o cupom aplicado
    console.log('=== DEBUG PAYMENT SUCCESS ===');
    console.log('appliedCoupon:', appliedCoupon);
    console.log('couponCode:', couponCode);
    
    let cardId = '';
    let totalCents = 0; // Inicializar totalCents aqui
    
    // Se veio dados do cartão, salvar
    if (cardData) {
      const newCard: PaymentMethod = {
        id: generateId(),
        brand: detectBrand(cardData.number),
        last4: cardData.number.slice(-4),
        isDefault: true,
        number: cardData.number,
        name: cardData.name,
        expiry: cardData.expiry,
        cvc: cardData.cvc
      };

      // Adicionar cartão ao localStorage
      addPaymentMethod(newCard);
      cardId = newCard.id;
      
      // Atualizar estados locais
      const updatedMethods = [...paymentMethods, newCard];
      console.log('=== DEBUG PAYMENT SUCCESS ===');
      console.log('Novo cartão criado:', newCard);
      console.log('Métodos atualizados:', updatedMethods);
      
      setPaymentMethods(updatedMethods);
      setSavedCard(newCard);
      setCurrentId(newCard.id);
      setDefaultId(newCard.id);
      setSelectedCardId(newCard.id);
    } else if (savedCard) {
      // Se não veio dados do cartão mas já existe um cartão salvo, usar ele
      cardId = savedCard.id;
    }
    
    // Criar assinatura ativa vinculada ao cartão (se não for plano gratuito)
    if (planName !== 'Gratuito' && cardId) {
      // Calcular preços com cupom para o plano específico
      const plan = planData[planName as keyof typeof planData];
      if (!plan) return;
      
      const annualCents = toCents(plan.monthlyPrice * 12 * (1 - (plan.annualDiscount || 0)));
      
      // Usar o cupom aplicado ou tentar encontrar pelo código
      let coupon: Coupon | undefined = appliedCoupon?.valid ? appliedCoupon.coupon as Coupon : undefined;
      
      // Se não há cupom aplicado mas veio um código, tentar encontrar
      if (!coupon && couponCode) {
        console.log('=== DEBUG BUSCANDO CUPOM POR CÓDIGO ===');
        console.log('couponCode:', couponCode);
        
        // Buscar o cupom pelo código
        const foundCoupon = findCoupon(couponCode);
        if (foundCoupon) {
          console.log('Cupom encontrado:', foundCoupon);
          
          // Converter para o formato esperado pela função applyCoupon
          coupon = {
            code: foundCoupon.code,
            kind: foundCoupon.percentOff ? 'percent' : 'fixed_cents',
            value: foundCoupon.percentOff || foundCoupon.amountOff || 0
          };
          
          console.log('Cupom convertido:', coupon);
        } else {
          console.log('Cupom não encontrado para o código:', couponCode);
        }
      }
      
      const { discountCents, totalCents: calculatedTotalCents } = applyCoupon(annualCents, coupon);
      totalCents = calculatedTotalCents; // Atualizar totalCents aqui
      
      console.log('=== DEBUG ASSINATURA ===');
      console.log('Plano:', planName);
      console.log('Preço anual (centavos):', annualCents);
      console.log('Cupom aplicado:', coupon);
      console.log('Desconto (centavos):', discountCents);
      console.log('Total final (centavos):', totalCents);
      console.log('Total final (reais):', formatBRL(totalCents));
      
      const newSubscription: Subscription = {
        id: generateId(),
        name: `Assinatura ${planName}`,
        status: 'active',
        paymentMethodId: cardId,
        planName: planName,
        price: isAnnualPricing ? 
          (planName === 'Básico' ? 'R$ 23,92' : 'R$ 31,92') : 
          (planName === 'Básico' ? 'R$ 29,90' : 'R$ 39,90'),
        billing: isAnnualPricing ? 'Anual' : 'Mensal',
        // Dados do cupom
        priceAnnualCents: annualCents,
        firstChargeAmountCents: totalCents,
        renewsAt: isAnnualPricing ? '15/01/2025' : '15/02/2024'
      };
      
      // Debug específico para Premium e Básico
      if (planName === 'Premium' || planName === 'Básico') {
        console.log(`=== DEBUG ${planName.toUpperCase()} SUBSCRIPTION CREATION ===`);
        console.log('newSubscription:', newSubscription);
        console.log('annualCents:', annualCents);
        console.log('totalCents:', totalCents);
        console.log('formatBRL(totalCents):', formatBRL(totalCents));
        console.log('coupon applied:', coupon);
        console.log('discountCents:', discountCents);
      }
      
      // Adicionar assinatura ao localStorage
      const updatedSubscriptions = [...subscriptions, newSubscription];
      
      // Debug específico para Premium e Básico
      if (planName === 'Premium' || planName === 'Básico') {
        console.log(`=== DEBUG SAVING ${planName.toUpperCase()} SUBSCRIPTION ===`);
        console.log('updatedSubscriptions:', updatedSubscriptions);
        console.log('newSubscription being saved:', newSubscription);
      }
      
      saveSubscriptions(updatedSubscriptions);
      setSubscriptions(updatedSubscriptions);
      
      // Debug específico para Premium e Básico
      if (planName === 'Premium' || planName === 'Básico') {
        console.log(`=== DEBUG AFTER SETTING SUBSCRIPTIONS FOR ${planName.toUpperCase()} ===`);
        console.log('setSubscriptions called with:', updatedSubscriptions);
      }
    }
    
    // Salvar no estado global de assinatura
    const planId = getCurrentPlanId();
    const cycle = isAnnualPricing ? 'annual' : 'monthly';
    
    // Calcular data de renovação
    const nextRenewal = new Date();
    if (cycle === 'annual') {
      nextRenewal.setFullYear(nextRenewal.getFullYear() + 1);
    } else {
      nextRenewal.setMonth(nextRenewal.getMonth() + 1);
    }
    
    const subscriptionData = {
      planId: planId as 'basic' | 'premium' | 'free',
      cycle: cycle as 'monthly' | 'annual',
      status: 'active' as const,
      nextRenewalISO: nextRenewal.toISOString(),
      firstChargeAmountCents: planName !== 'Gratuito' ? totalCents : undefined,
      updatedAtISO: new Date().toISOString(),
    };
    
    console.log('💾 PAYMENT SUCCESS - planName:', planName, 'planId:', planId, 'cycle:', cycle);
    
    // Salvar assinatura associada ao usuário atual
    saveUserSubscription(subscriptionData);
    
    setAnimationDirection('right');
    setSubscriptionFlow('success');
  };

  // Função chamada quando a animação termina (sem redirecionamento automático)
  const handleAnimationComplete = () => {
    console.log('=== DEBUG ANIMATION COMPLETE ===');
    console.log('Animation finished, waiting for user to close manually');
    // Não redireciona automaticamente - usuário deve clicar no X
  };

  // Função para fechar a tela de sucesso manualmente
  const handleCloseSuccess = () => {
    console.log('=== DEBUG CLOSING SUCCESS SCREEN ===');
    setAnimationDirection('left');
    setSubscriptionFlow('plans');
    setSelectedPlan(null);
    setShowPlanSelector(false); // Fechar o seletor de planos para mostrar o card "Plano atual"
    
    // Debug específico para Premium e Básico
    if (userCurrentPlan === 'Premium' || userCurrentPlan === 'Básico') {
      console.log(`=== DEBUG AFTER CLOSING SUCCESS FOR ${userCurrentPlan.toUpperCase()} ===`);
      console.log('userCurrentPlan should be:', userCurrentPlan);
      console.log('subscriptions state should be updated');
      
      // Verificar se as assinaturas foram atualizadas
      const currentSubscriptions = getSubscriptions();
      console.log('Current subscriptions from localStorage:', currentSubscriptions);
      
      // Verificar se há assinatura do plano ativa
      const planSubscription = currentSubscriptions.find(s => s.planName === userCurrentPlan && s.status === 'active');
      console.log(`${userCurrentPlan} subscription found:`, planSubscription);
      
      // Forçar re-render do componente
      setUserCurrentPlan(userCurrentPlan);
      
      // Forçar atualização das assinaturas do estado
      setSubscriptions(currentSubscriptions);
    }
    
    console.log('Redirecionamento após fechamento manual');
  };

  const handlePaymentError = (error: string) => {
    console.log('=== PAYMENT ERROR ===');
    console.log('Error:', error);
    setPaymentError(error);
    setSubscriptionFlow('error');
  };

  const handleCloseError = () => {
    console.log('=== CLOSING ERROR SCREEN ===');
    setSubscriptionFlow('plans');
    setPaymentError(null);
    setSelectedPlan(null);
    setShowPlanSelector(false);
  };

  const handleBackToPlans = () => {
    setAnimationDirection('left');
    setSubscriptionFlow('plans');
    setSelectedPlan(null);
    clearCoupon(); // Limpar cupom ao voltar para planos
  };

  // Funções para gerenciamento de cartões
  const handleAddCard = () => {
    console.log('=== DEBUG ADICIONAR CARTÃO ===');
    console.log('showAddCardEditor antes:', showAddCardEditor);
    setCardAnimationDirection('right'); // Animação da direita para esquerda
    setShowAddCardEditor(true);
    console.log('showAddCardEditor depois: true');
  };

  const handleEditCard = () => {
    setCardAnimationDirection('right'); // Animação da direita para esquerda
    setShowCardEditor(true);
  };

  const handleDeleteCard = () => {
    if (!savedCard) return;
    
    // Usar o savedCard diretamente (já é um PaymentMethod)
    onRemoveClick(savedCard);
  };

  const handleSelectCard = (cardId: string) => {
    console.log('=== DEBUG SELEÇÃO DE CARTÃO ===');
    console.log('ID do cartão selecionado:', cardId);
    console.log('Cartões atuais:', paymentMethods);
    
    // Apenas trocar o cartão selecionado (currentId)
    setCurrentId(cardId);
    setSelectedCardId(cardId);
    
    // Encontrar o cartão selecionado
    const selectedCard = paymentMethods.find(card => card.id === cardId);
    if (selectedCard) {
      console.log('Cartão selecionado para exibição:', selectedCard);
      setSavedCard(selectedCard);
    }
  };

  const handleSetAsDefault = async (cardId: string) => {
    console.log('=== DEBUG DEFINIR COMO PADRÃO ===');
    console.log('ID do cartão para definir como padrão:', cardId);
    console.log('Cartões atuais:', paymentMethods);
    
    try {
      // Simular chamada da API
      // await api.patch("/payment-methods/default", { id: cardId });
      
      // Atualizar todos os cartões para remover o padrão anterior e definir o novo
      const updatedMethods = paymentMethods.map(card => ({
        ...card,
        isDefault: card.id === cardId
      }));
      
      console.log('Cartões atualizados:', updatedMethods);
      
      // Salvar no localStorage
      savePaymentMethods(updatedMethods);
      
      // Atualizar estados locais
      setPaymentMethods(updatedMethods);
      setDefaultId(cardId); // Atualizar o ID do cartão padrão
      
      // Encontrar o novo cartão padrão
      const newDefaultCard = updatedMethods.find(card => card.id === cardId);
      if (newDefaultCard) {
        console.log('Novo cartão padrão definido:', newDefaultCard);
        setSavedCard(newDefaultCard);
        setSelectedCardId(cardId);
      }
      
      // Opcional: toast.success("Cartão definido como padrão");
    } catch (error) {
      console.error('Erro ao definir como padrão:', error);
      // Opcional: toast.error("Não foi possível definir como padrão");
    }
  };

  const onRemoveClick = (card: PaymentMethod) => {
    console.log('=== DEBUG REMOÇÃO DE CARTÃO ===');
    console.log('Cartão a ser removido:', card);
    console.log('ID do cartão:', card.id);
    console.log('Assinaturas atuais:', subscriptions);
    console.log('Plano atual do usuário:', userCurrentPlan);
    
    // Verificar se há assinaturas ativas vinculadas ao cartão
    const linked = subscriptions.filter(s => s.status === "active" && s.paymentMethodId === card.id);
    console.log('Assinaturas vinculadas ao cartão:', linked);
    console.log('Quantidade de assinaturas vinculadas:', linked.length);
    console.log('Cartão é padrão?', card.isDefault);
    console.log('Condições de validação:');
    console.log('- linked.length === 0:', linked.length === 0);
    console.log('- userCurrentPlan === "Gratuito":', userCurrentPlan === 'Gratuito');
    console.log('- !card.isDefault:', !card.isDefault);
    
    // Se não há assinaturas vinculadas OU o usuário está no plano gratuito OU o cartão não é padrão
    if (linked.length === 0 || userCurrentPlan === 'Gratuito' || !card.isDefault) {
      console.log('→ Abrindo AlertDialog simples (sem assinatura, plano gratuito ou cartão não-padrão)');
      // AlertDialog simples de confirmação
      setCardToRemove(card);
      setShowAlertDialog(true);
      return;
    }

    console.log('→ Abrindo ReplaceDialog (cartão padrão com assinatura ativa)');
    // Cartão padrão com vínculos em planos pagos → obrigar substituição
    setCardToRemove(card);
    setShowReplaceDialog(true);
  };

  const handleConfirmRemove = async () => {
    if (!cardToRemove) return;
    
    setIsRemovingCard(true);
    try {
      // Simular chamada da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Remover cartão do localStorage
      removePaymentMethod(cardToRemove.id);
      
      // Atualizar estados locais
      const updatedMethods = paymentMethods.filter(m => m.id !== cardToRemove.id);
      setPaymentMethods(updatedMethods);
      
      if (updatedMethods.length > 0) {
        // Encontrar o cartão padrão ou usar o primeiro disponível
        const defaultCard = updatedMethods.find(m => m.isDefault) || updatedMethods[0];
        setSavedCard(defaultCard);
        setCurrentId(defaultCard.id);
        setSelectedCardId(defaultCard.id);
        setDefaultId(defaultCard.id);
      } else {
        // Se não há mais cartões, limpar todos os estados
        setSavedCard(null);
        setCurrentId('');
        setSelectedCardId('');
        setDefaultId('');
      }
      
      setShowAlertDialog(false);
      setCardToRemove(null);
      
      // Cartão removido com sucesso (sem toast)
    } catch (error) {
      console.error('Erro ao remover cartão:', error);
      setToast({
        message: 'Erro ao remover cartão. Tente novamente.',
        type: 'error',
        isVisible: true
      });
    } finally {
      setIsRemovingCard(false);
    }
  };

  const handleConfirmDowngrade = async () => {
    setIsDowngrading(true);
    try {
      // Simular chamada da API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Atualizar plano atual para Gratuito
      saveCurrentPlan('Gratuito');
      setUserCurrentPlan('Gratuito');
      
      // Fechar modal e seletor
      setShowDowngradeDialog(false);
      setShowPlanSelector(false);
      setSubscriptionFlow('plans');
      setSelectedPlan(null);
      
      // Toast de sucesso
      setToast({
        message: 'Mudança confirmada. Válida a partir da próxima renovação.',
        type: 'success',
        isVisible: true
      });
    } catch (error) {
      console.error('Erro ao confirmar downgrade:', error);
      setToast({
        message: 'Erro ao confirmar mudança. Tente novamente.',
        type: 'error',
        isVisible: true
      });
    } finally {
      setIsDowngrading(false);
    }
  };

  const handleReplaceAndRemove = async (oldCardId: string, newCardId: string, affected: Subscription[]) => {
    setIsRemovingCard(true);
    try {
      // Migrar assinaturas no localStorage
      for (const sub of affected) {
        updateSubscriptionPaymentMethod(sub.id, newCardId);
        console.log(`Migrando assinatura ${sub.id} para cartão ${newCardId}`);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Remover cartão antigo do localStorage
      removePaymentMethod(oldCardId);
      console.log(`Removendo cartão ${oldCardId}`);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Atualizar estados locais
      const updatedMethods = paymentMethods.filter(m => m.id !== oldCardId);
      const updatedSubscriptions = subscriptions.map(s => 
        s.id === affected[0]?.id ? { ...s, paymentMethodId: newCardId } : s
      );
      
      setPaymentMethods(updatedMethods);
      setSubscriptions(updatedSubscriptions);
      
      if (updatedMethods.length > 0) {
        // Encontrar o cartão padrão ou usar o primeiro disponível
        const defaultCard = updatedMethods.find(m => m.isDefault) || updatedMethods[0];
        setSavedCard(defaultCard);
        setCurrentId(defaultCard.id);
        setSelectedCardId(defaultCard.id);
        setDefaultId(defaultCard.id);
      } else {
        // Se não há mais cartões, limpar todos os estados
        setSavedCard(null);
        setCurrentId('');
        setSelectedCardId('');
        setDefaultId('');
      }
      
      setShowReplaceDialog(false);
      setCardToRemove(null);
      
      // Simular toast de sucesso
      console.log('Assinaturas atualizadas e cartão removido');
    } catch (error) {
      console.error('Erro ao trocar método de pagamento:', error);
    } finally {
      setIsRemovingCard(false);
    }
  };

  const handleAddNewCardForReplacement = () => {
    // Abrir formulário de adicionar cartão
    setShowAddCardEditor(true);
  };

  const handleSaveCard = (cardData: any) => {
    console.log('=== DEBUG SALVAR CARTÃO ===');
    console.log('Dados do cartão recebidos:', cardData);
    console.log('Cartões atuais:', paymentMethods);
    
    const newCard: PaymentMethod = {
      id: generateId(),
      brand: detectBrand(cardData.number),
      last4: cardData.number.slice(-4),
      isDefault: paymentMethods.length === 0, // Primeiro cartão é sempre padrão
      number: cardData.number,
      name: cardData.name,
      expiry: cardData.expiry,
      cvc: cardData.cvc
    };

    console.log('Novo cartão criado:', newCard);

    // Adicionar ao localStorage
    addPaymentMethod(newCard);
    
    // Atualizar estados locais
    const updatedMethods = [...paymentMethods, newCard];
    console.log('Cartões atualizados:', updatedMethods);
    
    setPaymentMethods(updatedMethods);
    setSavedCard(newCard);
    setSelectedCardId(newCard.id);
    setSelectedPaymentMethodId(newCard.id); // Atualizar cartão selecionado no modal
    
    // Atualizar também o currentId e defaultId se for o primeiro cartão
    if (paymentMethods.length === 0) {
      setCurrentId(newCard.id);
      setDefaultId(newCard.id);
    }
    
    setShowAddCardModal(false);
    setShowEditCardModal(false);
    setShowCardEditor(false);
    setShowAddCardEditor(false);
    
    console.log('Estados atualizados com sucesso');
    console.log('savedCard após atualização:', newCard);
  };

  const handleFinalizeSubscription = async () => {
    if (selectedPlan && selectedPaymentMethodId) {
      try {
        // Simular chamada da API para atualizar método de pagamento
        console.log('Atualizando assinatura com cartão:', selectedPaymentMethodId);
        console.log('Cupom aplicado:', appliedCoupon?.coupon?.code);
        
        // Se marcou para tornar padrão
        if (makeDefault) {
          console.log('Tornando cartão padrão:', selectedPaymentMethodId);
          await handleSetAsDefault(selectedPaymentMethodId);
          
          // Atualizar a visualização do cartão padrão na seção "Método de Pagamento"
          const newDefaultCard = paymentMethods.find(card => card.id === selectedPaymentMethodId);
          if (newDefaultCard) {
            setSavedCard(newDefaultCard);
            setCurrentId(newDefaultCard.id);
            setSelectedCardId(newDefaultCard.id);
          }
        }
        
        // Mostrar toast de sucesso
        setToast({
          message: 'Assinatura atualizada com sucesso!',
          type: 'success',
          isVisible: true
        });
        
        // Fechar modal e atualizar plano
        handlePaymentSuccess(selectedPlan.name, undefined, appliedCoupon?.coupon?.code);
      } catch (error) {
        console.error('Erro ao atualizar assinatura:', error);
        setToast({
          message: 'Erro ao atualizar assinatura. Tente novamente.',
          type: 'error',
          isVisible: true
        });
      }
    }
  };


  const handleCancelCardEdit = () => {
    setCardAnimationDirection('left'); // Animação da esquerda para direita
    setShowCardEditor(false);
  };

  const handleCancelAddCard = () => {
    setCardAnimationDirection('left'); // Animação da esquerda para direita
    setShowAddCardEditor(false);
  };

  const handleSelectPlan = (planName: string) => {
    setUserCurrentPlan(planName);
    // Aqui você pode adicionar lógica para processar a mudança de plano
    console.log('Plano selecionado:', planName);
    setShowPlanSelector(false);
  };

  const handleChangeCard = () => {
    // Implementar troca de cartão
    console.log('Trocar cartão');
  };


  const handleRemoveCard = () => {
    // Implementar remoção de cartão
    console.log('Remover cartão');
  };

  const handleDownloadReceipt = (paymentId: number) => {
    // Implementar download de recibo
    console.log('Download recibo:', paymentId);
  };

  const handleExportToPDF = () => {
    // Implementar exportação para PDF
    console.log('Exportando histórico para PDF...');
    
    try {
      // Criar novo documento PDF
      const doc = new jsPDF();
      
      // Configurações
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let yPosition = 30;
      
      // Cabeçalho
      doc.setFontSize(20);
      doc.setTextColor(0, 123, 255); // Azul
      doc.text('Histórico de Pagamentos', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 10;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Relatório gerado em ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 20;
      
      // Cabeçalho da tabela
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      
      const colWidths = [40, 50, 30, 30];
      const colPositions = [margin, margin + colWidths[0], margin + colWidths[0] + colWidths[1], margin + colWidths[0] + colWidths[1] + colWidths[2]];
      
      // Desenhar cabeçalho da tabela
      doc.setFillColor(248, 249, 250);
      doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 15, 'F');
      
      doc.text('Data', colPositions[0], yPosition);
      doc.text('Valor', colPositions[1], yPosition);
      doc.text('Plano', colPositions[2], yPosition);
      doc.text('Cobrança', colPositions[3], yPosition);
      
      yPosition += 15;
      
      // Dados da tabela
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      
      allPaymentHistory.forEach((payment, index) => {
        // Verificar se precisa de nova página
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 30;
        }
        
        // Alternar cor de fundo das linhas
        if (index % 2 === 0) {
          doc.setFillColor(248, 249, 250);
          doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 10, 'F');
        }
        
        // Dados da linha
        doc.setTextColor(0, 0, 0);
        doc.text(payment.date, colPositions[0], yPosition);
        doc.text(payment.value, colPositions[1], yPosition);
        
        // Plano com cor
        const planColor = payment.plan === 'Gratuito' ? [108, 117, 125] : 
                         payment.plan === 'Básico' ? [0, 123, 255] : 
                         [255, 193, 7];
        doc.setTextColor(planColor[0], planColor[1], planColor[2]);
        doc.text(payment.plan, colPositions[2], yPosition);
        
        // Cobrança com cor
        const billingColor = payment.billing === 'Sem cobrança' ? [108, 117, 125] : 
                            payment.billing === 'Anual' ? [0, 123, 255] : 
                            [40, 167, 69];
        doc.setTextColor(billingColor[0], billingColor[1], billingColor[2]);
        doc.text(payment.billing, colPositions[3], yPosition);
        
        yPosition += 10;
      });
      
      // Rodapé
      yPosition += 20;
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(10);
      doc.text(`Total de registros: ${allPaymentHistory.length}`, pageWidth / 2, yPosition, { align: 'center' });
      
      // Salvar PDF
      doc.save('historico-pagamentos.pdf');
      
      // Mostrar toast de sucesso
      setToast({
        message: 'Histórico exportado como PDF com sucesso!',
        type: 'success',
        isVisible: true
      });
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      setToast({
        message: 'Erro ao gerar PDF. Tente novamente.',
        type: 'error',
        isVisible: true
      });
    }
  };

  return (
    <div className="bg-transparent min-h-screen animate-fade-in">
      <div className="relative isolate px-6 pt-8 lg:px-8">
        <div className="mx-auto max-w-6xl py-4">
          {/* Header da página */}
          <div className="mb-8">
            <div className="flex items-start justify-between">
              <div>
                <div className="mb-4">
                  <Link href="/" className="cursor-pointer">
                    <EciooLogo className="h-12 w-36" />
                  </Link>
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    Gerenciar Pagamentos
                  </h1>
                  <p className="mt-2 text-base text-gray-300">
                    Veja e gerencie sua assinatura, métodos de pagamento e histórico.
                  </p>
                </div>
              </div>
              <button
                onClick={handleBackToSite}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl"
              >
                ← Voltar ao site
              </button>
            </div>
          </div>

          <div className="space-y-8 pb-16">
            {/* Seção Plano Atual / Seletor de Planos */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-blue-400/50 transition-colors duration-300 relative overflow-hidden">
                <div className="relative z-10">
                  
                  {/* Conteúdo do Plano Atual */}
                  {!showPlanSelector && (
                    <div className={`transition-all duration-300`}>
                      <h2 className="text-xl font-bold text-white mb-6">Plano Atual</h2>
                      
                      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Nome do Plano</label>
                            <p className="text-base font-semibold text-white">{getCurrentSubscriptionData().name}</p>
                          </div>
                          <div>
                            {(() => {
                              const subscriptionData = getCurrentSubscriptionData();
                              
                              // Debug para verificar os valores
                              console.log('=== DEBUG PLANO ATUAL ===');
                              console.log('subscriptionData:', subscriptionData);

                              return (
                                <>
                                  <label className="block text-sm font-medium text-gray-400 mb-2">
                                    {subscriptionData.originalPrice ? 'Pago hoje' : 'Valor'}
                                  </label>
                                  <div className="text-base font-semibold text-white">
                                    {subscriptionData.price}
                                  </div>
                                  {/* Mostrar desconto aplicado se houver */}
                                  {subscriptionData.originalPrice && subscriptionData.discount && (
                                    <div className="mt-2 space-y-1">
                                      <div className="text-sm text-gray-400 line-through">
                                        Valor original: {subscriptionData.originalPrice}
                                      </div>
                                      <div className="text-sm text-green-400 font-medium">
                                        Desconto: -{subscriptionData.discount}
                                      </div>
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Forma de Cobrança</label>
                            <p className="text-base font-semibold text-white">{getCurrentSubscriptionData().billing}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Próxima Renovação</label>
                            <p className="text-base font-semibold text-white">
                              {getCurrentSubscriptionData().nextRenewal}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-6 pt-6 border-t border-gray-700">
                          <button
                            onClick={handleChangePlan}
                            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors duration-200 cursor-pointer"
                          >
                            Alterar plano
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Seletor de Planos */}
                  {showPlanSelector && (
                    <div className={`transition-all duration-300`}>
                      {/* Header do Seletor e Toggle - apenas quando estiver na seleção de planos */}
                      {subscriptionFlow === 'plans' && (
                        <>
                          <div className="flex items-center gap-4 mb-8">
                            <button
                              onClick={handleBackToCurrentPlan}
                              className="w-8 h-8 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200 cursor-pointer"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>
                            <div>
                              <h3 
                                className="text-2xl font-bold text-white"
                                data-plan-selector-title
                                tabIndex={-1}
                                role="heading"
                                aria-level={2}
                              >
                                Escolha um plano
                              </h3>
                              <p className="text-gray-400 mt-1">Você pode mudar de plano a qualquer momento</p>
                            </div>
                          </div>

                          {/* Toggle de Preços Mensal/Anual */}
                          <div className="flex items-center justify-center mb-8">
                            <div className="flex items-center space-x-4">
                              <span className={`text-sm font-medium transition-colors duration-200 ${!isAnnualPricing ? 'text-white' : 'text-gray-400'}`}>
                                Mensal
                              </span>
                              <button
                                onClick={() => setIsAnnualPricing(!isAnnualPricing)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 cursor-pointer ${
                                  isAnnualPricing ? 'bg-blue-500' : 'bg-gray-600'
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                                    isAnnualPricing ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                              <span className={`text-sm font-medium transition-colors duration-200 ${isAnnualPricing ? 'text-white' : 'text-gray-400'}`}>
                                Anual
                              </span>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Step de Resumo (quando há cartão cadastrado) */}
                      {subscriptionFlow === 'summary' && selectedPlan && savedCard && (() => {
                        const plan = planData[selectedPlan.name as keyof typeof planData];
                        const periodo = isAnnualPricing ? "anual" : "mensal";
                        const { totalHoje, secundario, badgePeriodo } = resumoPreco({
                          precoMensal: plan?.monthlyPrice || 0,
                          periodo: periodo as Periodo,
                          descontoAnual: plan?.annualDiscount || 0,
                        });

                        // Cálculo unificado com cupom
                        const { annualCents } = getPlanPrices();
                        const annualPriceCents = annualCents;
                        const coupon: Coupon | undefined = appliedCoupon?.valid ? appliedCoupon.coupon as Coupon : undefined;
                        const { discountCents, totalCents } = applyCoupon(annualPriceCents, coupon);
                        const monthlyCents = Math.round(totalCents / 12);

                        return (
                          <div className={`mb-8 transition-all duration-300`}>
                            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                              <h3 className="text-xl font-semibold text-white mb-4">Resumo da Assinatura</h3>
                              
                              {/* Total hoje */}
                              <div className="mb-4 rounded-lg bg-white/5 ring-1 ring-white/10 p-4">
                                <div className="text-sm text-slate-300">Total hoje</div>
                                <div className="flex items-center gap-2">
                                  {appliedCoupon?.valid && (
                                    <span className="text-lg text-gray-400 line-through">{formatBRL(annualPriceCents)}</span>
                                  )}
                                  <div className="text-2xl font-semibold">
                                    {formatBRL(totalCents)}
                                  </div>
                                </div>
                                <div className="text-sm text-slate-400 mt-1">
                                  Equivale a {formatBRL(monthlyCents)}/mês
                                </div>
                              </div>
                              
                              {/* Componente de Cupom */}
                              <div className="mb-4">
                                <CouponInput
                                  planId={getCurrentPlanId()}
                                  cycle={getCurrentBillingCycle()}
                                  onApplied={handleCouponApplied}
                                  onRemoved={handleCouponRemoved}
                                  className="w-full"
                                />
                              </div>
                              
                              <div className="space-y-4">
                                <div className="flex justify-between items-center py-3 border-b border-gray-600">
                                  <span className="text-gray-300">Plano selecionado:</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-white font-semibold">{selectedPlan.name}</span>
                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                      periodo === 'anual' 
                                        ? 'bg-blue-500/20 text-blue-400' 
                                        : 'bg-green-500/20 text-green-400'
                                    }`}>
                                      {badgePeriodo}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="flex justify-between items-center py-3 border-b border-gray-600">
                                  <span className="text-gray-300">Valor original:</span>
                                  <span className="text-white font-semibold line-through">{formatBRL(annualPriceCents)}</span>
                                </div>
                                
                                {/* Linha de desconto do cupom */}
                                {appliedCoupon?.valid && discountCents > 0 && (
                                  <div className="flex justify-between items-center py-3 border-b border-gray-600">
                                    <span className="text-gray-300">Cupom {appliedCoupon.coupon?.code}:</span>
                                    <span className="text-red-400 font-semibold">
                                      -{formatBRL(discountCents)}
                                    </span>
                                  </div>
                                )}
                                
                                {/* Total final */}
                                <div className="flex justify-between items-center py-3 border-b border-gray-600">
                                  <span className="text-gray-300">Total hoje:</span>
                                  <span className="text-white font-semibold text-lg">
                                    {formatBRL(totalCents)}
                                  </span>
                                </div>
                                
                                <div className="flex justify-between items-center py-3 border-b border-gray-600">
                                  <span className="text-gray-300">Cobrança:</span>
                                  <span className="text-white font-semibold">
                                    {periodo === 'anual' ? 'Cobrado anualmente' : 'Cobrado mensalmente'}
                                  </span>
                                </div>
                                
                                <div className="flex justify-between items-center py-3">
                                  <span className="text-gray-300">Cartão:</span>
                                  <div className="flex items-center gap-2">
                                    {(() => {
                                      const selectedCard = paymentMethods.find(c => c.id === selectedPaymentMethodId);
                                      return selectedCard ? (
                                        <>
                                          <span className="text-white font-semibold">
                                            {BRAND[selectedCard.brand]?.label || 'Cartão'} •••• {selectedCard.last4}
                                          </span>
                                          <button
                                            ref={trocarBtnRef}
                                            onClick={() => setOpenPicker(true)}
                                            className="text-blue-400 hover:text-blue-300 text-sm underline cursor-pointer"
                                          >
                                            Trocar
                                          </button>
                                        </>
                                      ) : (
                                        <span className="text-gray-400">Nenhum cartão selecionado</span>
                                      );
                                    })()}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Checkbox "Tornar padrão" */}
                              {selectedPaymentMethodId !== defaultId && (
                                <label className="mt-3 inline-flex items-center gap-2 text-sm text-slate-300">
                                  <input 
                                    type="checkbox" 
                                    checked={makeDefault} 
                                    onChange={e => setMakeDefault(e.target.checked)} 
                                    className="accent-blue-500" 
                                  />
                                  Tornar este cartão o padrão
                                </label>
                              )}

                              <div className="flex gap-3 mt-6">
                                <button
                                  onClick={handleBackToPlans}
                                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 cursor-pointer"
                                >
                                  Voltar
                                </button>
                                <button
                                  onClick={handleFinalizeSubscription}
                                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 cursor-pointer"
                                >
                                  {`Finalizar assinatura — ${formatBRL(totalCents)}`}
                                </button>
                              </div>
                              
                              {/* Rodapé legal */}
                              <div className="mt-4 pt-4 border-t border-gray-700">
                                <p className="text-xs text-gray-500 text-center">
                                  Renovação automática. Você pode cancelar a qualquer momento em Pagamentos.
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Step de Pagamento */}
                      {subscriptionFlow === 'addCard' && selectedPlan && (
                        <div className={`mb-8 transition-all duration-300`}>
                          <PaymentStep
                            plan={selectedPlan}
                            onSuccess={(planName, cardData, couponCode) => {
                              handlePaymentSuccess(planName, cardData, couponCode);
                              if (couponCode) {
                                setCouponCode(couponCode);
                              }
                            }}
                            onError={handlePaymentError}
                            onBack={handleBackToPlans}
                            planId={getCurrentPlanId()}
                            billingCycle={getCurrentBillingCycle()}
                            showCouponInput={true}
                            priceMonthlyCents={getPlanPrices().monthlyCents}
                            priceAnnualCents={getPlanPrices().annualCents}
                          />
                        </div>
                      )}

                      {/* Step de Sucesso */}
                      {subscriptionFlow === 'success' && selectedPlan && (
                        <div className={`mb-8 transition-all duration-500 ease-out`}>
                          <div className="relative bg-gradient-to-br from-green-500/20 via-green-600/10 to-green-700/20 border border-green-500/40 rounded-2xl p-8 text-center overflow-hidden">
                            {/* Botão de fechar */}
                            <button
                              onClick={handleCloseSuccess}
                              className="absolute top-4 right-4 z-20 w-8 h-8 bg-gray-800/50 hover:bg-gray-700/70 rounded-full flex items-center justify-center transition-all duration-200 group cursor-pointer"
                              aria-label="Fechar tela de sucesso"
                            >
                              <svg 
                                className="w-4 h-4 text-gray-300 group-hover:text-white transition-colors duration-200" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  strokeWidth={2} 
                                  d="M6 18L18 6M6 6l12 12" 
                                />
                              </svg>
                            </button>

                            {/* Efeito de brilho de fundo */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/5 to-transparent animate-pulse"></div>
                            
                            {/* Partículas de fundo */}
                            <div className="absolute inset-0 overflow-hidden">
                              <div className="absolute top-4 left-4 w-2 h-2 bg-green-400/30 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
                              <div className="absolute top-8 right-12 w-1 h-1 bg-green-300/40 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                              <div className="absolute bottom-6 left-8 w-1.5 h-1.5 bg-green-500/30 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                              <div className="absolute bottom-4 right-8 w-1 h-1 bg-green-400/40 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
                            </div>

                            <div className="relative z-10">
                              <div className="mb-6">
                                <SuccessBadge 
                                  size={140} 
                                  className="mx-auto" 
                                  onComplete={handleAnimationComplete}
                                />
                              </div>
                              
                              <h3 className="text-3xl font-bold text-white mb-4 bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent animate-pulse">
                                Assinatura Ativada!
                              </h3>
                              
                              <p className="text-gray-200 mb-6 text-lg leading-relaxed">
                                Seu plano <strong className="text-green-300 font-semibold">{selectedPlan.name}</strong> foi ativado com sucesso.
                              </p>
                              
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Tela de Erro */}
                      {subscriptionFlow === 'error' && selectedPlan && (
                        <div className={`mb-8 transition-all duration-500 ease-out`}>
                          <div className="relative bg-gradient-to-br from-red-500/20 via-red-600/10 to-red-700/20 border border-red-500/40 rounded-2xl p-8 text-center overflow-hidden">
                            {/* Botão de fechar */}
                            <button
                              onClick={handleCloseError}
                              className="absolute top-4 right-4 z-20 w-8 h-8 bg-gray-800/50 hover:bg-gray-700/70 rounded-full flex items-center justify-center transition-all duration-200 group cursor-pointer"
                              aria-label="Fechar tela de erro"
                            >
                              <svg 
                                className="w-4 h-4 text-gray-300 group-hover:text-white transition-colors duration-200" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  strokeWidth={2} 
                                  d="M6 18L18 6M6 6l12 12" 
                                />
                              </svg>
                            </button>

                            {/* Efeito de brilho de fundo */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-400/5 to-transparent animate-pulse"></div>
                            
                            {/* Partículas de fundo */}
                            <div className="absolute inset-0 overflow-hidden">
                              <div className="absolute top-4 left-4 w-2 h-2 bg-red-400/30 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
                              <div className="absolute top-8 right-12 w-1 h-1 bg-red-300/40 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                              <div className="absolute bottom-6 left-8 w-1.5 h-1.5 bg-red-500/30 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                              <div className="absolute bottom-4 right-8 w-1 h-1 bg-red-400/40 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
                            </div>

                            <div className="relative z-10">
                              <div className="mb-6">
                                <ErrorBadge 
                                  size={140} 
                                  className="mx-auto" 
                                  onComplete={() => {
                                    console.log('=== ERROR BADGE ANIMATION COMPLETE ===');
                                  }}
                                />
                              </div>
                              
                              <h3 className="text-3xl font-bold text-white mb-4 bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent animate-pulse">
                                Pagamento com Problema
                              </h3>
                              
                              <p className="text-gray-200 mb-6 text-lg leading-relaxed">
                                {paymentError || 'Não conseguimos processar a cobrança. Verifique os dados do cartão ou tente outro método.'}
                              </p>

                              <div className="flex items-center justify-center">
                                <button
                                  onClick={() => {
                                    setSubscriptionFlow('addCard');
                                    setPaymentError(null);
                                  }}
                                  className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors duration-200 cursor-pointer"
                                >
                                  Tentar Novamente
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Cards dos Planos */}
                      {subscriptionFlow === 'plans' && (
                        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-300`}>
                        {/* Plano Gratuito */}
                        <PlanCard className={`bg-gray-800/50 border p-8 hover:border-blue-400/50 hover:text-white transition-colors duration-300 flex flex-col h-[500px] group sheen-effect ${
                          userCurrentPlan === 'Gratuito' 
                            ? 'border-blue-500 ring-4 ring-blue-500/30 shadow-[0_0_0_4px_rgba(59,130,246,0.3),0_0_20px_rgba(59,130,246,0.2)]' 
                            : 'border-gray-700'
                        }`}>
                          <div className="text-center flex flex-col h-full">
                            <h4 className="text-xl font-bold text-white group-hover:text-white group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.6)] transition-all duration-300 mb-6">Gratuito</h4>
                            
                            <div className="min-h-[120px] flex flex-col justify-start mb-2 pt-4">
                              <div className="text-3xl font-bold leading-tight text-white">R$ 0,00</div>
                            </div>

                            <ul className="space-y-4 mb-6 text-left flex-1">
                              <li className="flex items-center">
                                <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-sm text-gray-300">Buscar termos ilimitado</span>
                              </li>
                              <li className="flex items-center">
                                <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-sm text-gray-300">Download ilimitado de diários oficiais</span>
                              </li>
                              <li className="flex items-center">
                                <div className="flex-shrink-0">
                                  <div className="w-5 h-5 bg-gray-500/20 rounded-full flex items-center justify-center mr-3">
                                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  </div>
                                </div>
                                <div className="relative inline-block group-tooltip-1">
                                  <span className="text-sm text-gray-300 cursor-help underline decoration-dashed decoration-white group-tooltip-1-hover:text-white transition-colors duration-200" style={{ textUnderlineOffset: '1px' }}>
                                    1 alerta
                                  </span>
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-4 py-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-tooltip-1-hover:opacity-100 group-tooltip-1-hover:visible transition-all duration-300 pointer-events-none w-64 border border-gray-600/30" style={{ zIndex: 99999 }}>
                                    <div className="text-center">
                                      <p className="font-medium text-yellow-400 mb-1 text-sm">Limitação de 7 dias</p>
                                      <p className="text-gray-400 leading-relaxed text-xs">
                                        Alertas e contextos do Radar IA serão desativados após 7 dias. Ative um plano pago para continuar usando.
                                      </p>
                                    </div>
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900"></div>
                                  </div>
                                </div>
                              </li>
                              <li className="flex items-center">
                                <div className="flex-shrink-0">
                                  <div className="w-5 h-5 bg-gray-500/20 rounded-full flex items-center justify-center mr-3">
                                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  </div>
                                </div>
                                <div className="relative inline-block group-tooltip-2">
                                  <span className="text-sm text-gray-300 cursor-help underline decoration-dashed decoration-white group-tooltip-2-hover:text-white transition-colors duration-200" style={{ textUnderlineOffset: '1px' }}>
                                    1 contexto no Radar IA
                                  </span>
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-4 py-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-tooltip-2-hover:opacity-100 group-tooltip-2-hover:visible transition-all duration-300 pointer-events-none w-64 border border-gray-600/30" style={{ zIndex: 99999 }}>
                                    <div className="text-center">
                                      <p className="font-medium text-yellow-400 mb-1 text-sm">Limitação de 7 dias</p>
                                      <p className="text-gray-400 leading-relaxed text-xs">
                                        Alertas e contextos do Radar IA serão desativados após 7 dias. Ative um plano pago para continuar usando.
                                      </p>
                                    </div>
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900"></div>
                                  </div>
                                </div>
                              </li>
                              <li className="flex items-center">
                                <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-sm text-gray-300">Suporte: Padrão</span>
                              </li>
                            </ul>

                            {userCurrentPlan === 'Gratuito' ? (
                              <div className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-400 text-xs font-medium flex items-center justify-center gap-2 mt-auto cursor-not-allowed">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Seu plano
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  handleSubscribe({
                                    name: 'Gratuito',
                                    price: 'R$ 0,00',
                                    billing: 'Sem cobrança'
                                  });
                                }}
                                className="w-full px-3 py-2 bg-transparent border border-gray-500 text-gray-300 hover:border-gray-400 hover:text-white text-xs font-medium rounded-lg transition-colors duration-200 cursor-pointer mt-auto"
                              >
                                Mudar para gratuito
                              </button>
                            )}
                          </div>
                        </PlanCard>

                        {/* Plano Básico */}
                        <PlanCard className={`bg-gray-800/50 border p-8 hover:border-blue-400/50 hover:text-blue-300 transition-colors duration-300 flex flex-col h-[500px] group sheen-effect ${
                          userCurrentPlan === 'Básico' 
                            ? 'border-blue-500 ring-4 ring-blue-500/30 shadow-[0_0_0_4px_rgba(59,130,246,0.3),0_0_20px_rgba(59,130,246,0.2)]' 
                            : 'border-gray-700'
                        }`}>
                          <div className="text-center flex flex-col h-full">
                            <h4 className="text-xl font-bold text-white group-hover:text-blue-300 group-hover:drop-shadow-[0_0_10px_rgba(147,197,253,0.8)] transition-all duration-300 mb-6">Básico</h4>
                            
                            <div className="min-h-[120px] flex flex-col justify-center mb-2">
                              {isAnnualPricing ? (
                                <>
                                  <div className="flex items-baseline justify-center">
                                    <div className="text-3xl font-bold leading-tight text-white">R$ 23,92</div>
                                    <div className="text-sm text-white/60 ml-1">/mês</div>
                                  </div>
                                  <div className="text-xs text-white/50 mt-1">Cobrado anualmente: R$ 287,04 hoje</div>
                                  <div className="inline-flex items-center px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full mt-2">
                                    <span className="text-xs text-emerald-400 font-medium">20% OFF no plano anual</span>
                                  </div>
                                </>
                              ) : (
                                <div className="flex items-baseline justify-center">
                                  <div className="text-3xl font-bold leading-tight text-white">R$ 29,90</div>
                                  <div className="text-sm text-white/60 ml-1">/mês</div>
                                </div>
                              )}
                            </div>

                            <ul className="space-y-4 mb-8 text-left flex-1">
                              <li className="flex items-center">
                                <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-sm text-gray-300">Buscar termos ilimitado</span>
                              </li>
                              <li className="flex items-center">
                                <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-sm text-gray-300">Download ilimitado de diários oficiais</span>
                              </li>
                              <li className="flex items-center">
                                <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-sm text-gray-300">10 alertas</span>
                              </li>
                              <li className="flex items-center">
                                <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-sm text-gray-300">1 contexto ativo no Radar IA</span>
                              </li>
                              <li className="flex items-center">
                                <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-sm text-gray-300">Suporte: Padrão</span>
                              </li>
                            </ul>

                              {userCurrentPlan === 'Básico' ? (
                                <div className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-400 text-xs font-medium flex items-center justify-center gap-2 mt-auto cursor-not-allowed">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Seu plano
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    handleSubscribe({
                                      name: 'Básico',
                                      price: isAnnualPricing ? 'R$ 23,92' : 'R$ 29,90',
                                      billing: isAnnualPricing ? 'Cobrado anualmente' : 'Cobrado mensalmente'
                                    });
                                  }}
                                  className="w-full px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors duration-200 cursor-pointer mt-auto"
                                >
                                  {isAnnualPricing ? 'Assinar anual – R$ 287,04' : 'Assinar'}
                                </button>
                              )}
                          </div>
                        </PlanCard>

                        {/* Plano Premium */}
                        <PlanCard className={`bg-gray-800/50 border p-8 hover:border-blue-400/50 hover:text-amber-300 transition-colors duration-300 flex flex-col h-[500px] group sheen-effect ${
                          userCurrentPlan === 'Premium' 
                            ? 'border-blue-500 ring-4 ring-blue-500/30 shadow-[0_0_0_4px_rgba(59,130,246,0.3),0_0_20px_rgba(59,130,246,0.2)]' 
                            : 'border-gray-700'
                        }`}>
                          <div className="text-center flex flex-col h-full">
                            <h4 className="text-xl font-bold text-white group-hover:text-amber-200 group-hover:drop-shadow-[0_0_8px_rgba(253,230,138,0.5)] transition-all duration-300 mb-6">Premium</h4>
                            
                            <div className="min-h-[120px] flex flex-col justify-center mb-2">
                              {isAnnualPricing ? (
                                <>
                                  <div className="flex items-baseline justify-center">
                                    <div className="text-3xl font-bold leading-tight text-white">R$ 31,92</div>
                                    <div className="text-sm text-white/60 ml-1">/mês</div>
                                  </div>
                                  <div className="text-xs text-white/50 mt-1">Cobrado anualmente: R$ 383,04 hoje</div>
                                  <div className="inline-flex items-center px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full mt-2">
                                    <span className="text-xs text-emerald-400 font-medium">20% OFF no plano anual</span>
                                  </div>
                                </>
                              ) : (
                                <div className="flex items-baseline justify-center">
                                  <div className="text-3xl font-bold leading-tight text-white">R$ 39,90</div>
                                  <div className="text-sm text-white/60 ml-1">/mês</div>
                                </div>
                              )}
                            </div>

                            <ul className="space-y-4 mb-8 text-left flex-1">
                              <li className="flex items-center">
                                <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-sm text-gray-300">Buscar termos ilimitado</span>
                              </li>
                              <li className="flex items-center">
                                <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-sm text-gray-300">Download ilimitado de diários oficiais</span>
                              </li>
                              <li className="flex items-center">
                                <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-sm text-gray-300">Até 20 alertas</span>
                              </li>
                              <li className="flex items-center">
                                <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-sm text-gray-300">3 contextos ativos no Radar IA</span>
                              </li>
                              <li className="flex items-center">
                                <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-sm text-gray-300">Suporte: Prioritário</span>
                              </li>
                            </ul>

                                {userCurrentPlan === 'Premium' ? (
                                  <div className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-400 text-xs font-medium flex items-center justify-center gap-2 mt-auto cursor-not-allowed">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Seu plano
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => {
                                      handleSubscribe({
                                        name: 'Premium',
                                        price: isAnnualPricing ? 'R$ 31,92' : 'R$ 39,90',
                                        billing: isAnnualPricing ? 'Cobrado anualmente' : 'Cobrado mensalmente'
                                      });
                                    }}
                                    className="w-full px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors duration-200 cursor-pointer mt-auto"
                                  >
                                    {isAnnualPricing ? 'Assinar anual – R$ 383,04' : 'Assinar'}
                                  </button>
                                )}
                          </div>
                        </PlanCard>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

            {/* Seção Método de Pagamento */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-blue-400/50 transition-colors duration-300 group relative overflow-hidden">
                <div className="relative z-10">
                <h2 className="text-xl font-bold text-white mb-6">Métodos de pagamento</h2>
                
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                  {(() => {
                    console.log('=== DEBUG MÉTODOS DE PAGAMENTO ===');
                    console.log('savedCard:', savedCard);
                    console.log('paymentMethods.length:', paymentMethods.length);
                    console.log('paymentMethods:', paymentMethods);
                    console.log('showAddCardEditor:', showAddCardEditor);
                    console.log('showCardEditor:', showCardEditor);
                    return null;
                  })()}
                  {showAddCardEditor ? (
                    <div className={`transition-all duration-300 animate-fade-in-delay-2`}>
                      <PaymentStep
                        plan={{ name: 'Novo Cartão', price: 'R$ 0,00', billing: 'Cadastro' }}
                        onSuccess={(planName, cardData) => {
                          console.log('=== DEBUG PAYMENT STEP SUCCESS (NOVO CARTÃO) ===');
                          console.log('planName:', planName);
                          console.log('cardData:', cardData);
                          if (cardData) {
                            handleSaveCard(cardData);
                            setShowAddCardEditor(false); // Fechar o editor após salvar
                          }
                        }}
                        onBack={handleCancelAddCard}
                        customTitle="Novo Cartão"
                        hidePlanSummary={true}
                      />
                    </div>
                  ) : showCardEditor ? (
                    <div className={`transition-all duration-300 animate-fade-in-delay-2`}>
                      <PaymentStep
                        plan={{ name: 'Editar Cartão', price: 'R$ 0,00', billing: 'Edição' }}
                        onSuccess={(planName, cardData) => {
                          if (cardData) {
                            handleSaveCard(cardData);
                          }
                        }}
                        onBack={handleCancelCardEdit}
                        initialCardData={savedCard ? {
                          number: savedCard.number,
                          name: savedCard.name,
                          expiry: savedCard.expiry,
                          cvc: savedCard.cvc,
                          brand: savedCard.brand,
                          isDefault: savedCard.isDefault || false
                        } : undefined}
                        customTitle="Editar Cartão"
                        hidePlanSummary={true}
                      />
                    </div>
                  ) : (savedCard || paymentMethods.length > 0) ? (
                    <div className={`transition-all duration-300 animate-fade-in-delay-3`}>
                      <div className="space-y-4">
                        {/* Dropdown do cartão */}
                        <PaymentMethodDropdown
                          cards={paymentMethods}
                          currentId={currentId}
                          defaultId={defaultId}
                          onSelectCard={handleSelectCard}
                          onAddNewCard={handleAddCard}
                        />

                        {/* Botões de ação */}
                        <div className="flex justify-end flex-wrap md:flex-nowrap gap-2">
                          {/* Botão "Definir como padrão" - só aparece se o cartão selecionado não for padrão */}
                          {currentId && defaultId && currentId !== defaultId && (
                            <button
                              onClick={() => handleSetAsDefault(currentId)}
                              className="h-9 px-3 text-sm rounded-md bg-blue-600 hover:bg-blue-500 text-white font-semibold cursor-pointer"
                            >
                              Definir como padrão
                            </button>
                          )}
                          <button
                            onClick={handleEditCard}
                            className="text-sm h-9 px-3 rounded-md ring-1 ring-white/15 text-slate-200 hover:bg-white/5 transition-colors duration-200 cursor-pointer"
                          >
                            Editar
                          </button>
                          <button
                            onClick={handleDeleteCard}
                            className="text-sm h-9 px-3 rounded-md ring-1 ring-red-400/30 text-red-300 hover:bg-red-500/10 transition-colors duration-200 cursor-pointer"
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={`transition-all duration-300 animate-fade-in-delay-3`}>
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-600/50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Nenhum cartão cadastrado</h3>
                        <p className="text-gray-400 mb-6">Adicione um método de pagamento para gerenciar sua assinatura</p>
                        
                        <div className="flex justify-center">
                          <button
                            onClick={handleAddCard}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors duration-200 cursor-pointer"
                          >
                            Adicionar novo cartão
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>



            {/* Seção Histórico de Pagamentos */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-blue-400/50 transition-colors duration-300 group relative overflow-hidden">
                <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Histórico de Pagamentos</h2>
                  <button
                    onClick={() => handleExportToPDF()}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors duration-200 cursor-pointer flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Exportar PDF
                  </button>
                </div>
                
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-700/50">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Data da Assinatura</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Valor da Assinatura</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Plano</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Cobrança</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {paymentHistory.map((payment) => (
                          <tr key={payment.id} className="hover:bg-gray-700/30 transition-colors duration-200">
                            <td className="px-6 py-4 text-sm text-gray-300">{payment.date}</td>
                            <td className="px-6 py-4 text-sm text-white font-medium">{payment.value}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                payment.plan === 'Gratuito' 
                                  ? 'bg-gray-500/20 text-gray-400' 
                                  : payment.plan === 'Básico'
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : 'bg-amber-500/20 text-amber-400'
                              }`}>
                                {payment.plan}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                payment.billing === 'Sem cobrança' 
                                  ? 'bg-gray-500/20 text-gray-400' 
                                  : payment.billing === 'Anual'
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : 'bg-green-500/20 text-green-400'
                              }`}>
                                {payment.billing}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {paymentHistory.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-400">Nenhum pagamento encontrado</p>
                    </div>
                  )}
                </div>
                
                {/* Componente de Paginação */}
                {allPaymentHistory.length > itemsPerPage && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-400">
                      Mostrando {startIndex + 1} a {Math.min(endIndex, allPaymentHistory.length)} de {allPaymentHistory.length} registros
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {/* Botão Anterior */}
                      <button
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                          currentPage === 1
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-600 hover:bg-gray-500 text-white cursor-pointer'
                        }`}
                      >
                        Anterior
                      </button>
                      
                      {/* Números das páginas */}
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`w-10 h-10 text-sm font-medium rounded-lg transition-colors duration-200 flex items-center justify-center ${
                              currentPage === page
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-600 hover:bg-gray-500 text-white cursor-pointer'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                      
                      {/* Botão Próximo */}
                      <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                          currentPage === totalPages
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-600 hover:bg-gray-500 text-white cursor-pointer'
                        }`}
                      >
                        Próximo
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Estilos CSS para animação fade-in */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }

        .animate-fade-in-delay-1 {
          animation: fadeIn 0.6s ease-out 0.1s both;
        }

        .animate-fade-in-delay-2 {
          animation: fadeIn 0.6s ease-out 0.2s both;
        }

        .animate-fade-in-delay-3 {
          animation: fadeIn 0.6s ease-out 0.3s both;
        }

        @keyframes fadeOutLeft {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(-30px);
          }
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeOutRight {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(30px);
          }
        }

        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scaleInFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-out-left {
          animation: fadeOutLeft 0.25s ease-in forwards;
        }

        .animate-fade-in-right {
          animation: fadeInRight 0.3s ease-out forwards;
        }

        .animate-fade-out-right {
          animation: fadeOutRight 0.25s ease-in forwards;
        }

        .animate-fade-in-left {
          animation: fadeInLeft 0.3s ease-out forwards;
        }

        .animate-scale-in-fade-in-1 {
          animation: scaleInFadeIn 0.3s ease-out 0.1s both;
        }

        .animate-scale-in-fade-in-2 {
          animation: scaleInFadeIn 0.3s ease-out 0.2s both;
        }

        .animate-scale-in-fade-in-3 {
          animation: scaleInFadeIn 0.3s ease-out 0.3s both;
        }

        /* Efeito Sheen */
        .sheen-effect {
          position: relative;
          overflow: hidden;
        }

        .sheen-effect::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(45deg, transparent 45%, rgba(255,255,255,0.08) 50%, transparent 55%);
          transform: translateX(-100%) translateY(-100%) rotate(45deg);
          transition: transform 0.6s ease-out;
          pointer-events: none;
          z-index: 1;
          opacity: 0;
        }

        .sheen-effect:hover::before {
          opacity: 1;
          transform: translateX(100%) translateY(100%) rotate(45deg);
          transition: opacity 0.1s ease-out, transform 0.6s ease-out;
        }

        /* Tooltips separados para evitar conflito */
        .group-tooltip-1:hover .group-tooltip-1-hover\:text-white {
          color: white;
        }
        
        .group-tooltip-1:hover .group-tooltip-1-hover\:opacity-100 {
          opacity: 1;
        }
        
        .group-tooltip-1:hover .group-tooltip-1-hover\:visible {
          visibility: visible;
        }

        .group-tooltip-2:hover .group-tooltip-2-hover\:text-white {
          color: white;
        }
        
        .group-tooltip-2:hover .group-tooltip-2-hover\:opacity-100 {
          opacity: 1;
        }
        
        .group-tooltip-2:hover .group-tooltip-2-hover\:visible {
          visibility: visible;
        }


      `}</style>

      {/* Diálogos de confirmação e troca */}
      <AlertDialog
        isOpen={showAlertDialog}
        onClose={() => {
          setShowAlertDialog(false);
          setCardToRemove(null);
        }}
        onConfirm={handleConfirmRemove}
        title={`Remover cartão ${cardToRemove ? (BRAND[cardToRemove.brand]?.label || 'Cartão') : ''} •••• ${cardToRemove?.last4}?`}
        description="Este cartão não está vinculado a nenhuma assinatura."
        confirmLabel="Remover"
        confirmTone="danger"
        isLoading={isRemovingCard}
        brand={cardToRemove?.brand}
        last4={cardToRemove?.last4}
      />

      <ReplacePaymentMethodDialog
        isOpen={showReplaceDialog}
        onClose={() => {
          setShowReplaceDialog(false);
          setCardToRemove(null);
        }}
        onReplaceAndRemove={handleReplaceAndRemove}
        onAddNewCard={handleAddNewCardForReplacement}
        cardToRemove={cardToRemove}
        linkedSubscriptions={cardToRemove ? subscriptions.filter(s => s.status === "active" && s.paymentMethodId === cardToRemove.id) : []}
        availableCards={paymentMethods}
        isLoading={isRemovingCard}
      />

      {/* Modal de Downgrade para Gratuito */}
      {showDowngradeDialog && createPortal(
        <div 
          className="fixed inset-0 z-[10000]"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh'
          }}
        >
          <div className="absolute inset-0 bg-black/70" />
          <div 
            className="bg-gradient-to-br from-gray-900/98 to-gray-800/95 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              maxWidth: '32rem',
              width: 'calc(100vw - 2rem)',
              maxHeight: '90vh'
            }}
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-amber-500/20 to-orange-500/30 rounded-xl flex items-center justify-center ring-1 ring-amber-500/20">
                <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-semibold text-white mb-2">
                  Mudar para o plano Gratuito
                </h3>
                <p className="text-sm text-slate-300">
                  Confirme a mudança para o plano gratuito
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-slate-300 mb-6">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>Sem cobrança hoje.</strong></span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                <span>Você continuará com <strong>{userCurrentPlan}</strong> até <strong>15/01/2025</strong>.</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                <span>Na próxima renovação, sua assinatura será convertida para <strong>Gratuito</strong>.</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                <span>Você perderá: <strong>Alertas ilimitados</strong>, <strong>Contextos do Radar IA</strong>, <strong>Suporte prioritário</strong>.</span>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDowngradeDialog(false)}
                disabled={isDowngrading}
                className="h-10 px-4 text-sm rounded-md ring-1 ring-white/15 text-slate-300 hover:bg-white/5 transition-colors duration-200 disabled:opacity-60 cursor-pointer"
              >
                Voltar
              </button>
              <button
                onClick={handleConfirmDowngrade}
                disabled={isDowngrading}
                className="h-10 px-4 text-sm rounded-md bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isDowngrading ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Confirmando...
                  </div>
                ) : (
                  'Confirmar mudança'
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Toast de notificação */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />

      {/* Popover de seleção de cartão */}
      {openPicker && trocarBtnRef.current && createPortal(
        <CardPickerPopover
          anchorEl={trocarBtnRef.current}
          cards={paymentMethods}
          currentId={selectedPaymentMethodId}
          defaultId={defaultId}
          onSelect={(id) => { 
            setSelectedPaymentMethodId(id); 
            setMakeDefault(false); // Resetar checkbox ao trocar cartão
            setOpenPicker(false); 
          }}
          onClose={() => setOpenPicker(false)}
        />,
        document.body
      )}

    </div>
  );
}