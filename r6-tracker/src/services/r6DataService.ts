import { Platform, CompletePlayerData } from '../types/r6-data-types';import { Platform, CompletePlayerData } from '../types/r6-data-types';



// Configuration depuis les variables d'environnement// Configuration depuis les variables d'environnement

const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '15000');const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '15000');

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001');const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001');



// Fonction utilitaire pour calculer K/D et Win Rate// Fonction utilitaire pour calculer K/D et Win Rate

function calculateKD(kills: number, deaths: number): number {function calculateKD(kills: number, deaths: number): number {

  if (deaths === 0) return kills;  if (deaths === 0) return kills;

  return parseFloat((kills / deaths).toFixed(2));  return parseFloat((kills / deaths).toFixed(2));

}}



function calculateWinRate(wins: number, losses: number): number {function calculateWinRate(wins: number, losses: number): number {

  const totalMatches = wins + losses;  const totalMatches = wins + losses;

  if (totalMatches === 0) return 0;  if (totalMatches === 0) return 0;

  return Math.round((wins / totalMatches) * 100);  return Math.round((wins / totalMatches) * 100);

}}



// Fonction pour faire un appel à notre proxy API// Fonction pour faire un appel à notre proxy API

async function callR6DataProxy(action: string, params: Record<string, unknown> = {}): Promise<unknown> {async function callR6DataProxy(action: string, params: any = {}): Promise<any> {

  try {  try {

    console.log(`🔄 Proxy API: ${action}`, params);    console.log(`?? Proxy API: ${action}`, params);

        

    const response = await fetch(`${API_BASE_URL}/api/r6-data-proxy`, {    const response = await fetch(`${API_BASE_URL}/api/r6-data-proxy`, {

      method: 'POST',      method: 'POST',

      headers: {      headers: {

        'Content-Type': 'application/json',        'Content-Type': 'application/json',

      },      },

      body: JSON.stringify({ action, params }),      body: JSON.stringify({ action, params }),

      signal: AbortSignal.timeout(API_TIMEOUT)      signal: AbortSignal.timeout(API_TIMEOUT)

    });    });



    if (!response.ok) {    if (!response.ok) {

      throw new Error(`HTTP ${response.status}: ${response.statusText}`);      throw new Error(`HTTP ${response.status}: ${response.statusText}`);

    }    }



    const result = await response.json();    const result = await response.json();

        

    if (!result.success) {    if (!result.success) {

      throw new Error(result.error || 'Erreur inconnue du proxy');      throw new Error(result.error || 'Erreur inconnue du proxy');

    }    }



    console.log(`✅ Proxy API: ${action} réussi`);    console.log(`? Proxy API: ${action} réussi`);

    return result.data;    return result.data;



  } catch (error) {  } catch (error) {

    console.error(`❌ Proxy API: ${action} échoué:`, error);    console.error(`? Proxy API: ${action} échoué:`, error);

    throw error;    throw error;

  }  }

}}



// Fonction pour transformer les données de r6-data.js vers notre format// Fonction pour transformer les données de r6-data.js vers notre format

