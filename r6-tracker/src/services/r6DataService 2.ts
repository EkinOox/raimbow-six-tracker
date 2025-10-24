import r6Info from 'r6-data.js';
import { 
  Platform, 
  PlayerInfo, 
  PlayerStats, 
  GeneralStats, 
  RankedStats, 
  CasualStats,
  CompletePlayerData,
  ValidationResult,
  RankInfo,
  R6DataAccountInfo,
  R6DataPlayerStats
} from '../types/r6-data-types';

export class R6DataService {
  
  // Données des rangs R6 (statiques)
  private readonly RANKS: RankInfo[] = [
    { id: 0, name: 'Non classé', mmr_min: 0, mmr_max: 999 },
    { id: 1, name: 'Cuivre V', mmr_min: 1000, mmr_max: 1099 },
    { id: 2, name: 'Cuivre IV', mmr_min: 1100, mmr_max: 1199 },
    { id: 3, name: 'Cuivre III', mmr_min: 1200, mmr_max: 1299 },
    { id: 4, name: 'Cuivre II', mmr_min: 1300, mmr_max: 1399 },
    { id: 5, name: 'Cuivre I', mmr_min: 1400, mmr_max: 1499 },
    { id: 6, name: 'Bronze V', mmr_min: 1500, mmr_max: 1599 },
    { id: 7, name: 'Bronze IV', mmr_min: 1600, mmr_max: 1699 },
    { id: 8, name: 'Bronze III', mmr_min: 1700, mmr_max: 1799 },
    { id: 9, name: 'Bronze II', mmr_min: 1800, mmr_max: 1899 },
    { id: 10, name: 'Bronze I', mmr_min: 1900, mmr_max: 1999 },
    { id: 11, name: 'Argent V', mmr_min: 2000, mmr_max: 2099 },
    { id: 12, name: 'Argent IV', mmr_min: 2100, mmr_max: 2199 },
    { id: 13, name: 'Argent III', mmr_min: 2200, mmr_max: 2299 },
    { id: 14, name: 'Argent II', mmr_min: 2300, mmr_max: 2399 },
    { id: 15, name: 'Argent I', mmr_min: 2400, mmr_max: 2499 },
    { id: 16, name: 'Or V', mmr_min: 2500, mmr_max: 2599 },
    { id: 17, name: 'Or IV', mmr_min: 2600, mmr_max: 2699 },
    { id: 18, name: 'Or III', mmr_min: 2700, mmr_max: 2799 },
    { id: 19, name: 'Or II', mmr_min: 2800, mmr_max: 2899 },
    { id: 20, name: 'Or I', mmr_min: 2900, mmr_max: 2999 },
    { id: 21, name: 'Platine V', mmr_min: 3000, mmr_max: 3099 },
    { id: 22, name: 'Platine IV', mmr_min: 3100, mmr_max: 3199 },
    { id: 23, name: 'Platine III', mmr_min: 3200, mmr_max: 3299 },
    { id: 24, name: 'Platine II', mmr_min: 3300, mmr_max: 3399 },
    { id: 25, name: 'Platine I', mmr_min: 3400, mmr_max: 3499 },
    { id: 26, name: 'Émeraude V', mmr_min: 3500, mmr_max: 3599 },
    { id: 27, name: 'Émeraude IV', mmr_min: 3600, mmr_max: 3699 },
    { id: 28, name: 'Émeraude III', mmr_min: 3700, mmr_max: 3799 },
    { id: 29, name: 'Émeraude II', mmr_min: 3800, mmr_max: 3899 },
    { id: 30, name: 'Émeraude I', mmr_min: 3900, mmr_max: 3999 },
    { id: 31, name: 'Diamant V', mmr_min: 4000, mmr_max: 4099 },
    { id: 32, name: 'Diamant IV', mmr_min: 4100, mmr_max: 4199 },
    { id: 33, name: 'Diamant III', mmr_min: 4200, mmr_max: 4299 },
    { id: 34, name: 'Diamant II', mmr_min: 4300, mmr_max: 4399 },
    { id: 35, name: 'Diamant I', mmr_min: 4400, mmr_max: 4499 },
    { id: 36, name: 'Champion', mmr_min: 4500, mmr_max: 999999 }
  ];

  /**
   * Teste la connexion à l'API r6-data.js
   */
  async testConnection(): Promise<boolean> {
    try {
      const seasons = await r6Info.getSeasons();
      return Array.isArray(seasons) && seasons.length > 0;
    } catch (error) {
      console.error('Erreur de connexion r6-data.js:', error);
      return false;
    }
  }

