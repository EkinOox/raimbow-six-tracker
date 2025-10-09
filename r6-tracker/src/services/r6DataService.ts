import r6Info from 'r6-data.js';
import { 
  Platform, 
  R6DataPlayerInfo, 
  SimplePlayerStats, 
  CompletePlayerData,
  ValidationResult,
  RankInfo
} from '../types/r6-data-types';

export class R6DataService {
  
  // Données des rangs R6 (depuis les tests)
  private readonly RANKS: RankInfo[] = [
    { id: 0, name: 'Unranked', mmr_min: 0, mmr_max: 999 },
    { id: 1, name: 'Copper 5', mmr_min: 1000, mmr_max: 1099 },
    { id: 2, name: 'Copper 4', mmr_min: 1100, mmr_max: 1199 },
    { id: 3, name: 'Copper 3', mmr_min: 1200, mmr_max: 1299 },
    { id: 4, name: 'Copper 2', mmr_min: 1300, mmr_max: 1399 },
    { id: 5, name: 'Copper 1', mmr_min: 1400, mmr_max: 1499 },
    { id: 6, name: 'Bronze 5', mmr_min: 1500, mmr_max: 1599 },
    { id: 7, name: 'Bronze 4', mmr_min: 1600, mmr_max: 1699 },
    { id: 8, name: 'Bronze 3', mmr_min: 1700, mmr_max: 1799 },
    { id: 9, name: 'Bronze 2', mmr_min: 1800, mmr_max: 1899 },
    { id: 10, name: 'Bronze 1', mmr_min: 1900, mmr_max: 1999 },
    { id: 11, name: 'Silver 5', mmr_min: 2000, mmr_max: 2099 },
    { id: 12, name: 'Silver 4', mmr_min: 2100, mmr_max: 2199 },
    { id: 13, name: 'Silver 3', mmr_min: 2200, mmr_max: 2299 },
    { id: 14, name: 'Silver 2', mmr_min: 2300, mmr_max: 2399 },
    { id: 15, name: 'Silver 1', mmr_min: 2400, mmr_max: 2499 },
    { id: 16, name: 'Gold 5', mmr_min: 2500, mmr_max: 2599 },
    { id: 17, name: 'Gold 4', mmr_min: 2600, mmr_max: 2699 },
    { id: 18, name: 'Gold 3', mmr_min: 2700, mmr_max: 2799 },
    { id: 19, name: 'Gold 2', mmr_min: 2800, mmr_max: 2899 },
    { id: 20, name: 'Gold 1', mmr_min: 2900, mmr_max: 2999 },
    { id: 21, name: 'Platinum 5', mmr_min: 3000, mmr_max: 3099 },
    { id: 22, name: 'Platinum 4', mmr_min: 3100, mmr_max: 3199 },
    { id: 23, name: 'Platinum 3', mmr_min: 3200, mmr_max: 3299 },
    { id: 24, name: 'Platinum 2', mmr_min: 3300, mmr_max: 3399 },
    { id: 25, name: 'Platinum 1', mmr_min: 3400, mmr_max: 3499 },
    { id: 26, name: 'Emerald 5', mmr_min: 3500, mmr_max: 3599 },
    { id: 27, name: 'Emerald 4', mmr_min: 3600, mmr_max: 3699 },
    { id: 28, name: 'Emerald 3', mmr_min: 3700, mmr_max: 3799 },
    { id: 29, name: 'Emerald 2', mmr_min: 3800, mmr_max: 3899 },
    { id: 30, name: 'Emerald 1', mmr_min: 3900, mmr_max: 3999 },
    { id: 31, name: 'Diamond 5', mmr_min: 4000, mmr_max: 4099 },
    { id: 32, name: 'Diamond 4', mmr_min: 4100, mmr_max: 4199 },
    { id: 33, name: 'Diamond 3', mmr_min: 4200, mmr_max: 4299 },
    { id: 34, name: 'Diamond 2', mmr_min: 4300, mmr_max: 4399 },
    { id: 35, name: 'Diamond 1', mmr_min: 4400, mmr_max: 4499 },
    { id: 36, name: 'Champion', mmr_min: 4500, mmr_max: 999999 }
  ];