function transformR6DataToPlayerData(accountInfo: Record<string, unknown>, playerStats: Record<string, unknown>, username: string, platform: Platform): CompletePlayerData {function transformR6DataToPlayerData(accountInfo: any, playerStats: any, username: string, platform: Platform): CompletePlayerData {

  console.log('🔄 Transformation des données r6-data.js');  console.log('?? Transformation des données r6-data.js');

  console.log('📥 Account info reçu:', JSON.stringify(accountInfo, null, 2));  console.log('?? Account info reçu:', JSON.stringify(accountInfo, null, 2));

  console.log('📥 Player stats reçu:', JSON.stringify(playerStats, null, 2));  console.log('?? Player stats reçu:', JSON.stringify(playerStats, null, 2));



  // Extraction des données du profil (accountInfo)  // Extraction des données du profil (accountInfo)

  const profile = (accountInfo?.profile as Record<string, unknown>) || accountInfo || {};  const profile = accountInfo?.profile || accountInfo || {};

  const level = (profile.level as number) || (profile.clearanceLevel as number) || (profile.ubisoft_level as number) || 0;  const level = profile.level || profile.clearanceLevel || profile.ubisoft_level || 0;

  const xp = (profile.xp as number) || (profile.totalXp as number) || (profile.ubisoft_xp as number) || level * 1500;  const xp = profile.xp || profile.totalXp || profile.ubisoft_xp || level * 1500;

    

  console.log('👤 Profil extrait:', { level, xp, profile });  console.log('?? Profil extrait:', { level, xp, profile });



  // Extraction des statistiques (playerStats)  // Extraction des statistiques (playerStats)

  const statsData = (playerStats?.stats as Record<string, unknown>) || playerStats || {};  const statsData = playerStats?.stats || playerStats || {};

    

  console.log('📊 Stats data structure:', {  console.log('?? Stats data structure:', {

    hasStats: !!playerStats?.stats,    hasStats: !!playerStats?.stats,

    hasPlayerStats: !!playerStats,    hasPlayerStats: !!playerStats,

    statsKeys: Object.keys(statsData),    statsKeys: Object.keys(statsData),

    statsData: statsData    statsData: statsData

  });  });

    

  // Navigation dans la structure des stats (peut varier selon l'API)  // Navigation dans la structure des stats (peut varier selon l'API)

  const ranked = (statsData?.ranked as Record<string, unknown>) || (statsData?.rank as Record<string, unknown>) || {};  const ranked = statsData?.ranked || statsData?.rank || {};

  const casual = (statsData?.casual as Record<string, unknown>) || (statsData?.unranked as Record<string, unknown>) || {};  const casual = statsData?.casual || statsData?.unranked || {};

  const general = (statsData?.general as Record<string, unknown>) || (statsData?.overall as Record<string, unknown>) || {};  const general = statsData?.general || statsData?.overall || {};

    

  console.log('🏆 Ranked data:', ranked);  console.log('?? Ranked data:', ranked);

  console.log('🎮 Casual data:', casual);  console.log('?? Casual data:', casual);

  console.log('📈 General data:', general);  console.log('?? General data:', general);



  // Calcul des stats générales si pas directement disponibles  // Calcul des stats générales si pas directement disponibles

  const totalKills = (general.kills as number) || ((ranked.kills as number) || 0) + ((casual.kills as number) || 0) || 0;  const totalKills = general.kills || (ranked.kills || 0) + (casual.kills || 0) || 0;

  const totalDeaths = (general.deaths as number) || ((ranked.deaths as number) || 0) + ((casual.deaths as number) || 0) || 0;  const totalDeaths = general.deaths || (ranked.deaths || 0) + (casual.deaths || 0) || 0;

  const totalWins = (general.wins as number) || ((ranked.wins as number) || 0) + ((casual.wins as number) || 0) || 0;  const totalWins = general.wins || (ranked.wins || 0) + (casual.wins || 0) || 0;

  const totalLosses = (general.losses as number) || ((ranked.losses as number) || 0) + ((casual.losses as number) || 0) || 0;  const totalLosses = general.losses || (ranked.losses || 0) + (casual.losses || 0) || 0;



  console.log('🧮 Calculated totals:', { totalKills, totalDeaths, totalWins, totalLosses });  console.log('?? Calculated totals:', { totalKills, totalDeaths, totalWins, totalLosses });



  // Gestion du rang et MMR  // Gestion du rang et MMR

  const mmr = (ranked.mmr as number) || (ranked.rating as number) || (ranked.skill as number) || 0;  const mmr = ranked.mmr || ranked.rating || ranked.skill || 0;

  const rankName = (ranked.rank as string) || (ranked.rankName as string) || (ranked.tier as string) || 'Non classé';  const rankName = ranked.rank || ranked.rankName || ranked.tier || 'Non classé';

  const maxMmr = (ranked.maxMmr as number) || (ranked.max_mmr as number) || (ranked.seasonBest as number) || mmr;  const maxMmr = ranked.maxMmr || ranked.max_mmr || ranked.seasonBest || mmr;

  const maxRankName = (ranked.maxRank as string) || (ranked.max_rank as string) || (ranked.seasonBestRank as string) || rankName;  const maxRankName = ranked.maxRank || ranked.max_rank || ranked.seasonBestRank || rankName;

    

  console.log('🏅 Rank info:', { mmr, rankName, maxMmr, maxRankName });  console.log('?? Rank info:', { mmr, rankName, maxMmr, maxRankName });



  return {  return {

    info: {    info: {

      username: (profile.username as string) || (profile.nickname as string) || (profile.displayName as string) || username,      username: profile.username || profile.nickname || profile.displayName || username,

      level: level,      level: level,

      xp: xp,      xp: xp,

      platform: platform,      platform: platform,

      profilePicture: (profile.profilePicture as string) || (profile.avatar as string) || (profile.avatarUrl as string)      profilePicture: profile.profilePicture || profile.avatar || profile.avatarUrl

    },    },

    stats: {    stats: {

      general: {      general: {

        kills: totalKills,        kills: totalKills,

        deaths: totalDeaths,        deaths: totalDeaths,

        kd: calculateKD(totalKills, totalDeaths),        kd: calculateKD(totalKills, totalDeaths),

        winRate: calculateWinRate(totalWins, totalLosses)        winRate: calculateWinRate(totalWins, totalLosses)

      },      },

      ranked: {      ranked: {

        mmr: mmr,        mmr: mmr,

        rankName: rankName,        rankName: rankName,

        maxMmr: maxMmr,        maxMmr: maxMmr,

        maxRankName: maxRankName,        maxRankName: maxRankName,

        wins: (ranked.wins as number) || 0,        wins: ranked.wins || 0,

        losses: (ranked.losses as number) || 0,        losses: ranked.losses || 0,

        winRate: calculateWinRate((ranked.wins as number) || 0, (ranked.losses as number) || 0),        winRate: calculateWinRate(ranked.wins || 0, ranked.losses || 0),

        kd: calculateKD((ranked.kills as number) || 0, (ranked.deaths as number) || 0),        kd: calculateKD(ranked.kills || 0, ranked.deaths || 0),

        kills: (ranked.kills as number) || 0,        kills: ranked.kills || 0,

        deaths: (ranked.deaths as number) || 0        deaths: ranked.deaths || 0

      },      },

      casual: {      casual: {

        wins: (casual.wins as number) || 0,        wins: casual.wins || 0,

        losses: (casual.losses as number) || 0,        losses: casual.losses || 0,

        winRate: calculateWinRate((casual.wins as number) || 0, (casual.losses as number) || 0),        winRate: calculateWinRate(casual.wins || 0, casual.losses || 0),

        kd: calculateKD((casual.kills as number) || 0, (casual.deaths as number) || 0),        kd: calculateKD(casual.kills || 0, casual.deaths || 0),

        kills: (casual.kills as number) || 0,        kills: casual.kills || 0,

        deaths: (casual.deaths as number) || 0        deaths: casual.deaths || 0

      }      }

    },    },

    lastUpdated: new Date().toISOString()    lastUpdated: new Date().toISOString()

  };  };

}}



