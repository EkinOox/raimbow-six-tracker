'use client'

import { useState } from 'react';
import { Platform } from '../types/r6-data-types';
import Image from 'next/image';

// Types pour les données de joueur
interface PlayerData {
  accountInfo: {
    level: number;
    xp: number;
    profiles: Array<{
      platformType: string;
      nameOnPlatform: string;
    }>;
    profilePicture?: string;
  };
  rankedStats: {
    profile: {
      rank: number;
      rank_points: number;
      max_rank: number;
      max_rank_points: number;
    };
    season_statistics: {
      kills: number;
      deaths: number;
      match_outcomes: {
        wins: number;
        losses: number;
        abandons: number;
      };
    };
  } | null;
  username: string;
  platform: Platform;
}

// Système de scoring pour prédiction 1v1
interface ComparisonScore {
  player1Score: number;
  player2Score: number;
  winner: 'player1' | 'player2' | 'tie';
  factors: {
    rank: { player1: number; player2: number; winner: string };
    kd: { player1: number; player2: number; winner: string };
    winRate: { player1: number; player2: number; winner: string };
    experience: { player1: number; player2: number; winner: string };
    consistency: { player1: number; player2: number; winner: string };
  };
  confidence: number;
}

// Composant de recherche simplifié pour la comparaison
interface SimplePlayerSearchProps {
  onPlayerFound: (data: PlayerData) => void;
}

const platforms: { value: Platform; label: string; icon: string }[] = [
  { value: 'uplay', label: 'PC (Uplay)', icon: 'pi pi-desktop' },
  { value: 'playstation', label: 'PlayStation', icon: 'pi pi-play' },
  { value: 'xbox', label: 'Xbox', icon: 'pi pi-box' },
];

// Mapping des plateformes pour r6-data.js
const platformMap: Record<Platform, string> = {
  'pc': 'uplay',
  'uplay': 'uplay',
  'playstation': 'psn',
  'xbox': 'xbl'
};

const platformFamilyMap: Record<Platform, string[]> = {
  'pc': ['pc'],
  'uplay': ['pc'],
  'playstation': ['console'],
  'xbox': ['console']
};

