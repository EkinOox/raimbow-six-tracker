import { Platform, CompletePlayerData } from '../types/r6-data-types';

// Import dynamique de r6-data.js pour Ã©viter les problÃ¨mes SSR
let r6data: any = null; // eslint-disable-line @typescript-eslint/no-explicit-any

async function initR6Data(): Promise<any> { // eslint-disable-line @typescript-eslint/no-explicit-any
  if (!r6data) {
    try {
      const r6DataModule = await import('r6-data.js');
      r6data = r6DataModule.default || r6DataModule;
      console.log('âœ… r6-data.js initialisÃ© avec succÃ¨s');
    } catch (error) {
      console.error('â�Œ Erreur lors de l\'initialisation de r6-data.js:', error);
      throw new Error('Impossible d\'initialiser la bibliothÃ¨que r6-data.js');
    }
  }
  return r6data;
}

// Configuration depuis les variables d'environnement
const API_TIMEOUT = parseInt(process.env.API_TIMEOUT || '15000');

// Fonction utilitaire pour calculer K/D et Win Rate
function calculateKD(kills: number, deaths: number): number {
  if (deaths === 0) return kills;
  return parseFloat((kills / deaths).toFixed(2));
}

function calculateWinRate(wins: number, losses: number): number {
  const totalMatches = wins + losses;
  if (totalMatches === 0) return 0;
  return Math.round((wins / totalMatches) * 100);
}

// Fonction pour transformer les donnÃ©es de r6-data.js vers notre format
function transformR6DataToPlayerData(accountInfo: any, playerStats: any, username: string, platform: Platform): CompletePlayerData { // eslint-disable-line @typescript-eslint/no-explicit-any
  console.log('ðŸ”„ Transformation des donnÃ©es r6-data.js');
  console.log('Account info:', accountInfo);
  console.log('Player stats:', playerStats);

  // Extraction des donnÃ©es du profil (accountInfo)
  const profile = accountInfo?.profile || accountInfo || {};
  const level = profile.level || profile.clearanceLevel || profile.ubisoft_level || 0;
  const xp = profile.xp || profile.totalXp || profile.ubisoft_xp || level * 1500;

  // Extraction des statistiques (playerStats)
  const statsData = playerStats?.stats || playerStats || {};
  
  // Navigation dans la structure des stats (peut varier selon l'API)
  const ranked = statsData?.ranked || statsData?.rank || {};
  const casual = statsData?.casual || statsData?.unranked || {};
  const general = statsData?.general || statsData?.overall || {};

  // Calcul des stats gÃ©nÃ©rales si pas directement disponibles
  const totalKills = general.kills || (ranked.kills || 0) + (casual.kills || 0) || 0;
  const totalDeaths = general.deaths || (ranked.deaths || 0) + (casual.deaths || 0) || 0;
  const totalWins = general.wins || (ranked.wins || 0) + (casual.wins || 0) || 0;
  const totalLosses = general.losses || (ranked.losses || 0) + (casual.losses || 0) || 0;

  // Gestion du rang et MMR
  const mmr = ranked.mmr || ranked.rating || ranked.skill || 0;
  const rankName = ranked.rank || ranked.rankName || ranked.tier || 'Non classÃ©';
  const maxMmr = ranked.maxMmr || ranked.max_mmr || ranked.seasonBest || mmr;
  const maxRankName = ranked.maxRank || ranked.max_rank || ranked.seasonBestRank || rankName;

  return {
    info: {
      username: profile.username || profile.nickname || profile.displayName || username,
      level: level,
      xp: xp,
      platform: platform,
      profilePicture: profile.profilePicture || profile.avatar || profile.avatarUrl
    },
    stats: {
      general: {
        kills: totalKills,
        deaths: totalDeaths,
        kd: calculateKD(totalKills, totalDeaths),
        winRate: calculateWinRate(totalWins, totalLosses)
      },
      ranked: {
        mmr: mmr,
        rankName: rankName,
        maxMmr: maxMmr,
        maxRankName: maxRankName,
        wins: ranked.wins || 0,
        losses: ranked.losses || 0,
        winRate: calculateWinRate(ranked.wins || 0, ranked.losses || 0),
        kd: calculateKD(ranked.kills || 0, ranked.deaths || 0),
        kills: ranked.kills || 0,
        deaths: ranked.deaths || 0
      },
      casual: {
        wins: casual.wins || 0,
        losses: casual.losses || 0,
        winRate: calculateWinRate(casual.wins || 0, casual.losses || 0),
        kd: calculateKD(casual.kills || 0, casual.deaths || 0),
        kills: casual.kills || 0,
        deaths: casual.deaths || 0
      }
    },
    lastUpdated: new Date().toISOString()
  };
}

