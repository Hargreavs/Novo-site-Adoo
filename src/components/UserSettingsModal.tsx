'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/contexts/AuthContext';

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserSettingsModal({ isOpen, onClose }: UserSettingsModalProps) {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('geral');
  const [isMounted, setIsMounted] = useState(false);
  
  // Estados para os toggles de notificações
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  
  // Estados para alteração de senha
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Estados para alteração de e-mail
  const [showEmailChange, setShowEmailChange] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [emailVerificationCode, setEmailVerificationCode] = useState(['', '', '', '', '', '']);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [emailMessage, setEmailMessage] = useState('');
  const [emailError, setEmailError] = useState('');
  const [codeExpiryTime, setCodeExpiryTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  // Estados para edição de nome
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameMessage, setNameMessage] = useState('');
  const [nameError, setNameError] = useState('');
  
  // Estados para encerrar conta
  const [deleteStep, setDeleteStep] = useState('initial'); // 'initial', 'expanded', 'processing', 'success', 'error'
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteAgreement, setDeleteAgreement] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false); // Mock: simular se tem assinatura ativa
  
  // Estado para alternância de preços mensal/anual
  const [isAnnualPricing, setIsAnnualPricing] = useState(true);

  // Carregar preferências do localStorage
  useEffect(() => {
    const savedPreferences = localStorage.getItem('user-preferences');
    if (savedPreferences) {
      const preferences = JSON.parse(savedPreferences);
      setEmailNotifications(preferences.emailNotifications ?? true);
      setPushNotifications(preferences.pushNotifications ?? true);
      setSmsNotifications(preferences.smsNotifications ?? false);
    }
  }, []);

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

  // Salvar preferências no localStorage quando mudarem
  useEffect(() => {
    const preferences = {
      emailNotifications,
      pushNotifications,
      smsNotifications
    };
    localStorage.setItem('user-preferences', JSON.stringify(preferences));
  }, [emailNotifications, pushNotifications, smsNotifications]);

  // Função para validar senha atual
  const validateCurrentPassword = (password: string) => {
    return password === '123456'; // Senha mock para rafaximenes1@gmail.com
  };

  // Função para validar se as senhas coincidem
  const validatePasswordMatch = (newPass: string, confirmPass: string) => {
    return newPass === confirmPass;
  };

  // Função para validar se a nova senha é diferente da atual
  const validateNewPassword = (currentPass: string, newPass: string) => {
    return currentPass !== newPass;
  };

  // Função para alterar senha
  const handlePasswordChange = async () => {
    setIsChangingPassword(true);
    setPasswordMessage('');
    setPasswordError('');

    try {
      // Validações
      if (!validateCurrentPassword(currentPassword)) {
        setPasswordError('Senha atual incorreta');
        return;
      }

      if (!validatePasswordMatch(newPassword, confirmPassword)) {
        setPasswordError('As senhas não coincidem');
        return;
      }

      if (!validateNewPassword(currentPassword, newPassword)) {
        setPasswordError('A nova senha deve ser diferente da senha atual');
        return;
      }

      // Simular alteração de senha
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Salvar nova senha no localStorage (mock)
      localStorage.setItem('user-new-password', newPassword);
      
      setPasswordMessage('Senha alterada com sucesso. Faça o login novamente para continuar');
      
      // Deslogar após 2 segundos
      setTimeout(() => {
        localStorage.removeItem('auth.user');
        window.location.href = '/';
      }, 2000);

    } catch (error) {
      setPasswordError('Erro ao alterar senha. Tente novamente.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Função para voltar à aba de segurança
  const handleBackToSecurity = () => {
    setShowPasswordChange(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordMessage('');
    setPasswordError('');
  };

  // Função para voltar à aba de segurança (e-mail)
  const handleBackToSecurityFromEmail = () => {
    setShowEmailChange(false);
    setNewEmail('');
    setShowEmailVerification(false);
    setEmailVerificationCode(['', '', '', '', '', '']);
    setEmailMessage('');
    setEmailError('');
    setCodeExpiryTime(null);
    setTimeLeft(0);
  };

  // Função para iniciar alteração de e-mail
  const handleStartEmailChange = () => {
    setShowEmailChange(true);
    setNewEmail('');
    setEmailMessage('');
    setEmailError('');
  };

  // Função para enviar código de verificação
  const handleSendEmailCode = async () => {
    if (!newEmail.trim()) {
      setEmailError('Digite um e-mail válido');
      return;
    }

    setIsSendingCode(true);
    setEmailError('');

    try {
      // Simular envio de código
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Iniciar timer de 5 minutos (300 segundos)
      const expiryTime = Date.now() + (5 * 60 * 1000);
      setCodeExpiryTime(expiryTime);
      setTimeLeft(300);
      
      setShowEmailVerification(true);
      setEmailMessage('Código enviado para o novo e-mail');
    } catch (error) {
      setEmailError('Erro ao enviar código. Tente novamente.');
    } finally {
      setIsSendingCode(false);
    }
  };

  // Função para verificar código de e-mail
  const handleVerifyEmailCode = async () => {
    const codeString = emailVerificationCode.join('');
    
    if (codeString.length !== 6) {
      setEmailError('Digite o código completo de 6 dígitos');
      return;
    }

    // Verificar se o código expirou
    if (timeLeft <= 0) {
      setEmailError('Código inválido. Solicite um novo código.');
      return;
    }

    setIsVerifyingEmail(true);
    setEmailError('');

    try {
      // Simular verificação de código
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Validação mock do código
      if (codeString !== '123456') {
        setEmailError('Código incorreto. Verifique seu e-mail.');
        return;
      }

      // Simular alteração de e-mail
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Armazenar o e-mail antigo como inválido para segurança
      const oldEmail = user?.email;
      if (oldEmail) {
        const invalidEmails = JSON.parse(localStorage.getItem('invalid-emails') || '[]');
        if (!invalidEmails.includes(oldEmail)) {
          invalidEmails.push(oldEmail);
          localStorage.setItem('invalid-emails', JSON.stringify(invalidEmails));
        }
      }

      // Atualizar o e-mail no localStorage (preservando o nome original)
      const currentUser = localStorage.getItem('auth.user');
      if (currentUser) {
        const userData = JSON.parse(currentUser);
        userData.email = newEmail;
        // Manter o nome original, não alterar baseado no e-mail
        localStorage.setItem('auth.user', JSON.stringify(userData));
      }

      // Atualizar também no sessionStorage (preservando o nome original)
      const currentUserSession = sessionStorage.getItem('auth.user');
      if (currentUserSession) {
        const userDataSession = JSON.parse(currentUserSession);
        userDataSession.email = newEmail;
        // Manter o nome original, não alterar baseado no e-mail
        sessionStorage.setItem('auth.user', JSON.stringify(userDataSession));
      }

      setEmailMessage('E-mail alterado com sucesso. Sua próxima autenticação já será com o novo endereço.');
      
      // Invalidar sessão e redirecionar
      setTimeout(() => {
        localStorage.removeItem('auth.user');
        localStorage.removeItem('user-preferences');
        localStorage.removeItem('user-new-password');
        sessionStorage.removeItem('auth.user');
        sessionStorage.removeItem('user-preferences');
        window.location.href = '/';
      }, 2000);

    } catch (error) {
      setEmailError('Erro ao verificar código. Tente novamente.');
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  // Função para gerenciar input do código de verificação
  const handleEmailCodeInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newCode = [...emailVerificationCode];
    newCode[index] = value;
    setEmailVerificationCode(newCode);
    
    // Auto-avanço para o próximo input
    if (value && index < 5) {
      const nextInput = document.getElementById(`email-code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleEmailCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !emailVerificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`email-code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleEmailCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    
    if (pastedData.length === 6) {
      const newCode = pastedData.split('');
      setEmailVerificationCode(newCode);
      
      const lastInput = document.getElementById(`email-code-5`);
      lastInput?.focus();
    }
  };

  // Função para formatar o tempo restante
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Função para iniciar edição de nome
  const handleStartEditName = () => {
    setEditedName(user?.name || '');
    setIsEditingName(true);
    setNameMessage('');
    setNameError('');
  };

  // Função para cancelar edição de nome
  const handleCancelEditName = () => {
    setIsEditingName(false);
    setEditedName('');
    setNameMessage('');
    setNameError('');
  };

  // Função para salvar nome
  const handleSaveName = async () => {
    if (!editedName.trim()) {
      setNameError('Nome é obrigatório');
      return;
    }

    if (editedName.trim().length > 30) {
      setNameError('Nome deve ter no máximo 30 caracteres');
      return;
    }

    setIsSavingName(true);
    setNameError('');

    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Atualizar nome usando o contexto
      updateUser({ name: editedName.trim() });

      setNameMessage('Nome alterado com sucesso');
      setIsEditingName(false);
    } catch (error) {
      setNameError('Erro ao salvar nome. Tente novamente.');
    } finally {
      setIsSavingName(false);
    }
  };

  // Função para resetar todos os estados do modal
  const resetAllStates = () => {
    // Reset de alteração de senha
    setShowPasswordChange(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsChangingPassword(false);
    setPasswordMessage('');
    setPasswordError('');

    // Reset de alteração de e-mail
    setShowEmailChange(false);
    setNewEmail('');
    setIsSendingCode(false);
    setShowEmailVerification(false);
    setEmailVerificationCode(['', '', '', '', '', '']);
    setIsVerifyingEmail(false);
    setEmailMessage('');
    setEmailError('');
    setCodeExpiryTime(null);
    setTimeLeft(0);

    // Reset de edição de nome
    setIsEditingName(false);
    setEditedName('');
    setIsSavingName(false);
    setNameMessage('');
    setNameError('');

    // Reset de encerrar conta
    setDeleteStep('initial');
    setDeleteConfirmation('');
    setDeleteAgreement(false);
    setIsDeletingAccount(false);
    setDeleteMessage('');
    setDeleteError('');

    // Reset de abas
    setActiveTab('geral');
  };

  // Função para iniciar processo de encerrar conta
  const handleStartDelete = () => {
    if (hasActiveSubscription) {
      // Se tem assinatura ativa, mostrar aviso
      return;
    }
    setDeleteStep('expanded');
    setDeleteConfirmation('');
    setDeleteAgreement(false);
    setDeleteMessage('');
    setDeleteError('');
  };

  // Função para confirmar encerramento
  const handleConfirmDelete = async () => {
    if (deleteConfirmation !== 'ENCERRAR' || !deleteAgreement) {
      setDeleteError('Preencha todos os campos obrigatórios');
      return;
    }

    setDeleteStep('processing');
    setIsDeletingAccount(true);
    setDeleteError('');

    try {
      // Chamar API para encerrar conta
      const response = await fetch('/api/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer mock-token-${user?.id}` // Token mock
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao processar solicitação');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Erro ao encerrar conta');
      }

      // Adicionar conta à lista de contas excluídas
      const deletedAccounts = JSON.parse(localStorage.getItem('deleted-accounts') || '[]');
      if (!deletedAccounts.includes(user?.email)) {
        deletedAccounts.push(user?.email);
        localStorage.setItem('deleted-accounts', JSON.stringify(deletedAccounts));
      }

      // Limpar todos os dados do usuário do localStorage
      localStorage.removeItem('auth.user');
      localStorage.removeItem('user-preferences');
      localStorage.removeItem('user-new-password');
      
      // Limpar também sessionStorage se houver
      sessionStorage.removeItem('auth.user');
      sessionStorage.removeItem('user-preferences');
      
      setDeleteStep('success');
      setDeleteMessage('Conta encerrada com sucesso. Redirecionando...');
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        // Forçar reload da página para garantir limpeza completa
        window.location.href = '/';
      }, 2000);

    } catch (error) {
      setDeleteStep('error');
      setDeleteError('Erro ao encerrar conta. Tente novamente.');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  // Função para cancelar encerramento
  const handleCancelDelete = () => {
    setDeleteStep('initial');
    setDeleteConfirmation('');
    setDeleteAgreement(false);
    setDeleteMessage('');
    setDeleteError('');
  };

  const tabs = [
    { id: 'geral', label: 'Geral', icon: '⚙️' },
    { id: 'seguranca', label: 'Segurança', icon: '🔒' },
    { id: 'assinaturas', label: 'Assinaturas', icon: '💳' },
    { id: 'suporte', label: 'Suporte', icon: '💬' }
  ];

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Verificar se o componente está montado
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Prevenir scroll quando modal estiver aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup ao desmontar
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Resetar estados quando modal for fechado
  useEffect(() => {
    if (!isOpen) {
      resetAllStates();
    }
  }, [isOpen]);

  // Fechar modal com ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        resetAllStates();
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !isMounted) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-[9999] flex items-center justify-center p-4"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          resetAllStates();
          onClose();
        }
      }}
    >
      <div 
        className="bg-gray-900 rounded-lg shadow-2xl border border-gray-700 w-full max-w-6xl h-[80vh] flex overflow-hidden relative"
        style={{ position: 'relative', zIndex: 1 }}
      >
        {/* Sidebar de navegação */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
          <div className="px-6 py-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">Configurações</h2>
          </div>
          
          <nav className="flex-1 p-4">
            <ul className="space-y-1">
              {tabs.map((tab) => (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium cursor-pointer ${
                      activeTab === tab.id
                        ? 'bg-blue-500/20 text-blue-400 border-l-4 border-blue-500'
                        : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Área de conteúdo */}
        <div className="flex-1 flex flex-col">
          {/* Header do conteúdo */}
          <div className="px-6 py-6 border-b border-gray-700 flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">
              {tabs.find(tab => tab.id === activeTab)?.label}
            </h3>
            <button
              onClick={() => {
                resetAllStates();
                onClose();
              }}
              className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center cursor-pointer"
            >
              <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Conteúdo da aba ativa */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'geral' && (
              <div className="space-y-8">
                <div className="border-b border-gray-700 pb-8">
                  <h4 className="text-lg font-bold text-white mb-6">Informações Pessoais</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Nome completo
                      </label>
                      {!isEditingName ? (
                        <div className="flex items-center space-x-3">
                          <input
                            type="text"
                            value={user?.name || ''}
                            className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-gray-500 placeholder-gray-500 focus:outline-none cursor-not-allowed"
                            readOnly
                          />
                          <button
                            onClick={handleStartEditName}
                            className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md"
                          >
                            Editar
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div>
                            <input
                              type="text"
                              value={editedName}
                              onChange={(e) => setEditedName(e.target.value)}
                              maxLength={30}
                              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Digite seu nome completo"
                            />
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-xs text-gray-400">
                                {editedName.length}/30 caracteres
                              </span>
                              {editedName.length > 25 && (
                                <span className="text-xs text-yellow-400">
                                  Próximo do limite
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-3">
                            <button
                              onClick={handleSaveName}
                              disabled={isSavingName || !editedName.trim()}
                              className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md flex items-center space-x-2"
                            >
                              {isSavingName ? (
                                <>
                                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  <span>Salvando...</span>
                                </>
                              ) : (
                                'Salvar'
                              )}
                            </button>
                            <button
                              onClick={handleCancelEditName}
                              disabled={isSavingName}
                              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md"
                            >
                              Cancelar
                            </button>
                          </div>
                          {nameError && (
                            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                              <p className="text-red-400 text-sm">{nameError}</p>
                            </div>
                          )}
                          {nameMessage && (
                            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                              <p className="text-green-400 text-sm">{nameMessage}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        E-mail
                      </label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-gray-500 placeholder-gray-500 focus:outline-none cursor-not-allowed"
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-white mb-6">Preferências</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <h5 className="text-sm font-medium text-white">Notificações por e-mail</h5>
                        <p className="text-sm text-gray-400">Receba atualizações sobre seus monitoramentos através do e-mail.</p>
                      </div>
                      <button 
                        onClick={() => setEmailNotifications(!emailNotifications)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                          emailNotifications ? 'bg-blue-500' : 'bg-gray-600'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          emailNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <h5 className="text-sm font-medium text-white">Notificações push</h5>
                        <p className="text-sm text-gray-400">Receba atualizações sobre seus monitoramentos através do seu navegador.</p>
                      </div>
                      <button 
                        onClick={() => setPushNotifications(!pushNotifications)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                          pushNotifications ? 'bg-blue-500' : 'bg-gray-600'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          pushNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <h5 className="text-sm font-medium text-white">Notificações por SMS</h5>
                        <p className="text-sm text-gray-400">Receba atualizações sobre seus monitoramentos através de SMS.</p>
                      </div>
                      <button 
                        onClick={() => setSmsNotifications(!smsNotifications)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                          smsNotifications ? 'bg-blue-500' : 'bg-gray-600'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          smsNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'seguranca' && !showPasswordChange && !showEmailChange && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-bold text-white mb-4">Segurança da Conta</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-4 h-32 flex flex-col">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col">
                          <h5 className="text-base font-semibold text-white mb-1">Alterar senha</h5>
                          <p className="text-xs text-gray-400 mb-3 leading-relaxed flex-1">Mantenha sua conta segura com uma senha forte</p>
                          <button 
                            onClick={() => setShowPasswordChange(true)}
                            className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-md transition-colors duration-200 cursor-pointer h-8 flex items-center justify-center w-full"
                          >
                            Alterar senha
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-4 h-32 flex flex-col">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col">
                          <h5 className="text-base font-semibold text-white mb-1">Trocar e-mail da conta</h5>
                          <p className="text-xs text-gray-400 mb-3 leading-relaxed flex-1">Altere seu e-mail cadastrado.</p>
                          <button 
                            onClick={handleStartEmailChange}
                            className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-md transition-colors duration-200 cursor-pointer h-8 flex items-center justify-center w-full"
                          >
                            Trocar e-mail
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Zona de Risco */}
                <div className="border-t border-gray-700 pt-8">
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-red-400 text-lg">⚠️</span>
                    <h4 className="text-lg font-bold text-gray-300">Zona de Risco</h4>
                  </div>
                  <p className="text-sm text-gray-400 mb-6">Ações irreversíveis que afetam permanentemente sua conta</p>
                  
                  <div className="p-4 bg-gray-800 border border-red-400/50 rounded-lg">
                    {deleteStep === 'initial' && (
                      <div className="space-y-4">
                        <div>
                          <h5 className="text-sm font-medium text-white mb-2">
                            <span className="text-red-400">Encerrar conta</span>
                          </h5>
                          <p className="text-sm text-gray-300">
                            Exclua permanentemente sua conta e todos os dados associados.
                          </p>
                        </div>
                        <div className="flex justify-start">
                          <button 
                            onClick={handleStartDelete}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-md cursor-pointer"
                          >
                            Encerrar conta
                          </button>
                        </div>
                      </div>
                    )}

                    {hasActiveSubscription && deleteStep === 'initial' && (
                      <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                        <p className="text-sm text-yellow-400 mb-3">
                          Você possui uma assinatura ativa. Cancele sua assinatura antes de encerrar a conta.
                        </p>
                        <button className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-medium rounded cursor-pointer">
                          Gerenciar assinatura
                        </button>
                      </div>
                    )}

                    {deleteStep === 'expanded' && (
                      <div className="space-y-4">
                        <div>
                          <h5 className="text-sm font-medium text-white mb-3">
                            <span className="text-red-400">Confirmar encerramento</span>
                          </h5>
                          <p className="text-sm text-gray-300 mb-4">
                            Esta ação é irreversível. Confirme que você entende as consequências:
                          </p>
                          <ul className="text-xs text-gray-400 space-y-1 mb-4">
                            <li>• Todos os seus dados serão excluídos permanentemente</li>
                            <li>• Você perderá acesso a todos os recursos</li>
                            <li>• Esta ação não pode ser desfeita</li>
                          </ul>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Digite <span className="text-red-400 font-bold">ENCERRAR</span> para confirmar:
                          </label>
                          <input
                            type="text"
                            value={deleteConfirmation}
                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400"
                            placeholder="Digite: ENCERRAR"
                          />
                        </div>

                        <div className="flex items-start space-x-2">
                          <input
                            type="checkbox"
                            id="deleteAgreement"
                            checked={deleteAgreement}
                            onChange={(e) => setDeleteAgreement(e.target.checked)}
                            className="mt-1 w-4 h-4 text-red-400 bg-gray-700 border-gray-600 rounded focus:ring-red-400 focus:ring-2"
                          />
                          <label htmlFor="deleteAgreement" className="text-sm text-gray-300">
                            Concordo que entendo as consequências e desejo encerrar minha conta permanentemente.
                          </label>
                        </div>

                        {deleteError && (
                          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <p className="text-red-400 text-sm">{deleteError}</p>
                          </div>
                        )}

                        <div className="flex space-x-3">
                          <button
                            onClick={handleConfirmDelete}
                            disabled={deleteConfirmation !== 'ENCERRAR' || !deleteAgreement}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md cursor-pointer"
                          >
                            Excluir permanentemente
                          </button>
                          <button
                            onClick={handleCancelDelete}
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-md cursor-pointer"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}

                    {deleteStep === 'processing' && (
                      <div className="text-center py-6">
                        <div className="flex items-center justify-center space-x-3">
                          <svg className="animate-spin h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="text-gray-300">Processando encerramento...</span>
                        </div>
                      </div>
                    )}

                    {deleteStep === 'success' && (
                      <div className="text-center py-6">
                        <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="text-green-400 text-sm">{deleteMessage}</p>
                      </div>
                    )}

                    {deleteStep === 'error' && (
                      <div className="text-center py-6">
                        <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                        <p className="text-red-400 text-sm mb-4">{deleteError}</p>
                        <button
                          onClick={handleCancelDelete}
                          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-md cursor-pointer"
                        >
                          Tentar novamente
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tela de alteração de e-mail */}
            {activeTab === 'seguranca' && showEmailChange && !showEmailVerification && (
              <div className="space-y-8">
                <div className="flex items-center space-x-4 mb-6">
                  <button
                    onClick={handleBackToSecurityFromEmail}
                    className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center cursor-pointer"
                  >
                    <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div>
                    <h4 className="text-lg font-bold text-white">Alteração de e-mail</h4>
                    <p className="text-sm text-gray-400">Digite seu novo e-mail abaixo</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      E-mail atual
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-gray-500 placeholder-gray-500 focus:outline-none cursor-not-allowed"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Digite seu novo e-mail
                    </label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="seu@novoemail.com"
                    />
                  </div>

                  {/* Aviso discreto */}
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <p className="text-yellow-400 text-sm">
                      Seu e-mail é usado para login e comunicações importantes. Alterar este dado exigirá nova verificação de identidade.
                    </p>
                  </div>

                  {/* Mensagens de erro e sucesso */}
                  {emailError && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <p className="text-red-400 text-sm">{emailError}</p>
                    </div>
                  )}

                  {emailMessage && (
                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <p className="text-green-400 text-sm">{emailMessage}</p>
                    </div>
                  )}

                  <div className="flex space-x-4">
                    <button
                      onClick={handleSendEmailCode}
                      disabled={!newEmail.trim() || isSendingCode}
                      className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md flex items-center space-x-2"
                    >
                      {isSendingCode ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Enviando...</span>
                        </>
                      ) : (
                        'Enviar código de verificação'
                      )}
                    </button>

                    <button
                      onClick={handleBackToSecurityFromEmail}
                      className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-md"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tela de verificação de código de e-mail */}
            {activeTab === 'seguranca' && showEmailChange && showEmailVerification && (
              <div className="space-y-8">
                <div className="flex items-center space-x-4 mb-6">
                  <button
                    onClick={() => setShowEmailVerification(false)}
                    className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center cursor-pointer"
                  >
                    <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div>
                    <h4 className="text-lg font-bold text-white">Verificação de e-mail</h4>
                    <p className="text-sm text-gray-400">Digite o código enviado para {newEmail}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Inputs de código */}
                  <div className="flex justify-center gap-3">
                    {emailVerificationCode.map((digit, index) => (
                      <input
                        key={index}
                        id={`email-code-${index}`}
                        type="text"
                        value={digit}
                        onChange={(e) => handleEmailCodeInputChange(index, e.target.value)}
                        onKeyDown={(e) => handleEmailCodeKeyDown(index, e)}
                        onPaste={handleEmailCodePaste}
                        className="w-12 h-12 bg-gray-800 border border-gray-600 rounded-md text-white text-center text-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

                  {/* Mensagens de erro e sucesso */}
                  {emailError && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <p className="text-red-400 text-sm text-center">{emailError}</p>
                    </div>
                  )}

                  {emailMessage && (
                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <p className="text-green-400 text-sm text-center">{emailMessage}</p>
                    </div>
                  )}

                  {/* Botão de reenviar código */}
                  <div className="text-center">
                    <button
                      onClick={handleSendEmailCode}
                      disabled={isSendingCode}
                      className="text-blue-400 hover:text-blue-300 text-sm underline disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isSendingCode ? 'Reenviando...' : 'Reenviar código'}
                    </button>
                  </div>
                </div>

                {/* Botões fixos na parte inferior */}
                <div className="sticky bottom-0 bg-gray-900 pt-6 border-t border-gray-700">
                  <div className="flex space-x-4">
                    <button
                      onClick={handleVerifyEmailCode}
                      disabled={emailVerificationCode.join('').length < 6 || isVerifyingEmail || timeLeft <= 0}
                      className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md flex items-center justify-center space-x-2"
                    >
                      {isVerifyingEmail ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Verificando...</span>
                        </>
                      ) : (
                        'Confirmar'
                      )}
                    </button>

                    <button
                      onClick={() => setShowEmailVerification(false)}
                      className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-md"
                    >
                      Voltar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tela de alteração de senha */}
            {activeTab === 'seguranca' && showPasswordChange && (
              <div className="space-y-8">
                <div className="flex items-center space-x-4 mb-6">
                  <button
                    onClick={handleBackToSecurity}
                    className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center cursor-pointer"
                  >
                    <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div>
                    <h4 className="text-lg font-bold text-white">Alteração de senha</h4>
                    <p className="text-sm text-gray-400">Digite sua senha atual e crie uma nova</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Senha atual
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Digite sua senha atual"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nova senha
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Digite sua nova senha"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Confirmar nova senha
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Confirme sua nova senha"
                    />
                  </div>

                  {/* Mensagens de erro e sucesso */}
                  {passwordError && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <p className="text-red-400 text-sm">{passwordError}</p>
                    </div>
                  )}

                  {passwordMessage && (
                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <p className="text-green-400 text-sm">{passwordMessage}</p>
                    </div>
                  )}

                  <div className="flex space-x-4">
                    <button
                      onClick={handlePasswordChange}
                      disabled={!currentPassword || !newPassword || !confirmPassword || isChangingPassword}
                      className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md flex items-center space-x-2"
                    >
                      {isChangingPassword ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Alterando...</span>
                        </>
                      ) : (
                        'Salvar nova senha'
                      )}
                    </button>

                    <button
                      onClick={handleBackToSecurity}
                      className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-md"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'assinaturas' && (
              <div className="space-y-6">
                {/* Card informativo do plano atual */}
                <div className="p-5 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base font-bold text-white">
                        Você está atualmente no{' '}
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                          plano gratuito
                        </span>
                      </h4>
                      <p className="text-sm text-gray-300">Explore nossos planos e escolha o que melhor se adapta às suas necessidades</p>
                    </div>
                    <div className="ml-4">
                      <button 
                        onClick={() => window.location.href = '/pagamentos'}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors duration-200 cursor-pointer"
                      >
                        Gerencia sua assinatura
                      </button>
                    </div>
                  </div>
                </div>

                {/* Toggle de Preços Mensal/Anual */}
                <div className="flex items-center justify-center mb-6">
                  <div className="flex items-center space-x-4">
                    <span className={`text-sm font-medium transition-colors duration-200 ${!isAnnualPricing ? 'text-white' : 'text-gray-400'}`}>
                      Mensal
                    </span>
           <button
             onClick={() => setIsAnnualPricing(!isAnnualPricing)}
             className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 cursor-pointer ${
               isAnnualPricing ? 'bg-blue-500' : 'bg-gray-600'
             }`}
           >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                          isAnnualPricing ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className={`text-sm font-medium transition-colors duration-200 ${isAnnualPricing ? 'text-white' : 'text-gray-400'}`}>
                      Anual
                    </span>
                  </div>
                </div>

                {/* Cards de preços */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {/* Plano Gratuito */}
                  <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-blue-500/50 transition-all duration-300 flex flex-col">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-white">Gratuito</h3>
                      <div className="min-h-[120px] flex flex-col items-center justify-start gap-1 mt-6 pt-4">
                        <div className="text-3xl font-bold leading-tight text-white">R$ 0,00</div>
                      </div>
                    </div>
                    <ul className="mt-4 space-y-2 flex-1">
                      <li className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="w-4 h-4 bg-green-500/20 rounded-full flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <span className="ml-3 text-sm text-gray-300">Buscar termos ilimitado</span>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="w-4 h-4 bg-green-500/20 rounded-full flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <span className="ml-3 text-sm text-gray-300">Download ilimitado de diários oficiais</span>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="w-4 h-4 bg-gray-500/20 rounded-full flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-3 flex items-center gap-2">
                          <div className="relative inline-block group">
                            <span className="text-sm text-gray-300 cursor-help underline decoration-dashed decoration-white" style={{ textUnderlineOffset: '1px' }}>
                              1 alerta
                            </span>
                            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-4 py-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 pointer-events-none w-64 border border-gray-600/30" style={{ zIndex: 99999 }}>
                              <div className="text-center">
                                <p className="font-medium text-yellow-400 mb-1 text-sm">Limitação de 7 dias</p>
                                <p className="text-gray-400 leading-relaxed text-xs">
                                  Alertas e contextos do Radar IA serão desativados após 7 dias. Ative um plano pago para continuar usando.
                                </p>
                              </div>
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                            </div>
                          </div>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="w-4 h-4 bg-gray-500/20 rounded-full flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-3 flex items-center gap-2">
                          <div className="relative inline-block group">
                            <span className="text-sm text-gray-300 cursor-help underline decoration-dashed decoration-white" style={{ textUnderlineOffset: '1px' }}>
                              1 contexto no Radar IA
                            </span>
                            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-4 py-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 pointer-events-none w-64 border border-gray-600/30" style={{ zIndex: 99999 }}>
                              <div className="text-center">
                                <p className="font-medium text-yellow-400 mb-1 text-sm">Limitação de 7 dias</p>
                                <p className="text-gray-400 leading-relaxed text-xs">
                                  Alertas e contextos do Radar IA serão desativados após 7 dias. Ative um plano pago para continuar usando.
                                </p>
                              </div>
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                            </div>
                          </div>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="w-4 h-4 bg-green-500/20 rounded-full flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <span className="ml-3 text-sm text-gray-300">Suporte: Padrão</span>
                      </li>
                    </ul>
                    <div className="mt-4">
                      <button className="w-full px-3 py-2 bg-gray-600 text-white text-xs font-medium rounded-lg cursor-not-allowed opacity-50">
                        Plano Atual
                      </button>
                    </div>
                  </div>

                  {/* Plano Básico */}
                  <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-blue-500/50 transition-all duration-300 flex flex-col">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-white">Básico</h3>
                      <div className="min-h-[120px] flex flex-col items-center justify-center gap-1 mt-6">
                        {isAnnualPricing ? (
                          <>
                            <div className="flex items-baseline justify-center">
                              <div className="text-3xl font-bold leading-tight text-white">R$ 23,92</div>
                              <div className="text-sm text-white/60 ml-1">/mês</div>
                            </div>
                            <div className="text-xs text-white/50 mt-1">Cobrado anualmente: R$ 287,04 hoje</div>
                            <div className="inline-flex items-center px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full mt-2">
                              <span className="text-xs text-emerald-400 font-medium">20% OFF no plano anual</span>
                            </div>
                          </>
                        ) : (
                          <div className="flex items-baseline">
                            <div className="text-3xl font-bold leading-tight text-white">R$ 29,90</div>
                            <div className="text-sm text-white/60 ml-1">/mês</div>
                          </div>
                        )}
                      </div>
                    </div>
                    <ul className="mt-4 space-y-2 flex-1">
                      <li className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="w-4 h-4 bg-green-500/20 rounded-full flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <span className="ml-3 text-sm text-gray-300">Buscar termos ilimitado</span>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="w-4 h-4 bg-green-500/20 rounded-full flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <span className="ml-3 text-sm text-gray-300">Download ilimitado de diários oficiais</span>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="w-4 h-4 bg-green-500/20 rounded-full flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <span className="ml-3 text-sm text-gray-300">10 alertas</span>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="w-4 h-4 bg-green-500/20 rounded-full flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <span className="ml-3 text-sm text-gray-300">1 contexto ativo no Radar IA</span>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="w-4 h-4 bg-green-500/20 rounded-full flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <span className="ml-3 text-sm text-gray-300">Suporte: Padrão</span>
                      </li>
                    </ul>
                    <div className="mt-4">
                      <button 
                        onClick={() => window.location.href = '/pagamentos'}
                        className="w-full px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors duration-200 cursor-pointer"
                      >
                        {isAnnualPricing ? 'Assinar plano' : 'Assinar'}
                      </button>
                    </div>
                  </div>

                  {/* Plano Premium */}
                  <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-blue-500/50 transition-all duration-300 flex flex-col">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-white">Premium</h3>
                      <div className="min-h-[120px] flex flex-col items-center justify-center gap-1 mt-6">
                        {isAnnualPricing ? (
                          <>
                            <div className="flex items-baseline justify-center">
                              <div className="text-3xl font-bold leading-tight text-white">R$ 31,92</div>
                              <div className="text-sm text-white/60 ml-1">/mês</div>
                            </div>
                            <div className="text-xs text-white/50 mt-1">Cobrado anualmente: R$ 383,04 hoje</div>
                            <div className="inline-flex items-center px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full mt-2">
                              <span className="text-xs text-emerald-400 font-medium">20% OFF no plano anual</span>
                            </div>
                          </>
                        ) : (
                          <div className="flex items-baseline">
                            <div className="text-3xl font-bold leading-tight text-white">R$ 39,90</div>
                            <div className="text-sm text-white/60 ml-1">/mês</div>
                          </div>
                        )}
                      </div>
                    </div>
                    <ul className="mt-4 space-y-2 flex-1">
                      <li className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="w-4 h-4 bg-green-500/20 rounded-full flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <span className="ml-3 text-sm text-gray-300">Buscar termos ilimitado</span>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="w-4 h-4 bg-green-500/20 rounded-full flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <span className="ml-3 text-sm text-gray-300">Download ilimitado de diários oficiais</span>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="w-4 h-4 bg-green-500/20 rounded-full flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <span className="ml-3 text-sm text-gray-300">Até 20 alertas</span>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="w-4 h-4 bg-green-500/20 rounded-full flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <span className="ml-3 text-sm text-gray-300">3 contextos ativos no Radar IA</span>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="w-4 h-4 bg-green-500/20 rounded-full flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <span className="ml-3 text-sm text-gray-300">Suporte: Prioritário</span>
                      </li>
                    </ul>
                    <div className="mt-4">
                      <button 
                        onClick={() => window.location.href = '/pagamentos'}
                        className="w-full px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors duration-200 cursor-pointer"
                      >
                        {isAnnualPricing ? 'Assinar plano' : 'Assinar'}
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {activeTab === 'suporte' && (
              <div className="space-y-8">
                <div className="border-b border-gray-700 pb-8">
                  <h4 className="text-lg font-bold text-white mb-6">Central de Ajuda</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                      <h5 className="text-sm font-medium text-white mb-2">Documentação</h5>
                      <p className="text-sm text-gray-400 mb-4">Acesse nossa base de conhecimento</p>
                      <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition-colors duration-200">
                        Acessar
                      </button>
                    </div>
                    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                      <h5 className="text-sm font-medium text-white mb-2">Contato</h5>
                      <p className="text-sm text-gray-400 mb-4">Entre em contato conosco</p>
                      <button className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-md transition-colors duration-200">
                        Enviar mensagem
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Renderizar usando portal para garantir que apareça no topo
  return createPortal(modalContent, document.body);
}