function SimplePlayerSearch({ onPlayerFound }: SimplePlayerSearchProps) {
  const [username, setUsername] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('uplay');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!username.trim()) {
      setError('Le nom d\'utilisateur est requis');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const platformType = platformMap[selectedPlatform];
      const platformFamilies = platformFamilyMap[selectedPlatform];

      // Récupération des informations du compte
      const accountResponse = await fetch('/api/r6-data-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'getAccountInfo',
          params: {
            nameOnPlatform: username.trim(),
            platformType
          }
        })
      });

      const accountResult = await accountResponse.json();
      
      if (!accountResult.success) {
        const serverMsg = accountResult.error || `Joueur non trouvé sur ${selectedPlatform.toUpperCase()}`;
        throw new Error(serverMsg);
      }

      // Récupération des statistiques ranked
      const statsResponse = await fetch('/api/r6-data-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'getPlayerStats',
          params: {
            nameOnPlatform: username.trim(),
            platformType: platformType,
            platform_families: platformFamilies
          }
        })
      });

      const statsResult = await statsResponse.json();
      
      if (!statsResult.success) {
        const serverMsg = statsResult.error || 'Impossible de récupérer les statistiques';
        throw new Error(serverMsg);
      }

      // Adapter le format des stats
      let playerStats = null;
      if (Array.isArray(statsResult.data)) {
        playerStats = {
          platform_families_full_profiles: [{
            platform_family: platformFamilies[0],
            board_ids_full_profiles: statsResult.data
          }]
        };
      } else {
        playerStats = statsResult.data;
      }

      // Extraire les stats ranked
      const rankedBoard = playerStats.platform_families_full_profiles[0]?.board_ids_full_profiles
        ?.find((board: { board_id: string }) => board.board_id === 'ranked');
      
      const rankedData = rankedBoard?.full_profiles?.[0] || null;

      if (!rankedData) {
        throw new Error('Aucune statistique ranked trouvée pour ce joueur');
      }

      const playerData: PlayerData = {
        accountInfo: accountResult.data,
        rankedStats: rankedData,
        username: username.trim(),
        platform: selectedPlatform
      };

      onPlayerFound(playerData);

    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Erreur lors de la recherche:', error);
      }
      setError(error instanceof Error ? error.message : 'Erreur lors de la recherche');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-white font-medium mb-2">Plateforme</label>
        <div className="grid grid-cols-3 gap-2">
          {platforms.map((platform) => (
            <button
              key={platform.value}
              onClick={() => setSelectedPlatform(platform.value)}
              className={`p-2 rounded-lg border transition-all text-sm ${
                selectedPlatform === platform.value
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
              }`}
            >
              <i className={`${platform.icon} text-lg mb-1`}></i>
              <div className="text-xs font-medium">{platform.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-white font-medium mb-2">Nom d&apos;utilisateur</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Entrez le nom d'utilisateur"
            className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors"
          >
            {isLoading ? '...' : 'Go'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}

export default function PlayerComparison() {
  const [player1, setPlayer1] = useState<PlayerData | null>(null);
  const [player2, setPlayer2] = useState<PlayerData | null>(null);
  const [comparison, setComparison] = useState<ComparisonScore | null>(null);

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

  // Fonction pour obtenir l'image du rang
  const getRankImage = (rank: number): string => {
    if (rank === 0) return '/images/ranks/copper-5.webp';
    if (rank === 1) return '/images/ranks/copper-5.webp';
    if (rank === 2) return '/images/ranks/copper-4.webp';
    if (rank === 3) return '/images/ranks/copper-3.webp';
    if (rank === 4) return '/images/ranks/copper-2.webp';
    if (rank === 5) return '/images/ranks/copper-1.webp';
    if (rank === 6) return '/images/ranks/bronze-5.webp';
    if (rank === 7) return '/images/ranks/bronze-4.webp';
    if (rank === 8) return '/images/ranks/bronze-3.webp';
    if (rank === 9) return '/images/ranks/bronze-2.webp';
    if (rank === 10) return '/images/ranks/bronze-1.webp';
    if (rank === 11) return '/images/ranks/silver-5.webp';
    if (rank === 12) return '/images/ranks/silver-4.webp';
    if (rank === 13) return '/images/ranks/silver-3.webp';
    if (rank === 14) return '/images/ranks/silver-2.webp';
    if (rank === 15) return '/images/ranks/silver-1.webp';
    if (rank === 16) return '/images/ranks/gold-5.webp';
    if (rank === 17) return '/images/ranks/gold-4.webp';
    if (rank === 18) return '/images/ranks/gold-3.webp';
    if (rank === 19) return '/images/ranks/gold-2.webp';
    if (rank === 20) return '/images/ranks/gold-1.webp';
    if (rank === 21) return '/images/ranks/platinum-5.png';
    if (rank === 22) return '/images/ranks/platinum-4.png';
    if (rank === 23) return '/images/ranks/platinum-3.png';
    if (rank === 24) return '/images/ranks/platinum-2.png';
    if (rank === 25) return '/images/ranks/platinum-1.png';
    if (rank === 26) return '/images/ranks/emerald-5.avif';
    if (rank === 27) return '/images/ranks/emerald-4.avif';
    if (rank === 28) return '/images/ranks/emerald-3.avif';
    if (rank === 29) return '/images/ranks/emerald-2.avif';
    if (rank === 30) return '/images/ranks/emerald-1.png';
    if (rank === 31) return '/images/ranks/diamond-5.webp';
    if (rank === 32) return '/images/ranks/diamond-4.webp';
    if (rank === 33) return '/images/ranks/diamond-3.webp';
    if (rank === 34) return '/images/ranks/diamond-2.webp';
    if (rank === 35) return '/images/ranks/diamond-1.webp';
    return '/images/ranks/champion.webp';
  };

  // Fonction pour calculer le K/D ratio
  const calculateKD = (kills: number, deaths: number): number => {
    if (deaths === 0) return kills;
    return kills / deaths;
  };

  // Fonction pour calculer le win rate
  const calculateWinRate = (wins: number, losses: number): number => {
    const total = wins + losses;
    if (total === 0) return 0;
    return (wins / total) * 100;
  };

  // Algorithme de scoring amélioré pour prédiction 1v1
  const calculateComparison = (): ComparisonScore | null => {
    if (!player1?.rankedStats || !player2?.rankedStats) return null;

    const p1Stats = player1.rankedStats;
    const p2Stats = player2.rankedStats;

    // Facteur 1: Différence de MMR (poids: 40%) - Le plus important
    const p1MMR = p1Stats.profile.rank_points;
    const p2MMR = p2Stats.profile.rank_points;
    const mmrDifference = Math.abs(p1MMR - p2MMR);
    const mmrAdvantage = p1MMR > p2MMR ? 'player1' : p2MMR > p1MMR ? 'player2' : 'tie';
    
    // Calcul du score MMR (plus la différence est grande, plus l'avantage est important)
    const mmrScore1 = p1MMR > p2MMR ? 100 : Math.max(0, 100 - (mmrDifference / 10));
    const mmrScore2 = p2MMR > p1MMR ? 100 : Math.max(0, 100 - (mmrDifference / 10));

    const rankFactor = {
      player1: p1MMR,
      player2: p2MMR,
      winner: mmrAdvantage === 'player1' ? 'Joueur 1' : mmrAdvantage === 'player2' ? 'Joueur 2' : 'Égalité'
    };

    // Facteur 2: K/D Ratio (poids: 30%)
    const p1KD = calculateKD(p1Stats.season_statistics.kills, p1Stats.season_statistics.deaths);
    const p2KD = calculateKD(p2Stats.season_statistics.kills, p2Stats.season_statistics.deaths);
    const kdAdvantage = p1KD > p2KD ? 'player1' : p2KD > p1KD ? 'player2' : 'tie';
    
    const kdFactor = {
      player1: p1KD,
      player2: p2KD,
      winner: kdAdvantage === 'player1' ? 'Joueur 1' : kdAdvantage === 'player2' ? 'Joueur 2' : 'Égalité'
    };

    // Facteur 3: Win Rate (poids: 20%)
    const p1WinRate = calculateWinRate(p1Stats.season_statistics.match_outcomes.wins, p1Stats.season_statistics.match_outcomes.losses);
    const p2WinRate = calculateWinRate(p2Stats.season_statistics.match_outcomes.wins, p2Stats.season_statistics.match_outcomes.losses);
    const winRateFactor = {
      player1: p1WinRate,
      player2: p2WinRate,
      winner: p1WinRate > p2WinRate ? 'Joueur 1' : p2WinRate > p1WinRate ? 'Joueur 2' : 'Égalité'
    };

    // Facteur 4: Expérience (nombre de matches, poids: 7%)
    const p1Matches = p1Stats.season_statistics.match_outcomes.wins + p1Stats.season_statistics.match_outcomes.losses;
    const p2Matches = p2Stats.season_statistics.match_outcomes.wins + p2Stats.season_statistics.match_outcomes.losses;
    const experienceFactor = {
      player1: p1Matches,
      player2: p2Matches,
      winner: p1Matches > p2Matches ? 'Joueur 1' : p2Matches > p1Matches ? 'Joueur 2' : 'Égalité'
    };

    // Facteur 5: Consistance (faible taux d'abandon, poids: 3%)
    const p1AbandonRate = p1Matches > 0 ? (p1Stats.season_statistics.match_outcomes.abandons / p1Matches) * 100 : 0;
    const p2AbandonRate = p2Matches > 0 ? (p2Stats.season_statistics.match_outcomes.abandons / p2Matches) * 100 : 0;
    const p1Consistency = Math.max(0, 100 - p1AbandonRate);
    const p2Consistency = Math.max(0, 100 - p2AbandonRate);
    const consistencyFactor = {
      player1: p1Consistency,
      player2: p2Consistency,
      winner: p1Consistency > p2Consistency ? 'Joueur 1' : p2Consistency > p1Consistency ? 'Joueur 2' : 'Égalité'
    };

    // Calcul du score final pondéré (sur 100)
    const p1FinalScore = 
      (mmrScore1 * 0.40) +           // 40% pour MMR
      (Math.min(100, p1KD * 25) * 0.30) +  // 30% pour K/D
      (p1WinRate * 0.20) +           // 20% pour Win Rate
      (Math.min(100, p1Matches / 2) * 0.07) + // 7% pour expérience
      (p1Consistency * 0.03);        // 3% pour consistance

    const p2FinalScore = 
      (mmrScore2 * 0.40) +
      (Math.min(100, p2KD * 25) * 0.30) +
      (p2WinRate * 0.20) +
      (Math.min(100, p2Matches / 2) * 0.07) +
      (p2Consistency * 0.03);

    // Déterminer le gagnant et calculer le pourcentage de victoire
    const scoreDifference = Math.abs(p1FinalScore - p2FinalScore);
    let winner: 'player1' | 'player2' | 'tie';
    let winPercentage: number;

    if (scoreDifference < 2) {
      winner = 'tie';
      winPercentage = 50;
    } else if (p1FinalScore > p2FinalScore) {
      winner = 'player1';
      // Calculer le pourcentage de victoire basé sur la différence de score
      winPercentage = Math.min(95, Math.max(55, 50 + (scoreDifference * 0.8)));
    } else {
      winner = 'player2';
      winPercentage = Math.min(95, Math.max(55, 50 + (scoreDifference * 0.8)));
    }

    return {
      player1Score: Math.round(p1FinalScore),
      player2Score: Math.round(p2FinalScore),
      winner,
      factors: {
        rank: rankFactor,
        kd: kdFactor,
        winRate: winRateFactor,
        experience: experienceFactor,
        consistency: consistencyFactor
      },
      confidence: Math.round(winPercentage)
    };
  };

  // Fonction appelée quand un joueur est trouvé
  const handlePlayerFound = (playerData: PlayerData, playerNumber: 1 | 2) => {
    if (playerNumber === 1) {
      setPlayer1(playerData);
    } else {
      setPlayer2(playerData);
    }
    // Ne pas calculer automatiquement - attendre le bouton
    setComparison(null);
  };

  // Fonction pour lancer la comparaison
  const handleCompare = () => {
    if (player1 && player2) {
      const comp = calculateComparison();
      setComparison(comp);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl p-6">
      <h1 className="text-4xl font-bold text-white mb-8 text-center">
        Comparaison de Joueurs 1vs1
      </h1>
      <p className="text-white/70 text-center mb-12 max-w-2xl mx-auto">
        Comparez deux joueurs et obtenez une prédiction de qui devrait gagner en 1vs1 
        basée sur leurs statistiques ranked actuelles.
      </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Joueur 1 */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-blue-400 mb-6 text-center">Joueur 1</h2>
            <SimplePlayerSearch 
              onPlayerFound={(data) => handlePlayerFound(data, 1)} 
            />
            
            {player1 && (
              <div className="mt-6 p-4 bg-white/5 rounded-xl">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    {player1.accountInfo.profilePicture ? (
                      <Image
                        src={player1.accountInfo.profilePicture}
                        alt={`Photo de profil de ${player1.username}`}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                        unoptimized={true}
                      />
                    ) : (
                      <span className="text-white text-xl font-bold">
                        {player1.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{player1.username}</h3>
                    <p className="text-white/70">Niveau {player1.accountInfo.level}</p>
                  </div>
                </div>
                
                {player1.rankedStats && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Image 
                        src={getRankImage(player1.rankedStats.profile.rank)}
                        alt={getRankName(player1.rankedStats.profile.rank)}
                        width={32}
                        height={32}
                        className="w-8 h-8 object-contain"
                        unoptimized={true}
                      />
                      <span className="text-white font-medium">
                        {getRankName(player1.rankedStats.profile.rank)}
                      </span>
                      <span className="text-blue-400">
                        ({player1.rankedStats.profile.rank_points} MMR)
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-green-400 font-bold">
                          {calculateKD(player1.rankedStats.season_statistics.kills, player1.rankedStats.season_statistics.deaths).toFixed(2)}
                        </div>
                        <div className="text-white/60 text-sm">K/D</div>
                      </div>
                      <div>
                        <div className="text-purple-400 font-bold">
                          {calculateWinRate(player1.rankedStats.season_statistics.match_outcomes.wins, player1.rankedStats.season_statistics.match_outcomes.losses).toFixed(1)}%
                        </div>
                        <div className="text-white/60 text-sm">Win Rate</div>
                      </div>
                      <div>
                        <div className="text-blue-400 font-bold">
                          {player1.rankedStats.season_statistics.match_outcomes.wins + player1.rankedStats.season_statistics.match_outcomes.losses}
                        </div>
                        <div className="text-white/60 text-sm">Matches</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Joueur 2 */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-red-400 mb-6 text-center">Joueur 2</h2>
            <SimplePlayerSearch 
              onPlayerFound={(data) => handlePlayerFound(data, 2)} 
            />
            
            {player2 && (
              <div className="mt-6 p-4 bg-white/5 rounded-xl">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                    {player2.accountInfo.profilePicture ? (
                      <Image
                        src={player2.accountInfo.profilePicture}
                        alt={`Photo de profil de ${player2.username}`}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                        unoptimized={true}
                      />
                    ) : (
                      <span className="text-white text-xl font-bold">
                        {player2.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{player2.username}</h3>
                    <p className="text-white/70">Niveau {player2.accountInfo.level}</p>
                  </div>
                </div>
                
                {player2.rankedStats && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Image 
                        src={getRankImage(player2.rankedStats.profile.rank)}
                        alt={getRankName(player2.rankedStats.profile.rank)}
                        width={32}
                        height={32}
                        className="w-8 h-8 object-contain"
                        unoptimized={true}
                      />
                      <span className="text-white font-medium">
                        {getRankName(player2.rankedStats.profile.rank)}
                      </span>
                      <span className="text-blue-400">
                        ({player2.rankedStats.profile.rank_points} MMR)
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-green-400 font-bold">
                          {calculateKD(player2.rankedStats.season_statistics.kills, player2.rankedStats.season_statistics.deaths).toFixed(2)}
                        </div>
                        <div className="text-white/60 text-sm">K/D</div>
                      </div>
                      <div>
                        <div className="text-purple-400 font-bold">
                          {calculateWinRate(player2.rankedStats.season_statistics.match_outcomes.wins, player2.rankedStats.season_statistics.match_outcomes.losses).toFixed(1)}%
                        </div>
                        <div className="text-white/60 text-sm">Win Rate</div>
                      </div>
                      <div>
                        <div className="text-blue-400 font-bold">
                          {player2.rankedStats.season_statistics.match_outcomes.wins + player2.rankedStats.season_statistics.match_outcomes.losses}
                        </div>
                        <div className="text-white/60 text-sm">Matches</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bouton de comparaison */}
        {player1 && player2 && (
          <div className="text-center mb-8">
            <button
              onClick={handleCompare}
              className="px-12 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold text-xl rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              ⚔️ COMPARER LES JOUEURS
            </button>
            <p className="text-white/60 text-sm mt-2">
              Obtenez une prédiction 1vs1 basée sur les stats ranked actuelles
            </p>
          </div>
        )}

        {/* Résultat de la comparaison */}
        {comparison && player1 && player2 && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              🎯 Prédiction 1vs1
            </h2>

            {/* Résultat principal */}
            <div className="text-center mb-8">
              <div className={`text-6xl font-bold mb-4 ${
                comparison.winner === 'player1' ? 'text-blue-400' : 
                comparison.winner === 'player2' ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {comparison.winner === 'player1' ? player1.username : 
                 comparison.winner === 'player2' ? player2.username : 'Match Équilibré'}
              </div>
              <div className="text-3xl text-white mb-4">
                {comparison.winner === 'tie' ? 'Match très équilibré (50/50)' : `${comparison.confidence}% de chances de gagner`}
              </div>
              <div className="text-lg text-white/70 mb-6">
                {comparison.winner === 'tie' 
                  ? 'Les deux joueurs ont un niveau très similaire' 
                  : `Basé sur l'analyse des statistiques ranked actuelles`
                }
              </div>
              
              {/* Barre de progression visuelle */}
              <div className="max-w-md mx-auto mb-6">
                <div className="flex justify-between text-sm text-white/70 mb-2">
                  <span>{player1.username}</span>
                  <span>{player2.username}</span>
                </div>
                <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      comparison.winner === 'player1' ? 'bg-gradient-to-r from-blue-500 to-blue-400' : 
                      comparison.winner === 'player2' ? 'bg-gradient-to-r from-red-500 to-red-400' : 
                      'bg-gradient-to-r from-yellow-500 to-yellow-400'
                    }`}
                    style={{ 
                      width: comparison.winner === 'tie' ? '50%' : 
                             comparison.winner === 'player1' ? `${comparison.confidence}%` : 
                             `${100 - comparison.confidence}%`
                    }}
                  />
                </div>
                <div className="flex justify-between text-sm text-white/50 mt-1">
                  <span>{comparison.winner === 'player1' ? `${comparison.confidence}%` : `${100 - comparison.confidence}%`}</span>
                  <span>{comparison.winner === 'player2' ? `${comparison.confidence}%` : `${100 - comparison.confidence}%`}</span>
                </div>
              </div>

              {/* Scores détaillés */}
              <div className="flex justify-center space-x-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">{comparison.player1Score}</div>
                  <div className="text-white/70">{player1.username}</div>
                  <div className="text-sm text-white/50">Score Global</div>
                </div>
                <div className="text-4xl text-white/50 flex items-center">VS</div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-400">{comparison.player2Score}</div>
                  <div className="text-white/70">{player2.username}</div>
                  <div className="text-sm text-white/50">Score Global</div>
                </div>
              </div>
            </div>

            {/* Analyse détaillée */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {Object.entries(comparison.factors).map(([key, factor]) => (
                <div key={key} className="bg-white/5 rounded-xl p-4">
                  <h3 className="text-white font-bold mb-3 capitalize">
                    {key === 'kd' ? 'K/D Ratio' : 
                     key === 'winRate' ? 'Win Rate' : 
                     key === 'experience' ? 'Expérience' :
                     key === 'consistency' ? 'Consistance' : 'Rang'}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-blue-400">{player1.username.substring(0, 8)}...</span>
                      <span className="text-white font-medium">
                        {typeof factor.player1 === 'number' ? factor.player1.toFixed(key === 'kd' ? 2 : key === 'winRate' ? 1 : 0) : factor.player1}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-400">{player2.username.substring(0, 8)}...</span>
                      <span className="text-white font-medium">
                        {typeof factor.player2 === 'number' ? factor.player2.toFixed(key === 'kd' ? 2 : key === 'winRate' ? 1 : 0) : factor.player2}
                      </span>
                    </div>
                    <div className={`text-center text-sm font-bold ${
                      factor.winner.includes('Joueur 1') ? 'text-blue-400' :
                      factor.winner.includes('Joueur 2') ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      {factor.winner}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Explication de l'algorithme */}
            <div className="mt-8 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <h3 className="text-lg font-bold text-blue-300 mb-3">
                <i className="pi pi-info-circle mr-2"></i>
                Comment fonctionne la prédiction ?
              </h3>
              <div className="text-sm text-blue-200 space-y-1">
                <p>• <strong>MMR (40%)</strong> : Différence de rang - Facteur principal pour le skill</p>
                <p>• <strong>K/D Ratio (30%)</strong> : Efficacité au combat individuel</p>
                <p>• <strong>Win Rate (20%)</strong> : Capacité à gagner les matches</p>
                <p>• <strong>Expérience (7%)</strong> : Nombre de matches joués cette saison</p>
                <p>• <strong>Consistance (3%)</strong> : Faible taux d&apos;abandon (mental fort)</p>
              </div>
              <div className="mt-3 text-xs text-blue-300">
                💡 Plus la différence de MMR et K/D est importante, plus la prédiction est fiable
              </div>
            </div>
          </div>
        )}
    </div>
  );
}