'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import SectionHeader from '../../components/ui/SectionHeader';
import { r6DataService } from '../../services/r6DataService';
import { Platform, CompletePlayerData } from '../../types/r6-data-types';

interface TestResults {
  connection: { success: boolean; message: string };
  playerData: CompletePlayerData | null;
}

export default function ApiTestPage() {
  const [username, setUsername] = useState('Pengu');
  const [platform, setPlatform] = useState<Platform>('uplay');
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<TestResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const testR6DataApi = async () => {
    if (!username) {
      setError('Veuillez entrer un nom d\'utilisateur');
      return;
    }

    setLoading(true);
    setError(null);
    setTestResults(null);

    try {
      console.log(`Test avec ${username} sur ${platform}...`);

      // Test simple des informations du joueur
      const playerData = await r6DataService.getCompletePlayerData(username, platform);
      console.log('Données du joueur récupérées:', playerData);

      setTestResults({
        connection: { 
          success: true, 
          message: 'Connexion réussie à r6-data.js avec support console' 
        },
        playerData
      });

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
          title="Test API r6-data.js"
          description="Interface de test pour le nouveau service API Rainbow Six Siege"
        />

        {/* Formulaire de test */}
        <motion.div 
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6">Test du Service r6-data.js avec Support Console</h2>
          
          <div className="mb-4 p-4 bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-200">
            <strong>✨ Nouveau :</strong> Support complet pour Xbox et PlayStation ! Teste maintenant avec des joueurs console.
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
                placeholder="Ex: Pengu"
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
                {loading ? 'Test en cours...' : 'Tester l\'API'}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 mb-6">
              <strong>Erreur:</strong> {error}
            </div>
          )}
        </motion.div>

        {/* Résultats */}
        {testResults && (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {/* Test de connexion */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Test de Connexion</h3>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                testResults.connection.success 
                  ? 'bg-green-500/20 text-green-200 border border-green-500/30' 
                  : 'bg-red-500/20 text-red-200 border border-red-500/30'
              }`}>
                {testResults.connection.success ? '✅ Succès' : '❌ Échec'}
              </div>
              <p className="text-white/70 mt-2">{testResults.connection.message}</p>
            </div>

            {/* Informations du joueur */}
            {testResults.playerData && (
              <>
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Informations du Joueur</h3>
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
                  <h3 className="text-xl font-bold text-white mb-4">Statistiques Générales</h3>
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
                  <h3 className="text-xl font-bold text-white mb-4">Statistiques Ranked</h3>
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

                {/* Statistiques Casual */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Statistiques Casual</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-400">{testResults.playerData.stats.casual.wins}</p>
                      <p className="text-white/70 text-sm">Victoires</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-400">{testResults.playerData.stats.casual.losses}</p>
                      <p className="text-white/70 text-sm">Défaites</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-400">{testResults.playerData.stats.casual.kd}</p>
                      <p className="text-white/70 text-sm">K/D Ratio</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-400">{testResults.playerData.stats.casual.winRate}%</p>
                      <p className="text-white/70 text-sm">Taux de Victoire</p>
                    </div>
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