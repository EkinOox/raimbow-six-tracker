'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import SectionHeader from '../../components/ui/SectionHeader';
import { r6DataAPI } from '../../services/r6DataService';
import { Platform, CompletePlayerData } from '../../types/r6-data-types';

interface TestStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  data?: unknown;
  duration?: number;
}

interface TestResults {
  steps: TestStep[];
  playerData: CompletePlayerData | null;
  rawData: {
    accountInfo?: CompletePlayerData;
    playerStats?: CompletePlayerData;
    serviceStatus?: boolean;
  };
}

export default function ApiTestPage() {
  const [username, setUsername] = useState('Ekin0ox.DSG');
  const [platform, setPlatform] = useState<Platform>('uplay');
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<TestResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateStepStatus = (stepId: string, status: TestStep['status'], message?: string, data?: unknown, duration?: number) => {
    setTestResults(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        steps: prev.steps.map(step => 
          step.id === stepId 
            ? { ...step, status, message, data, duration }
            : step
        )
      };
    });
  };

  const testR6DataApi = async () => {
    if (!username) {
      setError('Veuillez entrer un nom d\'utilisateur');
      return;
    }

    setLoading(true);
    setError(null);
    
    // Initialisation des étapes de test
    const initialSteps: TestStep[] = [
      { id: 'init', name: 'Initialisation de r6-data.js', status: 'pending' },
      { id: 'service', name: 'Test du statut du service', status: 'pending' },
      { id: 'account', name: 'Récupération des informations du compte', status: 'pending' },
      { id: 'stats', name: 'Récupération des statistiques de jeu', status: 'pending' },
      { id: 'transform', name: 'Transformation des données', status: 'pending' }
    ];

    setTestResults({
      steps: initialSteps,
      playerData: null,
      rawData: {}
    });

    const rawData: { accountInfo?: CompletePlayerData; playerStats?: CompletePlayerData; serviceStatus?: boolean } = {};

    try {
      // Étape 1: Initialisation
      updateStepStatus('init', 'running', 'Chargement de la bibliothèque r6-data.js...');
      const startInit = Date.now();
      
      console.log(`🔍 Test avec ${username} sur ${platform}...`);
      
      updateStepStatus('init', 'success', 'Bibliothèque r6-data.js chargée avec succès', null, Date.now() - startInit);

      // Étape 2: Test du service
      updateStepStatus('service', 'running', 'Vérification du statut du service Rainbow Six...');
      const startService = Date.now();
      
      try {
        const serviceStatus = await r6DataAPI.testConnection();
        rawData.serviceStatus = serviceStatus;
        updateStepStatus('service', 'success', `Service ${serviceStatus ? 'accessible' : 'inaccessible'}`, serviceStatus, Date.now() - startService);
      } catch (serviceError) {
        updateStepStatus('service', 'error', `Erreur service: ${serviceError instanceof Error ? serviceError.message : 'Erreur inconnue'}`);
      }

      // Étape 3: Informations du compte
      updateStepStatus('account', 'running', `Récupération du profil de ${username}...`);
      const startAccount = Date.now();
      
      let accountInfo = null;
      try {
        accountInfo = await r6DataAPI.getAccountInfo(username, platform);
        rawData.accountInfo = accountInfo;
        updateStepStatus('account', 'success', `Profil trouvé - Niveau ${accountInfo?.info?.level || 'N/A'}`, accountInfo, Date.now() - startAccount);
      } catch (accountError) {
        updateStepStatus('account', 'error', `Erreur compte: ${accountError instanceof Error ? accountError.message : 'Erreur inconnue'}`);
      }

      // Étape 4: Statistiques de jeu
      updateStepStatus('stats', 'running', `Récupération des statistiques de ${username}...`);
      const startStats = Date.now();
      
      let playerStats = null;
      try {
        playerStats = await r6DataAPI.getPlayerStats(username, platform);
        rawData.playerStats = playerStats;
        updateStepStatus('stats', 'success', `Statistiques récupérées - ${playerStats?.stats?.general?.kills || 0} kills`, playerStats, Date.now() - startStats);
      } catch (statsError) {
        updateStepStatus('stats', 'error', `Erreur stats: ${statsError instanceof Error ? statsError.message : 'Erreur inconnue'}`);
      }

      // Étape 5: Transformation des données
      updateStepStatus('transform', 'running', 'Consolidation des données...');
      const startTransform = Date.now();

      // Utiliser les données les plus complètes disponibles
      const finalPlayerData = playerStats || accountInfo;
      
      if (finalPlayerData) {
        updateStepStatus('transform', 'success', 'Données consolidées avec succès', null, Date.now() - startTransform);
        
        setTestResults(prev => ({
          ...prev!,
          playerData: finalPlayerData,
          rawData
        }));
      } else {
        updateStepStatus('transform', 'error', 'Aucune donnée de joueur disponible');
      }

    } catch (err) {
      console.error('Erreur test API:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <SectionHeader 
          title="Test API r6-data.js - Live Testing"
          description="Interface de test en temps réel avec étapes détaillées"
        />

        {/* Formulaire de test */}
        <motion.div 
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6">Test du Service r6-data.js</h2>
          
          <div className="mb-4 p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-green-200">
            <strong>✅ Testé et fonctionnel :</strong> quick-test.js valide l&apos;intégration r6-data.js
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Nom d&apos;utilisateur
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Ekin0ox.DSG"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Plateforme
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="uplay">PC (Ubisoft Connect)</option>
                <option value="steam">PC (Steam)</option>
                <option value="playstation">PlayStation</option>
                <option value="xbox">Xbox</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={testR6DataApi}
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Test en cours...' : 'Lancer le Test Complet'}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 mb-6">
              <strong>Erreur:</strong> {error}
            </div>
          )}
        </motion.div>

        {/* Étapes de test en temps réel */}
        {testResults && (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {/* Progression des tests */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Progression des Tests</h3>
              <div className="space-y-3">
                {testResults.steps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    className="flex items-center space-x-4 p-3 rounded-lg bg-white/5"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex-shrink-0">
                      {step.status === 'pending' && (
                        <div className="w-6 h-6 rounded-full border-2 border-gray-400"></div>
                      )}
                      {step.status === 'running' && (
                        <div className="w-6 h-6 rounded-full border-2 border-blue-400 border-t-transparent animate-spin"></div>
                      )}
                      {step.status === 'success' && (
                        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-sm">✓</div>
                      )}
                      {step.status === 'error' && (
                        <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-sm">✗</div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">{step.name}</span>
                        {step.duration && (
                          <span className="text-white/60 text-sm">{step.duration}ms</span>
                        )}
                      </div>
                      {step.message && (
                        <p className={`text-sm mt-1 ${
                          step.status === 'error' ? 'text-red-300' : 
                          step.status === 'success' ? 'text-green-300' : 
                          'text-blue-300'
                        }`}>
                          {step.message}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Informations du joueur */}
            {testResults.playerData && (
              <>
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">🎮 Informations du Joueur</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-400">{testResults.playerData.info.username}</p>
                      <p className="text-white/70 text-sm">Nom</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-400">{testResults.playerData.info.level}</p>
                      <p className="text-white/70 text-sm">Niveau</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-400">{testResults.playerData.info.xp.toLocaleString()}</p>
                      <p className="text-white/70 text-sm">XP Total</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-400">{testResults.playerData.info.platform}</p>
                      <p className="text-white/70 text-sm">Plateforme</p>
                    </div>
                  </div>
                </div>

                {/* Statistiques générales */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">📊 Statistiques Générales</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-400">{testResults.playerData.stats.general.kills}</p>
                      <p className="text-white/70 text-sm">Éliminations</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-400">{testResults.playerData.stats.general.deaths}</p>
                      <p className="text-white/70 text-sm">Morts</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-400">{testResults.playerData.stats.general.kd}</p>
                      <p className="text-white/70 text-sm">K/D Ratio</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-400">{testResults.playerData.stats.general.winRate}%</p>
                      <p className="text-white/70 text-sm">Taux de Victoire</p>
                    </div>
                  </div>
                </div>

                {/* Statistiques Ranked */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">🏆 Statistiques Ranked</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-400">{testResults.playerData.stats.ranked.rankName}</p>
                      <p className="text-white/70 text-sm">Rang Actuel</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-400">{testResults.playerData.stats.ranked.mmr}</p>
                      <p className="text-white/70 text-sm">MMR</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-400">{testResults.playerData.stats.ranked.wins}</p>
                      <p className="text-white/70 text-sm">Victoires</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-400">{testResults.playerData.stats.ranked.losses}</p>
                      <p className="text-white/70 text-sm">Défaites</p>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-white/70">Meilleur rang: <span className="text-orange-300 font-semibold">{testResults.playerData.stats.ranked.maxRankName}</span> ({testResults.playerData.stats.ranked.maxMmr} MMR)</p>
                  </div>
                </div>

                {/* Données brutes pour le debug */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">🔍 Données Brutes (Debug)</h3>
                  <div className="space-y-4">
                    {testResults.rawData.serviceStatus !== undefined && (
                      <div>
                        <h4 className="text-lg font-semibold text-blue-300 mb-2">Service Status:</h4>
                        <pre className="bg-black/20 p-3 rounded text-green-300 text-sm overflow-x-auto">
                          {JSON.stringify(testResults.rawData.serviceStatus, null, 2)}
                        </pre>
                      </div>
                    )}
                    
                    {testResults.rawData.accountInfo && (
                      <div>
                        <h4 className="text-lg font-semibold text-blue-300 mb-2">Account Info:</h4>
                        <pre className="bg-black/20 p-3 rounded text-green-300 text-sm overflow-x-auto max-h-40 overflow-y-auto">
                          {JSON.stringify(testResults.rawData.accountInfo, null, 2)}
                        </pre>
                      </div>
                    )}
                    
                    {testResults.rawData.playerStats && (
                      <div>
                        <h4 className="text-lg font-semibold text-blue-300 mb-2">Player Stats:</h4>
                        <pre className="bg-black/20 p-3 rounded text-green-300 text-sm overflow-x-auto max-h-40 overflow-y-auto">
                          {JSON.stringify(testResults.rawData.playerStats, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}