// Conversion des plateformes pour r6-data.js// Conversion des plateformes pour r6-data.js

function convertPlatformForR6Data(platform: Platform): { platformType: string; platform_families: string } {function convertPlatformForR6Data(platform: Platform): { platformType: string; platform_families: string } {

  const platformMap: Record<Platform, { platformType: string; platform_families: string }> = {  const platformMap: Record<Platform, { platformType: string; platform_families: string }> = {

    'uplay': { platformType: 'uplay', platform_families: 'pc' },    'uplay': { platformType: 'uplay', platform_families: 'pc' },

    'steam': { platformType: 'uplay', platform_families: 'pc' }, // Steam utilise aussi uplay    'steam': { platformType: 'uplay', platform_families: 'pc' }, // Steam utilise aussi uplay

    'playstation': { platformType: 'psn', platform_families: 'console' },    'playstation': { platformType: 'psn', platform_families: 'console' },

    'xbox': { platformType: 'xbl', platform_families: 'console' },    'xbox': { platformType: 'xbl', platform_families: 'console' },

    'pc': { platformType: 'uplay', platform_families: 'pc' }    'pc': { platformType: 'uplay', platform_families: 'pc' }

  };  };

  return platformMap[platform] || { platformType: 'uplay', platform_families: 'pc' };  return platformMap[platform] || { platformType: 'uplay', platform_families: 'pc' };

}}



