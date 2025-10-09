import { Platform, CompletePlayerData } from '../types/r6-data-types';

// Configuration depuis les variables d'environnement
const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '15000');
const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001');

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

// Fonction pour faire un appel ÃƒÂ  notre proxy API
async function callR6DataProxy(action: string, params: any = {}): Promise<any> {
  try {
    console.log(`?? Proxy API: ${action}`, params);
    
    const response = await fetch(`${API_BASE_URL}/api/r6-data-proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, params }),
      signal: AbortSignal.timeout(API_TIMEOUT)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Erreur inconnue du proxy');
    }

    console.log(`? Proxy API: ${action} rÃƒÂ©ussi`);
    return result.data;

  } catch (error) {
    console.error(`? Proxy API: ${action} ÃƒÂ©chouÃƒÂ©:`, error);
    throw error;
  }
}

// Fonction pour transformer les donnÃƒÂ©es de r6-data.js vers notre format
function transformR6DataToPlayerData(accountInfo: any, playerStats: any, username: string, platform: Platform): CompletePlayerData {
  console.log('?? Transformation des donnÃƒÂ©es r6-data.js');
  console.log('?? Account info reÃƒÂ§u:', JSON.stringify(accountInfo, null, 2));
  console.log('?? Player stats reÃƒÂ§u:', JSON.stringify(playerStats, null, 2));

  // Extraction des donnÃƒÂ©es du profil (accountInfo)
  const profile = accountInfo?.profile || accountInfo || {};
  const level = profile.level || profile.clearanceLevel || profile.ubisoft_level || 0;
  const xp = profile.xp || profile.totalXp || profile.ubisoft_xp || level * 1500;
  
  console.log('?? Profil extrait:', { level, xp, profile });

  // Extraction des statistiques (playerStats)
  const statsData = playerStats?.stats || playerStats || {};
  
  console.log('?? Stats data structure:', {
    hasStats: !!playerStats?.stats,
    hasPlayerStats: !!playerStats,
    statsKeys: Object.keys(statsData),
    statsData: statsData
  });
  
  // Navigation dans la structure des stats (peut varier selon l'API)
  const ranked = statsData?.ranked || statsData?.rank || {};
  const casual = statsData?.casual || statsData?.unranked || {};
  const general = statsData?.general || statsData?.overall || {};
  
  console.log('?? Ranked data:', ranked);
  console.log('?? Casual data:', casual);
  console.log('?? General data:', general);

  // Calcul des stats gÃƒÂ©nÃƒÂ©rales si pas directement disponibles
  const totalKills = general.kills || (ranked.kills || 0) + (casual.kills || 0) || 0;
  const totalDeaths = general.deaths || (ranked.deaths || 0) + (casual.deaths || 0) || 0;
  const totalWins = general.wins || (ranked.wins || 0) + (casual.wins || 0) || 0;
  const totalLosses = general.losses || (ranked.losses || 0) + (casual.losses || 0) || 0;

  console.log('?? Calculated totals:', { totalKills, totalDeaths, totalWins, totalLosses });

  // Gestion du rang et MMR
  const mmr = ranked.mmr || ranked.rating || ranked.skill || 0;
  const rankName = ranked.rank || ranked.rankName || ranked.tier || 'Non classÃƒÂ©';
  const maxMmr = ranked.maxMmr || ranked.max_mmr || ranked.seasonBest || mmr;
  const maxRankName = ranked.maxRank || ranked.max_rank || ranked.seasonBestRank || rankName;
  
  console.log('?? Rank info:', { mmr, rankName, maxMmr, maxRankName });

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
    'playstation': { platformType: 'psn', platform_families: 'console' },
    'xbox': { platformType: 'xbl', platform_families: 'console' },
    'pc': { platformType: 'uplay', platform_families: 'pc' }
  };
  return platformMap[platform] || { platformType: 'uplay', platform_families: 'pc' };
}

export const r6DataAPI = {
  validateUsername: (username: string) => {
    const isValid = username && username.trim().length >= 3 && username.trim().length <= 15;
    return { 
      isValid,
      error: !isValid ? 'Le nom d\'utilisateur doit contenir entre 3 et 15 caractÃƒÂ¨res' : undefined
    };
  },

  testConnection: async (): Promise<boolean> => {
    try {
      const serviceStatus = await callR6DataProxy('getServiceStatus');
      return !!serviceStatus;
    } catch (error) {
      console.warn('?? Test de connexion r6-data.js ÃƒÂ©chouÃƒÂ©:', error);
      return false;
    }
  },

  getAccountInfo: async (username: string, platform: Platform): Promise<CompletePlayerData> => {
    console.log(`?? RÃƒÂ©cupÃƒÂ©ration des donnÃƒÂ©es compte pour ${username} sur ${platform}`);
    
    try {
      const { platformType, platform_families } = convertPlatformForR6Data(platform);
      
      console.log(`?? Appel proxy: getAccountInfo({nameOnPlatform: ${username}, platformType: ${platformType}})`);
      
      const accountInfo = await callR6DataProxy('getAccountInfo', {
        nameOnPlatform: username,
        platformType: platformType
      });

      console.log('?? DonnÃƒÂ©es compte reÃƒÂ§ues:', accountInfo);

      if (!accountInfo || (typeof accountInfo === 'object' && Object.keys(accountInfo).length === 0)) {
        throw new Error('Aucune donnÃƒÂ©e de compte retournÃƒÂ©e par l\'API');
      }

      // Essayons aussi de rÃƒÂ©cupÃƒÂ©rer les stats
      let playerStats = null;
      try {
        console.log(`?? Appel proxy: getPlayerStats({nameOnPlatform: ${username}, platformType: ${platformType}, platform_families: ${platform_families}})`);
        
        playerStats = await callR6DataProxy('getPlayerStats', {
          nameOnPlatform: username,
          platformType: platformType,
          platform_families: platform_families
        });
        
        console.log('?? DonnÃƒÂ©es stats reÃƒÂ§ues:', playerStats);
      } catch (statsError) {
        console.warn('?? Impossible de rÃƒÂ©cupÃƒÂ©rer les statistiques:', statsError);
      }

      return transformR6DataToPlayerData(accountInfo, playerStats, username, platform);
      
    } catch (error) {
      console.error('? Erreur r6-data.js:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('not found') || error.message.includes('404') || error.message.includes('Player not found')) {
          throw new Error(`Joueur "${username}" non trouvÃƒÂ© sur ${platform}`);
        }
        if (error.message.includes('timeout') || error.message.includes('AbortError')) {
          throw new Error('DÃƒÂ©lai d\'attente dÃƒÂ©passÃƒÂ© lors de la rÃƒÂ©cupÃƒÂ©ration des donnÃƒÂ©es');
        }
        if (error.message.includes('rate limit') || error.message.includes('429')) {
          throw new Error('Trop de requÃƒÂªtes, veuillez rÃƒÂ©essayer dans quelques instants');
        }
        throw new Error(`Erreur lors de la rÃƒÂ©cupÃƒÂ©ration des donnÃƒÂ©es: ${error.message}`);
      }

      throw new Error('Erreur inconnue lors de la rÃƒÂ©cupÃƒÂ©ration des donnÃƒÂ©es');
    }
  },

  getPlayerStats: async (username: string, platform: Platform): Promise<CompletePlayerData> => {
    console.log(`?? RÃƒÂ©cupÃƒÂ©ration des stats pour ${username} sur ${platform}`);
    
    try {
      const { platformType, platform_families } = convertPlatformForR6Data(platform);
      
      console.log(`?? Appel proxy: getPlayerStats({nameOnPlatform: ${username}, platformType: ${platformType}, platform_families: ${platform_families}})`);
      
      const playerStats = await callR6DataProxy('getPlayerStats', {
        nameOnPlatform: username,
        platformType: platformType,
        platform_families: platform_families
      });

      console.log('?? DonnÃƒÂ©es stats reÃƒÂ§ues:', playerStats);

      if (!playerStats || (typeof playerStats === 'object' && Object.keys(playerStats).length === 0)) {
        throw new Error('Aucune statistique retournÃƒÂ©e par l\'API');
      }

      // Essayons aussi de rÃƒÂ©cupÃƒÂ©rer les infos du compte
      let accountInfo = null;
      try {
        console.log(`?? Appel proxy: getAccountInfo({nameOnPlatform: ${username}, platformType: ${platformType}})`);
        
        accountInfo = await callR6DataProxy('getAccountInfo', {
          nameOnPlatform: username,
          platformType: platformType
        });
        
        console.log('?? DonnÃƒÂ©es compte reÃƒÂ§ues:', accountInfo);
      } catch (accountError) {
        console.warn('?? Impossible de rÃƒÂ©cupÃƒÂ©rer les informations du compte:', accountError);
      }

      return transformR6DataToPlayerData(accountInfo, playerStats, username, platform);
      
    } catch (error) {
      console.error('? Erreur r6-data.js stats:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('not found') || error.message.includes('404') || error.message.includes('Player not found')) {
          throw new Error(`Statistiques pour "${username}" non trouvÃƒÂ©es sur ${platform}`);
        }
        if (error.message.includes('timeout') || error.message.includes('AbortError')) {
          throw new Error('DÃƒÂ©lai d\'attente dÃƒÂ©passÃƒÂ© lors de la rÃƒÂ©cupÃƒÂ©ration des statistiques');
        }
        if (error.message.includes('rate limit') || error.message.includes('429')) {
          throw new Error('Trop de requÃƒÂªtes, veuillez rÃƒÂ©essayer dans quelques instants');
        }
        throw new Error(`Erreur lors de la rÃƒÂ©cupÃƒÂ©ration des statistiques: ${error.message}`);
      }

      throw new Error('Erreur inconnue lors de la rÃƒÂ©cupÃƒÂ©ration des statistiques');
    }
  }
};

// API pour rÃƒÂ©cupÃƒÂ©rer les opÃƒÂ©rateurs directement (conservÃƒÂ©e pour compatibilitÃƒÂ©)
export const getOperators = async () => {
  try {
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
    console.error('? Erreur lors de la rÃƒÂ©cupÃƒÂ©ration des opÃƒÂ©rateurs:', error);
    throw error;
  }
};

// API pour rÃƒÂ©cupÃƒÂ©rer les cartes directement (conservÃƒÂ©e pour compatibilitÃƒÂ©)
export const getMaps = async () => {
  try {
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
    console.error('? Erreur lors de la rÃƒÂ©cupÃƒÂ©ration des cartes:', error);
    throw error;
  }
};

// API pour rÃƒÂ©cupÃƒÂ©rer les armes directement (conservÃƒÂ©e pour compatibilitÃƒÂ©)
export const getWeapons = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/weapons`, {
      headers: { 'User-Agent': 'R6-Tracker-App/1.0' },
      signal: AbortSignal.timeout(API_TIMEOUT)
    });

    if (!response.ok) {
      throw new Error(`Erreur API weapons: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('? Erreur lors de la rÃƒÂ©cupÃƒÂ©ration des armes:', error);
    throw error;
  }
};