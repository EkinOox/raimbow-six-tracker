'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Platform, CompletePlayerData } from '../types/r6-data-types';

const platforms: { value: Platform; label: string; icon: string }[] = [
  { value: 'uplay', label: 'PC (Uplay)', icon: '💻' },
  { value: 'steam', label: 'Steam', icon: '🎮' },
  { value: 'playstation', label: 'PlayStation', icon: '🎮' },
  { value: 'xbox', label: 'Xbox', icon: '🎮' },
];

export default function PlayerSearch() {
  const [username, setUsername] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('uplay');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playerData, setPlayerData] = useState<CompletePlayerData | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'ranked' | 'casual'>('general');

  // Validation du nom d'utilisateur
  const validateUsername = (username: string): string | null => {
    if (!username || username.trim().length === 0) {
      return 'Le nom d\'utilisateur ne peut pas être vide';
    }
    if (username.length < 3) {
      return 'Le nom d\'utilisateur doit contenir au moins 3 caractères';
    }
    if (username.length > 15) {
      return 'Le nom d\'utilisateur ne peut pas dépasser 15 caractères';
    }
    const validUsernameRegex = /^[a-zA-Z0-9._-]+$/;
    if (!validUsernameRegex.test(username)) {
      return 'Le nom d\'utilisateur contient des caractères non autorisés';
    }
    return null;
  };

  // Recherche d'un joueur
  const handleSearch = async () => {
    const validation = validateUsername(username.trim());
    if (validation) {
      setError(validation);
      return;
    }

    setIsLoading(true);
    setError(null);
    setPlayerData(null);

    try {
      console.log(`🔝 Recherche de ${username} sur ${selectedPlatform}...`);
      
      // Appel à notre API route Next.js
      const response = await fetch(`/api/r6?username=${encodeURIComponent(username.trim())}&platform=${selectedPlatform}&type=complete`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.details || result.error || 'Erreur lors de la recherche');
      }

      setPlayerData(result.data);
      console.log('✅ Données récupérées:', result.data);

    } catch (error) {
      console.error('❌ Erreur lors de la recherche:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de la recherche');
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion de la soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Formulaire de recherche */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg">🔝</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Recherche de Joueur R6</h1>
            <p className="text-white/70">Trouvez les statistiques d&apos;un joueur Rainbow Six Siege</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sélecteur de plateforme */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-3">
              Plateforme
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {platforms.map((platform) => (
                <motion.button
                  key={platform.value}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedPlatform(platform.value)}
                  className={`p-3 rounded-lg border transition-all duration-200 flex items-center space-x-2 ${
                    selectedPlatform === platform.value
                      ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                      : 'bg-white/5 border-white/20 text-white/70 hover:border-blue-500/50'
                  }`}
                >
                  <span className="text-lg">{platform.icon}</span>
                  <span className="text-sm font-medium">{platform.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Champ nom d'utilisateur */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-white/80 mb-2">
              Nom d&apos;utilisateur
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ex: Pengu, Beaulo..."
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
              disabled={isLoading}
            />
          </div>

          {/* Bouton de recherche */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading || !username.trim()}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                <span>Recherche en cours...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <span>🔝</span>
                <span>Rechercher</span>
              </div>
            )}
          </motion.button>
        </form>

        {/* Affichage des erreurs */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg"
            >
              <div className="flex items-center space-x-2 text-red-400">
                <span>⚠︝</span>
                <span className="text-sm">{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Résultats de recherche */}
      <AnimatePresence>
        {playerData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Informations du joueur */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <div className="flex items-center space-x-4 mb-6">
                {playerData.info.profilePicture && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={playerData.info.profilePicture} 
                    alt={`Avatar de ${playerData.info.username}`}
                    className="w-16 h-16 rounded-lg border border-white/20"
                  />
                )}
                <div>
                  <h2 className="text-2xl font-bold text-white">{playerData.info.username}</h2>
                  <p className="text-white/70">
                    Niveau {playerData.info.level} • {playerData.info.xp.toLocaleString()} XP • {playerData.info.platform}
                  </p>
                  <p className="text-white/50 text-sm">
                    Dernière mise à jour: {new Date(playerData.lastUpdated).toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>

              {/* Navigation des onglets */}
              <div className="flex bg-white/5 rounded-lg p-1 mb-6">
                {[
                  { key: 'general', label: 'Général', icon: '📊' },
                  { key: 'ranked', label: 'Ranked', icon: '🝆' },
                  { key: 'casual', label: 'Casual', icon: '🎮' }
                ].map((tab) => (
                  <motion.button
                    key={tab.key}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(tab.key as 'general' | 'ranked' | 'casual')}
                    className={`flex-1 px-4 py-3 rounded-md transition-all duration-200 flex items-center justify-center space-x-2 ${
                      activeTab === tab.key
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span className="font-medium">{tab.label}</span>
                  </motion.button>
                ))}
              </div>

              {/* Contenu des onglets */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === 'general' && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-white/5 rounded-lg">
                        <div className="text-2xl font-bold text-green-400">{playerData.stats.general.kills}</div>
                        <div className="text-sm text-white/70">Éliminations</div>
                      </div>
                      <div className="text-center p-4 bg-white/5 rounded-lg">
                        <div className="text-2xl font-bold text-red-400">{playerData.stats.general.deaths}</div>
                        <div className="text-sm text-white/70">Morts</div>
                      </div>
                      <div className="text-center p-4 bg-white/5 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-400">{playerData.stats.general.kd}</div>
                        <div className="text-sm text-white/70">K/D Ratio</div>
                      </div>
                      <div className="text-center p-4 bg-white/5 rounded-lg">
                        <div className="text-2xl font-bold text-purple-400">{playerData.stats.general.winRate}%</div>
                        <div className="text-sm text-white/70">Taux Victoire</div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'ranked' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-white/5 rounded-lg">
                          <div className="text-2xl font-bold text-orange-400">{playerData.stats.ranked.mmr}</div>
                          <div className="text-sm text-white/70">MMR</div>
                        </div>
                        <div className="text-center p-4 bg-white/5 rounded-lg">
                          <div className="text-2xl font-bold text-green-400">{playerData.stats.ranked.wins}</div>
                          <div className="text-sm text-white/70">Victoires</div>
                        </div>
                        <div className="text-center p-4 bg-white/5 rounded-lg">
                          <div className="text-2xl font-bold text-red-400">{playerData.stats.ranked.losses}</div>
                          <div className="text-sm text-white/70">Défaites</div>
                        </div>
                        <div className="text-center p-4 bg-white/5 rounded-lg">
                          <div className="text-2xl font-bold text-purple-400">{playerData.stats.ranked.winRate}%</div>
                          <div className="text-sm text-white/70">Taux Victoire</div>
                        </div>
                      </div>
                      <div className="text-center p-4 bg-white/5 rounded-lg">
                        <div className="text-lg font-semibold text-orange-300">
                          {playerData.stats.ranked.rankName}
                        </div>
                        <div className="text-sm text-white/70">Rang actuel</div>
                        {playerData.stats.ranked.maxRankName !== playerData.stats.ranked.rankName && (
                          <div className="text-sm text-orange-400 mt-1">
                            Meilleur: {playerData.stats.ranked.maxRankName} ({playerData.stats.ranked.maxMmr} MMR)
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'casual' && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-white/5 rounded-lg">
                        <div className="text-2xl font-bold text-green-400">{playerData.stats.casual.wins}</div>
                        <div className="text-sm text-white/70">Victoires</div>
                      </div>
                      <div className="text-center p-4 bg-white/5 rounded-lg">
                        <div className="text-2xl font-bold text-red-400">{playerData.stats.casual.losses}</div>
                        <div className="text-sm text-white/70">Défaites</div>
                      </div>
                      <div className="text-center p-4 bg-white/5 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-400">{playerData.stats.casual.kd}</div>
                        <div className="text-sm text-white/70">K/D Ratio</div>
                      </div>
                      <div className="text-center p-4 bg-white/5 rounded-lg">
                        <div className="text-2xl font-bold text-purple-400">{playerData.stats.casual.winRate}%</div>
                        <div className="text-sm text-white/70">Taux Victoire</div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}