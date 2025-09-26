'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export function useAuthState() {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('auth.user');
        return storedUser ? JSON.parse(storedUser) : null;
      } catch (error) {
        console.error('Erro ao carregar usuário do localStorage:', error);
        return null;
      }
    }
    return null;
  });

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Marcar como inicializado após a hidratação
    setIsInitialized(true);
  }, []);

  const updateUser = (newUser: User | null) => {
    setUser(newUser);
    if (typeof window !== 'undefined') {
      if (newUser) {
        localStorage.setItem('auth.user', JSON.stringify(newUser));
      } else {
        localStorage.removeItem('auth.user');
      }
    }
  };

  return {
    user,
    isAuthenticated: !!user,
    isInitialized,
    updateUser
  };
}
