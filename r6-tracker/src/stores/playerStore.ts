// Store Zustand pour la gestion d'état R6 Tracker
// Encodage: UTF-8

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  SimplePlatform,
  SimplePlayerStats,
  SimpleRankedStats,
  SimpleCasualStats,
  StatsType,
  PlayerSearchResult
} from '../types/r6';

interface PlayerStore {
  // état actuel
  currentPlayer: PlayerSearchResult | null;
  currentStatsType: StatsType;
  isLoading: boolean;
  error: string | null;
  
  // Cache des joueurs recherchés
  searchHistory: PlayerSearchResult[];
  
  // Configuration
  defaultPlatform: SimplePlatform;
  apiConnected: boolean;
  
  // Actions pour la recherche
  setCurrentPlayer: (player: PlayerSearchResult | null) => void;
  setCurrentStatsType: (type: StatsType) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Actions pour le cache
  addToSearchHistory: (player: PlayerSearchResult) => void;
  clearSearchHistory: () => void;
  getPlayerFromHistory: (username: string, platform: SimplePlatform) => PlayerSearchResult | null;
  
  // Actions pour la configuration
  setDefaultPlatform: (platform: SimplePlatform) => void;
  setApiConnected: (connected: boolean) => void;
  
  // Actions utilitaires
  reset: () => void;
  hasPlayerData: () => boolean;
  getCurrentStats: () => SimplePlayerStats | SimpleRankedStats | SimpleCasualStats | null;
}

const initialState = {
  currentPlayer: null,
  currentStatsType: 'general' as StatsType,
  isLoading: false,
  error: null,
  searchHistory: [],
  defaultPlatform: 'pc' as SimplePlatform,
  apiConnected: false,
};

export const usePlayerStore = create<PlayerStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Actions pour la recherche
      setCurrentPlayer: (player) => {
        console.log('Mise à jour du joueur actuel:', player?.username || 'null');
        set({ currentPlayer: player, error: null });
        
        // Ajouter au cache si nouveau joueur
        if (player) {
          get().addToSearchHistory(player);
        }
      },

      setCurrentStatsType: (type) => {
        console.log('changement de type de stats:', type);
        set({ currentStatsType: type });
      },

      setLoading: (loading) => {
        console.log('état de chargement:', loading);
        set({ isLoading: loading });
        if (loading) {
          set({ error: null });
        }
      },

      setError: (error) => {
        console.log('? Erreur:', error);
        set({ error, isLoading: false });
      },

      // Actions pour le cache
      addToSearchHistory: (player) => {
        const { searchHistory } = get();

        // Vérifier si le joueur existe déjà
        const existingIndex = searchHistory.findIndex(
          p => p.username.toLowerCase() === player.username.toLowerCase() && 
               p.platform === player.platform
        );

        let newHistory;
        if (existingIndex >= 0) {
          // Mettre à jour le joueur existant
          newHistory = [...searchHistory];
          newHistory[existingIndex] = { ...player, lastUpdated: new Date() };
          console.log('Mise à jour du joueur dans l\'historique:', player.username);
        } else {
          // Ajouter un nouveau joueur (limiter à 10 entrées)
          newHistory = [{ ...player, lastUpdated: new Date() }, ...searchHistory.slice(0, 9)];
          console.log('Ajout du joueur à l\'historique:', player.username);
        }

        set({ searchHistory: newHistory });
      },

      clearSearchHistory: () => {
        console.log('??? Suppression de l\'historique de recherche');
        set({ searchHistory: [] });
      },

      getPlayerFromHistory: (username, platform) => {
        const { searchHistory } = get();
        const player = searchHistory.find(
          p => p.username.toLowerCase() === username.toLowerCase() && 
               p.platform === platform
        );
        
        if (player) {
          console.log('Joueur trouvé dans l\'historique:', username);
          // Vérifier si les données ne sont pas trop anciennes (1 heure)
          const isRecent = new Date().getTime() - player.lastUpdated.getTime() < 3600000;
          if (isRecent) {
            return player;
          } else {
            console.log('Données trop anciennes pour:', username);
          }
        }
        
        return null;
      },

      // Actions pour la configuration
      setDefaultPlatform: (platform) => {
        console.log('Plateforme par défaut définie:', platform);
        set({ defaultPlatform: platform });
      },

      setApiConnected: (connected) => {
        console.log('État de connexion API:', connected);
        set({ apiConnected: connected });
      },

      // Actions utilitaires
      reset: () => {
        console.log('Réinitialisation du store');
        set({
          currentPlayer: null,
          currentStatsType: 'general',
          isLoading: false,
          error: null,
        });
      },

      hasPlayerData: () => {
        const { currentPlayer, currentStatsType } = get();
        if (!currentPlayer) return false;
        
        switch (currentStatsType) {
          case 'general':
            return !!currentPlayer.general;
          case 'ranked':
            return !!currentPlayer.ranked;
          case 'casual':
            return !!currentPlayer.casual;
          default:
            return false;
        }
      },

      getCurrentStats: () => {
        const { currentPlayer, currentStatsType } = get();
        if (!currentPlayer) return null;
        
        switch (currentStatsType) {
          case 'general':
            return currentPlayer.general || null;
          case 'ranked':
            return currentPlayer.ranked || null;
          case 'casual':
            return currentPlayer.casual || null;
          default:
            return null;
        }
      },
    }),
    {
      name: 'r6-player-store',
      partialize: (state: PlayerStore) => ({
        searchHistory: state.searchHistory,
        defaultPlatform: state.defaultPlatform,
      }),
    }
  )
);

// Hook personnalisé pour les actions fréquentes
export const usePlayerActions = () => {
  const store = usePlayerStore();
  
  return {
    searchPlayer: store.setCurrentPlayer,
    switchStatsType: store.setCurrentStatsType,
    clearData: store.reset,
    setLoading: store.setLoading,
    setError: store.setError,
  };
};

// Hook pour l'état de l'interface
export const usePlayerUI = () => {
  const currentPlayer = usePlayerStore(state => state.currentPlayer);
  const currentStatsType = usePlayerStore(state => state.currentStatsType);
  const isLoading = usePlayerStore(state => state.isLoading);
  const error = usePlayerStore(state => state.error);
  const hasData = usePlayerStore(state => state.hasPlayerData());
  const currentStats = usePlayerStore(state => state.getCurrentStats());
  
  return {
    currentPlayer,
    currentStatsType,
    isLoading,
    error,
    hasData,
    currentStats,
  };
};