// Conversion des plateformes pour r6-data.js
function convertPlatformForR6Data(platform: Platform): { platformType: string; platform_families: string } {
  const platformMap: Record<Platform, { platformType: string; platform_families: string }> = {
    'uplay': { platformType: 'uplay', platform_families: 'pc' },
    'steam': { platformType: 'uplay', platform_families: 'pc' }, // Steam utilise aussi uplay
    'playstation': { platformType: 'psn', platform_families: 'console' },
    'xbox': { platformType: 'xbl', platform_families: 'console' },
    'pc': { platformType: 'uplay', platform_families: 'pc' }
  };
  return platformMap[platform] || { platformType: 'uplay', platform_families: 'pc' };
}

// Configuration depuis les variables d'environnement
const API_TIMEOUT = parseInt(process.env.API_TIMEOUT || '15000');

// Fonction utilitaire pour calculer K/D et Win Rate
function calculateKD(kills: number, deaths: number): number {
  if (deaths === 0) return kills;
  return parseFloat((kills / deaths).toFixed(2));
}

function calculateWinRate(wins: number, losses: number): number {
  const totalMatches = wins + losses;
  if (totalMatches === 0) return 0;
  return Math.round((wins / totalMatches) * 100);
}

// Fonction pour transformer les donnÃ©es de r6-data.js vers notre format
function transformR6DataToPlayerData(r6DataResult: any, username: string, platform: Platform): CompletePlayerData { // eslint-disable-line @typescript-eslint/no-explicit-any
  console.log('ï¿½ Transformation des donnÃ©es r6-data.js:', r6DataResult);

  // r6-data.js peut retourner des structures diffÃ©rentes, adaptons-nous
  const profile = r6DataResult?.profile || r6DataResult;
  const stats = r6DataResult?.stats || profile?.stats || {};
  const info = r6DataResult?.info || profile?.info || profile || {};
  
  // Extraction des statistiques gÃ©nÃ©rales
  const general = stats?.general || stats?.overall || {};
  const ranked = stats?.ranked || stats?.rank || {};
  const casual = stats?.casual || stats?.unranked || {};

  // Gestion des diffÃ©rentes structures possibles de r6-data.js
  const level = info.level || info.clearanceLevel || info.ubisoft_level || 0;
  const xp = info.xp || info.totalXp || info.ubisoft_xp || level * 1500;
  
  // Calcul des statistiques dÃ©rivÃ©es
  const totalKills = general.kills || (ranked.kills || 0) + (casual.kills || 0) || 0;
  const totalDeaths = general.deaths || (ranked.deaths || 0) + (casual.deaths || 0) || 0;
  const totalWins = general.wins || (ranked.wins || 0) + (casual.wins || 0) || 0;
  const totalLosses = general.losses || (ranked.losses || 0) + (casual.losses || 0) || 0;

  // Gestion du rang et MMR
  const mmr = ranked.mmr || ranked.rating || ranked.skill || 0;
  const rankName = ranked.rank || ranked.rankName || ranked.tier || 'Non classÃ©';
  const maxMmr = ranked.maxMmr || ranked.max_mmr || ranked.seasonBest || mmr;
  const maxRankName = ranked.maxRank || ranked.max_rank || ranked.seasonBestRank || rankName;

  return {
    info: {
      username: info.username || info.nickname || info.displayName || username,
      level: level,
      xp: xp,
      platform: platform,
      profilePicture: info.profilePicture || info.avatar || info.avatarUrl
    },
    stats: {
      general: {
        kills: totalKills,
        deaths: totalDeaths,
        kd: calculateKD(totalKills, totalDeaths),
        winRate: calculateWinRate(totalWins, totalLosses)
      },
      ranked: {
        mmr: mmr,
        rankName: rankName,
        maxMmr: maxMmr,
        maxRankName: maxRankName,
        wins: ranked.wins || 0,
        losses: ranked.losses || 0,
        winRate: calculateWinRate(ranked.wins || 0, ranked.losses || 0),
        kd: calculateKD(ranked.kills || 0, ranked.deaths || 0),
        kills: ranked.kills || 0,
        deaths: ranked.deaths || 0
      },
      casual: {
        wins: casual.wins || 0,
        losses: casual.losses || 0,
        winRate: calculateWinRate(casual.wins || 0, casual.losses || 0),
        kd: calculateKD(casual.kills || 0, casual.deaths || 0),
        kills: casual.kills || 0,
        deaths: casual.deaths || 0
      }
    },
    lastUpdated: new Date().toISOString()
  };
}

