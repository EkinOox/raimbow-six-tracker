// Utilitaire pour transformer les données R6 API en format utilisable

import { R6DataPlayerStats, SimplePlayerStats } from '../types/r6-data-types';

// Mapping des rangs R6 Siege
const RANK_NAMES: { [key: number]: string } = {
  0: 'Unranked',
  1: 'Copper V',
  2: 'Copper IV',
  3: 'Copper III',
  4: 'Copper II',
  5: 'Copper I',
  6: 'Bronze V',
  7: 'Bronze IV',
  8: 'Bronze III',
  9: 'Bronze II',
  10: 'Bronze I',
  11: 'Silver V',
  12: 'Silver IV',
  13: 'Silver III',
  14: 'Silver II',
  15: 'Silver I',
  16: 'Gold V',
  17: 'Gold IV',
  18: 'Gold III',
  19: 'Gold II',
  20: 'Gold I',
  21: 'Platinum V',
  22: 'Platinum IV',
  23: 'Platinum III',
  24: 'Platinum II',
  25: 'Platinum I',
  26: 'Emerald V',
  27: 'Emerald IV',
  28: 'Emerald III',
  29: 'Emerald II',
  30: 'Emerald I',
  31: 'Diamond V',
  32: 'Diamond IV',
  33: 'Diamond III',
  34: 'Diamond II',
  35: 'Diamond I',
  36: 'Champion',
};

export function getRankName(rankId: number): string {
  return RANK_NAMES[rankId] || 'Unknown';
}

export function getRankImage(rankId: number): string {
  // Unranked
  if (rankId === 0) return '/images/ranks/copper-5.webp'; // Utiliser copper-5 comme fallback pour unranked
  
  // Copper (1-5) -> copper-5.webp à copper-1.webp
  if (rankId >= 1 && rankId <= 5) return `/images/ranks/copper-${6 - rankId}.webp`;
  
  // Bronze (6-10) -> bronze-5.webp à bronze-1.webp
  if (rankId >= 6 && rankId <= 10) return `/images/ranks/bronze-${11 - rankId}.webp`;
  
  // Silver (11-15) -> silver-5.webp à silver-1.webp
  if (rankId >= 11 && rankId <= 15) return `/images/ranks/silver-${16 - rankId}.webp`;
  
  // Gold (16-20) -> gold-5.webp à gold-1.webp
  if (rankId >= 16 && rankId <= 20) return `/images/ranks/gold-${21 - rankId}.webp`;
  
  // Platinum (21-25) -> platinum-5.png à platinum-1.png
  if (rankId >= 21 && rankId <= 25) return `/images/ranks/platinum-${26 - rankId}.png`;
  
  // Emerald (26-30) -> emerald-5.avif à emerald-1.png
  if (rankId === 26) return '/images/ranks/emerald-5.avif';
  if (rankId === 27) return '/images/ranks/emerald-4.avif';
  if (rankId === 28) return '/images/ranks/emerald-3.avif';
  if (rankId === 29) return '/images/ranks/emerald-2.avif';
  if (rankId === 30) return '/images/ranks/emerald-1.png';
  
  // Diamond (31-35) -> diamond-5.webp à diamond-1.webp
  if (rankId >= 31 && rankId <= 35) return `/images/ranks/diamond-${36 - rankId}.webp`;
  
  // Champion (36)
  if (rankId === 36) return '/images/ranks/champion.webp';
  
  // Fallback
  return '/images/ranks/copper-5.webp';
}

/**
 * Transforme les données brutes de l'API R6 en format simple et utilisable
 */
