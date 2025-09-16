'use client';

// COMPONENTE COMENTADO PARA TESTES DE VISUALIZAÇÃO
// Este modal será desabilitado temporariamente para permitir
// navegação livre nas funcionalidades das páginas

import { useLayoutEffect } from 'react';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  title?: string;
  subtitle?: string;
}

export default function RegisterModal({ isOpen, onClose, onSuccess, title, subtitle }: RegisterModalProps) {
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