'use client';

import { useAuth } from '@/contexts/AuthContext';
import Protected from '@/components/Protected';
import TransparentHeader from '@/components/TransparentHeader';

export default function ContaPage() {
  const { user } = useAuth();

  return (
    <Protected>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <TransparentHeader currentPage="conta" />
        
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8">Minha Conta</h1>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
              <div className="flex items-center space-x-4 mb-6">
                <img
                  src={user?.avatarUrl || '/avatar-default.svg'}
                  alt={user?.name || 'Usuário'}
                  className="w-16 h-16 rounded-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/avatar-default.svg';
                  }}
                />
                <div>
                  <h2 className="text-xl font-semibold text-white">{user?.name}</h2>
                  <p className="text-gray-400">{user?.email}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-2">Informações da Conta</h3>
                  <p className="text-gray-300">Esta é uma página de exemplo para usuários logados.</p>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-2">Configurações</h3>
                  <p className="text-gray-300">Aqui você pode gerenciar suas configurações de conta.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Protected>
  );
}
