'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import EciooLogo from '@/components/EciooLogo';
import { useAuth } from '@/contexts/AuthContext';

interface TestModalProps {
  isOpen: boolean;
  onClose: () => void;
  preFilledData?: {
    name?: string;
    email?: string;
  };
}

export default function TestModal({ isOpen, onClose, preFilledData }: TestModalProps) {
  const { signup, verifyCode, acceptPolicies, pendingUser, clearPendingUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Estados para verificação de código
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [showVerification, setShowVerification] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [isVerificationLoading, setIsVerificationLoading] = useState(false);
  
  // Estados para timer e reenvio de código
  const [codeExpiryTime, setCodeExpiryTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isResendingCode, setIsResendingCode] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: preFilledData?.name || '',
        email: preFilledData?.email || '',
        password: '',
        confirmPassword: ''
      });
      // Reset verification states
      setShowVerification(false);
      setErrorMessage('');
      setVerificationCode(['', '', '', '', '', '']);
      setAcceptedTerms(false);
      setAcceptedPrivacy(false);
      setIsVerificationLoading(false);
      console.log('Modal opened - isOpen:', isOpen, 'preFilledData:', preFilledData);
    }
  }, [isOpen, preFilledData]);

  // Mostrar modal de verificação quando pendingUser existir e modal estiver aberto
  useEffect(() => {
    if (pendingUser && isOpen && !showVerification) {
      setShowVerification(true);
      
      // Iniciar timer de 5 minutos quando mostrar verificação
      const expiryTime = Date.now() + (5 * 60 * 1000);
      setCodeExpiryTime(expiryTime);
      setTimeLeft(300);
    }
  }, [pendingUser, isOpen, showVerification]);

  // Timer para expiração do código
  useEffect(() => {
    if (codeExpiryTime && timeLeft > 0) {
      const timer = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((codeExpiryTime - now) / 1000));
        setTimeLeft(remaining);
        
        if (remaining === 0) {
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [codeExpiryTime, timeLeft]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      // Limpar pendingUser quando modal for fechado
      if (pendingUser) {
        clearPendingUser();
      }
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, pendingUser, clearPendingUser]);

  // Forçar estilos de autofill para tema escuro
  useEffect(() => {
    const forceAutofillStyles = () => {
      const inputs = document.querySelectorAll('input[type="text"], input[type="email"]');
      inputs.forEach((input: any) => {
        if (input.value) {
          input.style.backgroundColor = 'rgb(31, 41, 55)';
          input.style.color = 'white';
        }
      });
    };

    if (isOpen) {
      // Forçar estilos imediatamente
      setTimeout(forceAutofillStyles, 100);
      
      // Forçar estilos quando inputs mudarem
      const inputs = document.querySelectorAll('input[type="text"], input[type="email"]');
      inputs.forEach((input: any) => {
        input.addEventListener('animationstart', forceAutofillStyles);
        input.addEventListener('input', forceAutofillStyles);
      });

      return () => {
        inputs.forEach((input: any) => {
          input.removeEventListener('animationstart', forceAutofillStyles);
          input.removeEventListener('input', forceAutofillStyles);
        });
      };
    }
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
    setErrorMessage('');
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await signup(formData.email, formData.name, formData.password);
      if (result.success) {
        // O modal de verificação será mostrado automaticamente via useEffect
        setIsLoading(false);
      } else {
        setErrorMessage(result.message);
        setIsLoading(false);
      }
    } catch (error) {
      setErrorMessage('Erro interno do servidor');
      setIsLoading(false);
    }
  };

  // Funções para verificação de código
  const handleCodeInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    
    // Auto-avanço para o próximo input
    if (value && index < 5) {
      const nextInput = document.getElementById(`modal-code-${index + 1}`);
      nextInput?.focus();
    }
    
    // Verificação automática quando todos os 6 dígitos estiverem preenchidos
    const updatedCode = [...newCode];
    if (updatedCode.every(digit => digit !== '') && updatedCode.join('').length === 6) {
      // Só verificar se os checkboxes estiverem marcados
      if (acceptedTerms && acceptedPrivacy) {
        setTimeout(() => {
          handleAutoVerification(updatedCode.join(''));
        }, 500);
      }
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`modal-code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    
    if (pastedData.length === 6) {
      const newCode = pastedData.split('');
      setVerificationCode(newCode);
      
      const lastInput = document.getElementById(`modal-code-5`);
      lastInput?.focus();
      
      // Só verificar se os checkboxes estiverem marcados
      if (acceptedTerms && acceptedPrivacy) {
        setTimeout(() => {
          handleAutoVerification(pastedData);
        }, 500);
      }
    }
  };

  // Função para formatar o tempo restante
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Função para reenviar código
  const handleResendCode = async () => {
    if (!pendingUser) return;

    setIsResendingCode(true);
    setErrorMessage('');

    try {
      // Simular reenvio de código
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Reiniciar timer de 5 minutos
      const expiryTime = Date.now() + (5 * 60 * 1000);
      setCodeExpiryTime(expiryTime);
      setTimeLeft(300);
      
      // Mostrar mensagem de sucesso temporariamente
      setErrorMessage('');
    } catch (error) {
      setErrorMessage('Erro ao reenviar código. Tente novamente.');
    } finally {
      setIsResendingCode(false);
    }
  };

  const handleAutoVerification = async (codeString: string) => {
    if (isVerificationLoading) return;
    
    setErrorMessage('');
    
    // Só verificar se o código estiver completo e for diferente de vazio
    if (codeString.length !== 6) return;

    // Verificar se o código expirou
    if (timeLeft <= 0) {
      setErrorMessage('Código inválido. Solicite um novo código.');
      return;
    }
    
    if (codeString !== '123456') {
      setErrorMessage('Código incorreto. Verifique seu e-mail.');
      return;
    }
    
    if (!acceptedTerms || !acceptedPrivacy) {
      return;
    }
    
    setIsVerificationLoading(true);
    
    try {
      const result = await verifyCode(codeString);
      
      if (result.success) {
        const policiesResult = await acceptPolicies();
        if (policiesResult.success) {
          setTimeout(() => {
            onClose();
            window.location.href = '/#benefits';
          }, 1500);
        } else {
          setErrorMessage(policiesResult.message);
          setIsVerificationLoading(false);
        }
      } else {
        setErrorMessage(result.message);
        setIsVerificationLoading(false);
      }
    } catch (error) {
      setErrorMessage('Erro interno do servidor');
      setIsVerificationLoading(false);
    }
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
      <div className="relative bg-gray-900 rounded-xl shadow-2xl max-w-md w-full z-[10000] overflow-hidden border border-gray-700">
        {/* Header com logo - apenas no formulário de cadastro */}
        {!showVerification && (
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
                <h2 className="text-xl font-semibold text-white leading-tight mb-1">
                  Comece seu teste gratuito
                </h2>
                <p className="text-gray-300 text-base">
                  Acesse todos os recursos por 7 dias
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header simplificado para verificação */}
        {showVerification && (
          <div className="relative p-6">
            {/* Botão de fechar no canto superior direito */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all duration-200 p-1.5 rounded-full"
              aria-label="Fechar modal"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Conteúdo do modal */}
        <div className="p-8">
          {showVerification ? (
            /* Modal de Verificação de E-mail */
            <div className="space-y-8">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-4">Verificação de E-mail</h3>
                <p className="text-base text-gray-400">
                  Enviamos um código de 6 dígitos para {pendingUser?.maskedEmail}
                </p>
              </div>

              {/* Banner informativo */}
              <div className="bg-gray-500/10 border border-gray-500/20 rounded-xl p-6">
                <p className="text-base text-gray-300 text-center">
                  Enviamos um código de 6 dígitos para {pendingUser?.maskedEmail}
                </p>
              </div>

              {/* Mensagem de erro */}
              {errorMessage && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                  <p className="text-sm text-red-400 text-center">{errorMessage}</p>
                </div>
              )}

              {/* Inputs de código */}
              <div className="flex justify-center space-x-2">
                {verificationCode.map((digit, index) => (
                  <input
                    key={index}
                    id={`modal-code-${index}`}
                    type="text"
                    value={digit}
                    onChange={(e) => handleCodeInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(index, e)}
                    onPaste={handleCodePaste}
                    className="w-10 h-10 text-center text-sm font-mono bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    maxLength={1}
                    tabIndex={index + 1}
                  />
                ))}
              </div>

              {/* Timer */}
              {timeLeft > 0 && (
                <div className="text-center">
                  <p className="text-sm text-gray-400">
                    Código válido por: <span className="text-blue-400 font-mono">{formatTime(timeLeft)}</span>
                  </p>
                </div>
              )}

              {/* Botão de reenviar código */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isResendingCode}
                  className="text-blue-400 hover:text-blue-300 text-sm underline disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isResendingCode ? 'Reenviando...' : 'Reenviar código'}
                </button>
              </div>

              {/* Checkboxes */}
              <div className="space-y-6">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                    acceptedTerms 
                      ? 'bg-blue-500 border-blue-500' 
                      : 'border-gray-400 hover:border-gray-300'
                  }`}>
                    {acceptedTerms && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className="text-base text-gray-300">
                    Li e concordo com os{' '}
                    <a href="/termos-de-uso" className="text-blue-400 hover:underline">
                      Termos de Uso
                    </a>
                  </span>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedPrivacy}
                    onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                    acceptedPrivacy 
                      ? 'bg-blue-500 border-blue-500' 
                      : 'border-gray-400 hover:border-gray-300'
                  }`}>
                    {acceptedPrivacy && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className="text-base text-gray-300">
                    Li e concordo com a{' '}
                    <a href="/politica-de-privacidade" className="text-blue-400 hover:underline">
                      Política de Privacidade
                    </a>
                  </span>
                </label>
              </div>

              {/* Botão de verificação */}
              <button
                onClick={() => handleAutoVerification(verificationCode.join(''))}
                disabled={verificationCode.join('').length < 6 || !acceptedTerms || !acceptedPrivacy || isVerificationLoading || timeLeft <= 0}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-3 rounded-md text-base font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isVerificationLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  </div>
                ) : (
                  'Verificar e concluir'
                )}
              </button>
            </div>
          ) : (
            /* Formulário de Cadastro Original */
            <>
              {/* Botões de integração */}
              <div className="space-y-3 mb-6">
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
                  <span className="text-white text-base font-medium">Continuar com Google</span>
                </button>

                <button
                  onClick={handleAppleSignup}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 border border-gray-600 rounded-md hover:bg-gray-800 transition-colors bg-gray-800/50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.78 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <span className="text-white text-base font-medium">Continuar com Apple</span>
                </button>
              </div>

              {/* Divisor */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-900 text-gray-400">ou</span>
                </div>
              </div>

              {/* Mensagem de erro */}
              {errorMessage && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-6">
                  <p className="text-sm text-red-400 text-center">{errorMessage}</p>
                </div>
              )}

              {/* Formulário */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Campos de nome e email - só mostram se não estiverem preenchidos */}
                {(!preFilledData?.name || !preFilledData?.email) && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Nome completo *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-white placeholder-gray-400 text-base autofill:bg-gray-800 autofill:text-white autofill:shadow-[inset_0_0_0px_1000px_rgba(31,41,55,1)]"
                        placeholder="Digite seu nome completo"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        E-mail *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-white placeholder-gray-400 text-base autofill:bg-gray-800 autofill:text-white autofill:shadow-[inset_0_0_0px_1000px_rgba(31,41,55,1)]"
                        placeholder="seu@email.com"
                        required
                      />
                    </div>
                  </>
                )}

                {/* Mostrar dados preenchidos se existirem */}
                {(preFilledData?.name || preFilledData?.email) && (
                  <div className="bg-gray-800/70 rounded-lg p-4 border border-gray-500/50 shadow-sm">
                    <p className="text-sm text-gray-300 mb-3 font-medium">Dados preenchidos:</p>
                    <div className="space-y-2">
                      {preFilledData?.name && (
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400 text-sm font-medium min-w-[40px]">Nome:</span>
                          <span className="text-white text-sm font-medium">{preFilledData.name}</span>
                        </div>
                      )}
                      {preFilledData?.email && (
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400 text-sm font-medium min-w-[40px]">E-mail:</span>
                          <span className="text-white text-sm font-medium">{preFilledData.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Senha *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors pr-8 text-white placeholder-gray-400 text-base"
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
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Confirmar senha *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors pr-8 text-white placeholder-gray-400 text-base"
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
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-3 rounded-md text-base font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {isLoading ? 'Criando conta...' : 'Iniciar teste gratuito'}
                </button>
              </form>

              {/* Texto legal */}
              <p className="text-sm text-gray-400 text-center mt-6">
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
            </>
          )}
        </div>
      </div>
    </div>
  );

  if (typeof window !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
}

// Adicionar estilos CSS para forçar tema escuro no autofill
const autofillStyles = `
  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus,
  input:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 30px rgb(31, 41, 55) inset !important;
    -webkit-text-fill-color: white !important;
    background-color: rgb(31, 41, 55) !important;
    transition: background-color 5000s ease-in-out 0s;
  }
  
  input:-moz-autofill {
    background-color: rgb(31, 41, 55) !important;
    color: white !important;
  }
`;

// Adicionar estilos ao head se não existirem
if (typeof window !== 'undefined' && !document.getElementById('test-modal-autofill-styles')) {
  const style = document.createElement('style');
  style.id = 'test-modal-autofill-styles';
  style.textContent = autofillStyles;
  document.head.appendChild(style);
}
