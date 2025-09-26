'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

interface PendingUser {
  id: string;
  name: string;
  email: string;
  maskedEmail: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  pendingUser: PendingUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  recreateAccount: (email: string) => void;
  signup: (email: string, fullName: string, password: string) => Promise<{ success: boolean; message: string }>;
  verifyCode: (code: string) => Promise<{ success: boolean; message: string }>;
  acceptPolicies: () => Promise<{ success: boolean; message: string }>;
  clearPendingUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Inicializar com dados do localStorage imediatamente para evitar flash
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('auth.user');
        return storedUser ? JSON.parse(storedUser) : null;
      } catch (error) {
        console.error('Erro ao carregar usuário do localStorage:', error);
        localStorage.removeItem('auth.user');
        return null;
      }
    }
    return null;
  });
  const [pendingUser, setPendingUser] = useState<PendingUser | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Sempre false para usuários já carregados
  const [isInitialized, setIsInitialized] = useState(true); // Sempre true para evitar flash

  // Sincronização entre abas - apenas para mudanças externas
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth.user') {
        try {
          if (e.newValue) {
            setUser(JSON.parse(e.newValue));
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error('Erro ao sincronizar usuário entre abas:', error);
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    // Verificar se a conta foi excluída
    const deletedAccounts = JSON.parse(localStorage.getItem('deleted-accounts') || '[]');
    if (deletedAccounts.includes(email)) {
      throw new Error('Esta conta foi encerrada e não pode mais ser acessada.');
    }

    // Verificar se o e-mail foi invalidado (alterado)
    const invalidEmails = JSON.parse(localStorage.getItem('invalid-emails') || '[]');
    if (invalidEmails.includes(email)) {
      throw new Error('Este e-mail foi alterado e não pode mais ser usado para login.');
    }

    // Verificar se há uma nova senha salva
    const newPassword = localStorage.getItem('user-new-password');
    const validPassword = newPassword || '123456';
    
    // Validação mock - aceitar apenas e-mails válidos
    const validEmails = ['rafaximenes1@gmail.com', 'alex.augustus2501@gmail.com'];
    if (!validEmails.includes(email) || password !== validPassword) {
      throw new Error('Credenciais inválidas.');
    }

    // Verificar se já existe um usuário logado para preservar o nome
    const existingUser = localStorage.getItem('auth.user');
    let userName = 'Rafael Ximenes'; // Nome padrão
    
    if (existingUser) {
      const userData = JSON.parse(existingUser);
      userName = userData.name || userName; // Preservar nome existente
    }

    const userData: User = {
      id: '1',
      name: userName,
      email: email,
      avatarUrl: '/avatar-default.png'
    };

    setUser(userData);
    localStorage.setItem('auth.user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth.user');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('auth.user', JSON.stringify(updatedUser));
      
      // Atualizar também no sessionStorage
      const currentUserSession = sessionStorage.getItem('auth.user');
      if (currentUserSession) {
        sessionStorage.setItem('auth.user', JSON.stringify(updatedUser));
      }
    }
  };

  const recreateAccount = (email: string) => {
    const deletedAccounts = JSON.parse(localStorage.getItem('deleted-accounts') || '[]');
    const updatedAccounts = deletedAccounts.filter((account: string) => account !== email);
    localStorage.setItem('deleted-accounts', JSON.stringify(updatedAccounts));
  };

  const signup = async (email: string, fullName: string, password: string): Promise<{ success: boolean; message: string }> => {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verificar se já existe um usuário ativo com este email
    const existingUser = localStorage.getItem('auth.user');
    if (existingUser) {
      const user = JSON.parse(existingUser);
      if (user.email === email) {
        return { success: false, message: 'Já existe uma conta ativa com este e-mail' };
      }
    }

    // Se a conta foi encerrada anteriormente, permitir recriação
    const deletedAccounts = JSON.parse(localStorage.getItem('deleted-accounts') || '[]');
    if (deletedAccounts.includes(email)) {
      // Remover da lista de contas excluídas para permitir recriação
      const updatedAccounts = deletedAccounts.filter((account: string) => account !== email);
      localStorage.setItem('deleted-accounts', JSON.stringify(updatedAccounts));
    }

    // Simular criação de usuário
    const newUser: User = {
      id: Date.now().toString(),
      name: fullName,
      email: email,
      avatarUrl: '/avatar-default.png'
    };

    // Salvar usuário pendente (não logado ainda)
    setPendingUser({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      maskedEmail: email.replace(/(.{2}).*(@.*)/, '$1***$2')
    });

    return { success: true, message: 'Conta criada com sucesso' };
  };

  const verifyCode = async (code: string): Promise<{ success: boolean; message: string }> => {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Validação mock do código
    if (code !== '123456') {
      return { success: false, message: 'Código incorreto' };
    }

    return { success: true, message: 'Código verificado com sucesso' };
  };

  const acceptPolicies = async (): Promise<{ success: boolean; message: string }> => {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (!pendingUser) {
      return { success: false, message: 'Nenhum usuário pendente encontrado' };
    }

    // Criar usuário final
    const finalUser: User = {
      id: pendingUser.id,
      name: pendingUser.name,
      email: pendingUser.email,
      avatarUrl: '/avatar-default.png'
    };

    // Salvar usuário no localStorage
    setUser(finalUser);
    localStorage.setItem('auth.user', JSON.stringify(finalUser));

    // Limpar usuário pendente
    setPendingUser(null);

    return { success: true, message: 'Políticas aceitas e conta criada com sucesso' };
  };

  const clearPendingUser = () => {
    setPendingUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    isInitialized,
    pendingUser,
    login,
    logout,
    updateUser,
    recreateAccount,
    signup,
    verifyCode,
    acceptPolicies,
    clearPendingUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}