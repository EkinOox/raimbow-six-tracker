'use client'

import { useState } from 'react';
import { Platform } from '../types/r6-data-types';
import Image from 'next/image';
import 'primeicons/primeicons.css';

const platforms: { value: Platform; label: string; icon: string }[] = [
  { value: 'uplay', label: 'PC (Uplay)', icon: 'pi pi-desktop' },
  { value: 'playstation', label: 'PlayStation', icon: 'pi pi-play' },
  { value: 'xbox', label: 'Xbox', icon: 'pi pi-box' },
];

// Types pour les vraies données de l'API
interface AccountInfo {
  level: number;
  xp: number;
  profiles: Array<{
    platformType: string;
    nameOnPlatform: string;
  }>;
  profilePicture?: string;
}

interface PlayerProfile {
  board_id: string;
  id: string;
  max_rank: number;
  max_rank_points: number;
  platform_family: string;
  rank: number;
  rank_points: number;
  season_id: number;
  top_rank_position: number;
}

interface SeasonStatistics {
  deaths: number;
  kills: number;
  match_outcomes: {
    abandons: number;
    losses: number;
    wins: number;
  };
}

interface FullProfile {
  profile: PlayerProfile;
  season_statistics: SeasonStatistics;
}

interface BoardData {
  board_id: string;
  full_profiles: FullProfile[];
}

interface PlayerStatsResponse {
  platform_families_full_profiles: Array<{
    platform_family: string;
    board_ids_full_profiles: BoardData[];
  }>;
}

// Mapping des plateformes pour r6-data.js
const platformMap: Record<Platform, string> = {
  'pc': 'uplay', // PC par défaut -> uplay
  'uplay': 'uplay',
  'playstation': 'psn',
  'xbox': 'xbl'
};

// Définir la platform_family selon la plateforme
const platformFamilyMap: Record<Platform, string[]> = {
  'pc': ['pc'],
  'uplay': ['pc'],
  'playstation': ['console'],
  'xbox': ['console']
};