  /**
   * Valide un nom d'utilisateur
   */
  validateUsername(username: string): ValidationResult {
    if (!username || username.trim().length === 0) {
      return { isValid: false, error: 'Le nom d\'utilisateur ne peut pas être vide' };
    }
    
    if (username.length < 3) {
      return { isValid: false, error: 'Le nom d\'utilisateur doit contenir au moins 3 caractères' };
    }
    
    if (username.length > 15) {
      return { isValid: false, error: 'Le nom d\'utilisateur ne peut pas dépasser 15 caractères' };
    }
    
    const validUsernameRegex = /^[a-zA-Z0-9._-]+$/;
    if (!validUsernameRegex.test(username)) {
      return { isValid: false, error: 'Le nom d\'utilisateur contient des caractères non autorisés' };
    }
    
    return { isValid: true };
  }

  /**
   * Convertit la plateforme pour r6-data.js
   */
  private convertPlatform(platform: Platform): string {
    const platformMap: Record<Platform, string> = {
      'pc': 'uplay',
      'uplay': 'uplay',
      'steam': 'uplay',
      'playstation': 'psn',
      'xbox': 'xbl'
    };
    return platformMap[platform] || 'uplay';
  }

  /**
   * Convertit platform vers platform_families
   */
  private getPlatformFamily(platform: Platform): string {
    const familyMap: Record<Platform, string> = {
      'pc': 'pc',
      'uplay': 'pc',
      'steam': 'pc',
      'playstation': 'console',
      'xbox': 'console'
    };
    return familyMap[platform] || 'pc';
  }

  /**
   * Convertit un rang ID en nom
   */
  getRankName(rankId: number): string {
    const rank = this.RANKS.find(r => r.id === rankId);
    return rank?.name || 'Non classé';
  }

  /**
   * Convertit le MMR en rang
   */
  getMmrToRank(mmr: number): RankInfo {
    const rank = this.RANKS.find(r => mmr >= r.mmr_min && mmr <= r.mmr_max);
    return rank || this.RANKS[0];
  }

  /**
   * Récupère les informations du compte
   */
  async getAccountInfo(username: string, platform: Platform): Promise<PlayerInfo> {
    const validation = this.validateUsername(username);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    try {
      const convertedPlatform = this.convertPlatform(platform);
      
      const accountInfo: R6DataAccountInfo = await r6Info.getAccountInfo({
        nameOnPlatform: username,
        platformType: convertedPlatform
      });

      if (!accountInfo) {
        throw new Error('Joueur non trouvé');
      }

      return {
        username: accountInfo.profiles?.[0]?.nameOnPlatform || username,
        level: accountInfo.level || 0,
        xp: accountInfo.xp || 0,
        platform: convertedPlatform,
        profilePicture: accountInfo.profilePicture || null,
        userId: accountInfo.profiles?.[0]?.id || null
      };

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      throw new Error(`Impossible de récupérer les informations du compte: ${errorMessage}`);
    }
  }

