'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import TransparentHeader from '@/components/TransparentHeader';
import TestModal from '@/components/TestModal';

export default function ResultadosPage() {
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'tudo';

  // Mock de resultados baseado no tipo de busca
  const getMockResults = () => {
    const baseResults = [
      {
        id: '1',
        title: 'João Silva Santos',
        subtitle: 'CPF: 123.456.789-00',
        type: 'pessoa',
        description: 'Advogado - OAB/SP 123456',
        date: '2024-01-15',
        source: 'OAB/SP'
      },
      {
        id: '2',
        title: 'Empresa ABC Ltda',
        subtitle: 'CNPJ: 12.345.678/0001-90',
        type: 'empresa',
        description: 'Construção Civil - Ativa desde 2010',
        date: '2024-01-10',
        source: 'Receita Federal'
      },
      {
        id: '3',
        title: 'Processo 1234567-89.2024.8.26.0001',
        subtitle: 'Ação de Cobrança',
        type: 'processo',
        description: 'João Silva Santos vs Empresa ABC Ltda',
        date: '2024-01-20',
        source: 'TJSP'
      }
    ];

    if (type === 'tudo') return baseResults;
    return baseResults.filter(result => result.type === type);
  };

  const results = getMockResults();

  return (
    <div className="min-h-screen bg-gray-50">
      <TransparentHeader 
        currentPage="resultados" 
        onTrialClick={() => setIsTestModalOpen(true)} 
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header da página de resultados */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Resultados para "{query}"
              </h1>
              <p className="text-gray-600 mt-1">
                {results.length} resultado(s) encontrado(s)
              </p>
            </div>
            
            {/* Filtros */}
            <div className="flex space-x-4">
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option>Todos os tipos</option>
                <option>Pessoas</option>
                <option>Empresas</option>
                <option>Processos</option>
                <option>Diários</option>
              </select>
              
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option>Mais recentes</option>
                <option>Mais antigos</option>
                <option>Mais relevantes</option>
              </select>
            </div>
          </div>

          {/* Barra de busca refinada */}
          <div className="max-w-2xl">
            <p className="text-sm text-gray-500 mb-2">
              Busca atual: <span className="font-medium text-gray-700">"{query}"</span>
            </p>
            <p className="text-sm text-gray-500">
              Use a barra de busca no header para fazer uma nova pesquisa.
            </p>
          </div>
        </div>

        {/* Lista de resultados */}
        <div className="space-y-4">
          {results.length > 0 ? (
            results.map((result) => (
              <div key={result.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {result.title}
                    </h3>
                    <p className="text-orange-600 font-medium mb-2">
                      {result.subtitle}
                    </p>
                    <p className="text-gray-600 mb-3">
                      {result.description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Fonte: {result.source}</span>
                      <span>•</span>
                      <span>{new Date(result.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button className="px-4 py-2 text-orange-600 border border-orange-600 rounded-lg hover:bg-orange-50 transition-colors">
                      Ver detalhes
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum resultado encontrado
              </h3>
              <p className="text-gray-600 mb-6">
                Tente ajustar seus termos de busca ou filtros
              </p>
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                Nova busca
              </button>
            </div>
          )}
        </div>

        {/* Paginação */}
        {results.length > 0 && (
          <div className="mt-8 flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Mostrando 1-{results.length} de {results.length} resultados
            </p>
            
            <div className="flex space-x-2">
              <button className="px-3 py-2 text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>
                Anterior
              </button>
              <button className="px-3 py-2 bg-orange-500 text-white rounded-lg">
                1
              </button>
              <button className="px-3 py-2 text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>
                Próximo
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de teste */}
      <TestModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
      />
    </div>
  );
}