export default function PlayerSearch() {
  const [username, setUsername] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('uplay');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerStatsResponse | null>(null);
  const [imageError, setImageError] = useState(false);

  const validateUsername = (username: string): string | null => {
    if (!username || username.trim().length === 0) {
      return 'Le nom d\'utilisateur est requis';
    }
    if (username.trim().length < 3) {
      return 'Le nom d\'utilisateur doit contenir au moins 3 caractères';
    }
    if (username.trim().length > 15) {
      return 'Le nom d\'utilisateur ne peut pas dépasser 15 caractères';
    }
    return null;
  };

  // Fonction pour convertir les rangs numériques en noms
  const getRankName = (rank: number): string => {
    const ranks = [
      'Non classé', // 0
      'Copper V', 'Copper IV', 'Copper III', 'Copper II', 'Copper I', // 1-5
      'Bronze V', 'Bronze IV', 'Bronze III', 'Bronze II', 'Bronze I', // 6-10
      'Silver V', 'Silver IV', 'Silver III', 'Silver II', 'Silver I', // 11-15
      'Gold V', 'Gold IV', 'Gold III', 'Gold II', 'Gold I', // 16-20
      'Platinum V', 'Platinum IV', 'Platinum III', 'Platinum II', 'Platinum I', // 21-25
      'Emerald V', 'Emerald IV', 'Emerald III', 'Emerald II', 'Emerald I', // 26-30
      'Diamond V', 'Diamond IV', 'Diamond III', 'Diamond II', 'Diamond I', // 31-35
      'Champion' // 36+
    ];
    return ranks[rank] || (rank > 35 ? 'Champion' : 'Inconnu');
  };

  // Fonction pour obtenir la couleur d'un rang
  const getRankColor = (rank: number): string => {
    if (rank === 0) return 'text-gray-400';
    if (rank <= 5) return 'text-amber-600'; // Copper
    if (rank <= 10) return 'text-amber-700'; // Bronze
    if (rank <= 15) return 'text-gray-300'; // Silver
    if (rank <= 20) return 'text-yellow-400'; // Gold
    if (rank <= 25) return 'text-slate-300'; // Platinum
    if (rank <= 30) return 'text-emerald-400'; // Emerald
    if (rank <= 35) return 'text-blue-400'; // Diamond
    return 'text-purple-400'; // Champion
  };

  // Fonction pour calculer le K/D ratio
  const calculateKD = (kills: number, deaths: number): string => {
    if (deaths === 0) return kills.toString();
    return (kills / deaths).toFixed(2);
  };

  // Fonction pour calculer le win rate
  const calculateWinRate = (wins: number, losses: number): string => {
    const total = wins + losses;
    if (total === 0) return '0';
    return ((wins / total) * 100).toFixed(1);
  };

  // Fonction pour obtenir les données d'un mode spécifique
  const getModeData = (boardId: string): FullProfile | null => {
    if (!playerStats?.platform_families_full_profiles) return null;
    
    // Déterminer quelle platform_family utiliser selon la plateforme sélectionnée
    const targetPlatformFamily = (selectedPlatform === 'playstation' || selectedPlatform === 'xbox') 
      ? 'console' 
      : 'pc';
    
    // Chercher dans la bonne platform_family
    const platformFamilyData = playerStats.platform_families_full_profiles
      .find(pf => pf.platform_family === targetPlatformFamily);
    
    if (!platformFamilyData?.board_ids_full_profiles) return null;
    
    const board = platformFamilyData.board_ids_full_profiles
      .find(b => b.board_id === boardId);
    
    return board?.full_profiles?.[0] || null;
  };

  const handleSearch = async () => {
    const validation = validateUsername(username.trim());
    if (validation) {
      setError(validation);
      return;
    }

    setIsLoading(true);
    setError(null);
    setAccountInfo(null);
    setPlayerStats(null);
    setImageError(false);

    try {
      console.log(`🔍 Recherche de ${username} sur ${selectedPlatform}...`);
      
      const mappedPlatform = platformMap[selectedPlatform];
      const platformFamilies = platformFamilyMap[selectedPlatform];
      
      console.log(`📋 Plateforme mappée: ${selectedPlatform} -> ${mappedPlatform}, families: ${platformFamilies}`);
      
      // Message spécial pour PlayStation et Xbox
      if (selectedPlatform === 'playstation' || selectedPlatform === 'xbox') {
        console.log(`ℹ️ Note: Pour ${selectedPlatform}, essayez d'abord avec un compte PC/Uplay qui a un profil lié à cette plateforme`);
      }
      
      // Récupération des informations du compte
      const accountResponse = await fetch('/api/r6-data-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'getAccountInfo',
          params: {
            nameOnPlatform: username.trim(),
            platformType: mappedPlatform
          }
        })
      });

      const accountResult = await accountResponse.json();
      
      if (!accountResult.success) {
        // Pour PlayStation/Xbox, essayer automatiquement de chercher via les profils liés
        if (selectedPlatform === 'playstation' || selectedPlatform === 'xbox') {
          console.log(`🔄 Recherche directe ${selectedPlatform} échouée, suggestion de recherche via Uplay...`);
          throw new Error(`❌ Recherche directe impossible sur ${selectedPlatform.toUpperCase()}.

🎯 Solution recommandée :
1. Trouvez le nom Uplay/PC du joueur
2. Recherchez avec ce nom sur "PC (Uplay)"
3. Vous verrez alors tous ses profils liés (PlayStation, Xbox, etc.)

💡 Astuce : Les comptes Ubisoft Connect lient automatiquement toutes les plateformes.`);
        }
        throw new Error(accountResult.error || 'Erreur lors de la récupération des informations du compte');
      }

      setAccountInfo(accountResult.data);

      // Récupération des statistiques du joueur
      const statsResponse = await fetch('/api/r6-data-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'getPlayerStats',
          params: {
            nameOnPlatform: username.trim(),
            platformType: mappedPlatform,
            platform_families: platformFamilies
          }
        })
      });

      const statsResult = await statsResponse.json();
      
      if (!statsResult.success) {
        throw new Error(statsResult.error || 'Erreur lors de la récupération des statistiques');
      }

      // Le format direct de r6-data.js est un array de boards, pas l'objet attendu
      // On adapte le format
      if (Array.isArray(statsResult.data)) {
        setPlayerStats({
          platform_families_full_profiles: [{
            platform_family: platformFamilies[0],
            board_ids_full_profiles: statsResult.data
          }]
        });
      } else {
        setPlayerStats(statsResult.data);
      }

      console.log('✅ Données récupérées:', { accountInfo: accountResult.data, playerStats: statsResult.data });

    } catch (error) {
      console.error('❌ Erreur lors de la recherche:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de la recherche');
    } finally {
      setIsLoading(false);
    }
  };

  // Données des modes de jeu
  const casualData = getModeData('standard');
  const rankedData = getModeData('ranked');
  const eventData = getModeData('living_game_mode');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          Rainbow Six Siege Tracker
        </h1>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-white font-medium mb-2">Plateforme</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {platforms.map((platform) => (
                  <button
                    key={platform.value}
                    onClick={() => setSelectedPlatform(platform.value)}
                    className={`p-3 rounded-lg border transition-all ${
                      selectedPlatform === platform.value
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    <i className={`${platform.icon} text-lg mb-1`}></i>
                    <div className="text-sm font-medium">{platform.label}</div>
                  </button>
                ))}
              </div>
              
              {/* Message d'aide pour PlayStation/Xbox */}
              {(selectedPlatform === 'playstation' || selectedPlatform === 'xbox') && (
                <div className="mt-3 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  <div className="text-sm text-amber-300">
                    <i className="pi pi-exclamation-triangle mr-2"></i>
                    <strong>Important:</strong> Pour {selectedPlatform === 'playstation' ? 'PlayStation' : 'Xbox'}, 
                    recherchez d&apos;abord avec le nom <strong>Uplay/PC</strong> du joueur. 
                    Vous verrez ensuite tous ses profils liés.
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Nom d&apos;utilisateur</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Entrez le nom d'utilisateur"
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                >
                  {isLoading ? 'Recherche...' : 'Rechercher'}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}
        </div>

        {accountInfo && (
          <div className="space-y-6">
            {/* En-tête du joueur */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <div className="flex items-center space-x-4 mb-6">
                {accountInfo.profilePicture && !imageError ? (
                  <Image 
                    src={accountInfo.profilePicture} 
                    alt={`Avatar de ${username}`}
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-xl border border-white/20 object-cover"
                    onError={() => setImageError(true)}
                    unoptimized={true}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl border border-white/20 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      {username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-white mb-1">
                    {username}
                  </h2>
                  <div className="flex items-center space-x-4 text-white/70">
                    <span className="flex items-center">
                      <i className="pi pi-star mr-2 text-yellow-400"></i>
                      Niveau {accountInfo.level}
                    </span>
                    <span className="flex items-center">
                      <i className="pi pi-trophy mr-2 text-blue-400"></i>
                      {accountInfo.xp.toLocaleString()} XP
                    </span>
                    <span className="flex items-center">
                      <i className="pi pi-desktop mr-2 text-green-400"></i>
                      {selectedPlatform.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Profils multi-plateformes */}
              {accountInfo.profiles && accountInfo.profiles.length > 1 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <i className="pi pi-globe mr-2 text-purple-400"></i>
                    Profils multi-plateformes
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {accountInfo.profiles.map((profile, index) => (
                      <div 
                        key={index} 
                        className={`bg-white/5 rounded-lg p-3 text-center transition-all hover:bg-white/10 cursor-pointer ${
                          profile.platformType === platformMap[selectedPlatform] ? 'ring-2 ring-blue-400' : ''
                        }`}
                        onClick={() => {
                          // Rechercher directement avec ce profil
                          const platformKey = Object.keys(platformMap).find(
                            key => platformMap[key as Platform] === profile.platformType
                          ) as Platform;
                          
                          if (platformKey && platformKey !== selectedPlatform) {
                            setSelectedPlatform(platformKey);
                            setUsername(profile.nameOnPlatform);
                            console.log(`🔄 Changement vers ${platformKey}: ${profile.nameOnPlatform}`);
                          }
                        }}
                      >
                        <div className="text-xs text-white/60 mb-1">
                          {profile.platformType.toUpperCase()}
                          {profile.platformType === platformMap[selectedPlatform] && ' (Actuel)'}
                        </div>
                        <div className="text-sm text-white font-medium truncate">
                          {profile.nameOnPlatform}
                        </div>
                        {profile.platformType !== platformMap[selectedPlatform] && (
                          <div className="text-xs text-blue-400 mt-1">
                            Cliquer pour rechercher
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Conseils d'utilisation */}
                  <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <div className="text-sm text-blue-300">
                      <i className="pi pi-info-circle mr-2"></i>
                      <strong>💡 Conseil:</strong> Cliquez sur un profil pour voir ses statistiques sur cette plateforme.
                    </div>
                    <div className="text-xs text-blue-400 mt-1">
                      • <strong>PC/Steam/Uplay</strong> : Statistiques PC
                      • <strong>PlayStation/Xbox</strong> : Statistiques Console (toutes consoles confondues)
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Statistiques par mode de jeu */}
            {playerStats && (
              <div className="space-y-6">
                {/* Indicateur de la plateforme des statistiques */}
                <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-500/20 rounded-xl p-4">
                  <div className="text-center text-blue-300">
                    <i className="pi pi-info-circle mr-2"></i>
                    <strong>Statistiques affichées :</strong> 
                    {(selectedPlatform === 'playstation' || selectedPlatform === 'xbox') 
                      ? ` Console (${selectedPlatform === 'playstation' ? 'PlayStation' : 'Xbox'})` 
                      : ' PC'
                    }
                    {(selectedPlatform === 'playstation' || selectedPlatform === 'xbox') && (
                      <div className="text-xs text-blue-400 mt-1">
                        Les statistiques console incluent PlayStation, Xbox et Switch
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Mode Ranked */}
                {rankedData && (
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                    <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                      <i className="pi pi-trophy mr-3 text-yellow-400"></i>
                      Mode Classé (Ranked)
                    </h3>
                    
                    {/* Informations de rang */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="text-center p-4 bg-white/5 rounded-xl">
                        <div className="text-sm text-white/60 mb-2">Rang Actuel</div>
                        <div className={`text-2xl font-bold mb-1 ${getRankColor(rankedData.profile.rank)}`}>
                          {getRankName(rankedData.profile.rank)}
                        </div>
                        <div className="text-blue-400">
                          {rankedData.profile.rank_points} MMR
                        </div>
                      </div>
                      
                      <div className="text-center p-4 bg-white/5 rounded-xl">
                        <div className="text-sm text-white/60 mb-2">Meilleur Rang</div>
                        <div className={`text-2xl font-bold mb-1 ${getRankColor(rankedData.profile.max_rank)}`}>
                          {getRankName(rankedData.profile.max_rank)}
                        </div>
                        <div className="text-blue-400">
                          {rankedData.profile.max_rank_points} MMR
                        </div>
                      </div>
                    </div>

                    {/* Statistiques détaillées */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-white/5 rounded-lg">
                        <div className="text-sm text-white/60 mb-1 flex items-center justify-center">
                          <i className="pi pi-target mr-1"></i>
                          Kills
                        </div>
                        <div className="text-xl font-bold text-green-400">
                          {rankedData.season_statistics.kills.toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="text-center p-3 bg-white/5 rounded-lg">
                        <div className="text-sm text-white/60 mb-1 flex items-center justify-center">
                          <i className="pi pi-times-circle mr-1"></i>
                          Morts
                        </div>
                        <div className="text-xl font-bold text-red-400">
                          {rankedData.season_statistics.deaths.toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="text-center p-3 bg-white/5 rounded-lg">
                        <div className="text-sm text-white/60 mb-1 flex items-center justify-center">
                          <i className="pi pi-percentage mr-1"></i>
                          K/D
                        </div>
                        <div className="text-xl font-bold text-yellow-400">
                          {calculateKD(rankedData.season_statistics.kills, rankedData.season_statistics.deaths)}
                        </div>
                      </div>
                      
                      <div className="text-center p-3 bg-white/5 rounded-lg">
                        <div className="text-sm text-white/60 mb-1 flex items-center justify-center">
                          <i className="pi pi-check-circle mr-1"></i>
                          Win Rate
                        </div>
                        <div className="text-xl font-bold text-purple-400">
                          {calculateWinRate(
                            rankedData.season_statistics.match_outcomes.wins,
                            rankedData.season_statistics.match_outcomes.losses
                          )}%
                        </div>
                      </div>
                    </div>

                    {/* Matches */}
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                        <div className="text-sm text-green-300 mb-1">Victoires</div>
                        <div className="text-xl font-bold text-green-400">
                          {rankedData.season_statistics.match_outcomes.wins}
                        </div>
                      </div>
                      
                      <div className="text-center p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                        <div className="text-sm text-red-300 mb-1">Défaites</div>
                        <div className="text-xl font-bold text-red-400">
                          {rankedData.season_statistics.match_outcomes.losses}
                        </div>
                      </div>
                      
                      <div className="text-center p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                        <div className="text-sm text-orange-300 mb-1">Abandons</div>
                        <div className="text-xl font-bold text-orange-400">
                          {rankedData.season_statistics.match_outcomes.abandons}
                        </div>
                      </div>
                    </div>

                    {/* Infos saison */}
                    <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <div className="text-center text-blue-300">
                        <i className="pi pi-calendar mr-2"></i>
                        Saison {rankedData.profile.season_id} • ID Joueur: {rankedData.profile.id.slice(0, 8)}...
                      </div>
                    </div>
                  </div>
                )}

                {/* Mode Casual */}
                {casualData && (
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                    <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                      <i className="pi pi-users mr-3 text-green-400"></i>
                      Mode Casual (Standard)
                    </h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 bg-white/5 rounded-lg">
                        <div className="text-sm text-white/60 mb-1">Kills</div>
                        <div className="text-xl font-bold text-green-400">
                          {casualData.season_statistics.kills.toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="text-center p-3 bg-white/5 rounded-lg">
                        <div className="text-sm text-white/60 mb-1">Morts</div>
                        <div className="text-xl font-bold text-red-400">
                          {casualData.season_statistics.deaths.toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="text-center p-3 bg-white/5 rounded-lg">
                        <div className="text-sm text-white/60 mb-1">K/D</div>
                        <div className="text-xl font-bold text-yellow-400">
                          {calculateKD(casualData.season_statistics.kills, casualData.season_statistics.deaths)}
                        </div>
                      </div>
                      
                      <div className="text-center p-3 bg-white/5 rounded-lg">
                        <div className="text-sm text-white/60 mb-1">Win Rate</div>
                        <div className="text-xl font-bold text-purple-400">
                          {calculateWinRate(
                            casualData.season_statistics.match_outcomes.wins,
                            casualData.season_statistics.match_outcomes.losses
                          )}%
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                        <div className="text-sm text-green-300 mb-1">Victoires</div>
                        <div className="text-lg font-bold text-green-400">
                          {casualData.season_statistics.match_outcomes.wins}
                        </div>
                      </div>
                      
                      <div className="text-center p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                        <div className="text-sm text-red-300 mb-1">Défaites</div>
                        <div className="text-lg font-bold text-red-400">
                          {casualData.season_statistics.match_outcomes.losses}
                        </div>
                      </div>
                      
                      <div className="text-center p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                        <div className="text-sm text-orange-300 mb-1">Abandons</div>
                        <div className="text-lg font-bold text-orange-400">
                          {casualData.season_statistics.match_outcomes.abandons}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mode Événements */}
                {eventData && (
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                    <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                      <i className="pi pi-star mr-3 text-purple-400"></i>
                      Mode Événements
                    </h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 bg-white/5 rounded-lg">
                        <div className="text-sm text-white/60 mb-1">Kills</div>
                        <div className="text-xl font-bold text-green-400">
                          {eventData.season_statistics.kills.toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="text-center p-3 bg-white/5 rounded-lg">
                        <div className="text-sm text-white/60 mb-1">Morts</div>
                        <div className="text-xl font-bold text-red-400">
                          {eventData.season_statistics.deaths.toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="text-center p-3 bg-white/5 rounded-lg">
                        <div className="text-sm text-white/60 mb-1">K/D</div>
                        <div className="text-xl font-bold text-yellow-400">
                          {calculateKD(eventData.season_statistics.kills, eventData.season_statistics.deaths)}
                        </div>
                      </div>
                      
                      <div className="text-center p-3 bg-white/5 rounded-lg">
                        <div className="text-sm text-white/60 mb-1">Win Rate</div>
                        <div className="text-xl font-bold text-purple-400">
                          {calculateWinRate(
                            eventData.season_statistics.match_outcomes.wins,
                            eventData.season_statistics.match_outcomes.losses
                          )}%
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                        <div className="text-sm text-green-300 mb-1">Victoires</div>
                        <div className="text-lg font-bold text-green-400">
                          {eventData.season_statistics.match_outcomes.wins}
                        </div>
                      </div>
                      
                      <div className="text-center p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                        <div className="text-sm text-red-300 mb-1">Défaites</div>
                        <div className="text-lg font-bold text-red-400">
                          {eventData.season_statistics.match_outcomes.losses}
                        </div>
                      </div>
                      
                      <div className="text-center p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                        <div className="text-sm text-orange-300 mb-1">Abandons</div>
                        <div className="text-lg font-bold text-orange-400">
                          {eventData.season_statistics.match_outcomes.abandons}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Résumé global */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                  <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                    <i className="pi pi-chart-line mr-3 text-blue-400"></i>
                    Résumé Global
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-white/5 rounded-xl">
                      <div className="text-sm text-white/60 mb-2">Total Kills</div>
                      <div className="text-2xl font-bold text-green-400">
                        {((rankedData?.season_statistics.kills || 0) + 
                          (casualData?.season_statistics.kills || 0) + 
                          (eventData?.season_statistics.kills || 0)).toLocaleString()}
                      </div>
                      <div className="text-xs text-white/50 mt-1">
                        Ranked: {rankedData?.season_statistics.kills || 0} | 
                        Casual: {casualData?.season_statistics.kills || 0} | 
                        Events: {eventData?.season_statistics.kills || 0}
                      </div>
                    </div>
                    
                    <div className="text-center p-4 bg-white/5 rounded-xl">
                      <div className="text-sm text-white/60 mb-2">Total Matches</div>
                      <div className="text-2xl font-bold text-blue-400">
                        {((rankedData?.season_statistics.match_outcomes.wins || 0) + 
                          (rankedData?.season_statistics.match_outcomes.losses || 0) + 
                          (casualData?.season_statistics.match_outcomes.wins || 0) + 
                          (casualData?.season_statistics.match_outcomes.losses || 0) +
                          (eventData?.season_statistics.match_outcomes.wins || 0) + 
                          (eventData?.season_statistics.match_outcomes.losses || 0)).toLocaleString()}
                      </div>
                      <div className="text-xs text-white/50 mt-1">
                        Tous modes confondus
                      </div>
                    </div>
                    
                    <div className="text-center p-4 bg-white/5 rounded-xl">
                      <div className="text-sm text-white/60 mb-2">Mode Préféré</div>
                      <div className="text-2xl font-bold text-purple-400">
                        {(() => {
                          const rankedMatches = (rankedData?.season_statistics.match_outcomes.wins || 0) + (rankedData?.season_statistics.match_outcomes.losses || 0);
                          const casualMatches = (casualData?.season_statistics.match_outcomes.wins || 0) + (casualData?.season_statistics.match_outcomes.losses || 0);
                          const eventMatches = (eventData?.season_statistics.match_outcomes.wins || 0) + (eventData?.season_statistics.match_outcomes.losses || 0);
                          
                          if (rankedMatches >= casualMatches && rankedMatches >= eventMatches) return 'Ranked';
                          if (casualMatches >= eventMatches) return 'Casual';
                          return 'Events';
                        })()}
                      </div>
                      <div className="text-xs text-white/50 mt-1">
                        Basé sur le nombre de matches
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}