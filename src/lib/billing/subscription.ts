export type PlanId = 'free' | 'basic' | 'premium';
export type BillingCycle = 'monthly' | 'annual';
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled';

export type Subscription = {
  planId: PlanId;
  cycle: BillingCycle;
  status: SubscriptionStatus;     // 'active' ao ativar
  nextRenewalISO?: string;        // '2025-01-15'
  firstChargeAmountCents?: number; // 19152 se usou cupom
  updatedAtISO: string;
};

const STORAGE_KEY = 'cjo.subscription';
const USER_SUBSCRIPTIONS_KEY = 'cjo.user_subscriptions';

/** Salva e notifica o app inteiro */
export function saveSubscription(sub: Subscription) {
  if (typeof window === 'undefined') return;
  
  console.log('💾 SAVING SUBSCRIPTION:', sub);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sub));
  window.dispatchEvent(new Event('subscription:updated'));
}

/** Lê do storage com fallback seguro */
export function readSubscription(): Subscription | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Subscription;
  } catch {
    return null;
  }
}

/** Remove a assinatura do storage */
export function clearSubscription() {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event('subscription:updated'));
}

/** Obtém o email do usuário atual do localStorage */
function getCurrentUserEmail(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const user = localStorage.getItem('auth.user');
    if (!user) return null;
    const userData = JSON.parse(user);
    return userData.email || null;
  } catch {
    return null;
  }
}

/** Salva assinatura associada ao usuário atual */
export function saveUserSubscription(sub: Subscription) {
  if (typeof window === 'undefined') return;
  
  const userEmail = getCurrentUserEmail();
  if (!userEmail) {
    console.warn('Nenhum usuário logado para salvar assinatura');
    return;
  }
  
  // Obter assinaturas existentes
  const existingSubscriptions = getUserSubscriptions();
  
  // Atualizar assinatura do usuário atual
  existingSubscriptions[userEmail] = sub;
  
  // Salvar no localStorage
  localStorage.setItem(USER_SUBSCRIPTIONS_KEY, JSON.stringify(existingSubscriptions));
  
  // Também salvar na chave antiga para compatibilidade
  saveSubscription(sub);
  
  console.log('💾 SAVING USER SUBSCRIPTION:', { userEmail, sub });
}

/** Lê assinatura do usuário atual */
export function readUserSubscription(): Subscription | null {
  if (typeof window === 'undefined') return null;
  
  const userEmail = getCurrentUserEmail();
  console.log('📖 readUserSubscription - userEmail:', userEmail);
  
  if (!userEmail) {
    console.warn('Nenhum usuário logado para ler assinatura');
    return null;
  }
  
  try {
    const subscriptions = getUserSubscriptions();
    console.log('📖 readUserSubscription - all subscriptions:', subscriptions);
    const userSub = subscriptions[userEmail] || null;
    console.log('📖 readUserSubscription - userSub for', userEmail, ':', userSub);
    return userSub;
  } catch (error) {
    console.error('📖 readUserSubscription - error:', error);
    return null;
  }
}

/** Obtém todas as assinaturas de usuários */
function getUserSubscriptions(): Record<string, Subscription> {
  if (typeof window === 'undefined') return {};
  
  try {
    const raw = localStorage.getItem(USER_SUBSCRIPTIONS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/** Remove assinatura do usuário atual */
export function clearUserSubscription() {
  if (typeof window === 'undefined') return;
  
  const userEmail = getCurrentUserEmail();
  if (!userEmail) return;
  
  const subscriptions = getUserSubscriptions();
  delete subscriptions[userEmail];
  
  localStorage.setItem(USER_SUBSCRIPTIONS_KEY, JSON.stringify(subscriptions));
  
  // Também limpar a chave antiga
  clearSubscription();
  
  console.log('🗑️ CLEARED USER SUBSCRIPTION:', userEmail);
}

