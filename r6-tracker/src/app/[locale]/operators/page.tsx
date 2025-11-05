'use client';

// Page Opérateurs avec système de filtrage avancé
// Encodage: UTF-8

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import SectionHeader from '@/components/ui/SectionHeader';
import FavoriteButtonOptimized from '@/components/FavoriteButtonOptimized';
import OperatorImage from '@/components/OperatorImage';
import { useOperators } from '@/hooks/useR6Data';
import { Operator } from '@/types/r6-api-types';
import { useAuth } from '@/hooks/useAuth';

// Options de filtrage
const sides = ['Tous', 'ATK', 'DEF'];
const speeds = ['Tous', '1', '2', '3'];

// Fonction helper pour valider les URLs d'opérateurs
function getValidImageUrl(url: string | undefined): string {
  if (!url) return '/images/logo/r6-logo.png';
  
  try {
    // Vérifie si c'est une URL relative valide
    if (url.startsWith('/')) return url;
    
    // Vérifie si c'est une URL absolue valide
    new URL(url);
    return url;
  } catch {
    return '/images/logo/r6-logo.png';
  }
}

export default function OperatorsPage() {
  const t = useTranslations('operators');
  const { operators, loading, error, loadOperators } = useOperators();
  const { isAuthenticated } = useAuth();
  
  // Health ranges et sort options définis avec useMemo pour éviter les re-renders
  const healthRanges = useMemo(() => [
    { label: t('healthRanges.all'), min: 0, max: 3 },
    { label: t('healthRanges.light'), min: 1, max: 1 },
    { label: t('healthRanges.medium'), min: 2, max: 2 },
    { label: t('healthRanges.heavy'), min: 3, max: 3 }
  ], [t]);

  const sortOptions = useMemo(() => [
    { value: 'name', label: t('sortOptions.name') },
    { value: 'name-desc', label: t('sortOptions.nameDesc') },
    { value: 'health', label: t('sortOptions.health') },
    { value: 'health-desc', label: t('sortOptions.healthDesc') },
    { value: 'speed', label: t('sortOptions.speed') },
    { value: 'speed-desc', label: t('sortOptions.speedDesc') },
    { value: 'season', label: t('sortOptions.season') },
    { value: 'season-desc', label: t('sortOptions.seasonDesc') }
  ], [t]);
  
  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSide, setSelectedSide] = useState('Tous');
  const [selectedRole, setSelectedRole] = useState('Tous');
  const [selectedSpeed, setSelectedSpeed] = useState('Tous');
  const [selectedHealthRange, setSelectedHealthRange] = useState(0);
  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // État pour les favoris (chargés une seule fois)
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  // Charger les opérateurs au montage du composant
  useEffect(() => {
    loadOperators();
  }, [loadOperators]);
  
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
              .filter((f: { itemType: string }) => f.itemType === 'operator')
              .map((f: { itemId: string }) => f.itemId)
          );
          setFavoriteIds(ids);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des favoris:', error);
      }
    };

    loadFavorites();
  }, [isAuthenticated]);  // Callback pour mettre à jour l'état des favoris localement
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

  // Extraire les unités, pays et rôles uniques pour les filtres
  const { uniqueUnits, uniqueCountries, uniqueRoles } = useMemo(() => {
    if (!operators) return { uniqueUnits: [], uniqueCountries: [], uniqueRoles: [] };
    
    const units = [...new Set(operators.map((op: Operator) => op.unit))].filter(Boolean).sort() as string[];
    const countries = [...new Set(operators.map((op: Operator) => op.birthplace))].filter(Boolean).sort() as string[];
    
    // Extraire tous les rôles uniques à partir des arrays de rôles
    const allRoles = new Set<string>();
    operators.forEach((op: Operator) => {
      if (Array.isArray(op.roles)) {
        op.roles.forEach(role => {
          if (role && typeof role === 'string') {
            allRoles.add(role);
          }
        });
      }
    });
    
    const roles = ['Tous', ...Array.from(allRoles).sort()];
    
    return { uniqueUnits: units, uniqueCountries: countries, uniqueRoles: roles };
  }, [operators]);

  // Filtrage et tri des opérateurs
  const filteredAndSortedOperators = useMemo(() => {
    if (!operators) return [];

    // Définir healthRanges localement dans useMemo
    const localHealthRanges = healthRanges;

    const filtered = operators.filter((operator: Operator) => {
      // Recherche textuelle
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesName = operator.name.toLowerCase().includes(search);
        const matchesRealName = operator.realname?.toLowerCase().includes(search);
        const matchesUnit = operator.unit?.toLowerCase().includes(search);
        const matchesBirthplace = operator.birthplace?.toLowerCase().includes(search);
        
        if (!matchesName && !matchesRealName && !matchesUnit && !matchesBirthplace) {
          return false;
        }
      }

      // Filtrage par côté (ATK/DEF)
      if (selectedSide !== 'Tous') {
        const operatorSideCode = operator.side === 'attacker' ? 'ATK' : 'DEF';
        if (operatorSideCode !== selectedSide) {
          return false;
        }
      }

      // Filtrage par rôle spécialisé
      if (selectedRole !== 'Tous') {
        // Vérifier si l'opérateur a ce rôle dans son array de rôles
        const hasRole = Array.isArray(operator.roles) && operator.roles.includes(selectedRole);
        if (!hasRole) {
          return false;
        }
      }

      // Filtrage par vitesse
      if (selectedSpeed !== 'Tous' && operator.speed !== selectedSpeed) {
        return false;
      }

      // Filtrage par santé (armor level)
      const healthRange = localHealthRanges[selectedHealthRange];
      if (healthRange && healthRange.label !== t('healthRanges.all')) {
        const operatorHealth = typeof operator.health === 'string' ? parseInt(operator.health) : operator.health;
        if (isNaN(operatorHealth) || operatorHealth < healthRange.min || operatorHealth > healthRange.max) {
          return false;
        }
      }

      // Filtrage par unité
      if (selectedUnit && operator.unit !== selectedUnit) {
        return false;
      }

      // Filtrage par pays
      if (selectedCountry && operator.birthplace !== selectedCountry) {
        return false;
      }

      return true;
    });

    // Tri
    filtered.sort((a: Operator, b: Operator) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'health':
          return a.health - b.health;
        case 'health-desc':
          return b.health - a.health;
        case 'speed':
          return parseInt(a.speed) - parseInt(b.speed);
        case 'speed-desc':
          return parseInt(b.speed) - parseInt(a.speed);
        case 'season':
          return a.season_introduced.localeCompare(b.season_introduced);
        case 'season-desc':
          return b.season_introduced.localeCompare(a.season_introduced);
        default:
          return 0;
      }
    });

    return filtered;
  }, [operators, searchTerm, selectedSide, selectedRole, selectedSpeed, selectedHealthRange, selectedUnit, selectedCountry, sortBy, healthRanges, t]);

  // Fonction pour réinitialiser tous les filtres
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedSide('Tous');
    setSelectedRole('Tous');
    setSelectedSpeed('Tous');
    setSelectedHealthRange(0);
    setSelectedUnit('');
    setSelectedCountry('');
    setSortBy('name');
  };

  // Vérifier si des filtres sont actifs
  const hasActiveFilters = searchTerm || selectedSide !== 'Tous' || selectedRole !== 'Tous' || 
    selectedSpeed !== 'Tous' || selectedHealthRange !== 0 || selectedUnit || selectedCountry;

  // Fonctions utilitaires pour les couleurs
  const getOperatorTypeColor = (side: string) => {
    return side === 'ATK' ? 'text-orange-400' : 'text-blue-400';
  };

  const getOperatorTypeBg = (side: string) => {
    return side === 'ATK' ? 'bg-orange-500/20' : 'bg-blue-500/20';
  };

  const getSpeedIcon = (speed: string) => {
    const speedNum = parseInt(speed);
    if (speedNum === 3) return '⚡⚡⚡';
    if (speedNum === 2) return '⚡⚡☆';
    return '⚡☆☆';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <SectionHeader
          title={t('title')}
          description={t('description')}
          icon="pi-users"
          useLogo={true}
        />

        {/* Barre de recherche et filtres avancés */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mb-8"
        >
          {/* Recherche principale et options d'affichage */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-white/80 mb-2">
                <i className="pi pi-search mr-2"></i>
                {t('filters.search')}
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('filters.searchPlaceholder')}
              />
            </div>
            <div className="flex gap-4">
              <div>
                <label htmlFor="sort-select" className="block text-sm font-medium text-white/80 mb-2">
                  <i className="pi pi-sort mr-2"></i>
                  {t('filters.sortBy')}
                </label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Trier les opérateurs"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value} className="bg-slate-800">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="view-mode" className="block text-sm font-medium text-white/80 mb-2">
                  <i className="pi pi-th-large mr-2"></i>
                  {t('filters.viewMode')}
                </label>
                <div className="flex bg-white/10 rounded-xl overflow-hidden" role="group" aria-label="Mode d'affichage">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-4 py-3 transition-colors ${
                      viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-white/70 hover:text-white'
                    }`}
                    aria-label="Affichage en grille"
                    aria-pressed={viewMode === 'grid'}
                    title="Affichage en grille"
                  >
                    <i className="pi pi-th-large"></i>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-3 transition-colors ${
                      viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-white/70 hover:text-white'
                    }`}
                    aria-label="Affichage en liste"
                    aria-pressed={viewMode === 'list'}
                    title="Affichage en liste"
                  >
                    <i className="pi pi-list"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Filtres avancés */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-4">
            {/* Côté */}
            <div>
              <label htmlFor="side-select" className="block text-sm font-medium text-white/80 mb-2">
                <i className="pi pi-shield mr-2"></i>
                {t('filters.side')}
              </label>
              <select
                id="side-select"
                value={selectedSide}
                onChange={(e) => setSelectedSide(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Filtrer par côté (Attaque ou Défense)"
              >
                {sides.map(side => (
                  <option key={side} value={side} className="bg-slate-800">
                    {side === 'ATK' ? t('filters.atk') : side === 'DEF' ? t('filters.def') : t('filters.all')}
                  </option>
                ))}
              </select>
            </div>

            {/* Rôle */}
            <div>
              <label htmlFor="role-select" className="block text-sm font-medium text-white/80 mb-2">
                <i className="pi pi-user mr-2"></i>
                {t('filters.role')}
              </label>
              <select
                id="role-select"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Filtrer par rôle spécialisé"
              >
                {uniqueRoles.map(role => (
                  <option key={role} value={role} className="bg-slate-800">
                    {role}
                  </option>
                ))}
              </select>
            </div>

            {/* Vitesse */}
            <div>
              <label htmlFor="speed-select" className="block text-sm font-medium text-white/80 mb-2">
                <i className="pi pi-fast-forward mr-2"></i>
                {t('filters.speed')}
              </label>
              <select
                id="speed-select"
                value={selectedSpeed}
                onChange={(e) => setSelectedSpeed(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Filtrer par niveau de vitesse"
              >
                {speeds.map(speed => (
                  <option key={speed} value={speed} className="bg-slate-800">
                    {speed === 'Tous' ? speed : `${speed} ⚡`}
                  </option>
                ))}
              </select>
            </div>

            {/* Santé */}
            <div>
              <label htmlFor="health-select" className="block text-sm font-medium text-white/80 mb-2">
                <i className="pi pi-heart mr-2"></i>
                {t('filters.health')}
              </label>
              <select
                id="health-select"
                value={selectedHealthRange}
                onChange={(e) => setSelectedHealthRange(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Filtrer par niveau d'armure"
              >
                {healthRanges.map((range, index) => (
                  <option key={index} value={index} className="bg-slate-800">
                    {range.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Unité */}
            <div>
              <label htmlFor="unit-select" className="block text-sm font-medium text-white/80 mb-2">
                <i className="pi pi-flag mr-2"></i>
                {t('filters.unit')}
              </label>
              <select
                id="unit-select"
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Filtrer par unité militaire"
              >
                <option value="" className="bg-slate-800">Toutes</option>
                {uniqueUnits.map((unit: string) => (
                  <option key={unit} value={unit} className="bg-slate-800">
                    {unit}
                  </option>
                ))}
              </select>
            </div>

            {/* Pays */}
            <div>
              <label htmlFor="country-select" className="block text-sm font-medium text-white/80 mb-2">
                <i className="pi pi-map mr-2"></i>
                Pays
              </label>
              <select
                id="country-select"
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Filtrer par pays d'origine"
              >
                <option value="" className="bg-slate-800">Tous</option>
                {uniqueCountries.map((country: string) => (
                  <option key={country} value={country} className="bg-slate-800">
                    {country}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Statistiques et actions */}
          <div className="flex items-center justify-between text-sm text-white/60">
            <span>
              {loading ? 'Chargement...' : `${filteredAndSortedOperators.length} opérateur(s) trouvé(s)`}
            </span>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-blue-400 hover:text-blue-300 transition-colors flex items-center"
                aria-label="Réinitialiser tous les filtres"
              >
                <i className="pi pi-times mr-2"></i>
                Réinitialiser les filtres
              </button>
            )}
          </div>
        </motion.div>

        {/* Affichage d'erreur */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-500/20 border border-red-500/30 rounded-2xl p-6 mb-8"
          >
            <div className="flex items-center text-red-300">
              <i className="pi pi-exclamation-triangle mr-3 text-xl"></i>
              <div>
                <h2 className="font-semibold">Erreur de chargement</h2>
                <p className="text-red-300 mt-1">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading state */}
        {loading && (!operators || operators.length === 0) && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3 text-white/70">
              <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              <span>Chargement des opérateurs...</span>
            </div>
          </div>
        )}

        {/* Grille/Liste des opérateurs */}
        <AnimatePresence mode="wait">
          {!loading && operators && filteredAndSortedOperators.length > 0 && (
            <motion.div
              key="operators-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={
                viewMode === 'grid' 
                  ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
                  : "space-y-4"
              }
            >
              {filteredAndSortedOperators.map((operator: Operator, index: number) => (
                <motion.div
                  key={`${operator.safename}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={
                    viewMode === 'grid'
                      ? "group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden hover:bg-white/15 transition-all duration-300 hover:scale-105"
                      : "group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden hover:bg-white/15 transition-all duration-300"
                  }
                >
                  <Link href={`/operators/${operator.safename}`}>
                    {viewMode === 'grid' ? (
                      // Vue grille
                      <div className="p-4">
                        <div className="relative mb-4">
                          <div className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900">
                            <OperatorImage
                              src={getValidImageUrl(operator.icon_url)}
                              alt={operator.name}
                              width={200}
                              height={200}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                          <div className={`absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-medium ${getOperatorTypeBg(operator.side)} ${getOperatorTypeColor(operator.side)}`}>
                            {operator.side}
                          </div>
                          {/* Bouton favori */}
                          <div className="absolute top-2 left-2" onClick={(e) => e.preventDefault()}>
                            <FavoriteButtonOptimized
                              itemType="operator"
                              itemId={operator.safename}
                              itemName={operator.name}
                              isFavorite={favoriteIds.has(operator.safename)}
                              onToggle={handleFavoriteToggle}
                              metadata={{
                                image: operator.icon_url,
                                side: operator.side,
                                type: 'operator',
                              }}
                              size="sm"
                            />
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <h2 className="text-lg font-bold text-white mb-1 group-hover:text-blue-300 transition-colors">
                            {operator.name}
                          </h2>
                          <p className="text-white/60 text-sm mb-2">{operator.realname}</p>
                          
                          <div className="flex items-center justify-center space-x-4 text-xs text-white/70">
                            <div className="flex items-center">
                              <i className="pi pi-heart mr-1 text-red-400"></i>
                              {operator.health}
                            </div>
                            <div className="flex items-center">
                              <span className="mr-1">{getSpeedIcon(operator.speed)}</span>
                              {operator.speed}
                            </div>
                          </div>
                          
                          <div className="mt-2 text-xs text-white/50">
                            {operator.unit}
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Vue liste
                      <div className="flex items-center p-4 space-x-4">
                        <div className="relative flex-shrink-0">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900">
                            <OperatorImage
                              src={getValidImageUrl(operator.icon_url)}
                              alt={operator.name}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className={`absolute -top-1 -right-1 px-1.5 py-0.5 rounded text-xs font-medium ${getOperatorTypeBg(operator.side)} ${getOperatorTypeColor(operator.side)}`}>
                            {operator.side}
                          </div>
                          {/* Bouton favori */}
                          <div className="absolute -bottom-1 -left-1" onClick={(e) => e.preventDefault()}>
                            <FavoriteButtonOptimized
                              itemType="operator"
                              itemId={operator.safename}
                              itemName={operator.name}
                              isFavorite={favoriteIds.has(operator.safename)}
                              onToggle={handleFavoriteToggle}
                              metadata={{
                                image: operator.icon_url,
                                side: operator.side,
                                type: 'operator',
                              }}
                              size="sm"
                            />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h2 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                            {operator.name}
                          </h2>
                          <p className="text-white/60 text-sm">{operator.realname}</p>
                          <p className="text-white/50 text-xs">{operator.unit} • {operator.birthplace}</p>
                        </div>
                        
                        <div className="flex items-center space-x-6 text-sm text-white/70">
                          <div className="text-center">
                            <div className="flex items-center justify-center">
                              <i className="pi pi-heart mr-1 text-red-400"></i>
                              {operator.health}
                            </div>
                            <div className="text-xs text-white/50">HP</div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center">
                              <span className="mr-1">{getSpeedIcon(operator.speed)}</span>
                              {operator.speed}
                            </div>
                            <div className="text-xs text-white/50">Speed</div>
                          </div>
                          <div className="text-center">
                            <div className="text-white/60">{operator.season_introduced}</div>
                            <div className="text-xs text-white/50">Saison</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message aucun résultat */}
        {!loading && operators && filteredAndSortedOperators.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="pi pi-search text-white/50 text-2xl"></i>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Aucun opérateur trouvé</h2>
            <p className="text-white/60 mb-4">
              Aucun opérateur ne correspond à vos critères de recherche.
            </p>
            <button
              onClick={resetFilters}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              aria-label="Réinitialiser tous les filtres"
            >
              Réinitialiser les filtres
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}