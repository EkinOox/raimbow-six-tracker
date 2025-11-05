'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { transformPlayerStats, getRankImage } from '@/utils/statsTransformer';
import type { R6DataAccountInfo, SimplePlayerStats } from '@/types/r6-data-types';

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const { user, isAuthenticated } = useAuth();
  
  const [playerInfo, setPlayerInfo] = useState<R6DataAccountInfo | null>(null);
  const [playerStats, setPlayerStats] = useState<SimplePlayerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [platform, setPlatform] = useState<'uplay' | 'playstation' | 'xbox'>('uplay');

  useEffect(() => {
    if (username) {
      fetchPlayerData(username, platform);
    }
  }, [username, platform]);

  const fetchPlayerData = async (playerUsername: string, playerPlatform: string) => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer les informations du compte
      const infoResponse = await fetch('/api/r6-data-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getAccountInfo',
          nameOnPlatform: playerUsername,
          platformType: playerPlatform,
        }),
      });
      
      if (!infoResponse.ok) {
        let errorMessage = 'Joueur non trouvé';
        try {
          const errorData = await infoResponse.json();
          errorMessage = errorData.error || errorData.details || errorMessage;
        } catch {
          // L'API a retourné du HTML ou un format non-JSON
          errorMessage = `Erreur ${infoResponse.status}: Le joueur n'existe pas ou l'API est indisponible`;
        }
        throw new Error(errorMessage);
      }

      let infoResult;
      try {
        const jsonResponse = await infoResponse.json();
        // L'API proxy retourne { success: true, data: {...} }
        infoResult = jsonResponse.data || jsonResponse;
      } catch (parseError) {
        console.error('Erreur parsing JSON info:', parseError);
        throw new Error('Réponse invalide de l\'API. Vérifiez le nom d\'utilisateur.');
      }
      
      if (infoResult) {
        setPlayerInfo(infoResult);
      }

      // Récupérer les statistiques
      const statsResponse = await fetch('/api/r6-data-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getPlayerStats',
          nameOnPlatform: playerUsername,
          platformType: playerPlatform,
          platform_families: playerPlatform === 'pc' || playerPlatform === 'uplay' ? 'pc' : 'console',
        }),
      });
      
      if (statsResponse.ok) {
        try {
          const jsonResponse = await statsResponse.json();
          // L'API proxy retourne { success: true, data: {...} }
          const statsResult = jsonResponse.data || jsonResponse;
          
          if (process.env.NODE_ENV === 'development') {
            console.log('📊 Données brutes de l\'API:', JSON.stringify(statsResult, null, 2));
          }
          
          if (statsResult) {
            if (process.env.NODE_ENV === 'development') {
              console.log('🔄 Transformation des stats...');
            }
            const transformedStats = transformPlayerStats(statsResult);
            if (process.env.NODE_ENV === 'development') {
              console.log('✅ Stats transformées:', JSON.stringify(transformedStats, null, 2));
            }
            setPlayerStats(transformedStats);
          }
        } catch (parseError) {
          console.error('Erreur parsing JSON stats:', parseError);
          // Les stats sont optionnelles, on continue sans elles
        }
      }
    } catch (err) {
      let errorMessage = 'Erreur lors du chargement des données';
      
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Rendre le message plus explicite pour les erreurs JSON
        if (errorMessage.includes('JSON') || errorMessage.includes('Unexpected token')) {
          errorMessage = `Le joueur "${playerUsername}" est introuvable sur ${playerPlatform}. Vérifiez l'orthographe et la plateforme.`;
        }
      }
      
      setError(errorMessage);
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark py-24 px-4 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="inline-block mb-4"
          >
            <i className="pi pi-spin pi-spinner text-5xl text-r6-primary"></i>
          </motion.div>
          <p className="text-r6-light text-lg">Chargement des statistiques de {username}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-dark py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8"
          >
            <i className="pi pi-exclamation-triangle text-5xl text-red-400 mb-4"></i>
            <h2 className="text-2xl font-bold text-red-400 mb-2">Joueur non trouvé</h2>
            <p className="text-r6-light/80 mb-2">{error}</p>
            
            <div className="mt-6 p-5 bg-r6-dark/50 rounded-lg text-left border border-orange-500/20">
              <div className="flex items-start space-x-3 mb-3">
                <i className="pi pi-lightbulb text-orange-400 text-xl flex-shrink-0 mt-1"></i>
                <div>
                  <p className="text-sm font-semibold text-orange-400 mb-2">Conseils de recherche</p>
                  <ul className="text-sm text-r6-light/80 space-y-2">
                    <li className="flex items-start">
                      <span className="text-r6-primary mr-2">•</span>
                      <span>Vérifiez l&apos;orthographe exacte du nom d&apos;utilisateur</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-r6-primary mr-2">•</span>
                      <span>Assurez-vous de sélectionner la bonne plateforme (PC/Uplay, PlayStation, Xbox)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-r6-primary mr-2">•</span>
                      <span>Le nom doit correspondre <strong>exactement</strong> au nom Ubisoft Connect</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-r6-primary mr-2">•</span>
                      <span>Respectez les majuscules, minuscules et caractères spéciaux</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-r6-primary mr-2">•</span>
                      <span>Si le profil est privé ou récent, il peut ne pas être accessible</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Sélecteur de plateforme */}
            <div className="mt-6 p-4 bg-glass-bg-dark/50 rounded-lg">
              <p className="text-sm text-r6-light/60 mb-3">Essayez une autre plateforme :</p>
              <div className="flex gap-3 justify-center flex-wrap">
                {(['uplay', 'playstation', 'xbox'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setPlatform(p);
                      setError(null);
                      fetchPlayerData(username, p);
                    }}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      platform === p
                        ? 'bg-r6-primary text-white'
                        : 'bg-glass-bg-dark/50 text-r6-light hover:bg-glass-bg-dark'
                    }`}
                  >
                    {p === 'uplay' ? 'PC/Uplay' : p === 'playstation' ? 'PlayStation' : 'Xbox'}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex gap-4 justify-center flex-wrap mt-6">
              <button
                onClick={() => fetchPlayerData(username, platform)}
                className="px-6 py-3 bg-r6-primary hover:bg-r6-primary/80 text-white rounded-lg transition-all flex items-center"
              >
                <i className="pi pi-refresh mr-2"></i>
                Réessayer
              </button>
              <Link
                href="/search"
                className="px-6 py-3 bg-glass-bg-dark/50 hover:bg-glass-bg-dark text-r6-light rounded-lg transition-all flex items-center"
              >
                <i className="pi pi-search mr-2"></i>
                Rechercher un joueur
              </Link>
              <Link
                href="/"
                className="px-6 py-3 bg-glass-bg-dark/50 hover:bg-glass-bg-dark text-r6-light rounded-lg transition-all flex items-center"
              >
                <i className="pi pi-home mr-2"></i>
                Retour à l&apos;accueil
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!playerInfo || !playerStats) return null;

  const displayUsername = playerInfo.profiles?.[0]?.nameOnPlatform || username;
  const rankImage = getRankImage(playerStats.ranked.rankId);
  const maxRankImage = getRankImage(playerStats.ranked.maxRankId);

  return (
    <div className="min-h-screen bg-gradient-dark py-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Profile */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-glass-bg-dark/90 backdrop-blur-glass border border-glass-border-dark rounded-2xl p-8 mb-8 overflow-hidden liquid-glass liquid-glass-hover"
        >
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div
              className="absolute w-full h-full"
              animate={{
                background: `radial-gradient(600px circle at 50% 50%, rgba(255, 169, 0, 0.08), rgba(255, 69, 0, 0.05), transparent 80%)`,
              }}
            />
          </div>

          <div className="relative z-10 flex items-center justify-between flex-wrap gap-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-2xl bg-gradient-r6 p-1 flex-shrink-0">
                <div className="w-full h-full rounded-xl bg-r6-dark flex items-center justify-center">
                  {playerInfo.profilePicture ? (
                    <Image src={playerInfo.profilePicture} alt={displayUsername} width={88} height={88} className="rounded-xl" />
                  ) : (
                    <i className="pi pi-user text-4xl text-r6-primary"></i>
                  )}
                </div>
              </div>

              <div>
                <h1 className="text-4xl font-bold text-r6-light mb-2">{displayUsername}</h1>
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="text-sm px-3 py-1 bg-r6-primary/20 text-r6-primary rounded-full border border-r6-primary/30">
                    <i className="pi pi-desktop mr-2"></i>
                    {platform.toUpperCase()}
                  </span>
                  <span className="text-sm px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
                    <i className="pi pi-star mr-2"></i>
                    Niveau {playerInfo.level}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {(['uplay', 'playstation', 'xbox'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    platform === p ? 'bg-r6-primary text-white' : 'bg-glass-bg-dark/50 text-r6-light/60 hover:text-r6-light'
                  }`}
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Overview Cards - Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-orange-500/20 to-orange-600/5 backdrop-blur-glass border border-orange-500/30 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <i className="pi pi-crosshairs text-3xl text-orange-400"></i>
              <span className="text-sm text-r6-light/60">Global</span>
            </div>
            <p className="text-4xl font-bold text-r6-light mb-1">{playerStats.general.kd.toFixed(2)}</p>
            <p className="text-r6-light/80 text-sm">K/D Ratio</p>
            <div className="mt-3 pt-3 border-t border-orange-500/20">
              <p className="text-xs text-r6-light/60">{playerStats.general.kills.toLocaleString()} kills · {playerStats.general.deaths.toLocaleString()} morts</p>
              <p className="text-xs text-r6-light/50 mt-1">{playerStats.general.totalMatches.toLocaleString()} matchs joués</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-gradient-to-br from-blue-500/20 to-blue-600/5 backdrop-blur-glass border border-blue-500/30 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <i className="pi pi-chart-bar text-3xl text-blue-400"></i>
              <span className="text-sm text-r6-light/60">Global</span>
            </div>
            <p className="text-4xl font-bold text-r6-light mb-1">{playerStats.general.winRate}%</p>
            <p className="text-r6-light/80 text-sm">Taux de victoire</p>
            <div className="mt-3 pt-3 border-t border-blue-500/20">
              <p className="text-xs text-r6-light/60">
                {playerStats.ranked.wins + playerStats.casual.wins} victoires · {playerStats.ranked.losses + playerStats.casual.losses} défaites
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-purple-500/20 to-purple-600/5 backdrop-blur-glass border border-purple-500/30 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <i className="pi pi-trophy text-3xl text-yellow-400"></i>
              <span className="text-sm text-r6-light/60">Ranked</span>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <Image src={rankImage} alt={playerStats.ranked.rankName} width={48} height={48} className="drop-shadow-lg" />
              <div>
                <p className="text-2xl font-bold text-r6-light">{playerStats.ranked.mmr}</p>
                <p className="text-r6-light/80 text-sm">{playerStats.ranked.rankName}</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-purple-500/20">
              <div className="flex items-center gap-2">
                <Image src={maxRankImage} alt={playerStats.ranked.maxRankName} width={20} height={20} className="opacity-60" />
                <p className="text-xs text-r6-light/60">Max: {playerStats.ranked.maxMmr} ({playerStats.ranked.maxRankName})</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Ranked Stats - Detailed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-glass-bg-dark/90 backdrop-blur-glass border border-glass-border-dark rounded-2xl p-8 mb-8 liquid-glass liquid-glass-hover"
        >
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/5 border border-yellow-500/30 flex items-center justify-center">
                <i className="pi pi-trophy text-2xl text-yellow-400"></i>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-r6-light">Mode Ranked</h2>
                <p className="text-sm text-r6-light/60">Statistiques classées compétitives</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Image src={rankImage} alt={playerStats.ranked.rankName} width={80} height={80} className="drop-shadow-2xl" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              icon="pi-crosshairs" 
              label="K/D Ratio" 
              value={playerStats.ranked.kd.toFixed(2)} 
              subValue={`${playerStats.ranked.kills} / ${playerStats.ranked.deaths}`} 
              color="orange" 
            />
            <StatCard 
              icon="pi-percentage" 
              label="Win Rate" 
              value={`${playerStats.ranked.winRate}%`} 
              subValue={`${playerStats.ranked.wins}W / ${playerStats.ranked.losses}L`} 
              color="blue" 
            />
            <StatCard 
              icon="pi-bolt" 
              label="Total Kills" 
              value={playerStats.ranked.kills.toLocaleString()} 
              subValue="Éliminations"
              color="red" 
            />
            <StatCard 
              icon="pi-check-circle" 
              label="Victoires" 
              value={playerStats.ranked.wins.toString()} 
              subValue={`${playerStats.ranked.wins + playerStats.ranked.losses} matchs`}
              color="green" 
            />
          </div>

          {/* Additional Ranked Info */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-glass-bg-dark/50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <i className="pi pi-exclamation-triangle text-yellow-500"></i>
                <span className="text-sm text-r6-light/80">Abandons</span>
              </div>
              <p className="text-2xl font-bold text-r6-light">{playerStats.ranked.abandons}</p>
              <p className="text-xs text-r6-light/60 mt-1">
                {((playerStats.ranked.abandons / (playerStats.ranked.wins + playerStats.ranked.losses + playerStats.ranked.abandons)) * 100).toFixed(1)}% des matchs
              </p>
            </div>
            
            {playerStats.ranked.topRankPosition > 0 && (
              <div className="p-4 bg-gradient-to-br from-yellow-500/20 to-yellow-600/5 border border-yellow-500/30 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <i className="pi pi-star-fill text-yellow-400"></i>
                  <span className="text-sm text-r6-light/80">Top Rank Position</span>
                </div>
                <p className="text-2xl font-bold text-yellow-400">#{playerStats.ranked.topRankPosition.toLocaleString()}</p>
                <p className="text-xs text-r6-light/60 mt-1">Meilleur classement</p>
              </div>
            )}
            
            <div className="p-4 bg-glass-bg-dark/50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <i className="pi pi-calendar text-blue-400"></i>
                <span className="text-sm text-r6-light/80">Saison</span>
              </div>
              <p className="text-2xl font-bold text-r6-light">Saison {playerStats.ranked.seasonId}</p>
              <p className="text-xs text-r6-light/60 mt-1">Saison actuelle</p>
            </div>
          </div>

          {/* Ranked Performance Bar */}
          <div className="mt-6 p-4 bg-glass-bg-dark/50 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-r6-light/80">Performance</span>
              <span className="text-sm text-r6-light/60">
                {((playerStats.ranked.wins / (playerStats.ranked.wins + playerStats.ranked.losses)) * 100).toFixed(1)}% victoires
              </span>
            </div>
            <div className="w-full bg-r6-dark/50 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(playerStats.ranked.wins / (playerStats.ranked.wins + playerStats.ranked.losses)) * 100}%` }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="h-full bg-gradient-to-r from-green-500 to-blue-500"
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-r6-light/60">
              <span>{playerStats.ranked.wins} victoires</span>
              <span>{playerStats.ranked.losses} défaites</span>
            </div>
          </div>
        </motion.div>

        {/* Casual/Standard Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-glass-bg-dark/90 backdrop-blur-glass border border-glass-border-dark rounded-2xl p-8 mb-8 liquid-glass liquid-glass-hover"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/5 border border-purple-500/30 flex items-center justify-center">
              <i className="pi pi-users text-2xl text-purple-400"></i>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-r6-light">Mode Standard (Casual)</h2>
              <p className="text-sm text-r6-light/60">Parties rapides et détente</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              icon="pi-crosshairs" 
              label="K/D Ratio" 
              value={playerStats.casual.kd.toFixed(2)} 
              subValue={`${playerStats.casual.kills} / ${playerStats.casual.deaths}`} 
              color="orange" 
            />
            <StatCard 
              icon="pi-percentage" 
              label="Win Rate" 
              value={`${playerStats.casual.winRate}%`} 
              subValue={`${playerStats.casual.wins}W / ${playerStats.casual.losses}L`} 
              color="blue" 
            />
            <StatCard 
              icon="pi-bolt" 
              label="Total Kills" 
              value={playerStats.casual.kills.toLocaleString()} 
              subValue="Éliminations"
              color="red" 
            />
            <StatCard 
              icon="pi-check-circle" 
              label="Victoires" 
              value={playerStats.casual.wins.toString()} 
              subValue={`${playerStats.casual.wins + playerStats.casual.losses} matchs`}
              color="green" 
            />
          </div>

          {/* Casual abandons */}
          {playerStats.casual.abandons > 0 && (
            <div className="mt-6 p-4 bg-glass-bg-dark/50 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <i className="pi pi-exclamation-triangle text-yellow-500"></i>
                  <span className="text-sm text-r6-light/80">Abandons</span>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-r6-light">{playerStats.casual.abandons}</p>
                  <p className="text-xs text-r6-light/60">
                    {((playerStats.casual.abandons / (playerStats.casual.wins + playerStats.casual.losses + playerStats.casual.abandons)) * 100).toFixed(1)}% des matchs
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Casual Performance Bar */}
          <div className="mt-6 p-4 bg-glass-bg-dark/50 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-r6-light/80">Performance</span>
              <span className="text-sm text-r6-light/60">
                {((playerStats.casual.wins / (playerStats.casual.wins + playerStats.casual.losses)) * 100).toFixed(1)}% victoires
              </span>
            </div>
            <div className="w-full bg-r6-dark/50 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(playerStats.casual.wins / (playerStats.casual.wins + playerStats.casual.losses)) * 100}%` }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-r6-light/60">
              <span>{playerStats.casual.wins} victoires</span>
              <span>{playerStats.casual.losses} défaites</span>
            </div>
          </div>
        </motion.div>

        {/* Event/Arcade Mode Stats - Si disponible */}
        {playerStats.event && (playerStats.event.wins > 0 || playerStats.event.losses > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-glass-bg-dark/90 backdrop-blur-glass border border-glass-border-dark rounded-2xl p-8 mb-8 liquid-glass liquid-glass-hover"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500/20 to-pink-600/5 border border-pink-500/30 flex items-center justify-center">
                <i className="pi pi-sparkles text-2xl text-pink-400"></i>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-r6-light">Mode Événement / Arcade</h2>
                <p className="text-sm text-r6-light/60">Modes de jeu spéciaux et événements</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard 
                icon="pi-crosshairs" 
                label="K/D Ratio" 
                value={playerStats.event.kd.toFixed(2)} 
                subValue={`${playerStats.event.kills} / ${playerStats.event.deaths}`} 
                color="orange" 
              />
              <StatCard 
                icon="pi-percentage" 
                label="Win Rate" 
                value={`${playerStats.event.winRate}%`} 
                subValue={`${playerStats.event.wins}W / ${playerStats.event.losses}L`} 
                color="blue" 
              />
              <StatCard 
                icon="pi-bolt" 
                label="Total Kills" 
                value={playerStats.event.kills.toLocaleString()} 
                subValue="Éliminations"
                color="red" 
              />
              <StatCard 
                icon="pi-check-circle" 
                label="Victoires" 
                value={playerStats.event.wins.toString()} 
                subValue={`${playerStats.event.wins + playerStats.event.losses} matchs`}
                color="purple" 
              />
            </div>

            <div className="mt-6 p-4 bg-glass-bg-dark/50 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-r6-light/80">Performance Événement</span>
                <span className="text-sm text-r6-light/60">
                  {((playerStats.event.wins / (playerStats.event.wins + playerStats.event.losses)) * 100).toFixed(1)}% victoires
                </span>
              </div>
              <div className="w-full bg-r6-dark/50 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(playerStats.event.wins / (playerStats.event.wins + playerStats.event.losses)) * 100}%` }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                  className="h-full bg-gradient-to-r from-pink-500 to-purple-500"
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-r6-light/60">
                <span>{playerStats.event.wins} victoires</span>
                <span>{playerStats.event.losses} défaites</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Comparison Ranked vs Casual */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-glass-bg-dark/90 backdrop-blur-glass border border-glass-border-dark rounded-2xl p-8 mb-8 liquid-glass liquid-glass-hover"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/5 border border-blue-500/30 flex items-center justify-center">
              <i className="pi pi-chart-line text-2xl text-blue-400"></i>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-r6-light">Comparaison des modes</h2>
              <p className="text-sm text-r6-light/60">Analyse de performance par mode de jeu</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* K/D Comparison */}
            <div className="p-6 bg-glass-bg-dark/50 rounded-xl">
              <h3 className="text-lg font-semibold text-r6-light mb-4 flex items-center gap-2">
                <i className="pi pi-crosshairs text-orange-400"></i>
                K/D Ratio
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-r6-light/80">Ranked</span>
                    <span className="text-sm font-bold text-yellow-400">{playerStats.ranked.kd.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-r6-dark/50 rounded-full h-2">
                    <div 
                      className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
                      style={{ width: `${Math.min((playerStats.ranked.kd / 3) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-r6-light/80">Casual</span>
                    <span className="text-sm font-bold text-purple-400">{playerStats.casual.kd.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-r6-dark/50 rounded-full h-2">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      style={{ width: `${Math.min((playerStats.casual.kd / 3) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Win Rate Comparison */}
            <div className="p-6 bg-glass-bg-dark/50 rounded-xl">
              <h3 className="text-lg font-semibold text-r6-light mb-4 flex items-center gap-2">
                <i className="pi pi-percentage text-blue-400"></i>
                Taux de victoire
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-r6-light/80">Ranked</span>
                    <span className="text-sm font-bold text-yellow-400">{playerStats.ranked.winRate}%</span>
                  </div>
                  <div className="w-full bg-r6-dark/50 rounded-full h-2">
                    <div 
                      className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
                      style={{ width: `${playerStats.ranked.winRate}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-r6-light/80">Casual</span>
                    <span className="text-sm font-bold text-purple-400">{playerStats.casual.winRate}%</span>
                  </div>
                  <div className="w-full bg-r6-dark/50 rounded-full h-2">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      style={{ width: `${playerStats.casual.winRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Total Stats Summary */}
          <div className="mt-6 p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl">
            <h3 className="text-lg font-semibold text-r6-light mb-4">📊 Totaux globaux</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-r6-primary">{playerStats.general.kills.toLocaleString()}</p>
                <p className="text-sm text-r6-light/60 mt-1">Total Kills</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-red-400">{playerStats.general.deaths.toLocaleString()}</p>
                <p className="text-sm text-r6-light/60 mt-1">Total Morts</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-400">{(playerStats.ranked.wins + playerStats.casual.wins).toLocaleString()}</p>
                <p className="text-sm text-r6-light/60 mt-1">Total Victoires</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-400">{(playerStats.ranked.wins + playerStats.ranked.losses + playerStats.casual.wins + playerStats.casual.losses + (playerStats.event?.wins || 0) + (playerStats.event?.losses || 0)).toLocaleString()}</p>
                <p className="text-sm text-r6-light/60 mt-1">Total Matchs</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-8 flex gap-4 justify-center flex-wrap">
          <Link href="/search" className="px-6 py-3 bg-r6-primary hover:bg-r6-primary/80 text-white rounded-lg transition-all flex items-center gap-2">
            <i className="pi pi-search"></i>
            Rechercher un autre joueur
          </Link>
          <Link href="/comparaison" className="px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 rounded-lg transition-all flex items-center gap-2">
            <i className="pi pi-arrow-right-arrow-left"></i>
            Comparer des joueurs
          </Link>
          {isAuthenticated && user && (
            <Link href="/dashboard-new" className="px-6 py-3 bg-glass-bg-dark/50 hover:bg-glass-bg-dark text-r6-light rounded-lg transition-all flex items-center gap-2">
              <i className="pi pi-chart-bar"></i>
              Ma Dashboard
            </Link>
          )}
        </motion.div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  subValue?: string;
  color: 'orange' | 'blue' | 'red' | 'green' | 'purple';
}

function StatCard({ icon, label, value, subValue, color }: StatCardProps) {
  const colors = {
    orange: 'from-orange-500/20 to-orange-600/5 border-orange-500/30 text-orange-400',
    blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/30 text-blue-400',
    red: 'from-red-500/20 to-red-600/5 border-red-500/30 text-red-400',
    green: 'from-green-500/20 to-green-600/5 border-green-500/30 text-green-400',
    purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/30 text-purple-400',
  };

  return (
    <motion.div whileHover={{ scale: 1.02, y: -2 }} className={`bg-gradient-to-br ${colors[color]} border rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-2">
        <i className={`pi ${icon} text-lg`}></i>
        <span className="text-r6-light/80 text-sm">{label}</span>
      </div>
      <p className="text-2xl font-bold text-r6-light">{value}</p>
      {subValue && <p className="text-xs text-r6-light/60 mt-1">{subValue}</p>}
    </motion.div>
  );
}