export const r6DataAPI = {export const r6DataAPI = {

  validateUsername: (username: string) => {  validateUsername: (username: string) => {

    const isValid = username && username.trim().length >= 3 && username.trim().length <= 15;    const isValid = username && username.trim().length >= 3 && username.trim().length <= 15;

    return {     return { 

      isValid,      isValid,

      error: !isValid ? 'Le nom d\'utilisateur doit contenir entre 3 et 15 caractères' : undefined      error: !isValid ? 'Le nom d\'utilisateur doit contenir entre 3 et 15 caractères' : undefined

    };    };

  },  },



  testConnection: async (): Promise<boolean> => {  testConnection: async (): Promise<boolean> => {

    try {    try {

      const serviceStatus = await callR6DataProxy('getServiceStatus');      const serviceStatus = await callR6DataProxy('getServiceStatus');

      return !!serviceStatus;      return !!serviceStatus;

    } catch (error) {    } catch (error) {

      console.warn('⚠️ Test de connexion r6-data.js échoué:', error);      console.warn('?? Test de connexion r6-data.js échoué:', error);

      return false;      return false;

    }    }

  },  },



  getAccountInfo: async (username: string, platform: Platform): Promise<CompletePlayerData> => {  getAccountInfo: async (username: string, platform: Platform): Promise<CompletePlayerData> => {

    console.log(`🔍 Récupération des données compte pour ${username} sur ${platform}`);    console.log(`?? Récupération des données compte pour ${username} sur ${platform}`);

        

    try {    try {

      const { platformType, platform_families } = convertPlatformForR6Data(platform);      const { platformType, platform_families } = convertPlatformForR6Data(platform);

            

      console.log(`📡 Appel proxy: getAccountInfo({nameOnPlatform: ${username}, platformType: ${platformType}})`);      console.log(`?? Appel proxy: getAccountInfo({nameOnPlatform: ${username}, platformType: ${platformType}})`);

            

      const accountInfo = await callR6DataProxy('getAccountInfo', {      const accountInfo = await callR6DataProxy('getAccountInfo', {

        nameOnPlatform: username,        nameOnPlatform: username,

        platformType: platformType        platformType: platformType

      });      });



      console.log('📋 Données compte reçues:', accountInfo);      console.log('?? Données compte reçues:', accountInfo);



      if (!accountInfo || (typeof accountInfo === 'object' && Object.keys(accountInfo).length === 0)) {      if (!accountInfo || (typeof accountInfo === 'object' && Object.keys(accountInfo).length === 0)) {

        throw new Error('Aucune donnée de compte retournée par l\'API');        throw new Error('Aucune donnée de compte retournée par l\'API');

      }      }



      // Essayons aussi de récupérer les stats      // Essayons aussi de récupérer les stats

      let playerStats = null;      let playerStats = null;

      try {      try {

        console.log(`📡 Appel proxy: getPlayerStats({nameOnPlatform: ${username}, platformType: ${platformType}, platform_families: ${platform_families}})`);        console.log(`?? Appel proxy: getPlayerStats({nameOnPlatform: ${username}, platformType: ${platformType}, platform_families: ${platform_families}})`);

                

        playerStats = await callR6DataProxy('getPlayerStats', {        playerStats = await callR6DataProxy('getPlayerStats', {

          nameOnPlatform: username,          nameOnPlatform: username,

          platformType: platformType,          platformType: platformType,

          platform_families: platform_families          platform_families: platform_families

        });        });

                

        console.log('📊 Données stats reçues:', playerStats);        console.log('?? Données stats reçues:', playerStats);

      } catch (statsError) {      } catch (statsError) {

        console.warn('⚠️ Impossible de récupérer les statistiques:', statsError);        console.warn('?? Impossible de récupérer les statistiques:', statsError);

      }      }



      return transformR6DataToPlayerData(accountInfo as Record<string, unknown>, (playerStats as Record<string, unknown>) || {}, username, platform);      return transformR6DataToPlayerData(accountInfo, playerStats, username, platform);

            

    } catch (error) {    } catch (error) {

      console.error('❌ Erreur r6-data.js:', error);      console.error('? Erreur r6-data.js:', error);

            

      if (error instanceof Error) {      if (error instanceof Error) {

        if (error.message.includes('not found') || error.message.includes('404') || error.message.includes('Player not found')) {        if (error.message.includes('not found') || error.message.includes('404') || error.message.includes('Player not found')) {

          throw new Error(`Joueur "${username}" non trouvé sur ${platform}`);          throw new Error(`Joueur "${username}" non trouvé sur ${platform}`);

        }        }

        if (error.message.includes('timeout') || error.message.includes('AbortError')) {        if (error.message.includes('timeout') || error.message.includes('AbortError')) {

          throw new Error('Délai d\'attente dépassé lors de la récupération des données');          throw new Error('Délai d\'attente dépassé lors de la récupération des données');

        }        }

        if (error.message.includes('rate limit') || error.message.includes('429')) {        if (error.message.includes('rate limit') || error.message.includes('429')) {

          throw new Error('Trop de requêtes, veuillez réessayer dans quelques instants');          throw new Error('Trop de requêtes, veuillez réessayer dans quelques instants');

        }        }

        throw new Error(`Erreur lors de la récupération des données: ${error.message}`);        throw new Error(`Erreur lors de la récupération des données: ${error.message}`);

      }      }



      throw new Error('Erreur inconnue lors de la récupération des données');      throw new Error('Erreur inconnue lors de la récupération des données');

    }    }

  },  },



  getPlayerStats: async (username: string, platform: Platform): Promise<CompletePlayerData> => {  getPlayerStats: async (username: string, platform: Platform): Promise<CompletePlayerData> => {

    console.log(`📊 Récupération des stats pour ${username} sur ${platform}`);    console.log(`?? Récupération des stats pour ${username} sur ${platform}`);

        

    try {    try {

      const { platformType, platform_families } = convertPlatformForR6Data(platform);      const { platformType, platform_families } = convertPlatformForR6Data(platform);

            

      console.log(`📡 Appel proxy: getPlayerStats({nameOnPlatform: ${username}, platformType: ${platformType}, platform_families: ${platform_families}})`);      console.log(`?? Appel proxy: getPlayerStats({nameOnPlatform: ${username}, platformType: ${platformType}, platform_families: ${platform_families}})`);

            

      const playerStats = await callR6DataProxy('getPlayerStats', {      const playerStats = await callR6DataProxy('getPlayerStats', {

        nameOnPlatform: username,        nameOnPlatform: username,

        platformType: platformType,        platformType: platformType,

        platform_families: platform_families        platform_families: platform_families

      });      });



      console.log('📊 Données stats reçues:', playerStats);      console.log('?? Données stats reçues:', playerStats);



      if (!playerStats || (typeof playerStats === 'object' && Object.keys(playerStats).length === 0)) {      if (!playerStats || (typeof playerStats === 'object' && Object.keys(playerStats).length === 0)) {

        throw new Error('Aucune statistique retournée par l\'API');        throw new Error('Aucune statistique retournée par l\'API');

      }      }



      // Essayons aussi de récupérer les infos du compte      // Essayons aussi de récupérer les infos du compte

      let accountInfo = null;      let accountInfo = null;

      try {      try {

        console.log(`📡 Appel proxy: getAccountInfo({nameOnPlatform: ${username}, platformType: ${platformType}})`);        console.log(`?? Appel proxy: getAccountInfo({nameOnPlatform: ${username}, platformType: ${platformType}})`);

                

        accountInfo = await callR6DataProxy('getAccountInfo', {        accountInfo = await callR6DataProxy('getAccountInfo', {

          nameOnPlatform: username,          nameOnPlatform: username,

          platformType: platformType          platformType: platformType

        });        });

                

        console.log('📋 Données compte reçues:', accountInfo);        console.log('?? Données compte reçues:', accountInfo);

      } catch (accountError) {      } catch (accountError) {

        console.warn('⚠️ Impossible de récupérer les informations du compte:', accountError);        console.warn('?? Impossible de récupérer les informations du compte:', accountError);

      }      }



      return transformR6DataToPlayerData((accountInfo as Record<string, unknown>) || {}, playerStats as Record<string, unknown>, username, platform);      return transformR6DataToPlayerData(accountInfo, playerStats, username, platform);

            

    } catch (error) {    } catch (error) {

      console.error('❌ Erreur r6-data.js stats:', error);      console.error('? Erreur r6-data.js stats:', error);

            

      if (error instanceof Error) {      if (error instanceof Error) {

        if (error.message.includes('not found') || error.message.includes('404') || error.message.includes('Player not found')) {        if (error.message.includes('not found') || error.message.includes('404') || error.message.includes('Player not found')) {

          throw new Error(`Statistiques pour "${username}" non trouvées sur ${platform}`);          throw new Error(`Statistiques pour "${username}" non trouvées sur ${platform}`);

        }        }

        if (error.message.includes('timeout') || error.message.includes('AbortError')) {        if (error.message.includes('timeout') || error.message.includes('AbortError')) {

          throw new Error('Délai d\'attente dépassé lors de la récupération des statistiques');          throw new Error('Délai d\'attente dépassé lors de la récupération des statistiques');

        }        }

        if (error.message.includes('rate limit') || error.message.includes('429')) {        if (error.message.includes('rate limit') || error.message.includes('429')) {

          throw new Error('Trop de requêtes, veuillez réessayer dans quelques instants');          throw new Error('Trop de requêtes, veuillez réessayer dans quelques instants');

        }        }

        throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);        throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);

      }      }



      throw new Error('Erreur inconnue lors de la récupération des statistiques');      throw new Error('Erreur inconnue lors de la récupération des statistiques');

    }    }

  }  }

};};



