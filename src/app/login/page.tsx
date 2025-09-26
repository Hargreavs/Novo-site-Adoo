'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import EciooLogo from '@/components/EciooLogo';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const { signup, verifyCode, acceptPolicies, pendingUser, isAuthenticated, user, logout, clearPendingUser, login } = useAuth();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isModalHovered, setIsModalHovered] = useState(false);
  const [hoveredParticle, setHoveredParticle] = useState<number | null>(null);
  
  // Estados para verificação de código
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [showVerification, setShowVerification] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  
  // Estados para timer e reenvio de código
  const [codeExpiryTime, setCodeExpiryTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isResendingCode, setIsResendingCode] = useState(false);
  
  // Estados do modal (login/cadastro)
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [registerData, setRegisterData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  const [isVerificationLoading, setIsVerificationLoading] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Trigger fade-in animation after component mounts
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Limpar progresso de cadastro quando sair da página ou atualizar
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (showVerification) {
        clearPendingUser();
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && showVerification) {
        clearPendingUser();
      }
    };

    const handlePageHide = () => {
      if (showVerification) {
        clearPendingUser();
      }
    };

    // Adicionar event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [showVerification, clearPendingUser]);

  // Limpar progresso quando o componente for desmontado (navegação para fora)
  useEffect(() => {
    return () => {
      if (showVerification) {
        clearPendingUser();
      }
    };
  }, [showVerification, clearPendingUser]);

  // Forçar estilo escuro nos inputs quando valores mudarem
  useEffect(() => {
    const forceDarkStyle = () => {
      const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]');
      inputs.forEach((input: any) => {
        if (input.value) {
          input.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
          input.style.color = 'rgb(209, 213, 219)';
          input.style.setProperty('-webkit-box-shadow', '0 0 0 1000px rgba(255, 255, 255, 0.05) inset', 'important');
        }
      });
    };

    // Executar imediatamente e após mudanças
    forceDarkStyle();
    
    // Executar após um pequeno delay para capturar autofill
    const timer = setTimeout(forceDarkStyle, 100);
    
    // Adicionar event listeners para capturar mudanças
    const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]');
    inputs.forEach((input) => {
      input.addEventListener('animationstart', forceDarkStyle);
      input.addEventListener('input', forceDarkStyle);
      input.addEventListener('change', forceDarkStyle);
    });
    
    return () => {
      clearTimeout(timer);
      inputs.forEach((input) => {
        input.removeEventListener('animationstart', forceDarkStyle);
        input.removeEventListener('input', forceDarkStyle);
        input.removeEventListener('change', forceDarkStyle);
      });
    };
  }, [registerData, email, password]);

  // Não redirecionar automaticamente usuários autenticados da página de login
  // Eles podem usar a página para fazer logout

  // Verificar estado do usuário pendente
  useEffect(() => {
    // Só mostrar verificação se estiver no modo cadastro E houver pendingUser
    // Não esconder se estiver em loading de verificação
    if (pendingUser && !isLoginMode && !isVerificationLoading) {
      setShowVerification(true);
      setShowTerms(false);
      
      // Iniciar timer de 5 minutos quando mostrar verificação
      const expiryTime = Date.now() + (5 * 60 * 1000);
      setCodeExpiryTime(expiryTime);
      setTimeLeft(300);
    } else if (!isVerificationLoading) {
      setShowVerification(false);
      setShowTerms(false);
      setCodeExpiryTime(null);
      setTimeLeft(0);
    }
  }, [pendingUser, isLoginMode, isVerificationLoading]);

  // Limpar estados quando mudar para modo cadastro
  useEffect(() => {
    if (!isLoginMode) {
      setErrorMessage('');
      setSuccessMessage('');
      setAcceptedTerms(false);
      setAcceptedPrivacy(false);
      setVerificationCode(['', '', '', '', '', '']);
      setShowVerification(false);
      setShowTerms(false);
    }
  }, [isLoginMode]);

  // Resetar verificação quando mudar para modo login
  useEffect(() => {
    if (isLoginMode) {
      setShowVerification(false);
      setShowTerms(false);
      setErrorMessage('');
      setSuccessMessage('');
    }
  }, [isLoginMode]);

  // Resetar checkboxes quando entrar no modo de verificação
  useEffect(() => {
    if (showVerification) {
      setAcceptedTerms(false);
      setAcceptedPrivacy(false);
    }
  }, [showVerification]);

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

  // Memoizar as partículas para evitar recriação
  const particles = useMemo(() => {
    if (!isClient) return [];
    
    return [...Array(20)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDelay: Math.random() * 3,
      animationDuration: 3 + Math.random() * 2
    }));
  }, [isClient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      await login(email, password);
      // Redirecionar para a página principal
      router.push('/');
    } catch (error) {
      setIsLoading(false);
      setErrorMessage('E-mail ou Senha inválidos');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    
    // Validação básica
    if (registerData.password !== registerData.confirmPassword) {
      setErrorMessage('As senhas não coincidem');
      return;
    }
    
    if (registerData.password.length < 6) {
      setErrorMessage('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    
    setIsRegisterLoading(true);
    
    try {
      const result = await signup(registerData.email, registerData.fullName, registerData.password);
      
      if (result.success) {
        // Não mostrar mensagem de sucesso, apenas ativar verificação
        // O estado showVerification será ativado pelo useEffect
      } else {
        setErrorMessage(result.message);
      }
    } catch (error) {
      setErrorMessage('Erro interno do servidor');
    } finally {
      setIsRegisterLoading(false);
    }
  };

  const handleRegisterInputChange = (field: string, value: string) => {
    setRegisterData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    
    const codeString = verificationCode.join('');
    
    // Validação do código
    if (codeString.length !== 6) {
      setErrorMessage('Digite o código completo de 6 dígitos');
      return;
    }

    // Verificar se o código expirou
    if (timeLeft <= 0) {
      setErrorMessage('Código inválido. Solicite um novo código.');
      return;
    }
    
    // Validação dos checkboxes - usar estado atual
    if (!acceptedTerms || !acceptedPrivacy) {
      setErrorMessage('Aceite os termos de uso e política de privacidade');
      return;
    }
    
    // Validação do código específico
    if (codeString !== '123456') {
      setErrorMessage('Código incorreto. Verifique seu e-mail.');
      return;
    }
    
    setIsVerificationLoading(true);
    
    try {
      const result = await verifyCode(codeString);
      
      if (result.success) {
        // Após verificar o código, aceitar políticas automaticamente
        const policiesResult = await acceptPolicies();
        if (policiesResult.success) {
          // Manter loading ativo e redirecionar sem limpar pendingUser
          setTimeout(() => {
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

  const handleAcceptPolicies = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      const result = await acceptPolicies();
      
      if (result.success) {
        setSuccessMessage(result.message);
        // O usuário será redirecionado pelo useEffect
      } else {
        setErrorMessage(result.message);
      }
    } catch (error) {
      setErrorMessage('Erro interno do servidor');
    }
  };

  const handleCodeInputChange = (index: number, value: string) => {
    // Permitir apenas números
    if (!/^\d*$/.test(value)) return;
    
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    
    // Auto-avanço para o próximo input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
    
    // Verificação automática quando todos os 6 dígitos estiverem preenchidos
    const updatedCode = [...newCode];
    if (updatedCode.every(digit => digit !== '') && updatedCode.join('').length === 6) {
      // Aguardar um pequeno delay para o usuário ver o último dígito
      setTimeout(() => {
        handleAutoVerification(updatedCode.join(''));
      }, 500);
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Voltar para o input anterior ao apagar
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    
    if (pastedData.length === 6) {
      const newCode = pastedData.split('');
      setVerificationCode(newCode);
      
      // Focar no último input
      const lastInput = document.getElementById(`code-5`);
      lastInput?.focus();
      
      // Verificação automática após colar
      setTimeout(() => {
        handleAutoVerification(pastedData);
      }, 500);
    }
  };

  // Função para verificação automática
  const handleAutoVerification = async (codeString: string) => {
    // Só verificar se não estiver já em loading
    if (isVerificationLoading) return;
    
    setErrorMessage('');
    setSuccessMessage('');
    
    // Verificar se o código expirou
    if (timeLeft <= 0) {
      setErrorMessage('Código inválido. Solicite um novo código.');
      return;
    }
    
    // Validação do código específico - sempre verificar o código primeiro
    if (codeString !== '123456') {
      setErrorMessage('Código incorreto. Verifique seu e-mail.');
      return;
    }
    
    // Validação dos checkboxes - só verificar se código estiver correto
    if (!acceptedTerms || !acceptedPrivacy) {
      // Não mostrar mensagem de erro para checkboxes na verificação automática
      // O botão já está desabilitado quando os checkboxes não estão marcados
      return;
    }
    
    // Se chegou até aqui, código está correto e checkboxes estão marcados
    setIsVerificationLoading(true);
    
    try {
      const result = await verifyCode(codeString);
      
      if (result.success) {
        // Após verificar o código, aceitar políticas automaticamente
        const policiesResult = await acceptPolicies();
        if (policiesResult.success) {
          // Manter loading ativo e redirecionar sem limpar pendingUser
          setTimeout(() => {
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
      
      setSuccessMessage('Código reenviado com sucesso');
    } catch (error) {
      setErrorMessage('Erro ao reenviar código. Tente novamente.');
    } finally {
      setIsResendingCode(false);
    }
  };

  // Função para lidar com navegação para fora da página
  const handleNavigation = () => {
    if (showVerification) {
      clearPendingUser();
    }
  };

  return (
    <div className={`min-h-screen bg-slate-900 relative overflow-hidden transition-all duration-500 ease-out ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      {/* Background Animado */}
      <div className="absolute inset-0">
        {/* Gradiente base */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/20 to-purple-900/30"></div>
        
        {/* Círculos flutuantes animados */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        
        {/* Partículas flutuantes */}
        <div className="absolute inset-0">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className={`absolute w-2 h-2 rounded-full animate-float cursor-pointer transition-all duration-300 ${
                hoveredParticle === particle.id 
                  ? 'bg-gradient-to-r from-blue-400 to-purple-500 shadow-lg shadow-blue-400/50 scale-150 particle-glow' 
                  : 'bg-blue-400/30'
              }`}
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                animationDelay: `${particle.animationDelay}s`,
                animationDuration: `${particle.animationDuration}s`
              }}
              onMouseEnter={() => setHoveredParticle(particle.id)}
              onMouseLeave={() => setHoveredParticle(null)}
            ></div>
          ))}
        </div>
        
        {/* Overlay escuro para contraste */}
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Header */}
      <header className={`relative z-20 transition-all duration-500 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
              {/* Logo */}
              <Link href="/#hero" className="flex items-center" onClick={handleNavigation}>
                <span className="sr-only">ecioo</span>
                <EciooLogo className="h-12 w-32" />
              </Link>

            {/* Botões de Ação */}
            <div className="flex items-center space-x-4">
              <span className="text-gray-400 text-sm">
                {isLoginMode ? 'Não tem uma conta?' : 'Já tem uma conta?'}
              </span>
              <button
                onClick={() => setIsLoginMode(!isLoginMode)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1.5 rounded-md text-base font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer"
              >
                {isLoginMode ? 'Criar uma conta' : 'Entrar'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-20 flex items-center justify-center min-h-[calc(100vh-120px)] px-4 sm:px-6 lg:px-8">
        <div className={`w-full max-w-md transition-all duration-500 ease-out delay-100 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          {/* Login Card */}
          <div 
            className={`bg-slate-800/30 backdrop-blur-xl rounded-3xl shadow-2xl border transition-all duration-300 ease-out ${
              showVerification ? 'p-10' : 'p-8'
            } ${
              isModalHovered 
                ? 'border-blue-400/50 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04),0_0_20px_rgba(59,130,246,0.1)]' 
                : 'border-white/10'
            }`}
            onMouseEnter={() => setIsModalHovered(true)}
            onMouseLeave={() => setIsModalHovered(false)}
          >
            {/* Título */}
            <div className={`text-center mb-8 transition-all duration-500 ease-out delay-150 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <h1 className="text-2xl font-bold text-white mb-2">
                {showVerification ? 'Verificação de E-mail' : 
                 isLoginMode ? 'Bem-vindo de volta' : 'Criar conta'}
              </h1>
              <p className="text-gray-400 text-sm">
                {showVerification ? `Enviamos um código para ${pendingUser?.maskedEmail}` :
                 isLoginMode 
                  ? 'Entre na sua conta para continuar' 
                  : 'Preencha os dados para criar sua conta'}
              </p>
            </div>

            {/* Mensagens de erro e sucesso */}
            {(errorMessage || successMessage) && (
              <div className={`mb-6 p-4 rounded-xl transition-all duration-300 ${
                errorMessage 
                  ? 'bg-red-500/10 border border-red-500/20 text-red-400' 
                  : 'bg-green-500/10 border border-green-500/20 text-green-400'
              }`}>
                <p className="text-sm font-medium">
                  {errorMessage || successMessage}
                </p>
              </div>
            )}

            {/* Conteúdo baseado no estado */}
            {showVerification ? (
              <form onSubmit={handleVerifyCode} className={`space-y-8 transition-all duration-500 ease-out delay-200 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                {/* Banner informativo neutro */}
                <div className="bg-gray-500/10 border border-gray-500/20 rounded-xl p-4">
                  <p className="text-gray-300 text-sm text-center">
                    Enviamos um código de 6 dígitos para {pendingUser?.maskedEmail}
                  </p>
                </div>

                {/* Inputs de código */}
                <div className="flex justify-center gap-3">
                  {verificationCode.map((digit, index) => (
                    <input
                      key={index}
                      id={`code-${index}`}
                      type="text"
                      value={digit}
                      onChange={(e) => handleCodeInputChange(index, e.target.value)}
                      onKeyDown={(e) => handleCodeKeyDown(index, e)}
                      onPaste={handleCodePaste}
                      className="w-12 h-12 bg-white/5 border border-white/20 rounded-xl text-gray-300 text-center text-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm"
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

                {/* Checkboxes obrigatórios */}
                <div className="space-y-6">
                  <label className="flex items-start gap-4 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center ${
                        acceptedTerms 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 border-blue-500 shadow-lg shadow-blue-500/25' 
                          : 'bg-white/5 border-white/30 group-hover:border-blue-400/50 group-hover:bg-white/10'
                      }`}>
                        {acceptedTerms && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-gray-300 text-sm leading-relaxed">
                      Li e concordo com os{' '}
                      <Link href="/termos" className="text-blue-400 hover:text-blue-300 underline transition-colors">
                        Termos de Uso
                      </Link>
                    </span>
                  </label>
                  
                  <label className="flex items-start gap-4 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={acceptedPrivacy}
                        onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center ${
                        acceptedPrivacy 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 border-blue-500 shadow-lg shadow-blue-500/25' 
                          : 'bg-white/5 border-white/30 group-hover:border-blue-400/50 group-hover:bg-white/10'
                      }`}>
                        {acceptedPrivacy && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-gray-300 text-sm leading-relaxed">
                      Li e concordo com a{' '}
                      <Link href="/privacidade" className="text-blue-400 hover:text-blue-300 underline transition-colors">
                        Política de Privacidade
                      </Link>
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={verificationCode.join('').length < 6 || !acceptedTerms || !acceptedPrivacy || isVerificationLoading || timeLeft <= 0}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                >
                  {isVerificationLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    </div>
                  ) : (
                    'Verificar e concluir'
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={isLoginMode ? handleSubmit : handleRegisterSubmit} className={`space-y-6 transition-all duration-500 ease-out delay-200 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
              {/* Botões de Login Social */}
              <div className="space-y-3">
                {/* Botão Google */}
                <button
                  type="button"
                  className="w-full flex items-center justify-center px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-medium transition-all duration-200 backdrop-blur-sm"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continuar com Google
                </button>

                {/* Botão Apple */}
                <button
                  type="button"
                  className="w-full flex items-center justify-center px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-medium transition-all duration-200 backdrop-blur-sm"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  Continuar com Apple
                </button>
              </div>

              {/* Separador */}
              <div className="relative flex items-center">
                <div className="flex-1 border-t border-white/20"></div>
                <span className="px-4 text-gray-400 text-sm">ou</span>
                <div className="flex-1 border-t border-white/20"></div>
              </div>

              {/* Campo Nome Completo (apenas no modo cadastro) */}
              {!isLoginMode && (
                <div>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    value={registerData.fullName}
                    onChange={(e) => handleRegisterInputChange('fullName', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm autofill:bg-white/5 autofill:text-gray-300 autofill:shadow-[inset_0_0_0px_1000px_rgba(255,255,255,0.05)]"
                    placeholder="Nome completo"
                  />
                </div>
              )}

              {/* Campo Email */}
              <div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={isLoginMode ? email : registerData.email}
                  onChange={(e) => isLoginMode ? setEmail(e.target.value) : handleRegisterInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm autofill:bg-white/5 autofill:text-gray-300 autofill:shadow-[inset_0_0_0px_1000px_rgba(255,255,255,0.05)]"
                  placeholder="Email"
                />
              </div>

              {/* Campo Senha */}
              <div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={isLoginMode ? (showPassword ? 'text' : 'password') : (showRegisterPassword ? 'text' : 'password')}
                    autoComplete={isLoginMode ? "current-password" : "new-password"}
                    required
                    value={isLoginMode ? password : registerData.password}
                    onChange={(e) => isLoginMode ? setPassword(e.target.value) : handleRegisterInputChange('password', e.target.value)}
                    className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/20 rounded-xl text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm autofill:bg-white/5 autofill:text-gray-300 autofill:shadow-[inset_0_0_0px_1000px_rgba(255,255,255,0.05)]"
                    placeholder="Senha"
                  />
                  <button
                    type="button"
                    onClick={() => isLoginMode ? setShowPassword(!showPassword) : setShowRegisterPassword(!showRegisterPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {isLoginMode ? (
                      showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
                      )
                    ) : (
                      showRegisterPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
                      )
                    )}
                  </button>
                </div>
                
                {/* Esqueceu a senha (apenas no modo login) */}
                {isLoginMode && (
                  <div className="mt-2 text-right">
                    <Link
                      href="/forgot-password"
                      className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Esqueceu a senha?
                    </Link>
                  </div>
                )}
              </div>

              {/* Campo Confirmar Senha (apenas no modo cadastro) */}
              {!isLoginMode && (
                <div>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={registerData.confirmPassword}
                      onChange={(e) => handleRegisterInputChange('confirmPassword', e.target.value)}
                      className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/20 rounded-xl text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm autofill:bg-white/5 autofill:text-gray-300 autofill:shadow-[inset_0_0_0px_1000px_rgba(255,255,255,0.05)]"
                      placeholder="Confirmar senha"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Botão de Login/Cadastro */}
              <button
                type="submit"
                disabled={isLoading || isRegisterLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg cursor-pointer"
              >
                {isLoginMode ? (
                  isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    </div>
                  ) : (
                    'Entre'
                  )
                ) : (
                  isRegisterLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Criando...
                    </div>
                  ) : (
                    'Criar conta'
                  )
                )}
              </button>

              {/* Link para Alternar Modo */}
              <div className="text-center">
                <p className="text-gray-400 text-sm">
                  {isLoginMode ? (
                    <>
                      Não tem uma conta?{' '}
                      <button
                        onClick={() => setIsLoginMode(false)}
                        className="text-blue-400 hover:text-blue-300 transition-colors font-medium cursor-pointer"
                      >
                        Cadastre-se
                      </button>
                    </>
                  ) : (
                    <>
                      Já tem uma conta?{' '}
                      <button
                        onClick={() => setIsLoginMode(true)}
                        className="text-blue-400 hover:text-blue-300 transition-colors font-medium cursor-pointer"
                      >
                        Entre
                      </button>
                    </>
                  )}
                </p>
              </div>

            </form>
            )}
          </div>
        </div>
      </div>


      {/* CSS para animações customizadas */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 0.8; }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        
        @keyframes particleGlow {
          0%, 100% { 
            box-shadow: 0 0 5px rgba(59, 130, 246, 0.3), 0 0 10px rgba(59, 130, 246, 0.2);
          }
          50% { 
            box-shadow: 0 0 15px rgba(59, 130, 246, 0.6), 0 0 25px rgba(147, 51, 234, 0.4), 0 0 35px rgba(59, 130, 246, 0.3);
          }
        }
        .particle-glow {
          animation: particleGlow 2s ease-in-out infinite;
        }
        
        /* Estilos para autofill do navegador - SOLUÇÃO DEFINITIVA */
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px rgba(15, 23, 42, 0.8) inset !important;
          -webkit-text-fill-color: rgb(209, 213, 219) !important;
          background-color: rgba(15, 23, 42, 0.8) !important;
          transition: background-color 5000s ease-in-out 0s !important;
        }
        
        /* Para Firefox */
        input:-moz-autofill {
          background-color: rgba(15, 23, 42, 0.8) !important;
          color: rgb(209, 213, 219) !important;
        }
        
        /* Força o estilo escuro em todos os inputs */
        input[type="text"],
        input[type="email"],
        input[type="password"] {
          background-color: rgba(255, 255, 255, 0.05) !important;
          color: rgb(209, 213, 219) !important;
        }
        
        /* Específico para inputs preenchidos */
        input[value]:not([value=""]),
        input:not(:placeholder-shown) {
          background-color: rgba(255, 255, 255, 0.05) !important;
          color: rgb(209, 213, 219) !important;
        }
      `}</style>
    </div>
  );
}
