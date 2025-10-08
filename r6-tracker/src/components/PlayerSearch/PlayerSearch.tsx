'use client';

// Composant PlayerSearch avec recherche avancée et navigation entre stats
// Encodage: UTF-8

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { R6MockApi } from '../../services/r6MockApi';
import { 
  SimplePlatform, 
  StatsType, 
  PlayerSearchResult
} from '../../types/r6';
import { usePlayerStore, usePlayerActions, usePlayerUI } from '../../stores/playerStore';
import PlayerCard from '../PlayerCard/PlayerCard';

const platforms: { value: SimplePlatform; label: string; icon: string }[] = [
  { value: 'pc', label: 'PC (Uplay)', icon: 'pi-desktop' },
  { value: 'xbox', label: 'Xbox Live', icon: 'pi-microsoft' },
  { value: 'psn', label: 'PlayStation', icon: 'pi-playstation' },
  { value: 'console', label: 'Console', icon: 'pi-gamepad' },
];

const statsTypes: { value: StatsType; label: string; icon: string }[] = [
  { value: 'general', label: 'Général', icon: 'pi-chart-bar' },
  { value: 'ranked', label: 'Ranked', icon: 'pi-trophy' },
  { value: 'casual', label: 'Casual', icon: 'pi-gamepad' },
];

