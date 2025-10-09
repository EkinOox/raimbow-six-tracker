'use client'

const platforms: { value: Platform; label: string; icon: string }[] = [
  { value: 'uplay', label: 'PC (Uplay)', icon: 'pi pi-desktop' },
  { value: 'steam', label: 'Steam', icon: 'pi pi-desktop' },
  { value: 'playstation', label: 'PlayStation', icon: 'pi pi-play' },
  { value: 'xbox', label: 'Xbox', icon: 'pi pi-box' },
];

import { useState } from 'react';
import { Platform, CompletePlayerData } from '../types/r6-data-types';
import Image from 'next/image';
import 'primeicons/primeicons.css';

export default function PlayerSearch() {
  const [username, setUsername] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('uplay');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playerData, setPlayerData] = useState<CompletePlayerData | null>(null);
  const [imageError, setImageError] = useState(false);

  const validateUsername = (username: string): string | null => {
    if (!username || username.trim().length === 0) {
      return 'Le nom d\'utilisateur est requis';
    }
    if (username.trim().length < 3) {
      return 'Le nom d\'utilisateur doit contenir au moins 3 caractÃ¨res';
    }
    if (username.trim().length > 15) {
      return 'Le nom d\'utilisateur ne peut pas dÃ©passer 15 caractÃ¨res';
    }
    return null;
  };

  const handleSearch = async () => {
    const validation = validateUsername(username.trim());
    if (validation) {
      setError(validation);
      return;
    }

    setIsLoading(true);
    setError(null);
    setPlayerData(null);
    setImageError(false); // Reset l'erreur d'image pour le nouveau joueur

    try {
      console.log(`🔍 Recherche de ${username} sur ${selectedPlatform}...`);
      
      const response = await fetch(`/api/r6?username=${encodeURIComponent(username.trim())}&platform=${selectedPlatform}&type=complete`);
      
      console.log('📡 Réponse API reçue:', response.status, response.statusText);
      
      const result = await response.json();
      console.log('📊 Données de réponse:', result);

      if (!result.success) {
        throw new Error(result.details || result.error || 'Erreur lors de la recherche');
      }

      console.log('✅ Données de joueur:', result.data);
      console.log('🔍 DEBUG - Structure des données reçues:');
      console.log('  - Info:', result.data?.info);
      console.log('  - Stats:', result.data?.stats);
      console.log('  - Stats.general:', result.data?.stats?.general);
      console.log('  - Stats.ranked:', result.data?.stats?.ranked);
      console.log('  - Stats.casual:', result.data?.stats?.casual);
      
      setPlayerData(result.data);
    } catch (error) {
      console.error('❌ Erreur lors de la recherche:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de la recherche');
    } finally {
      setIsLoading(false);
    }
  };

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
                />
                <button
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium rounded-lg"
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

        {playerData && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
            <div className="flex items-center space-x-4 mb-6">
              {playerData?.info?.profilePicture && !imageError ? (
                <Image 
                  src={playerData.info.profilePicture} 
                  alt={`Avatar de ${playerData.info.username}`}
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-lg border border-white/20 object-cover"
                  onError={() => setImageError(true)}
                  unoptimized={true}
                />
              ) : (
                <div className="w-16 h-16 rounded-lg border border-white/20 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-xl font-bold">
                    {playerData?.info?.username?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {playerData?.info?.username || username}
                </h2>
                <p className="text-white/70">
                  {playerData?.info?.level ? `Niveau ${playerData.info.level}` : 'Niveau inconnu'} â€¢ {playerData?.info?.platform || selectedPlatform}
                </p>
              </div>
            </div>

            {(!playerData?.stats || Object.keys(playerData.stats).length === 0) ? (
              <div className="text-center py-8">
                <p className="text-white/60">
                  Les données de statistiques ne sont pas disponibles pour ce joueur.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Statistiques Générales */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <i className="pi pi-chart-bar mr-2 text-blue-400"></i>
                    Statistiques Générales
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/5 rounded-lg p-4 text-center">
                      <div className="text-sm text-white/60 mb-1 flex items-center justify-center">
                        <i className="pi pi-target mr-1"></i>
                        Éliminations
                      </div>
                      <div className="text-2xl font-bold text-green-400">
                        {playerData?.stats?.general?.kills?.toLocaleString() || 0}
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 text-center">
                      <div className="text-sm text-white/60 mb-1 flex items-center justify-center">
                        <i className="pi pi-times-circle mr-1"></i>
                        Morts
                      </div>
                      <div className="text-2xl font-bold text-red-400">
                        {playerData?.stats?.general?.deaths?.toLocaleString() || 0}
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 text-center">
                      <div className="text-sm text-white/60 mb-1 flex items-center justify-center">
                        <i className="pi pi-percentage mr-1"></i>
                        K/D Ratio
                      </div>
                      <div className="text-2xl font-bold text-yellow-400">
                        {playerData?.stats?.general?.kd || '0.00'}
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 text-center">
                      <div className="text-sm text-white/60 mb-1 flex items-center justify-center">
                        <i className="pi pi-check-circle mr-1"></i>
                        Taux de Victoire
                      </div>
                      <div className="text-2xl font-bold text-purple-400">
                        {playerData?.stats?.general?.winRate || 0}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistiques Ranked */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <i className="pi pi-trophy mr-2 text-yellow-400"></i>
                    Statistiques Ranked
                  </h3>
                  <div className="bg-white/5 rounded-lg p-6">
                    {/* Rang et MMR */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="text-center">
                        <div className="text-sm text-white/60 mb-2 flex items-center justify-center">
                          <i className="pi pi-star mr-1"></i>
                          Rang Actuel
                        </div>
                        <div className="text-3xl font-bold text-orange-400 mb-1">
                          {playerData?.stats?.ranked?.rankName || 'Non classé'}
                        </div>
                        <div className="text-lg text-blue-400">
                          {playerData?.stats?.ranked?.mmr ? `${playerData.stats.ranked.mmr} MMR` : 'MMR inconnu'}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-white/60 mb-2 flex items-center justify-center">
                          <i className="pi pi-crown mr-1"></i>
                          Meilleur Rang
                        </div>
                        <div className="text-3xl font-bold text-yellow-400 mb-1">
                          {playerData?.stats?.ranked?.maxRankName || 'Non classé'}
                        </div>
                        <div className="text-lg text-blue-400">
                          {playerData?.stats?.ranked?.maxMmr ? `${playerData.stats.ranked.maxMmr} MMR` : 'MMR inconnu'}
                        </div>
                      </div>
                    </div>

                    {/* Stats Ranked détaillées */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-sm text-white/60 mb-1">Victoires</div>
                        <div className="text-xl font-bold text-green-400">
                          {playerData?.stats?.ranked?.wins?.toLocaleString() || 0}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-white/60 mb-1">Défaites</div>
                        <div className="text-xl font-bold text-red-400">
                          {playerData?.stats?.ranked?.losses?.toLocaleString() || 0}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-white/60 mb-1">K/D Ranked</div>
                        <div className="text-xl font-bold text-yellow-400">
                          {playerData?.stats?.ranked?.kd || '0.00'}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-white/60 mb-1">Win Rate</div>
                        <div className="text-xl font-bold text-purple-400">
                          {playerData?.stats?.ranked?.winRate || 0}%
                        </div>
                      </div>
                    </div>

                    {/* Kills/Deaths Ranked */}
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="text-center">
                        <div className="text-sm text-white/60 mb-1">Kills Ranked</div>
                        <div className="text-xl font-bold text-green-400">
                          {playerData?.stats?.ranked?.kills?.toLocaleString() || 0}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-white/60 mb-1">Deaths Ranked</div>
                        <div className="text-xl font-bold text-red-400">
                          {playerData?.stats?.ranked?.deaths?.toLocaleString() || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistiques Casual */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <i className="pi pi-users mr-2 text-green-400"></i>
                    Statistiques Casual
                  </h3>
                  <div className="bg-white/5 rounded-lg p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-sm text-white/60 mb-1">Victoires</div>
                        <div className="text-xl font-bold text-green-400">
                          {playerData?.stats?.casual?.wins?.toLocaleString() || 0}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-white/60 mb-1">Défaites</div>
                        <div className="text-xl font-bold text-red-400">
                          {playerData?.stats?.casual?.losses?.toLocaleString() || 0}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-white/60 mb-1">K/D Casual</div>
                        <div className="text-xl font-bold text-yellow-400">
                          {playerData?.stats?.casual?.kd || '0.00'}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-white/60 mb-1">Win Rate</div>
                        <div className="text-xl font-bold text-purple-400">
                          {playerData?.stats?.casual?.winRate || 0}%
                        </div>
                      </div>
                    </div>

                    {/* Kills/Deaths Casual */}
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="text-center">
                        <div className="text-sm text-white/60 mb-1">Kills Casual</div>
                        <div className="text-xl font-bold text-green-400">
                          {playerData?.stats?.casual?.kills?.toLocaleString() || 0}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-white/60 mb-1">Deaths Casual</div>
                        <div className="text-xl font-bold text-red-400">
                          {playerData?.stats?.casual?.deaths?.toLocaleString() || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Résumé comparatif */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <i className="pi pi-chart-line mr-2 text-purple-400"></i>
                    Résumé Comparatif
                  </h3>
                  <div className="bg-white/5 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-sm text-white/60 mb-2 flex items-center justify-center">
                          <i className="pi pi-calendar mr-1"></i>
                          Total Matches
                        </div>
                        <div className="text-2xl font-bold text-blue-400">
                          {((playerData?.stats?.ranked?.wins || 0) + 
                            (playerData?.stats?.ranked?.losses || 0) + 
                            (playerData?.stats?.casual?.wins || 0) + 
                            (playerData?.stats?.casual?.losses || 0)).toLocaleString()}
                        </div>
                        <div className="text-xs text-white/50">
                          Ranked: {((playerData?.stats?.ranked?.wins || 0) + (playerData?.stats?.ranked?.losses || 0)).toLocaleString()} | 
                          Casual: {((playerData?.stats?.casual?.wins || 0) + (playerData?.stats?.casual?.losses || 0)).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-white/60 mb-2 flex items-center justify-center">
                          <i className="pi pi-heart mr-1"></i>
                          Préférence de Mode
                        </div>
                        <div className="text-2xl font-bold text-purple-400">
                          {((playerData?.stats?.ranked?.wins || 0) + (playerData?.stats?.ranked?.losses || 0)) > 
                           ((playerData?.stats?.casual?.wins || 0) + (playerData?.stats?.casual?.losses || 0)) 
                           ? 'Ranked' : 'Casual'}
                        </div>
                        <div className="text-xs text-white/50">
                          Basé sur le nombre de matches
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-white/60 mb-2 flex items-center justify-center">
                          <i className="pi pi-clock mr-1"></i>
                          Dernière Mise à Jour
                        </div>
                        <div className="text-lg font-bold text-gray-400">
                          {playerData?.lastUpdated ? 
                            new Date(playerData.lastUpdated).toLocaleDateString('fr-FR') : 
                            'Inconnue'}
                        </div>
                        <div className="text-xs text-white/50">
                          {playerData?.lastUpdated ? 
                            new Date(playerData.lastUpdated).toLocaleTimeString('fr-FR') : 
                            'Heure inconnue'}
                        </div>
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
