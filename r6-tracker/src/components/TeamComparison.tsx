'use client';

import { useState, useCallback, memo, useRef } from 'react';
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

// Interface pour une équipe
interface Team {
  name: string;
  players: PlayerData[];
  color: string;
}

// Statistiques d'équipe calculées
interface TeamStats {
  averageMMR: number;
  averageKD: number;
  averageWinRate: number;
  averageLevel: number;
  totalExperience: number;
  teamScore: number;
  playerCount: number;
}

// Résultat de comparaison d'équipes
interface TeamComparison {
  team1Stats: TeamStats;
  team2Stats: TeamStats;
  winner: 'team1' | 'team2' | 'tie';
  winProbability: number;
  factors: {
    avgMMR: { team1: number; team2: number; advantage: string };
    avgKD: { team1: number; team2: number; advantage: string };
    avgWinRate: { team1: number; team2: number; advantage: string };
    teamSize: { team1: number; team2: number; advantage: string };
    experience: { team1: number; team2: number; advantage: string };
  };
}

export default function TeamComparison() {
  // États pour les deux équipes
  const [team1, setTeam1] = useState<Team>({
    name: 'Équipe 1',
    players: [],
    color: 'blue'
  });
  
  const [team2, setTeam2] = useState<Team>({
    name: 'Équipe 2',
    players: [],
    color: 'red'
  });

  // États pour l'interface
  const [platform1, setPlatform1] = useState<Platform>('uplay');
  const [platform2, setPlatform2] = useState<Platform>('uplay');
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [comparison, setComparison] = useState<TeamComparison | null>(null);
  
  // Références pour les inputs (évite les re-rendus)
  const inputRef1 = useRef<HTMLInputElement>(null);
  const inputRef2 = useRef<HTMLInputElement>(null);

  // Fonction pour obtenir l'image du rang
  const getRankImage = (rankId: number): string => {
    const rankMappings: { [key: number]: string } = {
      0: '/images/ranks/copper-5.webp', 1: '/images/ranks/copper-4.webp', 2: '/images/ranks/copper-3.webp', 3: '/images/ranks/copper-2.webp', 4: '/images/ranks/copper-1.webp',
      5: '/images/ranks/bronze-5.webp', 6: '/images/ranks/bronze-4.webp', 7: '/images/ranks/bronze-3.webp', 8: '/images/ranks/bronze-2.webp', 9: '/images/ranks/bronze-1.webp',
      10: '/images/ranks/silver-5.webp', 11: '/images/ranks/silver-4.webp', 12: '/images/ranks/silver-3.webp', 13: '/images/ranks/silver-2.webp', 14: '/images/ranks/silver-1.webp',
      15: '/images/ranks/gold-5.webp', 16: '/images/ranks/gold-4.webp', 17: '/images/ranks/gold-3.webp', 18: '/images/ranks/gold-2.webp', 19: '/images/ranks/gold-1.webp',
      20: '/images/ranks/platinum-5.png', 21: '/images/ranks/platinum-4.png', 22: '/images/ranks/platinum-3.png', 23: '/images/ranks/platinum-2.png', 24: '/images/ranks/platinum-1.png',
      25: '/images/ranks/emerald-5.avif', 26: '/images/ranks/emerald-4.avif', 27: '/images/ranks/emerald-3.avif', 28: '/images/ranks/emerald-2.avif', 29: '/images/ranks/emerald-1.png',
      30: '/images/ranks/diamond-5.webp', 31: '/images/ranks/diamond-4.webp', 32: '/images/ranks/diamond-3.webp', 33: '/images/ranks/diamond-2.webp', 34: '/images/ranks/diamond-1.webp',
      35: '/images/ranks/champion.webp'
    };
    return rankMappings[rankId] || '/images/ranks/copper-5.webp';
  };

  // Recherche de joueur pour équipe 1 (mémorisée)
  const searchPlayer1 = useCallback(async () => {
    const searchQuery = inputRef1.current?.value.trim();
    if (!searchQuery) return;
    
    setLoading1(true);
    try {
      const platformType = platform1 === 'uplay' ? 'uplay' : 
                          platform1 === 'playstation' ? 'psn' : 
                          platform1 === 'xbox' ? 'xbl' : 'uplay';
      const platformFamilies = platform1 === 'uplay' ? ['pc'] : ['console'];

      // Récupération des informations du compte
      const accountResponse = await fetch('/api/r6-data-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'getAccountInfo',
          params: {
            nameOnPlatform: searchQuery,
            platformType
          }
        })
      });

      const accountResult = await accountResponse.json();
      
      if (!accountResult.success) {
        throw new Error(`Joueur non trouvé sur ${platform1.toUpperCase()}`);
      }

      // Récupération des statistiques ranked
      const statsResponse = await fetch('/api/r6-data-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'getPlayerStats',
          params: {
            nameOnPlatform: searchQuery,
            platformType: platformType,
            platform_families: platformFamilies
          }
        })
      });

      const statsResult = await statsResponse.json();
      
      if (!statsResult.success) {
        throw new Error('Impossible de récupérer les statistiques');
      }

      // Adapter le format des stats (même logique que PlayerComparison)
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

      // Créer un objet PlayerData compatible
      const newPlayer: PlayerData = {
        accountInfo: accountResult.data,
        rankedStats: rankedData,
        username: searchQuery,
        platform: platform1
      };
      
      setTeam1(prev => ({
        ...prev,
        players: [...prev.players, newPlayer]
      }));
      
      // Vider l'input
      if (inputRef1.current) {
        inputRef1.current.value = '';
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      alert(error instanceof Error ? error.message : 'Erreur lors de la recherche du joueur');
    } finally {
      setLoading1(false);
    }
  }, [platform1]);

  // Recherche de joueur pour équipe 2 (mémorisée)
  const searchPlayer2 = useCallback(async () => {
    const searchQuery = inputRef2.current?.value.trim();
    if (!searchQuery) return;
    
    setLoading2(true);
    try {
      const platformType = platform2 === 'uplay' ? 'uplay' : 
                          platform2 === 'playstation' ? 'psn' : 
                          platform2 === 'xbox' ? 'xbl' : 'uplay';
      const platformFamilies = platform2 === 'uplay' ? ['pc'] : ['console'];

      // Récupération des informations du compte
      const accountResponse = await fetch('/api/r6-data-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'getAccountInfo',
          params: {
            nameOnPlatform: searchQuery,
            platformType
          }
        })
      });

      const accountResult = await accountResponse.json();
      
      if (!accountResult.success) {
        throw new Error(`Joueur non trouvé sur ${platform2.toUpperCase()}`);
      }

      // Récupération des statistiques ranked
      const statsResponse = await fetch('/api/r6-data-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'getPlayerStats',
          params: {
            nameOnPlatform: searchQuery,
            platformType: platformType,
            platform_families: platformFamilies
          }
        })
      });

      const statsResult = await statsResponse.json();
      
      if (!statsResult.success) {
        throw new Error('Impossible de récupérer les statistiques');
      }

      // Adapter le format des stats (même logique que PlayerComparison)
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

      // Créer un objet PlayerData compatible
      const newPlayer: PlayerData = {
        accountInfo: accountResult.data,
        rankedStats: rankedData,
        username: searchQuery,
        platform: platform2
      };
      
      setTeam2(prev => ({
        ...prev,
        players: [...prev.players, newPlayer]
      }));
      
      // Vider l'input
      if (inputRef2.current) {
        inputRef2.current.value = '';
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      alert(error instanceof Error ? error.message : 'Erreur lors de la recherche du joueur');
    } finally {
      setLoading2(false);
    }
  }, [platform2]);

  // Supprimer un joueur d'une équipe
  const removePlayer = (teamNumber: 1 | 2, playerIndex: number) => {
    if (teamNumber === 1) {
      setTeam1(prev => ({
        ...prev,
        players: prev.players.filter((_, index) => index !== playerIndex)
      }));
    } else {
      setTeam2(prev => ({
        ...prev,
        players: prev.players.filter((_, index) => index !== playerIndex)
      }));
    }
  };

  // Calculer les statistiques d'une équipe
  const calculateTeamStats = (team: Team): TeamStats => {
    if (team.players.length === 0) {
      return {
        averageMMR: 0,
        averageKD: 0,
        averageWinRate: 0,
        averageLevel: 0,
        totalExperience: 0,
        teamScore: 0,
        playerCount: 0
      };
    }

    const validPlayers = team.players.filter(p => p.rankedStats);
    if (validPlayers.length === 0) {
      return {
        averageMMR: 0,
        averageKD: 0,
        averageWinRate: 0,
        averageLevel: team.players.reduce((sum, p) => sum + p.accountInfo.level, 0) / team.players.length,
        totalExperience: team.players.reduce((sum, p) => sum + p.accountInfo.level, 0),
        teamScore: 0,
        playerCount: team.players.length
      };
    }

    const avgMMR = validPlayers.reduce((sum, p) => sum + p.rankedStats!.profile.rank_points, 0) / validPlayers.length;
    
    const avgKD = validPlayers.reduce((sum, p) => {
      const { kills, deaths } = p.rankedStats!.season_statistics;
      return sum + (deaths > 0 ? kills / deaths : kills);
    }, 0) / validPlayers.length;

    const avgWinRate = validPlayers.reduce((sum, p) => {
      const { wins, losses } = p.rankedStats!.season_statistics.match_outcomes;
      const totalMatches = wins + losses;
      return sum + (totalMatches > 0 ? wins / totalMatches : 0);
    }, 0) / validPlayers.length;

    const avgLevel = team.players.reduce((sum, p) => sum + p.accountInfo.level, 0) / team.players.length;
    const totalExp = team.players.reduce((sum, p) => sum + p.accountInfo.level, 0);

    // Score d'équipe (pondéré)
    const teamScore = (avgMMR * 0.4) + (avgKD * 1000 * 0.3) + (avgWinRate * 5000 * 0.2) + (avgLevel * 0.07) + (team.players.length * 500 * 0.03);

    return {
      averageMMR: avgMMR,
      averageKD: avgKD,
      averageWinRate: avgWinRate,
      averageLevel: avgLevel,
      totalExperience: totalExp,
      teamScore: teamScore,
      playerCount: team.players.length
    };
  };

  // Comparer les deux équipes
  const compareTeams = () => {
    const stats1 = calculateTeamStats(team1);
    const stats2 = calculateTeamStats(team2);

    if (stats1.playerCount === 0 || stats2.playerCount === 0) {
      alert('Les deux équipes doivent avoir au moins un joueur !');
      return;
    }

    // Facteur de déséquilibre des effectifs
    const sizeRatio = Math.min(stats1.playerCount, stats2.playerCount) / Math.max(stats1.playerCount, stats2.playerCount);
    const sizePenalty = Math.pow(sizeRatio, 0.5); // Pénalité pour l'équipe plus nombreuse

    // Ajustement des scores selon la taille des équipes
    let adjustedScore1 = stats1.teamScore;
    let adjustedScore2 = stats2.teamScore;

    if (stats1.playerCount > stats2.playerCount) {
      adjustedScore1 *= sizePenalty;
    } else if (stats2.playerCount > stats1.playerCount) {
      adjustedScore2 *= sizePenalty;
    }

    // Calcul du pourcentage de victoire
    const totalScore = adjustedScore1 + adjustedScore2;
    const team1WinProb = totalScore > 0 ? (adjustedScore1 / totalScore) * 100 : 50;

    const winner = adjustedScore1 > adjustedScore2 ? 'team1' : adjustedScore2 > adjustedScore1 ? 'team2' : 'tie';

    const comparisonResult: TeamComparison = {
      team1Stats: stats1,
      team2Stats: stats2,
      winner,
      winProbability: winner === 'team1' ? team1WinProb : 100 - team1WinProb,
      factors: {
        avgMMR: {
          team1: stats1.averageMMR,
          team2: stats2.averageMMR,
          advantage: stats1.averageMMR > stats2.averageMMR ? 'team1' : 'team2'
        },
        avgKD: {
          team1: stats1.averageKD,
          team2: stats2.averageKD,
          advantage: stats1.averageKD > stats2.averageKD ? 'team1' : 'team2'
        },
        avgWinRate: {
          team1: stats1.averageWinRate,
          team2: stats2.averageWinRate,
          advantage: stats1.averageWinRate > stats2.averageWinRate ? 'team1' : 'team2'
        },
        teamSize: {
          team1: stats1.playerCount,
          team2: stats2.playerCount,
          advantage: stats1.playerCount === stats2.playerCount ? 'tie' : 
                    stats1.playerCount > stats2.playerCount ? 'team1' : 'team2'
        },
        experience: {
          team1: stats1.totalExperience,
          team2: stats2.totalExperience,
          advantage: stats1.totalExperience > stats2.totalExperience ? 'team1' : 'team2'
        }
      }
    };

    setComparison(comparisonResult);
  };

  // Interface pour une équipe (mémorisée pour éviter les re-rendus)
  const TeamSection = memo(({ 
    team, 
    teamNumber, 
    inputRef,
    platform, 
    setPlatform, 
    loading, 
    searchFunction 
  }: {
    team: Team;
    teamNumber: 1 | 2;
    inputRef: React.RefObject<HTMLInputElement | null>;
    platform: Platform;
    setPlatform: (platform: Platform) => void;
    loading: boolean;
    searchFunction: () => void;
  }) => (
    <div className={`flex-1 bg-gradient-to-br ${team.color === 'blue' ? 'from-blue-900/20 to-blue-800/10' : 'from-red-900/20 to-red-800/10'} rounded-xl border ${team.color === 'blue' ? 'border-blue-500/30' : 'border-red-500/30'} p-6`}>
      {/* En-tête de l'équipe */}
      <div className="text-center mb-6">
        <h2 className={`text-2xl font-bold ${team.color === 'blue' ? 'text-blue-300' : 'text-red-300'} mb-2`}>
          {team.name}
        </h2>
        <div className={`text-sm ${team.color === 'blue' ? 'text-blue-400' : 'text-red-400'}`}>
          {team.players.length}/5 joueurs
        </div>
      </div>

      {/* Recherche de joueur */}
      <div className="mb-6 space-y-3">
        <div className="flex gap-2">
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as Platform)}
            className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white text-sm"
          >
            <option value="uplay">PC (Uplay)</option>
            <option value="playstation">PlayStation</option>
            <option value="xbox">Xbox</option>
          </select>
        </div>
        
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                searchFunction();
              }
            }}
            placeholder="Nom du joueur..."
            className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            disabled={loading}
            autoComplete="off"
          />
          <button
            onClick={searchFunction}
            disabled={loading}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              loading
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : team.color === 'blue'
                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                : 'bg-red-600 hover:bg-red-500 text-white'
            }`}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Ajouter'
            )}
          </button>
        </div>
      </div>

      {/* Liste des joueurs */}
      <div className="space-y-3">
        {team.players.map((player, index) => (
          <div key={index} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                {player.accountInfo.profilePicture && (
                  <Image
                    src={player.accountInfo.profilePicture}
                    alt={`Avatar de ${player.username}`}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                )}
                
                <div>
                  <div className="font-semibold text-white">{player.username}</div>
                  <div className="text-sm text-gray-400">
                    Niveau {player.accountInfo.level} • {player.platform.toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Rang et stats */}
              <div className="flex items-center gap-3">
                {player.rankedStats ? (
                  <>
                    <Image
                      src={getRankImage(player.rankedStats.profile.rank)}
                      alt="Rang"
                      width={32}
                      height={32}
                      className="rounded"
                    />
                    <div className="text-right text-sm">
                      <div className="text-white font-medium">
                        {player.rankedStats.profile.rank_points} MMR
                      </div>
                      <div className="text-gray-400">
                        K/D: {(player.rankedStats.season_statistics.deaths > 0 
                          ? player.rankedStats.season_statistics.kills / player.rankedStats.season_statistics.deaths 
                          : player.rankedStats.season_statistics.kills).toFixed(2)}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-gray-400">
                    Pas de stats ranked
                  </div>
                )}
                
                <button
                  onClick={() => removePlayer(teamNumber, index)}
                  className="p-1 text-red-400 hover:text-red-300 transition-colors"
                  title="Retirer de l'équipe"
                >
                  <i className="pi pi-times"></i>
                </button>
              </div>
            </div>
          </div>
        ))}

        {team.players.length === 0 && (
          <div className={`text-center py-8 text-gray-400 border-2 border-dashed ${team.color === 'blue' ? 'border-blue-600' : 'border-red-600'} rounded-lg`}>
            <i className="pi pi-users text-3xl mb-2 block"></i>
            Aucun joueur dans cette équipe
          </div>
        )}
      </div>
    </div>
  ));

  // Ajouter un displayName pour le composant mémorisé
  TeamSection.displayName = 'TeamSection';

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* En-tête */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">
          <i className="pi pi-users mr-3"></i>
          Comparaison d&apos;Équipes
        </h1>
        <p className="text-gray-300 text-lg">
          Comparez vos équipes et prédisez le résultat du match !
        </p>
      </div>

        {/* Interface principale : deux colonnes */}
        <div className="flex gap-8 mb-8">
          <TeamSection
            team={team1}
            teamNumber={1}
            inputRef={inputRef1}
            platform={platform1}
            setPlatform={setPlatform1}
            loading={loading1}
            searchFunction={searchPlayer1}
          />

          {/* VS au centre */}
          <div className="flex flex-col items-center justify-center px-4">
            <div className="text-6xl font-bold text-white mb-4">VS</div>
            <button
              onClick={compareTeams}
              disabled={team1.players.length === 0 || team2.players.length === 0}
              className={`px-6 py-3 rounded-xl font-bold text-lg transition-all ${
                team1.players.length === 0 || team2.players.length === 0
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              <i className="pi pi-bolt mr-2"></i>
              Comparer
            </button>
          </div>

          <TeamSection
            team={team2}
            teamNumber={2}
            inputRef={inputRef2}
            platform={platform2}
            setPlatform={setPlatform2}
            loading={loading2}
            searchFunction={searchPlayer2}
          />
        </div>

        {/* Résultats de la comparaison */}
        {comparison && (
          <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl border border-purple-500/30 p-8">
            <h2 className="text-3xl font-bold text-center text-white mb-8">
              <i className="pi pi-trophy mr-3 text-yellow-400"></i>
              Résultat de la Prédiction
            </h2>

            {/* Vainqueur et pourcentage */}
            <div className="text-center mb-8">
              <div className={`text-6xl font-bold mb-4 ${
                comparison.winner === 'team1' ? 'text-blue-400' : 
                comparison.winner === 'team2' ? 'text-red-400' : 'text-gray-400'
              }`}>
                {comparison.winner === 'team1' ? team1.name : 
                 comparison.winner === 'team2' ? team2.name : 'Match Égal'}
              </div>
              
              {comparison.winner !== 'tie' && (
                <div className="text-2xl text-white mb-4">
                  {comparison.winProbability.toFixed(1)}% de chances de victoire
                </div>
              )}

              {/* Barre de progression */}
              <div className="w-full max-w-md mx-auto bg-gray-700 rounded-full h-6 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${
                    comparison.winner === 'team1' ? 'bg-gradient-to-r from-blue-500 to-blue-400' :
                    comparison.winner === 'team2' ? 'bg-gradient-to-r from-red-500 to-red-400' :
                    'bg-gradient-to-r from-gray-500 to-gray-400'
                  }`}
                  style={{ 
                    width: comparison.winner === 'tie' ? '50%' : `${comparison.winProbability}%` 
                  }}
                ></div>
              </div>
            </div>

            {/* Statistiques détaillées */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* MMR moyen */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h3 className="text-lg font-bold text-white mb-3">MMR Moyen</h3>
                <div className="space-y-2">
                  <div className={`flex justify-between ${comparison.factors.avgMMR.advantage === 'team1' ? 'text-green-400' : 'text-gray-300'}`}>
                    <span>{team1.name}:</span>
                    <span className="font-bold">{comparison.factors.avgMMR.team1.toFixed(0)}</span>
                  </div>
                  <div className={`flex justify-between ${comparison.factors.avgMMR.advantage === 'team2' ? 'text-green-400' : 'text-gray-300'}`}>
                    <span>{team2.name}:</span>
                    <span className="font-bold">{comparison.factors.avgMMR.team2.toFixed(0)}</span>
                  </div>
                </div>
              </div>

              {/* K/D moyen */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h3 className="text-lg font-bold text-white mb-3">K/D Moyen</h3>
                <div className="space-y-2">
                  <div className={`flex justify-between ${comparison.factors.avgKD.advantage === 'team1' ? 'text-green-400' : 'text-gray-300'}`}>
                    <span>{team1.name}:</span>
                    <span className="font-bold">{comparison.factors.avgKD.team1.toFixed(2)}</span>
                  </div>
                  <div className={`flex justify-between ${comparison.factors.avgKD.advantage === 'team2' ? 'text-green-400' : 'text-gray-300'}`}>
                    <span>{team2.name}:</span>
                    <span className="font-bold">{comparison.factors.avgKD.team2.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Win Rate moyen */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h3 className="text-lg font-bold text-white mb-3">Win Rate Moyen</h3>
                <div className="space-y-2">
                  <div className={`flex justify-between ${comparison.factors.avgWinRate.advantage === 'team1' ? 'text-green-400' : 'text-gray-300'}`}>
                    <span>{team1.name}:</span>
                    <span className="font-bold">{(comparison.factors.avgWinRate.team1 * 100).toFixed(1)}%</span>
                  </div>
                  <div className={`flex justify-between ${comparison.factors.avgWinRate.advantage === 'team2' ? 'text-green-400' : 'text-gray-300'}`}>
                    <span>{team2.name}:</span>
                    <span className="font-bold">{(comparison.factors.avgWinRate.team2 * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Explication de l'algorithme */}
            <div className="mt-8 p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
              <h3 className="text-lg font-bold text-purple-300 mb-3">
                <i className="pi pi-info-circle mr-2"></i>
                Comment fonctionne la prédiction d&apos;équipe ?
              </h3>
              <div className="text-sm text-purple-200 space-y-1">
                <p>• <strong>MMR Moyen (40%)</strong> : Moyenne des rangs de l&apos;équipe</p>
                <p>• <strong>K/D Moyen (30%)</strong> : Capacité de frag collective</p>
                <p>• <strong>Win Rate Moyen (20%)</strong> : Capacité à gagner en équipe</p>
                <p>• <strong>Équilibrage des effectifs</strong> : Pénalité pour l&apos;équipe plus nombreuse</p>
                <p>• <strong>Expérience (10%)</strong> : Niveau et expérience combinée</p>
              </div>
              <div className="mt-3 text-xs text-purple-300">
                💡 L&apos;algorithme s&apos;adapte automatiquement aux effectifs déséquilibrés (1v2, 3v5, etc.)
              </div>
            </div>
          </div>
        )}
    </div>
  );
}