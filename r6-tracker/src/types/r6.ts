// Types pour Rainbow Six Siege Tracker
// Encodage: UTF-8

export type SimplePlatform = 'pc' | 'xbox' | 'psn' | 'console';

export interface SimplePlayerStats {
  name: string;
  level: string;
  kd: string;
  kills: string;
  deaths: string;
  wins: string;
  losses: string;
  win_: string;
  headshot_: string;
  time_played: string;
  matches_played: string;
  total_xp: string;
  melee_kills: string;
  blind_kills: string;
  header: string;
  url: string;
}

export interface SimpleRankedStats {
  current_rank: string;
  current_mmr: string;
  max_rank: string;
  max_mmr: string;
  kd: string;
  kills: string;
  deaths: string;
  wins: string;
  losses: string;
  win_: string;
  matches_played: string;
  time_played: string;
  season: string;
}

export interface SimpleCasualStats {
  kd: string;
  kills: string;
  deaths: string;
  wins: string;
  losses: string;
  win_: string;
  matches_played: string;
  time_played: string;
  kills_per_match: string;
  mmr: string;
}

export type StatsType = 'general' | 'ranked' | 'casual';

export interface PlayerSearchResult {
  general?: SimplePlayerStats;
  ranked?: SimpleRankedStats;
  casual?: SimpleCasualStats;
  platform: SimplePlatform;
  username: string;
  lastUpdated: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// Types pour la navigation
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  active?: boolean;
}

// Types pour les rangs R6
export const R6_RANKS = [
  'Unranked',
  'Copper V', 'Copper IV', 'Copper III', 'Copper II', 'Copper I',
  'Bronze V', 'Bronze IV', 'Bronze III', 'Bronze II', 'Bronze I',
  'Silver V', 'Silver IV', 'Silver III', 'Silver II', 'Silver I',
  'Gold V', 'Gold IV', 'Gold III', 'Gold II', 'Gold I',
  'Platinum V', 'Platinum IV', 'Platinum III', 'Platinum II', 'Platinum I',
  'Diamond V', 'Diamond IV', 'Diamond III', 'Diamond II', 'Diamond I',
  'Champion'
] as const;

export type R6Rank = typeof R6_RANKS[number];