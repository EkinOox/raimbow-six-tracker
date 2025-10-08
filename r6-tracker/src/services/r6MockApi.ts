// API Mock complète pour Rainbow Six Siege
// Encodage: UTF-8

import {
  SimplePlatform,
  SimplePlayerStats,
  SimpleRankedStats,
  SimpleCasualStats,
  ValidationResult,
  R6_RANKS,
  R6Rank
} from '../types/r6';

export class R6MockApi {
  // Délai de simulation réseau
  private static readonly NETWORK_DELAY = 800;

  // Noms d'utilisateur de test avec données prédéfinies
  private static readonly TEST_USERS = [
    'Ash_Main_2024', 'Jager_ACE', 'Thermite_Breach', 'Vigil_Roam',
    'Hibana_Pro', 'Smoke_Defense', 'Twitch_Drone', 'Caveira_Silent',
    'Buck_Sledge', 'Valkyrie_Eyes', 'Blackbeard_Shield', 'Pulse_Heartbeat',
    'Capitao_Fire', 'Echo_Yokai', 'Jackal_Track', 'Mira_Window'
  ];

  /**
   * Validation des noms d'utilisateur
   */
  static validateUsername(username: string): ValidationResult {
    console.log('Validation du nom d\'utilisateur:', username);

    if (!username || username.trim().length === 0) {
      return { valid: false, error: 'Le nom d\'utilisateur ne peut pas être vide' };
    }

    if (username.length < 3) {
      return { valid: false, error: 'Le nom d\'utilisateur doit contenir au moins 3 caractères' };
    }

    if (username.length > 15) {
      return { valid: false, error: 'Le nom d\'utilisateur ne peut pas dépasser 15 caractères' };
    }

    // Caractères autorisés : lettres, chiffres, underscore, tiret, point
    const validPattern = /^[a-zA-Z0-9._-]+$/;
    if (!validPattern.test(username)) {
      return { 
        valid: false, 
        error: 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, points, tirets et underscores' 
      };
    }

    console.log('? Nom d\'utilisateur valide');
    return { valid: true };
  }

