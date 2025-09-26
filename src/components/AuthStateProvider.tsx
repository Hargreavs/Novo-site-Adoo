'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export default function AuthStateProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [persistentUser, setPersistentUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Carregar usuário do localStorage imediatamente
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem('auth.user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setPersistentUser(userData);
        }
      } catch (error) {
        console.error('Erro ao carregar usuário persistente:', error);
      }
      setIsReady(true);
    };

    loadUser();
  }, []);

  // Sincronizar com o contexto quando disponível
  useEffect(() => {
    if (user && user !== persistentUser) {
      setPersistentUser(user);
    }
  }, [user, persistentUser]);

  // Manter o estado persistente no localStorage
  useEffect(() => {
    if (persistentUser) {
      localStorage.setItem('auth.user', JSON.stringify(persistentUser));
    }
  }, [persistentUser]);

  return <>{children}</>;
}
