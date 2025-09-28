import { useEffect, useState } from 'react';
import { readSubscription } from '@/lib/billing/subscription';
import { saveCurrentPlan } from '@/utils/paymentStorage';

export function useSubscription() {
  const [sub, setSub] = useState<ReturnType<typeof readSubscription>>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // hidrata no client
    const subscription = readSubscription();
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
      if (e.key === 'cjo.subscription') {
        const newSub = readSubscription();
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
      const newSub = readSubscription();
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
