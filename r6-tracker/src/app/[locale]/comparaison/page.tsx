'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import PlayerComparison from '@/components/PlayerComparison';
import TeamComparison from '@/components/TeamComparison';

type ComparisonMode = 'select' | 'player' | 'team';

// Composant BackButton réutilisable
const BackButton = ({ onClick }: { onClick: () => void }) => {
  const t = useTranslations('comparison');
  return (
    <div className="p-6">
      <button
        onClick={onClick}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all duration-300"
      >
        <i className="pi pi-arrow-left"></i>
        {t('backToMenu')}
      </button>
    </div>
  );
};

// Composant PageWrapper réutilisable
const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20">
    {children}
  </div>
);

export default function ComparisonPage() {
  const [mode, setMode] = useState<ComparisonMode>('select');
  const t = useTranslations('comparison');

  if (mode === 'player') {
    return (
      <PageWrapper>
        <BackButton onClick={() => setMode('select')} />
        <PlayerComparison />
      </PageWrapper>
    );
  }

  if (mode === 'team') {
    return (
      <PageWrapper>
        <BackButton onClick={() => setMode('select')} />
        <TeamComparison />
      </PageWrapper>
    );
  }

  // Mode sélection avec design liquid glass
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 relative overflow-hidden">
      {/* Effets de fond liquid glass */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="max-w-6xl mx-auto text-center">
          {/* En-tête principal */}
          <div className="mb-16">
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {t('title')}
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              {t('subtitle')}
            </p>
          </div>

          {/* Cartes de sélection */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* Comparaison de Joueurs */}
            <div 
              onClick={() => setMode('player')}
              className="group cursor-pointer transform hover:scale-105 transition-all duration-500"
            >
              <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:border-blue-400/50 hover:bg-white/20 transition-all duration-500 overflow-hidden">
                {/* Effet liquid glass */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10">
                  {/* Icône principale */}
                  <div className="mb-6">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <i className="pi pi-user text-3xl text-white"></i>
                    </div>
                  </div>

                  {/* Titre */}
                  <h2 className="text-3xl font-bold text-white mb-4 group-hover:text-blue-300 transition-colors duration-300">
                    {t('player.title')}
                  </h2>

                  {/* Description */}
                  <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                    {t('player.description')}
                  </p>

                  {/* Fonctionnalités */}
                  <div className="space-y-3 text-left">
                    <div className="flex items-center gap-3 text-gray-200">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span>{t('player.features.mmr')}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-200">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span>{t('player.features.prediction')}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-200">
                      <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                      <span>{t('player.features.multiplatform')}</span>
                    </div>
                  </div>

                  {/* Bouton d'action */}
                  <div className="mt-8">
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white font-semibold group-hover:from-blue-500 group-hover:to-purple-500 transition-all duration-300">
                      {t('player.cta')}
                      <i className="pi pi-arrow-right group-hover:translate-x-1 transition-transform duration-300"></i>
                    </div>
                  </div>
                </div>

                {/* Icônes décoratives */}
                <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity duration-300">
                  <i className="pi pi-bolt text-4xl text-blue-400"></i>
                </div>
              </div>
            </div>

            {/* Comparaison d'Équipes */}
            <div 
              onClick={() => setMode('team')}
              className="group cursor-pointer transform hover:scale-105 transition-all duration-500"
            >
              <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:border-red-400/50 hover:bg-white/20 transition-all duration-500 overflow-hidden">
                {/* Effet liquid glass */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-transparent to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10">
                  {/* Icône principale */}
                  <div className="mb-6">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <i className="pi pi-users text-3xl text-white"></i>
                    </div>
                  </div>

                  {/* Titre */}
                  <h2 className="text-3xl font-bold text-white mb-4 group-hover:text-red-300 transition-colors duration-300">
                    {t('team.title')}
                  </h2>

                  {/* Description */}
                  <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                    {t('team.description')}
                  </p>

                  {/* Fonctionnalités */}
                  <div className="space-y-3 text-left">
                    <div className="flex items-center gap-3 text-gray-200">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <span>{t('team.features.teamSize')}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-200">
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                      <span>{t('team.features.balancing')}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-200">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <span>{t('team.features.avgStats')}</span>
                    </div>
                  </div>

                  {/* Bouton d'action */}
                  <div className="mt-8">
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl text-white font-semibold group-hover:from-red-500 group-hover:to-orange-500 transition-all duration-300">
                      {t('team.cta')}
                      <i className="pi pi-arrow-right group-hover:translate-x-1 transition-transform duration-300"></i>
                    </div>
                  </div>
                </div>

                {/* Icônes décoratives */}
                <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity duration-300">
                  <i className="pi pi-shield text-4xl text-red-400"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Footer informatif */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-center gap-4 text-gray-300">
                <i className="pi pi-info-circle text-xl text-blue-400"></i>
                <p className="text-center">
                  {t('info')}{' '}
                  <span className="text-white font-semibold">{t('infoHighlight')}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}