  /**
   * Valide un nom d'utilisateur
   */
  validateUsername(username: string): ValidationResult {
    if (!username || username.trim().length === 0) {
      return { isValid: false, error: 'Le nom d\'utilisateur ne peut pas être vide' };
    }

    const trimmed = username.trim();
    
    if (trimmed.length < 3) {
      return { isValid: false, error: 'Le nom d\'utilisateur doit contenir au moins 3 caractères' };
    }

    if (trimmed.length > 15) {
      return { isValid: false, error: 'Le nom d\'utilisateur ne peut pas dépasser 15 caractères' };
    }

    const validUsernameRegex = /^[a-zA-Z0-9._-]+$/;
    if (!validUsernameRegex.test(trimmed)) {
      return { isValid: false, error: 'Le nom d\'utilisateur contient des caractères non autorisés' };
    }

    return { isValid: true };
  }

  /**
   * Convertit le nom de plateforme vers le format r6-data.js
   */
  convertPlatform(platform: Platform): string {
    const platformMap: Record<Platform, string> = {
      'pc': 'uplay',
      'uplay': 'uplay',
      'steam': 'steam',
      'xbox': 'xbox',
      'playstation': 'playstation'
    };
    return platformMap[platform] || 'uplay';
  }

  /**
   * Convertit la plateforme vers la famille de plateforme pour les stats
   */
  getPlatformFamily(platform: Platform): string {
    const familyMap: Record<Platform, string> = {
      'pc': 'pc',
      'uplay': 'pc',
      'steam': 'pc',
      'xbox': 'console',
      'playstation': 'console'
    };
    return familyMap[platform] || 'pc';
  }

  /**
   * Récupère le nom du rang basé sur les MMR
   */
  getRankNameFromMMR(mmr: number): string {
    const rank = this.RANKS.find(r => mmr >= r.mmr_min && mmr <= r.mmr_max);
    return rank?.name || 'Unranked';
  }

