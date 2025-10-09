'use client';

// Page Opérateurs avec système de filtrage avancé
// Encodage: UTF-8

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import SectionHeader from '../../components/ui/SectionHeader';
import { useOperators } from '../../hooks/useR6Data';
import { Operator } from '../../types/r6-api-types';

// Options de filtrage
const roles = ['Tous', 'Attacker', 'Defender'];
const sides = ['Tous', 'ATK', 'DEF'];
const speeds = ['Tous', '1', '2', '3'];
const healthRanges = [
  { label: 'Tous', min: 0, max: 200 },
  { label: '1-2 Armor (100-110 HP)', min: 100, max: 110 },
  { label: '2-2 Balanced (110-125 HP)', min: 110, max: 125 },
  { label: '3-1 Heavy (125+ HP)', min: 125, max: 200 }
];

// Options de tri
const sortOptions = [
  { value: 'name', label: 'Nom (A-Z)' },
  { value: 'name-desc', label: 'Nom (Z-A)' },
  { value: 'health', label: 'Santé (croissant)' },
  { value: 'health-desc', label: 'Santé (décroissant)' },
  { value: 'speed', label: 'Vitesse (croissant)' },
  { value: 'speed-desc', label: 'Vitesse (décroissant)' },
  { value: 'season', label: 'Saison (ancien → récent)' },
  { value: 'season-desc', label: 'Saison (récent → ancien)' }
];

export default function OperatorsPage() {
  const { operators, loading, error, loadOperators } = useOperators();
  
  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('Tous');
  const [selectedSide, setSelectedSide] = useState('Tous');
  const [selectedSpeed, setSelectedSpeed] = useState('Tous');
  const [selectedHealthRange, setSelectedHealthRange] = useState(0);
  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Charger les opérateurs au montage du composant
  useEffect(() => {
    loadOperators();
  }, [loadOperators]);

  // Extraire les unités et pays uniques pour les filtres
  const { uniqueUnits, uniqueCountries } = useMemo(() => {
    if (!operators) return { uniqueUnits: [], uniqueCountries: [] };
    
    const units = [...new Set(operators.map((op: Operator) => op.unit))].filter(Boolean).sort() as string[];
    const countries = [...new Set(operators.map((op: Operator) => op.birthplace))].filter(Boolean).sort() as string[];
    
    return { uniqueUnits: units, uniqueCountries: countries };
  }, [operators]);

  // Filtrage et tri des opérateurs
  const filteredAndSortedOperators = useMemo(() => {
    if (!operators) return [];

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

      // Filtrage par rôle
      if (selectedRole !== 'Tous' && !operator.roles.includes(selectedRole)) {
        return false;
      }

      // Filtrage par côté
      if (selectedSide !== 'Tous' && operator.side !== selectedSide) {
        return false;
      }

      // Filtrage par vitesse
      if (selectedSpeed !== 'Tous' && operator.speed !== selectedSpeed) {
        return false;
      }

      // Filtrage par santé
      const healthRange = healthRanges[selectedHealthRange];
      if (healthRange && healthRange.label !== 'Tous') {
        if (operator.health < healthRange.min || operator.health > healthRange.max) {
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
  }, [operators, searchTerm, selectedRole, selectedSide, selectedSpeed, selectedHealthRange, selectedUnit, selectedCountry, sortBy]);

  // Fonction pour réinitialiser tous les filtres
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedRole('Tous');
    setSelectedSide('Tous');
    setSelectedSpeed('Tous');
    setSelectedHealthRange(0);
    setSelectedUnit('');
    setSelectedCountry('');
    setSortBy('name');
  };

  // Vérifier si des filtres sont actifs
  const hasActiveFilters = searchTerm || selectedRole !== 'Tous' || selectedSide !== 'Tous' || 
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
          title="Operators"
          description="Découvrez tous les opérateurs de Rainbow Six Siege avec leurs statistiques détaillées"
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
                Recherche globale
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nom, vrai nom, unité, pays..."
              />
            </div>
            <div className="flex gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  <i className="pi pi-sort mr-2"></i>
                  Tri
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value} className="bg-slate-800">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  <i className="pi pi-th-large mr-2"></i>
                  Vue
                </label>
                <div className="flex bg-white/10 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-4 py-3 transition-colors ${
                      viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <i className="pi pi-th-large"></i>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-3 transition-colors ${
                      viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <i className="pi pi-list"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Filtres avancés */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-4">
            {/* Rôle */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                <i className="pi pi-user mr-2"></i>
                Rôle
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {roles.map(role => (
                  <option key={role} value={role} className="bg-slate-800">
                    {role}
                  </option>
                ))}
              </select>
            </div>

            {/* Côté */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                <i className="pi pi-shield mr-2"></i>
                Côté
              </label>
              <select
                value={selectedSide}
                onChange={(e) => setSelectedSide(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sides.map(side => (
                  <option key={side} value={side} className="bg-slate-800">
                    {side === 'ATK' ? 'Attaque' : side === 'DEF' ? 'Défense' : side}
                  </option>
                ))}
              </select>
            </div>

            {/* Vitesse */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                <i className="pi pi-fast-forward mr-2"></i>
                Vitesse
              </label>
              <select
                value={selectedSpeed}
                onChange={(e) => setSelectedSpeed(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-white/80 mb-2">
                <i className="pi pi-heart mr-2"></i>
                Santé
              </label>
              <select
                value={selectedHealthRange}
                onChange={(e) => setSelectedHealthRange(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-white/80 mb-2">
                <i className="pi pi-flag mr-2"></i>
                Unité
              </label>
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-white/80 mb-2">
                <i className="pi pi-map mr-2"></i>
                Pays
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <h3 className="font-semibold">Erreur de chargement</h3>
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
                  key={operator.safename}
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
                            <Image
                              src={operator.icon_url || '/images/logo/r6-logo.png'}
                              alt={operator.name}
                              width={200}
                              height={200}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/images/logo/r6-logo.png';
                              }}
                            />
                          </div>
                          <div className={`absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-medium ${getOperatorTypeBg(operator.side)} ${getOperatorTypeColor(operator.side)}`}>
                            {operator.side}
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-300 transition-colors">
                            {operator.name}
                          </h3>
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
                            <Image
                              src={operator.icon_url || '/images/logo/r6-logo.png'}
                              alt={operator.name}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/images/logo/r6-logo.png';
                              }}
                            />
                          </div>
                          <div className={`absolute -top-1 -right-1 px-1.5 py-0.5 rounded text-xs font-medium ${getOperatorTypeBg(operator.side)} ${getOperatorTypeColor(operator.side)}`}>
                            {operator.side}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                            {operator.name}
                          </h3>
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
            <h3 className="text-xl font-semibold text-white mb-2">Aucun opérateur trouvé</h3>
            <p className="text-white/60 mb-4">
              Aucun opérateur ne correspond à vos critères de recherche.
            </p>
            <button
              onClick={resetFilters}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Réinitialiser les filtres
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}