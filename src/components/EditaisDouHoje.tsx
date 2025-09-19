'use client';

import { useState } from 'react';
import TestModal from './TestModal';

interface Edital {
  id: string;
  titulo: string;
  fonte: string;
  data: string;
  termo?: string;
  tags?: string[];
  temIA?: boolean;
}

interface EditaisDouHojeProps {
  editais: Edital[];
  isLoggedIn?: boolean;
  isPremium?: boolean;
  searchTerm?: string;
}

export default function EditaisDouHoje({ 
  editais, 
  isLoggedIn = false, 
  isPremium = false,
  searchTerm = ''
}: EditaisDouHojeProps) {
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);
  
  const editaisDesbloqueados = editais.slice(0, 1 + revealedCount);
  const editaisBloqueados = editais.slice(1 + revealedCount);
  const editaisRestantes = editais.length - 1 - revealedCount;

  const highlightTerm = (text: string, term: string) => {
    if (!term) return text;
    const regex = new RegExp(`(${term})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-300/20 text-yellow-200 px-1 rounded">$1</mark>');
  };

  const handleReveal = () => {
    if (!isLoggedIn) {
      setIsTestModalOpen(true);
      return;
    }
    setRevealedCount(prev => prev + 1);
  };

  const canRevealMore = editaisRestantes > 0;
  const canRevealAll = isLoggedIn && (isPremium || !isPremium); // Logado pode revelar, premium vê tudo

  const hoje = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <>
      <div className="bg-white/3 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Editais do Diário Oficial da União hoje - {hoje}</h3>
        
        <div className="space-y-4">
          {/* Editais desbloqueados */}
          {editaisDesbloqueados.map((edital, index) => (
            <div key={edital.id} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 
                    className="text-sm font-medium text-white mb-2"
                    dangerouslySetInnerHTML={{ 
                      __html: highlightTerm(edital.titulo, searchTerm) 
                    }}
                  />
                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                    <span>{edital.fonte}</span>
                    <span>{edital.data}</span>
                  </div>
                  
                  {/* Tags e IA - apenas para premium */}
                  {isPremium && edital.tags && edital.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {edital.tags.map((tag, tagIndex) => (
                        <span 
                          key={tagIndex}
                          className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Indicador de IA */}
                  {isPremium && edital.temIA && (
                    <div className="mt-2 flex items-center text-xs text-green-400">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                      </svg>
                      Análise IA disponível
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Editais bloqueados com blur */}
          {editaisBloqueados.map((edital, index) => (
            <div key={edital.id} className="relative bg-white/5 rounded-lg p-4 overflow-hidden">
              {/* Conteúdo borrado */}
              <div className="blur-sm">
                <h4 className="text-sm font-medium text-white mb-2">
                  {edital.titulo}
                </h4>
                <div className="flex items-center space-x-4 text-xs text-gray-400">
                  <span>{edital.fonte}</span>
                  <span>{edital.data}</span>
                </div>
              </div>
              
              {/* Botão de revelar - fora do blur */}
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <button
                  onClick={handleReveal}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl border-0 outline-none cursor-pointer"
                  style={{ 
                    opacity: 1,
                    backgroundColor: 'transparent',
                    backgroundImage: 'linear-gradient(to right, #3b82f6, #2563eb)'
                  }}
                >
                  {!isLoggedIn ? 'Revelar' : 'Revelar'}
                </button>
              </div>
            </div>
          ))}

          {/* Label de editais restantes */}
          {editaisRestantes > 0 && (
            <div className="text-center pt-2">
              <span className="text-sm text-gray-400">
                +{editaisRestantes} editais hoje
              </span>
            </div>
          )}
        </div>
      </div>

      <TestModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
      />
    </>
  );
}