// API pour récupérer les opérateurs directement (conservée pour compatibilité)// API pour récupérer les opérateurs directement (conservée pour compatibilité)

export const getOperators = async () => {export const getOperators = async () => {

  try {  try {

    const response = await fetch(`${API_BASE_URL}/api/operators`, {    const response = await fetch(`${API_BASE_URL}/api/operators`, {

      headers: { 'User-Agent': 'R6-Tracker-App/1.0' },      headers: { 'User-Agent': 'R6-Tracker-App/1.0' },

      signal: AbortSignal.timeout(API_TIMEOUT)      signal: AbortSignal.timeout(API_TIMEOUT)

    });    });



    if (!response.ok) {    if (!response.ok) {

      throw new Error(`Erreur API operators: ${response.status}`);      throw new Error(`Erreur API operators: ${response.status}`);

    }    }



    const data = await response.json();    const data = await response.json();

    return data.operators || data;    return data.operators || data;

  } catch (error) {  } catch (error) {

    console.error('❌ Erreur lors de la récupération des opérateurs:', error);    console.error('? Erreur lors de la récupération des opérateurs:', error);

    throw error;    throw error;

  }  }

};};



// API pour récupérer les cartes directement (conservée pour compatibilité)// API pour récupérer les cartes directement (conservée pour compatibilité)

