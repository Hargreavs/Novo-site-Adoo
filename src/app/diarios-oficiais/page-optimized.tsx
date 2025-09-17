'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import TransparentHeader from '@/components/TransparentHeader';
import IconLoader from '@/components/IconLoader';
import { usePreload, usePreloadPage } from '@/hooks/usePreload';

// Lazy load all heavy components
const LazySearchFilters = lazy(() => import('@/components/LazySearchFilters'));
const LazySearchResults = lazy(() => import('@/components/LazySearchResults'));
const RegisterModal = lazy(() => import('@/components/RegisterModal'));
const TestModal = lazy(() => import('@/components/TestModal'));

export default function DiariosOficiais() {
  // Preload critical components
  usePreload();
  usePreloadPage('diarios-oficiais');
  
  const [activeTab, setActiveTab] = useState('buscar');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  return (
    <div className="bg-transparent min-h-screen">
      <TransparentHeader 
        currentPage="diarios-oficiais" 
        onTrialClick={() => setIsTestModalOpen(true)} 
      />

      <div className="relative isolate px-6 pt-14 lg:px-8">
        {/* Hero Section - Minimal */}
        <div className="mx-auto max-w-6xl py-16 sm:py-24">
          <div className="text-center mb-16">
            <h1 className="text-lg font-bold tracking-tight text-white sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                Diários Oficiais
              </span>
            </h1>
            <p className="mt-3 text-base text-gray-300 max-w-2xl mx-auto sm:text-lg sm:mt-4">
              Busque e monitore publicações oficiais de forma inteligente
            </p>
          </div>

          {/* Tab Navigation - Minimal */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-1">
              <button
                onClick={() => setActiveTab('buscar')}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'buscar'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <IconLoader name="MagnifyingGlassIcon" className="w-4 h-4 inline mr-2" />
                Buscar
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="space-y-8">
            {activeTab === 'buscar' && (
              <Suspense fallback={
                <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                    <div className="h-10 bg-gray-700 rounded"></div>
                    <div className="h-10 bg-gray-700 rounded"></div>
                    <div className="h-10 bg-gray-700 rounded"></div>
                  </div>
                </div>
              }>
                <LazySearchFilters
                  searchTerm=""
                  setSearchTerm={() => {}}
                  selectedDate=""
                  setSelectedDate={() => {}}
                  customDateRange={{ start: undefined, end: undefined }}
                  setCustomDateRange={() => {}}
                  dateRange="today"
                  setDateRange={() => {}}
                  selectedOrgao=""
                  setSelectedOrgao={() => {}}
                  selectedTipo=""
                  setSelectedTipo={() => {}}
                  onSearch={() => {}}
                  onClearFilters={() => {}}
                  isSearching={false}
                />
              </Suspense>
            )}

            <Suspense fallback={
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-700 rounded w-1/4"></div>
                      <div className="h-20 bg-gray-700 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            }>
              <LazySearchResults
                results={[]}
                isLoading={false}
                onToggleBookmark={() => {}}
                onMarkAsRead={() => {}}
                onViewDetails={() => {}}
              />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Suspense fallback={null}>
        <RegisterModal
          isOpen={isRegisterModalOpen}
          onClose={() => setIsRegisterModalOpen(false)}
        />
        <TestModal
          isOpen={isTestModalOpen}
          onClose={() => setIsTestModalOpen(false)}
        />
      </Suspense>
    </div>
  );
}