  /**
   * Récupère les informations de base d'un joueur
   */
  async getPlayerInfo(username: string, platform: Platform): Promise<R6DataPlayerInfo> {
    try {
      const accountInfo = await r6Info.getAccountInfo({
        nameOnPlatform: username,
        platformType: this.convertPlatform(platform)
      });

      if (!accountInfo) {
        throw new Error('Aucune information trouvée pour ce joueur');
      }

      return {
        username: accountInfo.profiles?.[0]?.nameOnPlatform || username,
        level: accountInfo.level,
        xp: accountInfo.xp,
        platform: platform,
        profilePicture: accountInfo.profilePicture || undefined
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des informations:', error);
      throw new Error(`Impossible de récupérer les informations du joueur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Récupère les statistiques d'un joueur
   */
  async getPlayerStats(username: string, platform: Platform): Promise<SimplePlayerStats> {
    try {
      const platformFamily = this.getPlatformFamily(platform);
      
      console.log(`🎮 Récupération des stats pour ${username} sur ${platform} (famille: ${platformFamily})`);
      
      const playerStats = await r6Info.getPlayerStats({
        nameOnPlatform: username,
        platformType: this.convertPlatform(platform),
        platform_families: platformFamily
      });

      if (!playerStats?.platform_families_full_profiles?.[0]?.board_ids_full_profiles) {
        throw new Error('Aucune statistique trouvée pour ce joueur');
      }

      const boardData = playerStats.platform_families_full_profiles[0].board_ids_full_profiles;
      
      console.log(`📊 Plateformes trouvées: ${boardData.map(b => b.board_id).join(', ')}`);
      
      // Recherche des différents types de stats
      const rankedData = boardData.find(board => board.board_id === 'ranked');
      const casualData = boardData.find(board => board.board_id === 'standard');
      const unrankedData = boardData.find(board => board.board_id === 'unranked'); // Pour les consoles
      
      // Prioriser les données disponibles (unranked pour consoles, standard pour PC)
      const generalData = casualData || unrankedData;
      
      // Stats ranked
      const rankedProfile = rankedData?.full_profiles?.[0];
      const rankedStats = rankedProfile?.season_statistics;
      const rankedInfo = rankedProfile?.profile;

      // Stats casual/general
      const casualProfile = casualData?.full_profiles?.[0];
      const casualStatsData = casualProfile?.season_statistics;
      
      // Pour les consoles, utiliser aussi les données unranked si disponibles
      const unrankedProfile = unrankedData?.full_profiles?.[0];
      const unrankedStatsData = unrankedProfile?.season_statistics;
      
      // Combiner les stats casual et unranked pour un total plus précis
      const combinedCasualStats = {
        wins: (casualStatsData?.match_outcomes?.wins || 0) + (unrankedStatsData?.match_outcomes?.wins || 0),
        losses: (casualStatsData?.match_outcomes?.losses || 0) + (unrankedStatsData?.match_outcomes?.losses || 0),
        kills: (casualStatsData?.kills || 0) + (unrankedStatsData?.kills || 0),
        deaths: (casualStatsData?.deaths || 0) + (unrankedStatsData?.deaths || 0)
      };

      // Calculs pour ranked
      const rankedWins = rankedStats?.match_outcomes?.wins || 0;
      const rankedLosses = rankedStats?.match_outcomes?.losses || 0;
      const rankedKills = rankedStats?.kills || 0;
      const rankedDeaths = rankedStats?.deaths || 0;
      const rankedTotal = rankedWins + rankedLosses;
      const rankedWinRate = rankedTotal > 0 ? Math.round((rankedWins / rankedTotal) * 100) : 0;
      const rankedKD = rankedDeaths > 0 ? parseFloat((rankedKills / rankedDeaths).toFixed(2)) : rankedKills;

      // Calculs pour casual/unranked combinés
      const casualWins = combinedCasualStats.wins;
      const casualLosses = combinedCasualStats.losses;
      const casualKills = combinedCasualStats.kills;
      const casualDeaths = combinedCasualStats.deaths;
      const casualTotal = casualWins + casualLosses;
      const casualWinRate = casualTotal > 0 ? Math.round((casualWins / casualTotal) * 100) : 0;
      const casualKD = casualDeaths > 0 ? parseFloat((casualKills / casualDeaths).toFixed(2)) : casualKills;

      // MMR et rangs
      const currentMMR = rankedInfo?.rank_points || 0;
      const maxMMR = rankedInfo?.max_rank_points || 0;
      const currentRankName = this.getRankNameFromMMR(currentMMR);
      const maxRankName = this.getRankNameFromMMR(maxMMR);

      return {
        general: {
          kills: rankedKills + casualKills,
          deaths: rankedDeaths + casualDeaths,
          kd: parseFloat(((rankedKills + casualKills) / Math.max(rankedDeaths + casualDeaths, 1)).toFixed(2)),
          winRate: Math.round(((rankedWins + casualWins) / Math.max(rankedTotal + casualTotal, 1)) * 100)
        },
        ranked: {
          mmr: currentMMR,
          rankName: currentRankName,
          maxMmr: maxMMR,
          maxRankName: maxRankName,
          wins: rankedWins,
          losses: rankedLosses,
          winRate: rankedWinRate,
          kd: rankedKD,
          kills: rankedKills,
          deaths: rankedDeaths
        },
        casual: {
          wins: casualWins,
          losses: casualLosses,
          winRate: casualWinRate,
          kd: casualKD,
          kills: casualKills,
          deaths: casualDeaths
        }
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw new Error(`Impossible de récupérer les statistiques: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Récupère les données complètes d'un joueur (info + stats)
   */
  async getCompletePlayerData(username: string, platform: Platform): Promise<CompletePlayerData> {
    try {
      const [info, stats] = await Promise.all([
        this.getPlayerInfo(username, platform),
        this.getPlayerStats(username, platform)
      ]);

      return {
        info,
        stats,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des données complètes:', error);
      throw error;
    }
  }
}

// Instance unique du service
export const r6DataService = new R6DataService();