  /**
   * Récupère les statistiques du joueur
   */
  async getPlayerStats(username: string, platform: Platform): Promise<PlayerStats> {
    const validation = this.validateUsername(username);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    try {
      const convertedPlatform = this.convertPlatform(platform);
      const platformFamily = this.getPlatformFamily(platform);
      
      const playerStats: R6DataPlayerStats = await r6Info.getPlayerStats({
        nameOnPlatform: username,
        platformType: convertedPlatform,
        platform_families: platformFamily
      });

      if (!playerStats?.platform_families_full_profiles?.[0]?.board_ids_full_profiles) {
        throw new Error('Aucune statistique trouvée pour ce joueur');
      }

      const boardsData = playerStats.platform_families_full_profiles[0].board_ids_full_profiles;
      
      // Extraire les données par mode de jeu
      const rankedData = boardsData.find(board => board.board_id === 'ranked')?.full_profiles?.[0];
      const casualData = boardsData.find(board => board.board_id === 'standard')?.full_profiles?.[0];
      
      // Calculs pour les statistiques générales
      const totalKills = (rankedData?.season_statistics?.kills || 0) + (casualData?.season_statistics?.kills || 0);
      const totalDeaths = (rankedData?.season_statistics?.deaths || 0) + (casualData?.season_statistics?.deaths || 0);
      const totalWins = (rankedData?.season_statistics?.match_outcomes?.wins || 0) + (casualData?.season_statistics?.match_outcomes?.wins || 0);
      const totalLosses = (rankedData?.season_statistics?.match_outcomes?.losses || 0) + (casualData?.season_statistics?.match_outcomes?.losses || 0);
      const totalMatches = totalWins + totalLosses;

      // Statistiques générales
      const general: GeneralStats = {
        kills: totalKills,
        deaths: totalDeaths,
        kd: totalDeaths > 0 ? Number((totalKills / totalDeaths).toFixed(2)) : totalKills,
        wins: totalWins,
        losses: totalLosses,
        matches: totalMatches,
        winRate: totalMatches > 0 ? Number(((totalWins / totalMatches) * 100).toFixed(1)) : 0,
        assists: 0, // Non disponible dans r6-data.js
        headshots: 0, // Non disponible dans r6-data.js
        meleeKills: 0, // Non disponible dans r6-data.js
        timePlayed: 0 // Non disponible dans r6-data.js
      };

      // Statistiques ranked
      const rankedKills = rankedData?.season_statistics?.kills || 0;
      const rankedDeaths = rankedData?.season_statistics?.deaths || 0;
      const rankedWins = rankedData?.season_statistics?.match_outcomes?.wins || 0;
      const rankedLosses = rankedData?.season_statistics?.match_outcomes?.losses || 0;
      const rankedMatches = rankedWins + rankedLosses;
      const currentMmr = rankedData?.profile?.rank_points || 0;
      const maxMmr = rankedData?.profile?.max_rank_points || 0;

      const ranked: RankedStats = {
        rank: rankedData?.profile?.rank || 0,
        maxRank: rankedData?.profile?.max_rank || 0,
        mmr: currentMmr,
        maxMmr: maxMmr,
        wins: rankedWins,
        losses: rankedLosses,
        abandons: rankedData?.season_statistics?.match_outcomes?.abandons || 0,
        kills: rankedKills,
        deaths: rankedDeaths,
        kd: rankedDeaths > 0 ? Number((rankedKills / rankedDeaths).toFixed(2)) : rankedKills,
        winRate: rankedMatches > 0 ? Number(((rankedWins / rankedMatches) * 100).toFixed(1)) : 0,
        season: rankedData?.profile?.season_id || 39,
        topRankPosition: rankedData?.profile?.top_rank_position || 0,
        rankName: this.getMmrToRank(currentMmr).name,
        maxRankName: this.getMmrToRank(maxMmr).name
      };

      // Statistiques casual
      const casualKills = casualData?.season_statistics?.kills || 0;
      const casualDeaths = casualData?.season_statistics?.deaths || 0;
      const casualWins = casualData?.season_statistics?.match_outcomes?.wins || 0;
      const casualLosses = casualData?.season_statistics?.match_outcomes?.losses || 0;
      const casualMatches = casualWins + casualLosses;

      const casual: CasualStats = {
        kills: casualKills,
        deaths: casualDeaths,
        wins: casualWins,
        losses: casualLosses,
        matches: casualMatches,
        kd: casualDeaths > 0 ? Number((casualKills / casualDeaths).toFixed(2)) : casualKills,
        winRate: casualMatches > 0 ? Number(((casualWins / casualMatches) * 100).toFixed(1)) : 0
      };

      return { general, ranked, casual };

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      throw new Error(`Impossible de récupérer les statistiques: ${errorMessage}`);
    }
  }

  /**
   * Récupère les données complètes d'un joueur
   */
  async getCompletePlayerData(username: string, platform: Platform): Promise<CompletePlayerData> {
    try {
      const [info, stats] = await Promise.all([
        this.getAccountInfo(username, platform),
        this.getPlayerStats(username, platform)
      ]);

      return {
        info,
        stats,
        platform,
        username,
        lastUpdated: new Date()
      };

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      throw new Error(`Impossible de récupérer les données du joueur: ${errorMessage}`);
    }
  }

  /**
   * Récupère les saisons
   */
  async getSeasons() {
    try {
      return await r6Info.getSeasons();
    } catch (error: unknown) {
      console.error('Erreur getSeasons:', error);
      return [];
    }
  }

  /**
   * Récupère les opérateurs
   */
  async getOperators() {
    try {
      return await r6Info.getOperators();
    } catch (error: unknown) {
      console.error('Erreur getOperators:', error);
      return [];
    }
  }
}

// Instance par défaut
export const r6DataService = new R6DataService();