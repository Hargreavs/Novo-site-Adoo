'use client';

// COMPONENTE COMENTADO PARA TESTES DE VISUALIZAÇÃO
// Este modal será desabilitado temporariamente para permitir
// navegação livre nas funcionalidades das páginas

import { useLayoutEffect } from 'react';

interface SimpleRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  name: string;
  email: string;
}

export default function SimpleRegisterModal({ isOpen, onClose, onSuccess, name, email }: SimpleRegisterModalProps) {
  // COMPONENTE DESABILITADO PARA TESTES - SEMPRE FECHA IMEDIATAMENTE
  useLayoutEffect(() => {
    if (isOpen) {
      // Simular login automático para testes
      localStorage.setItem('isLoggedIn', 'true');
      onSuccess?.();
      onClose();
    }
  }, [isOpen, onClose, onSuccess]);

  // Retornar null para não renderizar nada
  return null;
}