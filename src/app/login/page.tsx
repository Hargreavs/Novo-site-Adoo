'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import EciooLogo from '@/components/EciooLogo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isModalHovered, setIsModalHovered] = useState(false);
  const [hoveredParticle, setHoveredParticle] = useState<number | null>(null);
  
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

  useEffect(() => {
    setIsClient(true);
    // Trigger fade-in animation after component mounts
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

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
    
    // Simular login (substituir por lógica real)
    setTimeout(() => {
      setIsLoading(false);
      // Redirecionar para dashboard ou página principal
      window.location.href = '/';
    }, 1500);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (registerData.password !== registerData.confirmPassword) {
      alert('As senhas não coincidem');
      return;
    }
    
    if (registerData.password.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    
    setIsRegisterLoading(true);
    
    // Simular cadastro (substituir por lógica real)
    setTimeout(() => {
      setIsRegisterLoading(false);
      setIsLoginMode(true);
      // Limpar dados do formulário
      setRegisterData({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      // Redirecionar para dashboard ou página principal
      window.location.href = '/';
    }, 1500);
  };

  const handleRegisterInputChange = (field: string, value: string) => {
    setRegisterData(prev => ({
      ...prev,
      [field]: value
    }));
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
              <Link href="/#hero" className="flex items-center">
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
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
              >
                {isLoginMode ? 'Criar uma conta' : 'Entrar'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-20 flex items-center justify-center min-h-[calc(100vh-120px)] px-4 sm:px-6 lg:px-8">
        <div className={`w-full max-w-sm transition-all duration-500 ease-out delay-100 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          {/* Login Card */}
          <div 
            className={`bg-slate-800/30 backdrop-blur-xl rounded-3xl shadow-2xl border p-8 transition-all duration-300 ease-out ${
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
                {isLoginMode ? 'Bem-vindo de volta' : 'Criar conta'}
              </h1>
              <p className="text-gray-400 text-sm">
                {isLoginMode 
                  ? 'Entre na sua conta para continuar' 
                  : 'Preencha os dados para criar sua conta'
                }
              </p>
            </div>

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
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm"
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
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm"
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
                    className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm"
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
                      className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm"
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
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
              >
                {isLoginMode ? (
                  isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Entrando...
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
                        className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                      >
                        Cadastre-se
                      </button>
                    </>
                  ) : (
                    <>
                      Já tem uma conta?{' '}
                      <button
                        onClick={() => setIsLoginMode(true)}
                        className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                      >
                        Entre
                      </button>
                    </>
                  )}
                </p>
              </div>
            </form>
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
      `}</style>
    </div>
  );
}