// Conversion des plateformes pour r6-data.js
function convertPlatformForR6Data(platform: Platform): string {
  const platformMap: Record<Platform, string> = {
    'uplay': 'uplay',
    'steam': 'steam', 
    'playstation': 'psn',
    'xbox': 'xbl',
    'pc': 'uplay'
  };
  return platformMap[platform] || 'uplay';
}

export const r6DataAPI = {
  validateUsername: (username: string) => {
    const isValid = username && username.trim().length >= 3 && username.trim().length <= 15;
    return { 
      isValid,
      error: !isValid ? 'Le nom d\'utilisateur doit contenir entre 3 et 15 caractÃ¨res' : undefined
    };
  },

  testConnection: async (): Promise<boolean> => {
    try {
      const r6DataLib = await initR6Data();
      
      // Test simple avec un joueur connu
      const testResult = await Promise.race([
        r6DataLib.getPlayer('TestUser', 'uplay'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
      ]);
      
      return !!testResult;
    } catch (error) {
      console.warn('âš ï¸� Test de connexion r6-data.js Ã©chouÃ©:', error);
      return false;
    }
  },

  getAccountInfo: async (username: string, platform: Platform): Promise<CompletePlayerData> => {
    console.log(`ðŸ”� RÃ©cupÃ©ration des donnÃ©es via r6-data.js pour ${username} sur ${platform}`);
    
    try {
      const r6DataLib = await initR6Data();
      const r6Platform = convertPlatformForR6Data(platform);
      
      console.log(`ðŸ“¡ Appel r6-data.js: getPlayer(${username}, ${r6Platform})`);
      
      // Appel Ã  r6-data.js avec timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), API_TIMEOUT)
      );
      
      const dataPromise = r6DataLib.getPlayer(username, r6Platform);
      const r6DataResult = await Promise.race([dataPromise, timeoutPromise]);

      console.log('âœ… DonnÃ©es reÃ§ues de r6-data.js:', r6DataResult);

      if (!r6DataResult || (typeof r6DataResult === 'object' && Object.keys(r6DataResult).length === 0)) {
        throw new Error('Aucune donnÃ©e retournÃ©e par l\'API');
      }

      return transformR6DataToPlayerData(r6DataResult, username, platform);
      
    } catch (error) {
      console.error('â�Œ Erreur r6-data.js:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('not found') || error.message.includes('404') || error.message.includes('Player not found')) {
          throw new Error(`Joueur "${username}" non trouvÃ© sur ${platform}`);
        }
        if (error.message.includes('Timeout')) {
          throw new Error('DÃ©lai d\'attente dÃ©passÃ© lors de la rÃ©cupÃ©ration des donnÃ©es');
        }
        if (error.message.includes('rate limit') || error.message.includes('429')) {
          throw new Error('Trop de requÃªtes, veuillez rÃ©essayer dans quelques instants');
        }
        throw new Error(`Erreur lors de la rÃ©cupÃ©ration des donnÃ©es: ${error.message}`);
      }
      
      throw new Error('Erreur inconnue lors de la rÃ©cupÃ©ration des donnÃ©es');
    }
  },

  getPlayerStats: async (username: string, platform: Platform): Promise<CompletePlayerData> => {
    console.log(`ðŸ”� RÃ©cupÃ©ration des stats via r6-data.js pour ${username} sur ${platform}`);
    
    try {
      const r6DataLib = await initR6Data();
      const r6Platform = convertPlatformForR6Data(platform);
      
      console.log(`ðŸ“¡ Appel r6-data.js: getPlayerStats(${username}, ${r6Platform})`);
      
      // Essayons d'abord getPlayerStats si disponible, sinon getPlayer
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), API_TIMEOUT)
      );
      
      let dataPromise;
      if (typeof r6DataLib.getPlayerStats === 'function') {
        dataPromise = r6DataLib.getPlayerStats(username, r6Platform);
      } else {
        // Fallback vers getPlayer si getPlayerStats n'existe pas
        dataPromise = r6DataLib.getPlayer(username, r6Platform);
      }
      
      const r6DataResult = await Promise.race([dataPromise, timeoutPromise]);

      console.log('âœ… Stats reÃ§ues de r6-data.js:', r6DataResult);

      if (!r6DataResult || (typeof r6DataResult === 'object' && Object.keys(r6DataResult).length === 0)) {
        throw new Error('Aucune statistique retournÃ©e par l\'API');
      }

      return transformR6DataToPlayerData(r6DataResult, username, platform);
      
    } catch (error) {
      console.error('â�Œ Erreur r6-data.js stats:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('not found') || error.message.includes('404') || error.message.includes('Player not found')) {
          throw new Error(`Statistiques pour "${username}" non trouvÃ©es sur ${platform}`);
        }
        if (error.message.includes('Timeout')) {
          throw new Error('DÃ©lai d\'attente dÃ©passÃ© lors de la rÃ©cupÃ©ration des statistiques');
        }
        if (error.message.includes('rate limit') || error.message.includes('429')) {
          throw new Error('Trop de requÃªtes, veuillez rÃ©essayer dans quelques instants');
        }
        throw new Error(`Erreur lors de la rÃ©cupÃ©ration des statistiques: ${error.message}`);
      }
      
      throw new Error('Erreur inconnue lors de la rÃ©cupÃ©ration des statistiques');
    }
  }
};