export default function PlayerSearch() {
  const [username, setUsername] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<SimplePlatform>('pc');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  
  const { 
    currentPlayer, 
    currentStatsType, 
    isLoading, 
    error, 
    hasData, 
    currentStats 
  } = usePlayerUI();
  
  const {
    searchPlayer,
    switchStatsType,
    setLoading,
    setError,
    clearData
  } = usePlayerActions();

  const { setApiConnected, getPlayerFromHistory } = usePlayerStore();

  // Test de connexion API
  const handleTestConnection = useCallback(async () => {
    setIsTestingConnection(true);
    console.log('?? Test de connexion API...');
    
    try {
      const isConnected = await R6MockApi.testConnection();
      setApiConnected(isConnected);
      
      if (isConnected) {
        console.log('Test de connexion réussi');
      } else {
        console.log('Test de connexion échoué');
        setError('Impossible de se connecter à l\'API R6');
      }
    } catch (error) {
      console.error('Erreur lors du test de connexion:', error);
      setError('Erreur lors du test de connexion');
      setApiConnected(false);
    } finally {
      setIsTestingConnection(false);
    }
  }, [setApiConnected, setError]);

  // Recherche d'un joueur
  const handleSearch = useCallback(async () => {
    if (!username.trim()) {
      setError('Veuillez entrer un nom d\'utilisateur');
      return;
    }

    // Validation du nom d'utilisateur
    const validation = R6MockApi.validateUsername(username.trim());
    if (!validation.valid) {
      setError(validation.error || 'Nom d\'utilisateur invalide');
      return;
    }

    setLoading(true);
    clearData();
    
    console.log(`Recherche de ${username} sur ${selectedPlatform}...`);

    try {
      // Vérifier le cache d'abord
      const cachedPlayer = getPlayerFromHistory(username.trim(), selectedPlatform);
      if (cachedPlayer) {
        console.log('Données trouvées dans le cache');
        searchPlayer(cachedPlayer);
        setLoading(false);
        return;
      }

      // Récupération parallèle des trois types de stats
      const [generalStats, rankedStats, casualStats] = await Promise.all([
        R6MockApi.getGeneralStats(selectedPlatform, username.trim()),
        R6MockApi.getRankedStats(selectedPlatform, username.trim()),
        R6MockApi.getCasualStats(selectedPlatform, username.trim())
      ]);

      // Vérifier si au moins un type de stats a été récupéré
      if (!generalStats && !rankedStats && !casualStats) {
        throw new Error('Aucune donnée trouvée pour ce joueur');
      }

      const playerResult: PlayerSearchResult = {
        username: username.trim(),
        platform: selectedPlatform,
        general: generalStats || undefined,
        ranked: rankedStats || undefined,
        casual: casualStats || undefined,
        lastUpdated: new Date()
      };

      searchPlayer(playerResult);
      console.log('Recherche terminée avec succès');

    } catch (error) {
      console.error('? Erreur lors de la recherche:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de la recherche');
    } finally {
      setLoading(false);
    }
  }, [username, selectedPlatform, setLoading, setError, clearData, searchPlayer, getPlayerFromHistory]);

  // Changement de type de stats
  const handleStatsTypeChange = useCallback((type: StatsType) => {
    console.log(`?? Changement vers les stats ${type}`);
    switchStatsType(type);
  }, [switchStatsType]);

  // Gestion de la soumission du formulaire
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  }, [handleSearch]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Formulaire de recherche */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-glass"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-r6 rounded-lg flex items-center justify-center">
            <i className="pi pi-search text-white text-lg"></i>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-r6-light">Recherche de Joueur</h1>
            <p className="text-r6-light/70">Trouvez les statistiques d&apos;un joueur Rainbow Six Siege</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sélecteur de plateforme */}
          <div>
            <label className="block text-sm font-medium text-r6-light/80 mb-3">
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
                      ? 'bg-r6-primary/20 border-r6-primary text-r6-primary'
                      : 'bg-glass-bg/20 border-glass-border/30 text-r6-light/70 hover:border-r6-primary/50'
                  }`}
                >
                  <i className={`pi ${platform.icon} text-lg`}></i>
                  <span className="text-sm font-medium">{platform.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Champ nom d'utilisateur */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-r6-light/80 mb-2">
              Nom d&apos;utilisateur
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Entrez le nom d'utilisateur..."
              className="w-full px-4 py-3 bg-glass-bg/20 border border-glass-border/30 rounded-lg text-r6-light placeholder-r6-light/50 focus:outline-none focus:border-r6-primary focus:ring-2 focus:ring-r6-primary/20 transition-all duration-200"
              disabled={isLoading}
            />
          </div>

          {/* Boutons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading || !username.trim()}
              className="flex-1 btn-r6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Recherche...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <i className="pi pi-search"></i>
                  <span>Rechercher</span>
                </div>
              )}
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleTestConnection}
              disabled={isTestingConnection}
              className="px-6 py-3 bg-glass-bg/20 border border-glass-border/30 rounded-lg text-r6-light hover:border-r6-accent hover:text-r6-accent transition-all duration-200 disabled:opacity-50"
            >
              {isTestingConnection ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-r6-accent/20 border-t-r6-accent rounded-full animate-spin"></div>
                  <span>Test...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <i className="pi pi-wifi"></i>
                  <span>Test API</span>
                </div>
              )}
            </motion.button>
          </div>
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
                <i className="pi pi-exclamation-triangle"></i>
                <span className="text-sm">{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Navigation entre types de stats */}
      <AnimatePresence>
        {currentPlayer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex justify-center"
          >
            <div className="flex bg-glass-bg/20 backdrop-blur-sm border border-glass-border/30 rounded-lg p-1">
              {statsTypes.map((type) => {
                const hasStatsForType = currentPlayer[type.value];
                const isActive = currentStatsType === type.value;
                
                return (
                  <motion.button
                    key={type.value}
                    whileHover={hasStatsForType ? { scale: 1.02 } : {}}
                    whileTap={hasStatsForType ? { scale: 0.98 } : {}}
                    onClick={() => hasStatsForType && handleStatsTypeChange(type.value)}
                    disabled={!hasStatsForType}
                    className={`relative px-6 py-3 rounded-md transition-all duration-200 flex items-center space-x-2 ${
                      isActive
                        ? 'bg-r6-primary text-white shadow-lg'
                        : hasStatsForType
                        ? 'text-r6-light/80 hover:text-r6-light hover:bg-glass-bg/30'
                        : 'text-r6-light/40 cursor-not-allowed'
                    }`}
                  >
                    <i className={`pi ${type.icon} text-sm`}></i>
                    <span className="font-medium">{type.label}</span>
                    {!hasStatsForType && (
                      <span className="text-xs opacity-60">(N/A)</span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Affichage des statistiques */}
      <AnimatePresence mode="wait">
        {hasData && currentStats && (
          <PlayerCard
            key={`${currentPlayer?.username}-${currentStatsType}`}
            stats={currentStats}
            type={currentStatsType}
          />
        )}
      </AnimatePresence>

      {/* Message si aucune donnée */}
      <AnimatePresence>
        {currentPlayer && !hasData && !isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-12 card-glass"
          >
            <div className="w-16 h-16 bg-r6-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="pi pi-info-circle text-r6-primary text-2xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-r6-light mb-2">
              Aucune donnée disponible
            </h3>
            <p className="text-r6-light/70">
              Les statistiques {currentStatsType} ne sont pas disponibles pour ce joueur.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}