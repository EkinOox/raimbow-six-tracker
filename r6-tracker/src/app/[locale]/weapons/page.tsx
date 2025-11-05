'use client';

// Page Weapons avec Redux
// Encodage: UTF-8

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import SectionHeader from '@/components/ui/SectionHeader';
import FavoriteButtonOptimized from '@/components/FavoriteButtonOptimized';
import { useWeapons } from '@/hooks/useR6Data';
import { WeaponFilters, Weapon } from '@/types/r6-api-types';
import { getWeaponImageUrl } from '@/utils/weaponImages';
import { useAuth } from '@/hooks/useAuth';

export default function WeaponsPage() {
  const t = useTranslations('weapons');
  const { weapons, loading, error, loadWeapons, updateFilters, filters } = useWeapons();
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('Tous');
  const [selectedFamily, setSelectedFamily] = useState('Tous');
  
  // Weapon types and families arrays
  const weaponTypes = ['Tous', 'Assault Rifle', 'SMG', 'LMG', 'Marksman Rifle', 'Sniper Rifle', 'Shotgun', 'Machine Pistol', 'Handgun'];
  const weaponFamilies = ['Tous', 'ATK', 'DEF'];
  
  // État pour les favoris (chargés une seule fois)
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  // Charger les weapons au montage du composant
  useEffect(() => {
    loadWeapons();
  }, [loadWeapons]);
  
  // Charger tous les favoris une seule fois
  useEffect(() => {
    const loadFavorites = async () => {
      if (!isAuthenticated) return;
      
      try {
        const response = await fetch('/api/favorites');
        
        if (response.ok) {
          const data = await response.json();
          const ids = new Set<string>(
            data.favorites
              .filter((f: { itemType: string }) => f.itemType === 'weapon')
              .map((f: { itemId: string }) => f.itemId)
          );
          setFavoriteIds(ids);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des favoris:', error);
      }
    };
    
    loadFavorites();
  }, [isAuthenticated]);
  
  // Callback pour mettre à jour l'état des favoris localement
  const handleFavoriteToggle = (itemId: string, newState: boolean) => {
    setFavoriteIds(prev => {
      const newSet = new Set(prev);
      if (newState) {
        newSet.add(itemId);
      } else {
        newSet.delete(itemId);
      }
      return newSet;
    });
  };

  // Appliquer les filtres quand ils changent
  useEffect(() => {
    const applyFilters = () => {
      const newFilters: WeaponFilters = {};
      
      if (searchTerm.trim()) {
        newFilters.name = searchTerm.trim();
      }
      if (selectedType !== 'Tous') {
        newFilters.type = selectedType;
      }
      if (selectedFamily !== 'Tous') {
        newFilters.family = selectedFamily;
      }
      
      updateFilters(newFilters);
    };

    const debounce = setTimeout(() => {
      applyFilters();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchTerm, selectedType, selectedFamily, updateFilters]);

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* En-tête */}
        <SectionHeader
          title={t('title')}
          description={t('description')}
          icon="pi-shield"
          useLogo={true}
        />

        {/* Barre de recherche et filtres */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Barre de recherche */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white/80 mb-2">
                {t('filters.search')}
              </label>
              <div className="relative">
                <i className="pi pi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50"></i>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('filters.searchPlaceholder')}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Filtre par type d'arme */}
            <div>
              <label htmlFor="weapon-type-select" className="block text-sm font-medium text-white/80 mb-2">
                {t('filters.type')}
              </label>
              <select
                id="weapon-type-select"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                aria-label="Filtrer par type d'arme"
              >
                {weaponTypes.map(type => (
                  <option key={type} value={type} className="bg-gray-800">
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtre par famille */}
            <div>
              <label htmlFor="weapon-side-select" className="block text-sm font-medium text-white/80 mb-2">
                {t('filters.side')}
              </label>
              <select
                id="weapon-side-select"
                value={selectedFamily}
                onChange={(e) => setSelectedFamily(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                aria-label="Filtrer par côté (Attaque ou Défense)"
              >
                {weaponFamilies.map(family => (
                  <option key={family} value={family} className="bg-gray-800">
                    {family === 'ATK' ? t('families.atk') : family === 'DEF' ? t('families.def') : t('families.all')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Statistiques de filtrage */}
          <div className="mt-4 flex items-center justify-between text-sm text-white/60">
            <span>
              {loading ? t('loading') : `${weapons?.length || 0} ${t('found')}`}
            </span>
            {Object.keys(filters).length > 0 && (
              <button
                onClick={() => updateFilters({})}
                className="text-blue-400 hover:text-blue-300 transition-colors"
                aria-label="Effacer tous les filtres"
              >
                <i className="pi pi-times mr-1"></i>
                {t('filters.clearFilters')}
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
              <span className="font-medium">{t('error')}</span>
            </div>
            <p className="text-red-300 mt-1">{error}</p>
          </motion.div>
        )}

        {/* Loading state */}
        {loading && (!weapons || weapons.length === 0) && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3 text-white/70">
              <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              <span>{t('loading')}</span>
            </div>
          </div>
        )}

        {/* Grille des weapons */}
        <AnimatePresence mode="wait">
          {!loading && weapons && weapons.length > 0 && (
            <motion.div
              key="weapons-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {weapons.map((weapon: Weapon, index: number) => {
                const weaponId = weapon.name.toLowerCase().replace(/\s+/g, '-');
                const isFav = favoriteIds.has(weaponId);
                
                return (
                <motion.div
                  key={weapon.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  className="group"
                >
                  <Link href={`/weapons/${weapon.name.toLowerCase().replace(/\s+/g, '-')}`}>
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden hover:bg-white/15 transition-all duration-300 cursor-pointer h-full flex flex-col">
                      {/* Image de l'arme */}
                      <div className="relative h-40 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center p-4">
                        <Image
                          src={getWeaponImageUrl(weapon.name, weapon.image_url)}
                          alt={`Arme ${weapon.name}`}
                          width={160}
                          height={80}
                          className="object-contain drop-shadow-2xl"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/images/logo/r6x-logo-ww.avif';
                          }}
                        />
                        <div className="absolute top-2 left-2">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            weapon.family === 'ATK' 
                              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' 
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}>
                            {weapon.family === 'ATK' ? 'ATK' : 'DEF'}
                          </span>
                        </div>
                        {/* Bouton favori */}
                        <div className="absolute top-2 right-2" onClick={(e) => e.preventDefault()}>
                          <FavoriteButtonOptimized
                            itemType="weapon"
                            itemId={weaponId}
                            itemName={weapon.name}
                            isFavorite={isFav}
                            onToggle={handleFavoriteToggle}
                            metadata={{
                              image: weapon.image_url,
                              type: weapon.type,
                              category: weapon.family,
                            }}
                            size="sm"
                          />
                        </div>
                      </div>

                      {/* Informations de l'arme */}
                      <div className="p-4 flex-1 flex flex-col">
                        <h2 className="text-lg font-bold text-white mb-1">
                          {weapon.name}
                        </h2>
                        
                        <div className="flex items-center space-x-2 text-white/60 mb-3">
                          <span className="text-sm">{weapon.type}</span>
                        </div>

                        {/* Statistiques de l'arme */}
                        <div className="space-y-2 mb-3 flex-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-white/60">{t('stats.damage')}</span>
                            <span className="text-white font-medium">{weapon.damage}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-white/60">{t('stats.fireRate')}</span>
                            <span className="text-white font-medium">{weapon.fireRate} {t('stats.rpm')}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-white/60">{t('stats.mobility')}</span>
                            <span className="text-white font-medium">{weapon.mobility}</span>
                          </div>
                        </div>

                        {/* Opérateurs utilisant cette arme */}
                        {weapon.operators && Array.isArray(weapon.operators) && weapon.operators.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-white/50 mb-1">
                              Utilisée par {weapon.operators.length} opérateur(s)
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {weapon.operators.slice(0, 3).map((op, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-white/10 text-white/80 text-xs rounded"
                                >
                                  {op}
                                </span>
                              ))}
                              {weapon.operators.length > 3 && (
                                <span className="px-2 py-1 bg-white/10 text-white/60 text-xs rounded">
                                  +{weapon.operators.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message aucun résultat */}
        {!loading && weapons && weapons.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="pi pi-search text-white/50 text-2xl"></i>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              {t('noResults')}
            </h2>
            <p className="text-white/60">
              {t('tryAdjusting')}
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}