// API pour rÃ©cupÃ©rer les opÃ©rateurs directement (conservÃ©e pour compatibilitÃ©)
export const getOperators = async () => {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
    const response = await fetch(`${API_BASE_URL}/api/operators`, {
      headers: { 'User-Agent': 'R6-Tracker-App/1.0' },
      signal: AbortSignal.timeout(API_TIMEOUT)
    });

    if (!response.ok) {
      throw new Error(`Erreur API operators: ${response.status}`);
    }

    const data = await response.json();
    return data.operators || data;
  } catch (error) {
    console.error('â�Œ Erreur lors de la rÃ©cupÃ©ration des opÃ©rateurs:', error);
    throw error;
  }
};

// API pour rÃ©cupÃ©rer les cartes directement (conservÃ©e pour compatibilitÃ©)
export const getMaps = async () => {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
    const response = await fetch(`${API_BASE_URL}/api/maps`, {
      headers: { 'User-Agent': 'R6-Tracker-App/1.0' },
      signal: AbortSignal.timeout(API_TIMEOUT)
    });

    if (!response.ok) {
      throw new Error(`Erreur API maps: ${response.status}`);
    }

    const data = await response.json();
    return data.maps || data;
  } catch (error) {
    console.error('â�Œ Erreur lors de la rÃ©cupÃ©ration des cartes:', error);
    throw error;
  }
};

// API pour rÃ©cupÃ©rer les armes directement (conservÃ©e pour compatibilitÃ©)
export const getWeapons = async () => {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
    const response = await fetch(`${API_BASE_URL}/api/weapons`, {
      headers: { 'User-Agent': 'R6-Tracker-App/1.0' },
      signal: AbortSignal.timeout(API_TIMEOUT)
    });

    if (!response.ok) {
      throw new Error(`Erreur API weapons: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('â�Œ Erreur lors de la rÃ©cupÃ©ration des armes:', error);
    throw error;
  }
};
