"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import SectionHeader from '../../components/ui/SectionHeader';
import FavoriteButtonOptimized from '../../components/FavoriteButtonOptimized';
import { useMaps } from '../../hooks/useR6Data';
import type { MapFilters } from '../../types/r6-api-types';
import { useAuth } from '@/hooks/useAuth';

const playlists = ['Tous', 'Ranked', 'Standard', 'Team Deathmatch', 'Quick Match'];

export default function MapsPage() {
  const { maps, loading, error, loadMaps, updateFilters, filters } = useMaps();
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState('Tous');
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadMaps();
  }, [loadMaps]);

  useEffect(() => {
    const loadFavorites = async () => {
      if (!isAuthenticated) return;
      try {
        const res = await fetch('/api/favorites');
        if (!res.ok) return;
  const payload = await res.json() as { favorites?: Array<{ itemType: string; itemId: string }> };
  const ids = new Set<string>((payload.favorites || []).filter((f) => f.itemType === 'map').map((f) => f.itemId));
        setFavoriteIds(ids);
      } catch (err) {
        console.error('Load favorites error', err);
      }
    };
    loadFavorites();
  }, [isAuthenticated]);

  const handleFavoriteToggle = (itemId: string, newState: boolean) => {
    setFavoriteIds(prev => {
      const copy = new Set(prev);
      if (newState) copy.add(itemId); else copy.delete(itemId);
      return copy;
    });
  };

  useEffect(() => {
    const applyFilters = () => {
      const newFilters: MapFilters = {};
      if (searchTerm.trim()) newFilters.name = searchTerm.trim();
      if (selectedPlaylist !== 'Tous') newFilters.playlists = selectedPlaylist;
      updateFilters(newFilters);
    };
    const t = setTimeout(applyFilters, 300);
    return () => clearTimeout(t);
  }, [searchTerm, selectedPlaylist, updateFilters]);

  const slugify = (name: string) => name.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
        <SectionHeader title="Maps" description="Explorez toutes les cartes Rainbow Six Siege." icon="pi-map" useLogo={true} />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white/80 mb-2">Rechercher une carte</label>
              <div className="relative">
                <i className="pi pi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50"></i>
                <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white" placeholder="Ex: Oregon, Villa..." />
              </div>
            </div>
            <div>
              <label htmlFor="map-playlist-select" className="block text-sm font-medium text-white/80 mb-2">Mode de jeu</label>
              <select 
                id="map-playlist-select"
                value={selectedPlaylist} 
                onChange={(e) => setSelectedPlaylist(e.target.value)} 
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white"
                aria-label="Filtrer par mode de jeu"
              >
                {playlists.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-white/60">
            <span>{loading ? 'Chargement...' : `${maps?.length || 0} carte(s) trouvée(s)`}</span>
            {Object.keys(filters).length > 0 && (
              <button 
                onClick={() => updateFilters({})} 
                className="text-blue-400"
                aria-label="Effacer tous les filtres"
              >
                Effacer les filtres
              </button>
            )}
          </div>
        </motion.div>

        {error && <div className="bg-red-500/20 p-4 rounded-xl text-red-300 mb-6">{error}</div>}

        <AnimatePresence mode="wait">
          {!loading && maps && maps.length > 0 && (
            <motion.div key="maps-grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {maps.map((map, idx) => (
                <motion.div key={map.name + idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }} whileHover={{ scale: 1.02 }} className="group">
                  <Link href={`/maps/${slugify(map.name)}`} className="block">
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden hover:bg-white/15 transition-all duration-300 cursor-pointer h-full flex flex-col">
                      <div className="relative h-48 bg-gradient-to-br from-blue-600 to-purple-600 flex-shrink-0">
                        <Image 
                          src={map.imageUrl || '/images/logo/r6-logo.png'} 
                          alt={map.name} 
                          fill 
                          className="object-cover"
                          quality={75}
                          loading="lazy"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="absolute top-3 right-3 z-10" onClick={(e) => e.stopPropagation()}>
                          <FavoriteButtonOptimized itemType="map" itemId={map.name} itemName={map.name} isFavorite={favoriteIds.has(map.name)} onToggle={handleFavoriteToggle} metadata={{ image: map.imageUrl, type: 'map', location: map.location }} size="md" />
                        </div>
                      </div>

                      <div className="p-6 flex-1 flex flex-col justify-between min-h-[220px]">
                        <div>
                          <h2 className="text-xl font-bold text-white mb-2">{map.name}</h2>
                          <div className="flex items-center space-x-2 text-white/60 mb-3"><i className="pi pi-map-marker"/> <span className="text-sm">{map.location}</span></div>
                          <div className="flex flex-wrap gap-2 mb-3">{(map.playlists || '').split(',').map((pl, i) => <span key={i} className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">{pl.trim()}</span>)}</div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-white/50 mt-auto"><span>Sortie: {map.releaseDate ? new Date(map.releaseDate).toLocaleDateString('fr-FR') : 'N/A'}</span>{map.mapReworked && <span className="text-orange-400">Rework: {map.mapReworked}</span>}</div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {!loading && maps && maps.length === 0 && !error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4"><i className="pi pi-search text-white/50 text-2xl"/></div>
            <h2 className="text-xl font-semibold text-white mb-2">Aucune carte trouvée</h2>
            <p className="text-white/60">Essayez de modifier vos critères de recherche ou de supprimer les filtres.</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