export const getMaps = async () => {export const getMaps = async () => {

  try {  try {

    const response = await fetch(`${API_BASE_URL}/api/maps`, {    const response = await fetch(`${API_BASE_URL}/api/maps`, {

      headers: { 'User-Agent': 'R6-Tracker-App/1.0' },      headers: { 'User-Agent': 'R6-Tracker-App/1.0' },

      signal: AbortSignal.timeout(API_TIMEOUT)      signal: AbortSignal.timeout(API_TIMEOUT)

    });    });



    if (!response.ok) {    if (!response.ok) {

      throw new Error(`Erreur API maps: ${response.status}`);      throw new Error(`Erreur API maps: ${response.status}`);

    }    }



    const data = await response.json();    const data = await response.json();

    return data.maps || data;    return data.maps || data;

  } catch (error) {  } catch (error) {

    console.error('❌ Erreur lors de la récupération des cartes:', error);    console.error('? Erreur lors de la récupération des cartes:', error);

    throw error;    throw error;

  }  }

};};



// API pour récupérer les armes directement (conservée pour compatibilité)// API pour récupérer les armes directement (conservée pour compatibilité)

export const getWeapons = async () => {export const getWeapons = async () => {

  try {  try {

    const response = await fetch(`${API_BASE_URL}/api/weapons`, {    const response = await fetch(`${API_BASE_URL}/api/weapons`, {

      headers: { 'User-Agent': 'R6-Tracker-App/1.0' },      headers: { 'User-Agent': 'R6-Tracker-App/1.0' },

      signal: AbortSignal.timeout(API_TIMEOUT)      signal: AbortSignal.timeout(API_TIMEOUT)

    });    });



    if (!response.ok) {    if (!response.ok) {

      throw new Error(`Erreur API weapons: ${response.status}`);      throw new Error(`Erreur API weapons: ${response.status}`);

    }    }



    return await response.json();    return await response.json();

  } catch (error) {  } catch (error) {

    console.error('❌ Erreur lors de la récupération des armes:', error);    console.error('? Erreur lors de la récupération des armes:', error);

    throw error;    throw error;

  }  }

};};