export function transformPlayerStats(rawData: R6DataPlayerStats): SimplePlayerStats {
  console.log('🔍 Début transformation - Données reçues:', rawData);
  
  // Initialiser avec des valeurs par défaut
  const defaultStats: SimplePlayerStats = {
    general: {
      kills: 0,
      deaths: 0,
      kd: 0,
      winRate: 0,
      totalMatches: 0,
    },
    ranked: {
      mmr: 0,
      rankId: 0,
      rankName: 'Unranked',
      maxMmr: 0,
      maxRankId: 0,
      maxRankName: 'Unranked',
      wins: 0,
      losses: 0,
      abandons: 0,
      winRate: 0,
      kd: 0,
      kills: 0,
      deaths: 0,
      seasonId: 0,
      topRankPosition: 0,
    },
    casual: {
      wins: 0,
      losses: 0,
      abandons: 0,
      winRate: 0,
      kd: 0,
      kills: 0,
      deaths: 0,
    },
    event: {
      wins: 0,
      losses: 0,
      abandons: 0,
      winRate: 0,
      kd: 0,
      kills: 0,
      deaths: 0,
    },
  };

  try {
    // Extraire les données ranked si disponibles
    const platformFamilies = rawData.platform_families_full_profiles || [];
    console.log(`📦 Nombre de platform families: ${platformFamilies.length}`);
    
    if (platformFamilies.length > 0) {
      const platformFamily = platformFamilies[0];
      console.log(`🎮 Platform family: ${platformFamily.platform_family}`);
      
      const boardIds = platformFamily.board_ids_full_profiles || [];
      console.log(`📋 Nombre de boards: ${boardIds.length}`);
      console.log(`📋 Board IDs disponibles:`, boardIds.map(b => b.board_id));
      
      if (boardIds.length > 0) {
        // Chercher le board ranked (peut être "pvp_ranked" ou "ranked")
        const rankedBoard = boardIds.find(board => board.board_id === 'pvp_ranked' || board.board_id === 'ranked');
        console.log(`🏆 Board ranked trouvé:`, !!rankedBoard);
        
        if (rankedBoard && rankedBoard.full_profiles && rankedBoard.full_profiles.length > 0) {
          const rankedProfile = rankedBoard.full_profiles[0];
          const profile = rankedProfile.profile;
          const stats = rankedProfile.season_statistics;
          
          console.log('📊 Profil ranked:', profile);
          console.log('📈 Stats ranked:', stats);
          
          // Stats ranked
          if (profile) {
            defaultStats.ranked.mmr = profile.rank_points || 0;
            defaultStats.ranked.rankId = profile.rank || 0;
            defaultStats.ranked.maxMmr = profile.max_rank_points || 0;
            defaultStats.ranked.maxRankId = profile.max_rank || 0;
            defaultStats.ranked.rankName = getRankName(profile.rank || 0);
            defaultStats.ranked.maxRankName = getRankName(profile.max_rank || 0);
            defaultStats.ranked.seasonId = profile.season_id || 0;
            defaultStats.ranked.topRankPosition = profile.top_rank_position || 0;
            console.log(`✅ Ranked: MMR=${defaultStats.ranked.mmr}, Rank=${defaultStats.ranked.rankName} (ID: ${defaultStats.ranked.rankId}), Season=${defaultStats.ranked.seasonId}`);
          }
          
          if (stats) {
            defaultStats.ranked.kills = stats.kills || 0;
            defaultStats.ranked.deaths = stats.deaths || 0;
            defaultStats.ranked.kd = stats.deaths > 0 ? parseFloat((stats.kills / stats.deaths).toFixed(2)) : stats.kills;
            
            if (stats.match_outcomes) {
              defaultStats.ranked.wins = stats.match_outcomes.wins || 0;
              defaultStats.ranked.losses = stats.match_outcomes.losses || 0;
              defaultStats.ranked.abandons = stats.match_outcomes.abandons || 0;
              const totalMatches = defaultStats.ranked.wins + defaultStats.ranked.losses;
              defaultStats.ranked.winRate = totalMatches > 0 
                ? parseFloat(((defaultStats.ranked.wins / totalMatches) * 100).toFixed(1))
                : 0;
            }
            console.log(`✅ Stats ranked: K/D=${defaultStats.ranked.kd}, Win Rate=${defaultStats.ranked.winRate}%, Abandons=${defaultStats.ranked.abandons}`);
          }
        }
        
        // Chercher le board casual/standard (peut être "pvp_casual", "casual" ou "standard")
        const casualBoard = boardIds.find(board => 
          board.board_id === 'pvp_casual' || 
          board.board_id === 'casual' || 
          board.board_id === 'standard'
        );
        console.log(`🎮 Board casual trouvé:`, !!casualBoard);
        
        if (casualBoard && casualBoard.full_profiles && casualBoard.full_profiles.length > 0) {
          const casualProfile = casualBoard.full_profiles[0];
          const stats = casualProfile.season_statistics;
          
          console.log('📈 Stats casual:', stats);
          
          if (stats) {
            defaultStats.casual.kills = stats.kills || 0;
            defaultStats.casual.deaths = stats.deaths || 0;
            defaultStats.casual.kd = stats.deaths > 0 ? parseFloat((stats.kills / stats.deaths).toFixed(2)) : stats.kills;
            
            if (stats.match_outcomes) {
              defaultStats.casual.wins = stats.match_outcomes.wins || 0;
              defaultStats.casual.losses = stats.match_outcomes.losses || 0;
              defaultStats.casual.abandons = stats.match_outcomes.abandons || 0;
              const totalMatches = defaultStats.casual.wins + defaultStats.casual.losses;
              defaultStats.casual.winRate = totalMatches > 0 
                ? parseFloat(((defaultStats.casual.wins / totalMatches) * 100).toFixed(1))
                : 0;
            }
            console.log(`✅ Stats casual: K/D=${defaultStats.casual.kd}, Win Rate=${defaultStats.casual.winRate}%, Abandons=${defaultStats.casual.abandons}`);
          }
        }
        
        // Chercher le board événement/arcade (living_game_mode)
        const eventBoard = boardIds.find(board => board.board_id === 'living_game_mode');
        console.log(`🎪 Board événement trouvé:`, !!eventBoard);
        
        if (eventBoard && eventBoard.full_profiles && eventBoard.full_profiles.length > 0) {
          const eventProfile = eventBoard.full_profiles[0];
          const stats = eventProfile.season_statistics;
          
          console.log('📈 Stats événement:', stats);
          
          if (stats && defaultStats.event) {
            defaultStats.event.kills = stats.kills || 0;
            defaultStats.event.deaths = stats.deaths || 0;
            defaultStats.event.kd = stats.deaths > 0 ? parseFloat((stats.kills / stats.deaths).toFixed(2)) : stats.kills;
            
            if (stats.match_outcomes) {
              defaultStats.event.wins = stats.match_outcomes.wins || 0;
              defaultStats.event.losses = stats.match_outcomes.losses || 0;
              defaultStats.event.abandons = stats.match_outcomes.abandons || 0;
              const totalMatches = defaultStats.event.wins + defaultStats.event.losses;
              defaultStats.event.winRate = totalMatches > 0 
                ? parseFloat(((defaultStats.event.wins / totalMatches) * 100).toFixed(1))
                : 0;
            }
            console.log(`✅ Stats événement: K/D=${defaultStats.event.kd}, Win Rate=${defaultStats.event.winRate}%`);
          }
        }
        
        // Stats générales (somme de ranked + casual + événement)
        defaultStats.general.kills = defaultStats.ranked.kills + defaultStats.casual.kills + (defaultStats.event?.kills || 0);
        defaultStats.general.deaths = defaultStats.ranked.deaths + defaultStats.casual.deaths + (defaultStats.event?.deaths || 0);
        defaultStats.general.kd = defaultStats.general.deaths > 0 
          ? parseFloat((defaultStats.general.kills / defaultStats.general.deaths).toFixed(2))
          : defaultStats.general.kills;
        
        const totalWins = defaultStats.ranked.wins + defaultStats.casual.wins + (defaultStats.event?.wins || 0);
        const totalLosses = defaultStats.ranked.losses + defaultStats.casual.losses + (defaultStats.event?.losses || 0);
        const totalMatches = totalWins + totalLosses;
        defaultStats.general.totalMatches = totalMatches;
        defaultStats.general.winRate = totalMatches > 0 
          ? parseFloat(((totalWins / totalMatches) * 100).toFixed(1))
          : 0;
        
        console.log(`✅ Stats générales: K/D=${defaultStats.general.kd}, Win Rate=${defaultStats.general.winRate}%, Total Matchs=${totalMatches}`);
      }
    }
  } catch (error) {
    console.error('❌ Erreur lors de la transformation des stats:', error);
  }

  console.log('✅ Transformation terminée:', defaultStats);
  return defaultStats;
}
