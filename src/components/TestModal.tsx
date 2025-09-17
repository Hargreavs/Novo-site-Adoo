'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import EciooLogo from '@/components/EciooLogo';

interface TestModalProps {
  isOpen: boolean;
  onClose: () => void;
  preFilledData?: {
    name?: string;
    email?: string;
  };
}

export default function TestModal({ isOpen, onClose, preFilledData }: TestModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: preFilledData?.name || '',
        email: preFilledData?.email || '',
        password: '',
        confirmPassword: ''
      });
      console.log('Modal opened - isOpen:', isOpen, 'preFilledData:', preFilledData);
    }
  }, [isOpen, preFilledData]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGoogleSignup = () => {
    console.log('Google signup clicked');
    // Implementar integração com Google
    alert('Integração com Google em desenvolvimento');
  };

  const handleAppleSignup = () => {
    console.log('Apple signup clicked');
    // Implementar integração com Apple
    alert('Integração com Apple em desenvolvimento');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      console.log('Form submitted:', formData);
      alert('Conta criada com sucesso! Bem-vindo ao ecioo!');
      setIsLoading(false);
      onClose();
    }, 2000);
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop com blur */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm z-[9998]"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gray-900 rounded-xl shadow-2xl max-w-sm w-full z-[10000] overflow-hidden border border-gray-700">
        {/* Header com logo */}
        <div className="relative p-4 border-b border-gray-700">
          {/* Botão de fechar no canto superior direito */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all duration-200 p-1.5 rounded-full"
            aria-label="Fechar modal"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
          
          {/* Conteúdo principal */}
          <div className="pr-10">
            <div className="flex items-center space-x-3 mb-2">
              <EciooLogo className="h-8 w-24 flex-shrink-0" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white leading-tight mb-1">
                Comece seu teste gratuito
              </h2>
              <p className="text-gray-300 text-sm">
                Acesse todos os recursos por 7 dias
              </p>
            </div>
          </div>
        </div>

        {/* Conteúdo do modal */}
        <div className="p-4">
          {/* Botões de integração */}
          <div className="space-y-2 mb-4">
            <button
              onClick={handleGoogleSignup}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 border border-gray-600 rounded-md hover:bg-gray-800 transition-colors bg-gray-800/50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-white text-sm font-medium">Continuar com Google</span>
            </button>

            <button
              onClick={handleAppleSignup}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 border border-gray-600 rounded-md hover:bg-gray-800 transition-colors bg-gray-800/50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.78 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <span className="text-white text-sm font-medium">Continuar com Apple</span>
            </button>
          </div>

          {/* Divisor */}
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-gray-900 text-gray-400">ou</span>
            </div>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Campos de nome e email - só mostram se não estiverem preenchidos */}
            {(!preFilledData?.name || !preFilledData?.email) && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Nome completo *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-white placeholder-gray-400 text-sm"
                    placeholder="Digite seu nome completo"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-white placeholder-gray-400 text-sm"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </>
            )}

            {/* Mostrar dados preenchidos se existirem */}
            {(preFilledData?.name || preFilledData?.email) && (
              <div className="bg-gray-800/50 rounded-md p-3 border border-gray-600">
                <p className="text-xs text-gray-400 mb-1">Dados preenchidos:</p>
                {preFilledData?.name && (
                  <p className="text-white text-xs mb-1">
                    <span className="text-gray-400">Nome:</span> {preFilledData.name}
                  </p>
                )}
                {preFilledData?.email && (
                  <p className="text-white text-xs">
                    <span className="text-gray-400">E-mail:</span> {preFilledData.email}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Senha *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors pr-8 text-white placeholder-gray-400 text-sm"
                  placeholder="Mínimo 6 caracteres"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-white"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Confirmar senha *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors pr-8 text-white placeholder-gray-400 text-sm"
                  placeholder="Digite a senha novamente"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-white"
                >
                  {showConfirmPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Botão de submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-3 rounded-md text-sm font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isLoading ? 'Criando conta...' : 'Iniciar teste gratuito'}
            </button>
          </form>

          {/* Texto legal */}
          <p className="text-xs text-gray-400 text-center mt-3">
            Ao criar uma conta, você concorda com nossos{' '}
            <a href="/termos-de-uso" className="text-blue-400 hover:underline">
              Termos de Uso
            </a>{' '}
            e{' '}
            <a href="/politica-de-privacidade" className="text-blue-400 hover:underline">
              Política de Privacidade
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );

  if (typeof window !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
}
