import { useEffect, useState } from 'react';
import { readSubscription, readUserSubscription, saveUserSubscription } from '@/lib/billing/subscription';
import { saveCurrentPlan } from '@/utils/paymentStorage';

export function useSubscription() {
  const [sub, setSub] = useState<ReturnType<typeof readSubscription>>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // hidrata no client - priorizar assinatura do usuário
    const userSubscription = readUserSubscription();
    const fallbackSubscription = readSubscription();
    const subscription = userSubscription || fallbackSubscription;
    
    console.log('🔄 HOOK INIT - userSubscription:', userSubscription);
    console.log('🔄 HOOK INIT - fallbackSubscription:', fallbackSubscription);
    console.log('🔄 HOOK INIT - final subscription:', subscription);
    console.log('🔄 HOOK INIT - subscription.planId:', subscription?.planId);
    setSub(subscription);
    setLoaded(true);

    // Sincronizar com o sistema de current_plan
    if (subscription?.status === 'active') {
      const planName = subscription.planId === 'basic' ? 'Básico' : 
                     subscription.planId === 'premium' ? 'Premium' : 'Gratuito';
      saveCurrentPlan(planName);
    } else {
      saveCurrentPlan('Gratuito');
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'cjo.subscription' || e.key === 'cjo.user_subscriptions') {
        const userSubscription = readUserSubscription();
        const fallbackSubscription = readSubscription();
        const newSub = userSubscription || fallbackSubscription;
        
        console.log('🔄 STORAGE EVENT - userSub:', userSubscription, 'fallback:', fallbackSubscription, 'final:', newSub);
        setSub(newSub);
        
        // Sincronizar com o sistema de current_plan
        if (newSub?.status === 'active') {
          const planName = newSub.planId === 'basic' ? 'Básico' : 
                         newSub.planId === 'premium' ? 'Premium' : 'Gratuito';
          saveCurrentPlan(planName);
        } else {
          saveCurrentPlan('Gratuito');
        }
      }
    };
    
    const onCustom = () => {
      const userSubscription = readUserSubscription();
      const fallbackSubscription = readSubscription();
      const newSub = userSubscription || fallbackSubscription;
      
      console.log('🔄 CUSTOM EVENT - userSub:', userSubscription, 'fallback:', fallbackSubscription, 'final:', newSub);
      setSub(newSub);
      
      // Sincronizar com o sistema de current_plan
      if (newSub?.status === 'active') {
        const planName = newSub.planId === 'basic' ? 'Básico' : 
                       newSub.planId === 'premium' ? 'Premium' : 'Gratuito';
        saveCurrentPlan(planName);
      } else {
        saveCurrentPlan('Gratuito');
      }
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('subscription:updated', onCustom);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('subscription:updated', onCustom);
    };
  }, []);

  return { sub, loaded };
}
