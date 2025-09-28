import { PaymentMethod, Subscription } from '@/types/payment';

const STORAGE_KEYS = {
  PAYMENT_METHODS: 'payment_methods',
  SUBSCRIPTIONS: 'subscriptions',
  CURRENT_PLAN: 'current_plan'
} as const;

// Funções para PaymentMethods
export const getPaymentMethods = (): PaymentMethod[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PAYMENT_METHODS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Erro ao carregar métodos de pagamento:', error);
    return [];
  }
};

export const savePaymentMethods = (methods: PaymentMethod[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify(methods));
  } catch (error) {
    console.error('Erro ao salvar métodos de pagamento:', error);
  }
};

export const addPaymentMethod = (method: PaymentMethod): void => {
  const methods = getPaymentMethods();
  const newMethods = [...methods, method];
  savePaymentMethods(newMethods);
};

export const removePaymentMethod = (methodId: string): void => {
  const methods = getPaymentMethods();
  const filteredMethods = methods.filter(m => m.id !== methodId);
  savePaymentMethods(filteredMethods);
};

export const updatePaymentMethod = (methodId: string, updates: Partial<PaymentMethod>): void => {
  const methods = getPaymentMethods();
  const updatedMethods = methods.map(m => 
    m.id === methodId ? { ...m, ...updates } : m
  );
  savePaymentMethods(updatedMethods);
};

// Funções para Subscriptions
export const getSubscriptions = (): Subscription[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Erro ao carregar assinaturas:', error);
    return [];
  }
};

export const saveSubscriptions = (subscriptions: Subscription[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subscriptions));
  } catch (error) {
    console.error('Erro ao salvar assinaturas:', error);
  }
};

export const updateSubscriptionPaymentMethod = (subscriptionId: string, newPaymentMethodId: string): void => {
  const subscriptions = getSubscriptions();
  const updatedSubscriptions = subscriptions.map(s => 
    s.id === subscriptionId ? { ...s, paymentMethodId: newPaymentMethodId } : s
  );
  saveSubscriptions(updatedSubscriptions);
};

// Funções para Current Plan
export const getCurrentPlan = (): string => {
  if (typeof window === 'undefined') return 'Gratuito';
  
  try {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_PLAN) || 'Gratuito';
  } catch (error) {
    console.error('Erro ao carregar plano atual:', error);
    return 'Gratuito';
  }
};

export const saveCurrentPlan = (plan: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_PLAN, plan);
  } catch (error) {
    console.error('Erro ao salvar plano atual:', error);
  }
};

// Função para inicializar dados mock
export const initializeMockData = (): void => {
  if (typeof window === 'undefined') return;
  
  // Limpar dados antigos para forçar recriação
  localStorage.removeItem('subscriptions');
  localStorage.removeItem('payment_methods');
  localStorage.removeItem('current_plan');
  
  // Configurar usuário como assinante do plano básico anual
  saveCurrentPlan('Básico');
  
  // Criar cartão mock para o usuário alex.augustus2501@gmail.com
  const mockPaymentMethods: PaymentMethod[] = [
    {
      id: 'card_1',
      brand: 'VISA',
      last4: '5555',
      isDefault: true,
      number: '4444444444445555',
      name: 'RAFAEL XIMENES',
      expiry: '01/26',
      cvc: '123'
    }
  ];
  savePaymentMethods(mockPaymentMethods);
  
  // Criar assinatura mock do plano básico anual
  const mockSubscriptions: Subscription[] = [
    {
      id: 'sub_1',
      name: 'Assinatura Básico',
      status: 'active',
      paymentMethodId: 'card_1',
      planName: 'Básico',
      price: 'R$ 277,04',
      billing: 'Anual',
      // Dados do plano básico anual
      priceAnnualCents: 27704, // R$ 277,04
      firstChargeAmountCents: 27704, // R$ 277,04 (sem desconto)
      renewsAt: '15/01/2025'
    }
  ];
  saveSubscriptions(mockSubscriptions);
};

// Função para gerar ID único
export const generateId = (): string => {
  return 'id_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
};