  /**
   * Test de connexion à l'API
   */
  static async testConnection(): Promise<boolean> {
    console.log('Test de connexion à l\'API R6...');

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Connexion API réussie');
      return true;
    } catch (error) {
      console.error('Échec de la connexion API:', error);
      return false;
    }
  }

  /**
   * Récupération des statistiques générales
   */
  static async getGeneralStats(
    platform: SimplePlatform, 
    username: string
  ): Promise<SimplePlayerStats | null> {
    console.log(`Récupération des stats générales pour ${username} sur ${platform}...`);

    // Validation
    const validation = this.validateUsername(username);
    if (!validation.valid) {
      console.error('Nom d\'utilisateur invalide:', validation.error);
      return null;
    }

    // Simulation du délai réseau
    await new Promise(resolve => setTimeout(resolve, this.NETWORK_DELAY));

    try {
      const stats = this.generateMockProfile(username);
      console.log('Stats générales récupérées avec succès');
      return stats;
    } catch (error) {
      console.error('Erreur lors de la récupération des stats générales:', error);
      return null;
    }
  }

  /**
   * Récupération des statistiques ranked
   */
  static async getRankedStats(
    platform: SimplePlatform, 
    username: string
  ): Promise<SimpleRankedStats | null> {
    console.log(`Récupération des stats ranked pour ${username} sur ${platform}...`);

    const validation = this.validateUsername(username);
    if (!validation.valid) {
      console.error('Nom d\'utilisateur invalide:', validation.error);
      return null;
    }

    await new Promise(resolve => setTimeout(resolve, this.NETWORK_DELAY));

    try {
      const stats = this.generateMockRankedSegment(username);
      console.log('Stats ranked récupérées avec succès');
      return stats;
    } catch (error) {
      console.error('? Erreur lors de la récupération des stats ranked:', error);
      return null;
    }
  }

  /**
   * Récupération des statistiques casual
   */
  static async getCasualStats(
    platform: SimplePlatform, 
    username: string
  ): Promise<SimpleCasualStats | null> {
    console.log(`Récupération des stats casual pour ${username} sur ${platform}...`);

    const validation = this.validateUsername(username);
    if (!validation.valid) {
      console.error('Nom d\'utilisateur invalide:', validation.error);
      return null;
    }

    await new Promise(resolve => setTimeout(resolve, this.NETWORK_DELAY));

    try {
      const stats = this.generateMockCasualSegment(username);
      console.log('Stats casual récupérées avec succès');
      return stats;
    } catch (error) {
      console.error('Erreur lors de la récupération des stats casual:', error);
      return null;
    }
  }

  /**
   * Génération d'un profil joueur réaliste
   */
  private static generateMockProfile(username: string): SimplePlayerStats {
    // Génération basée sur le hash du nom d'utilisateur pour la cohérence
    const seed = this.hashString(username);
    const random = this.seededRandom(seed);

    const level = (50 + Math.floor(random() * 250)).toString();
    const kills = (1000 + Math.floor(random() * 9000)).toString();
    const deaths = Math.floor(parseInt(kills) / (0.8 + random() * 0.8)).toString();
    const kd = (parseInt(kills) / parseInt(deaths)).toFixed(2);
    const wins = (200 + Math.floor(random() * 800)).toString();
    const losses = Math.floor(parseInt(wins) / (0.6 + random() * 0.8)).toString();
    const winRate = ((parseInt(wins) / (parseInt(wins) + parseInt(losses))) * 100).toFixed(1);
    const headshotRate = (15 + random() * 25).toFixed(1);
    const matchesPlayed = (parseInt(wins) + parseInt(losses)).toString();
    const hoursPlayed = Math.floor(parseInt(matchesPlayed) * (0.3 + random() * 0.4));
    const timePlayedHours = `${hoursPlayed}h ${Math.floor(random() * 60)}m`;

    return {
      name: username,
      level,
      kd,
      kills,
      deaths,
      wins,
      losses,
      win_: `${winRate}%`,
      headshot_: `${headshotRate}%`,
      time_played: timePlayedHours,
      matches_played: matchesPlayed,
      total_xp: (parseInt(level) * 1000 + Math.floor(random() * 1000)).toString(),
      melee_kills: Math.floor(parseInt(kills) * (0.01 + random() * 0.03)).toString(),
      blind_kills: Math.floor(parseInt(kills) * (0.02 + random() * 0.05)).toString(),
      header: `https://r6stats.com/img/default-header.jpg`,
      url: `https://r6stats.com/stats/${username.toLowerCase()}`
    };
  }

  /**
   * Génération des stats ranked réalistes
   */
  private static generateMockRankedSegment(username: string): SimpleRankedStats {
    const seed = this.hashString(username + 'ranked');
    const random = this.seededRandom(seed);

    // Sélection d'un rang réaliste
    const rankIndex = Math.floor(random() * R6_RANKS.length);
    const currentRank = R6_RANKS[rankIndex];
    const maxRankIndex = Math.max(rankIndex, Math.floor(random() * R6_RANKS.length));
    const maxRank = R6_RANKS[maxRankIndex];

    // MMR basé sur le rang
    const baseMmr = this.getMmrForRank(currentRank);
    const currentMmr = (baseMmr + Math.floor(random() * 200) - 100).toString();
    const maxMmr = Math.max(parseInt(currentMmr), baseMmr + Math.floor(random() * 300)).toString();

    const kills = (300 + Math.floor(random() * 1200)).toString();
    const deaths = Math.floor(parseInt(kills) / (0.7 + random() * 0.9)).toString();
    const kd = (parseInt(kills) / parseInt(deaths)).toFixed(2);
    const wins = (50 + Math.floor(random() * 200)).toString();
    const losses = Math.floor(parseInt(wins) / (0.5 + random() * 1.0)).toString();
    const winRate = ((parseInt(wins) / (parseInt(wins) + parseInt(losses))) * 100).toFixed(1);
    const matchesPlayed = (parseInt(wins) + parseInt(losses)).toString();
    const hoursPlayed = Math.floor(parseInt(matchesPlayed) * (0.4 + random() * 0.3));
    const timePlayedHours = `${hoursPlayed}h ${Math.floor(random() * 60)}m`;

    return {
      current_rank: currentRank,
      current_mmr: currentMmr,
      max_rank: maxRank,
      max_mmr: maxMmr,
      kd,
      kills,
      deaths,
      wins,
      losses,
      win_: `${winRate}%`,
      matches_played: matchesPlayed,
      time_played: timePlayedHours,
      season: 'Y9S3 Heavy Mettle'
    };
  }

  /**
   * Génération des stats casual réalistes
   */
  private static generateMockCasualSegment(username: string): SimpleCasualStats {
    const seed = this.hashString(username + 'casual');
    const random = this.seededRandom(seed);

    const kills = (500 + Math.floor(random() * 2000)).toString();
    const deaths = Math.floor(parseInt(kills) / (0.6 + random() * 0.8)).toString();
    const kd = (parseInt(kills) / parseInt(deaths)).toFixed(2);
    const wins = (100 + Math.floor(random() * 400)).toString();
    const losses = Math.floor(parseInt(wins) / (0.4 + random() * 1.2)).toString();
    const winRate = ((parseInt(wins) / (parseInt(wins) + parseInt(losses))) * 100).toFixed(1);
    const matchesPlayed = (parseInt(wins) + parseInt(losses)).toString();
    const killsPerMatch = (parseInt(kills) / parseInt(matchesPlayed)).toFixed(1);
    const hoursPlayed = Math.floor(parseInt(matchesPlayed) * (0.25 + random() * 0.35));
    const timePlayedHours = `${hoursPlayed}h ${Math.floor(random() * 60)}m`;
    const casualMmr = (1000 + Math.floor(random() * 2000)).toString();

    return {
      kd,
      kills,
      deaths,
      wins,
      losses,
      win_: `${winRate}%`,
      matches_played: matchesPlayed,
      time_played: timePlayedHours,
      kills_per_match: killsPerMatch,
      mmr: casualMmr
    };
  }

  /**
   * Obtenir le MMR de base pour un rang donné
   */
  private static getMmrForRank(rank: R6Rank): number {
    const mmrRanges: Record<string, number> = {
      'Unranked': 2500,
      'Copper V': 1200, 'Copper IV': 1300, 'Copper III': 1400, 'Copper II': 1500, 'Copper I': 1600,
      'Bronze V': 1700, 'Bronze IV': 1800, 'Bronze III': 1900, 'Bronze II': 2000, 'Bronze I': 2100,
      'Silver V': 2200, 'Silver IV': 2300, 'Silver III': 2400, 'Silver II': 2500, 'Silver I': 2600,
      'Gold V': 2700, 'Gold IV': 2800, 'Gold III': 2900, 'Gold II': 3000, 'Gold I': 3100,
      'Platinum V': 3200, 'Platinum IV': 3300, 'Platinum III': 3400, 'Platinum II': 3500, 'Platinum I': 3600,
      'Diamond V': 3700, 'Diamond IV': 3800, 'Diamond III': 3900, 'Diamond II': 4000, 'Diamond I': 4100,
      'Champion': 4200
    };
    return mmrRanges[rank] || 2500;
  }

  /**
   * Fonction de hash simple pour générer un seed
   */
  private static hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Générateur de nombres aléatoires avec seed
   */
  private static seededRandom(seed: number) {
    let current = seed;
    return function() {
      current = (current * 9301 + 49297) % 233280;
      return current / 233280;
    };
  }
}