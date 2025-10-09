'use client';

// Page Maps avec Redux
// Encodage: UTF-8

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import SectionHeader from '../../components/ui/SectionHeader';
import { useMaps } from '../../hooks/useR6Data';
import { MapFilters, Map } from '../../types/r6-api-types';

const playlists = ['Tous', 'Ranked', 'Standard', 'Team Deathmatch', 'Quick Match'];

export default function MapsPage() {
  const { maps, loading, error, loadMaps, updateFilters, filters, loadMapImage } = useMaps();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState('Tous');

    // Charger les maps au montage du composant
  useEffect(() => {
    loadMaps();
  }, [loadMaps]);

  // Charger les images pour toutes les cartes
  useEffect(() => {
    if (maps && maps.length > 0) {
      maps.forEach(map => {
        if (!map.imageLoaded) {
          loadMapImage(map.name);
        }
      });
    }
  }, [maps, loadMapImage]);

  // Appliquer les filtres quand ils changent
  useEffect(() => {
    const applyFilters = () => {
      const newFilters: MapFilters = {};
      
      if (searchTerm.trim()) {
        newFilters.name = searchTerm.trim();
      }
      if (selectedPlaylist !== 'Tous') {
        newFilters.playlists = selectedPlaylist;
      }
      
      updateFilters(newFilters);
    };

    const debounce = setTimeout(() => {
      applyFilters();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchTerm, selectedPlaylist, updateFilters]);

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* En-tête */}
        <SectionHeader
          title="Maps"
          description="Explorez toutes les cartes Rainbow Six Siege avec leurs détails, localisations et modes de jeu disponibles."
          icon="pi-map"
          useLogo={true}
        />

        {/* Barre de recherche et filtres */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Barre de recherche */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white/80 mb-2">
                Rechercher une carte
              </label>
              <div className="relative">
                <i className="pi pi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50"></i>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Ex: Oregon, Villa..."
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Filtre par playlist */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Mode de jeu
              </label>
              <select
                value={selectedPlaylist}
                onChange={(e) => setSelectedPlaylist(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                {playlists.map(playlist => (
                  <option key={playlist} value={playlist} className="bg-gray-800">
                    {playlist}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Statistiques de filtrage */}
          <div className="mt-4 flex items-center justify-between text-sm text-white/60">
            <span>
              {loading ? 'Chargement...' : `${maps?.length || 0} carte(s) trouvée(s)`}
            </span>
            {Object.keys(filters).length > 0 && (
              <button
                onClick={() => updateFilters({})}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                <i className="pi pi-times mr-1"></i>
                Effacer les filtres
              </button>
            )}
          </div>
        </motion.div>

        {/* Affichage d'erreur */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-8"
          >
            <div className="flex items-center space-x-2 text-red-400">
              <i className="pi pi-exclamation-triangle"></i>
              <span className="font-medium">Erreur de chargement</span>
            </div>
            <p className="text-red-300 mt-1">{error}</p>
          </motion.div>
        )}

        {/* Loading state */}
        {loading && (!maps || maps.length === 0) && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3 text-white/70">
              <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              <span>Chargement des cartes...</span>
            </div>
          </div>
        )}

        {/* Grille des maps */}
        <AnimatePresence mode="wait">
          {!loading && maps && maps.length > 0 && (
            <motion.div
              key="maps-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {maps.map((map: Map, index: number) => (
                <motion.div
                  key={`${map.name}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  className="group"
                >
                 
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden hover:bg-white/15 transition-all duration-300 cursor-pointer h-full flex flex-col">
                      {/* Image de la carte */}
                      <div className="relative h-48 bg-gradient-to-br from-blue-600 to-purple-600 flex-shrink-0">
                        <Image
                          src={map.imageUrl || '/images/logo/r6-logo.png'}
                          alt={`Carte ${map.name}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/images/logo/r6-logo.png';
                          }}
                        />
                        {!map.imageLoaded && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/20"></div>
                      </div>

                      {/* Informations de la carte */}
                      <div className="p-6 flex-1 flex flex-col justify-between min-h-[220px]">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-2">
                            {map.name}
                          </h3>
                          
                          <div className="flex items-center space-x-2 text-white/60 mb-3">
                            <i className="pi pi-map-marker text-sm"></i>
                            <span className="text-sm">{map.location}</span>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-3">
                            {map.playlists.split(', ').map((playlist: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full"
                              >
                                {playlist.trim()}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-white/50 mt-auto">
                          <span>
                            Sortie: {new Date(map.releaseDate).toLocaleDateString('fr-FR')}
                          </span>
                          {map.mapReworked && (
                            <span className="text-orange-400">
                              Rework: {map.mapReworked}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message aucun résultat */}
        {!loading && maps && maps.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="pi pi-search text-white/50 text-2xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Aucune carte trouvée
            </h3>
            <p className="text-white/60">
              Essayez de modifier vos critères de recherche ou de supprimer les filtres.
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}