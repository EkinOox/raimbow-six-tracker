// Types pour Rainbow Six Siege avec r6-data.js
export type Platform = 'pc' | 'uplay' | 'playstation' | 'xbox';

// Types pour les données brutes de r6-data.js
export interface R6DataAccountInfo {
  level: number;
  xp: number;
  profiles: Array<{
    platformType: string;
    nameOnPlatform: string;
    id?: string;
  }>;
  profilePicture?: string;
}

export interface R6DataPlayerStats {
  platform_families_full_profiles: Array<{
    platform_family: string;
    board_ids_full_profiles: Array<{
      board_id: string;
      full_profiles: Array<{
        profile: {
          board_id: string;
          id: string;
          max_rank: number;
          max_rank_points: number;
          platform_family: string;
          rank: number;
          rank_points: number;
          season_id: number;
          top_rank_position: number;
        };
        season_statistics: {
          deaths: number;
          kills: number;
          match_outcomes: {
            abandons: number;
            losses: number;
            wins: number;
          };
        };
      }>;
    }>;
  }>;
}

// Types pour notre application
/**
 * Informations de base d'un joueur R6Data
 */
export interface R6DataPlayerInfo {
  username: string;
  level: number;
  xp: number;
  platform: Platform;
  profilePicture?: string;
}

export interface GeneralStats {
  kills: number;
  deaths: number;
  kd: number;
  wins: number;
  losses: number;
  matches: number;
  winRate: number;
  assists: number;
  headshots: number;
  meleeKills: number;
  timePlayed: number;
}

export interface RankedStats {
  rank: number;
  maxRank: number;
  mmr: number;
  maxMmr: number;
  wins: number;
  losses: number;
  abandons: number;
  kills: number;
  deaths: number;
  kd: number;
  winRate: number;
  season: number;
  topRankPosition: number;
  rankName: string;
  maxRankName: string;
}

export interface CasualStats {
  kills: number;
  deaths: number;
  wins: number;
  losses: number;
  kd: number;
  winRate: number;
  matches: number;
}

export interface PlayerStats {
  general: GeneralStats;
  ranked: RankedStats;
  casual: CasualStats;
}

/**
 * Stats simplifiées pour notre application
 */
export interface SimplePlayerStats {
  general: {
    kills: number;
    deaths: number;
    kd: number;
    winRate: number;
  };
  ranked: {
    mmr: number;
    rankName: string;
    maxMmr: number;
    maxRankName: string;
    wins: number;
    losses: number;
    winRate: number;
    kd: number;
    kills: number;
    deaths: number;
  };
  casual: {
    wins: number;
    losses: number;
    winRate: number;
    kd: number;
    kills: number;
    deaths: number;
  };
}

/**
 * Données complètes d'un joueur (combinaison info + stats)
 */
export interface CompletePlayerData {
  info: R6DataPlayerInfo;
  stats: SimplePlayerStats;
  lastUpdated: string;
}

// Types pour les rangs
export interface RankInfo {
  id: number;
  name: string;
  mmr_min: number;
  mmr_max: number;
}

// Types pour l'API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Types pour l'interface utilisateur
export type StatsType = 'general' | 'ranked' | 'casual';

export interface SearchFormData {
  username: string;
  platform: Platform;
}

// Types pour les saisons et opérateurs
export interface SeasonInfo {
  id: number;
  name: string;
  startDate?: string;
  endDate?: string;
}

export interface OperatorInfo {
  id: string;
  name: string;
  side: string;
  ctu?: string;
  ability?: string;
}