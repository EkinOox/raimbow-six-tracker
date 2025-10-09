'use client';

// Page Op�rateurs avec filtrage crois� multi-API
// Encodage: UTF-8

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import SectionHeader from '../../components/ui/SectionHeader';
import { useCrossAPIData, EnrichedOperator } from '../../hooks/useCrossAPIData';

// Options de filtrage
const roles = ['Tous', 'Attacker', 'Defender'];
const sides = ['Tous', 'ATK', 'DEF'];
const speeds = ['Tous', '1', '2', '3'];
const healthRanges = [
  { label: 'Tous', min: 0, max: 200 },
  { label: 'Light (100-110 HP)', min: 100, max: 110 },
  { label: 'Medium (110-125 HP)', min: 110, max: 125 },
  { label: 'Heavy (125+ HP)', min: 125, max: 200 }
];

const weaponClasses = ['Tous', 'Primary', 'Secondary', 'Gadget'];
const damageRanges = [
  { label: 'Tous', min: 0, max: 200 },
  { label: 'Faible (0-30)', min: 0, max: 30 },
  { label: 'Moyen (31-50)', min: 31, max: 50 },
  { label: '�lev� (51+)', min: 51, max: 200 }
];

// Options de tri
const sortOptions = [
  { value: 'name', label: 'Nom (A-Z)' },
  { value: 'name-desc', label: 'Nom (Z-A)' },
  { value: 'health', label: 'Sant� ?' },
  { value: 'health-desc', label: 'Sant� ?' },
  { value: 'speed', label: 'Vitesse ?' },
  { value: 'speed-desc', label: 'Vitesse ?' },
  { value: 'weapons', label: 'Nb. armes ?' },
  { value: 'weapons-desc', label: 'Nb. armes ?' },
  { value: 'damage', label: 'D�g�ts moy. ?' },
  { value: 'damage-desc', label: 'D�g�ts moy. ?' },
  { value: 'season', label: 'Saison ?' },
  { value: 'season-desc', label: 'Saison ?' }
];

export default function OperatorsPage() {
  const {
    filteredOperators,
    statistics,
    loading,
    error,
    filters,
    updateFilter,
    resetFilters,
    availableWeaponTypes,
    availableUnits,
    availableCountries,
    availableSeasons
  } = useCrossAPIData();

  // �tats locaux pour l'interface
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Gestion de la recherche avec debounce
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    updateFilter('searchTerm', value || undefined);
  };

  // Tri des op�rateurs filtr�s
  const sortedOperators = useMemo(() => {
    if (!filteredOperators) return [];

    const sorted = [...filteredOperators].sort((a: EnrichedOperator, b: EnrichedOperator) => {
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
        case 'weapons':
          return a.weaponCount - b.weaponCount;
        case 'weapons-desc':
          return b.weaponCount - a.weaponCount;
        case 'damage':
          return a.averageWeaponDamage - b.averageWeaponDamage;
        case 'damage-desc':
          return b.averageWeaponDamage - a.averageWeaponDamage;
        case 'season':
          return a.season_introduced.localeCompare(b.season_introduced);
        case 'season-desc':
          return b.season_introduced.localeCompare(a.season_introduced);
        default:
          return 0;
      }
    });

    return sorted;
  }, [filteredOperators, sortBy]);

  // V�rifier si des filtres sont actifs
  const hasActiveFilters = Object.keys(filters).some(key => filters[key as keyof typeof filters] !== undefined);

  // Fonctions utilitaires pour les couleurs et ic�nes
  const getOperatorTypeColor = (side: string) => side === 'ATK' ? 'text-orange-400' : 'text-blue-400';
  const getOperatorTypeBg = (side: string) => side === 'ATK' ? 'bg-orange-500/20' : 'bg-blue-500/20';
  const getSpeedIcon = (speed: string) => {
    const speedNum = parseInt(speed);
    if (speedNum === 3) return '?????';
    if (speedNum === 2) return '?????';
    return '???';
  };

  const getWeaponTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      'Assault Rifle': '??',
      'SMG': '??',
      'LMG': '??',
      'Shotgun': '??',
      'Sniper Rifle': '??',
      'Marksman Rifle': '??',
      'Handgun': '??',
      'Machine Pistol': '??'
    };
    return icons[type] || '??';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* En-t�te avec statistiques */}
        <SectionHeader
          title="Operators & Weapons Analysis"
          description="Analyse crois�e des op�rateurs avec leurs armements et capacit�s tactiques"
          icon="pi-users"
          useLogo={true}
        />

        {/* Statistiques globales */}
        {statistics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8"
          >
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{statistics.totalOperators}</div>
              <div className="text-white/60 text-sm">Op�rateurs</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-orange-400">{statistics.attackers}</div>
              <div className="text-white/60 text-sm">Attaquants</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{statistics.defenders}</div>
              <div className="text-white/60 text-sm">D�fenseurs</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{statistics.avgWeaponCount}</div>
              <div className="text-white/60 text-sm">Armes/Op.</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-red-400">{statistics.avgDamage}</div>
              <div className="text-white/60 text-sm">D�g�ts moy.</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{statistics.uniqueWeaponOperators}</div>
              <div className="text-white/60 text-sm">Armes uniques</div>
            </div>
          </motion.div>
        )}

        {/* Interface de filtrage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mb-8"
        >
          {/* Recherche principale et contr�les */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-white/80 mb-2">
                <i className="pi pi-search mr-2"></i>
                Recherche multi-crit�res
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nom op�rateur, arme, unit�, pays..."
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

          {/* Toggle filtres avanc�s */}
          <div className="mb-4">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center text-blue-400 hover:text-blue-300 transition-colors"
            >
              <i className={`pi pi-${showAdvancedFilters ? 'chevron-up' : 'chevron-down'} mr-2`}></i>
              Filtres avanc�s cross-API
            </button>
          </div>

          {/* Filtres avanc�s */}
          <AnimatePresence>
            {showAdvancedFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-4 border-t border-white/20">
                  {/* Filtres Op�rateurs */}
                  <div className="col-span-full">
                    <h4 className="text-white font-semibold mb-3 flex items-center">
                      <i className="pi pi-users mr-2 text-blue-400"></i>
                      Filtres Op�rateurs
                    </h4>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">R�le</label>
                    <select
                      value={filters.operatorRole || 'Tous'}
                      onChange={(e) => updateFilter('operatorRole', e.target.value === 'Tous' ? undefined : e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {roles.map(role => (
                        <option key={role} value={role} className="bg-slate-800">
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">C�t�</label>
                    <select
                      value={filters.operatorSide || 'Tous'}
                      onChange={(e) => updateFilter('operatorSide', e.target.value === 'Tous' ? undefined : e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {sides.map(side => (
                        <option key={side} value={side} className="bg-slate-800">
                          {side === 'ATK' ? 'Attaque' : side === 'DEF' ? 'D�fense' : side}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Vitesse</label>
                    <select
                      value={filters.operatorSpeed || 'Tous'}
                      onChange={(e) => updateFilter('operatorSpeed', e.target.value === 'Tous' ? undefined : e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {speeds.map(speed => (
                        <option key={speed} value={speed} className="bg-slate-800">
                          {speed === 'Tous' ? speed : `${speed} ?`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Unit�</label>
                    <select
                      value={filters.operatorUnit || ''}
                      onChange={(e) => updateFilter('operatorUnit', e.target.value || undefined)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="" className="bg-slate-800">Toutes</option>
                      {availableUnits.map((unit: string) => (
                        <option key={unit} value={unit} className="bg-slate-800">
                          {unit}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filtres Armes */}
                  <div className="col-span-full mt-4">
                    <h4 className="text-white font-semibold mb-3 flex items-center">
                      <i className="pi pi-bolt mr-2 text-orange-400"></i>
                      Filtres Armement
                    </h4>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Type d&apos;arme</label>
                    <select
                      value={filters.weaponType || 'Tous'}
                      onChange={(e) => updateFilter('weaponType', e.target.value === 'Tous' ? undefined : e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Tous" className="bg-slate-800">Tous</option>
                      {availableWeaponTypes.map((type: string) => (
                        <option key={type} value={type} className="bg-slate-800">
                          {getWeaponTypeIcon(type)} {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Classe d&apos;arme</label>
                    <select
                      value={filters.weaponClass || 'Tous'}
                      onChange={(e) => updateFilter('weaponClass', e.target.value === 'Tous' ? undefined : e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {weaponClasses.map(weaponClass => (
                        <option key={weaponClass} value={weaponClass} className="bg-slate-800">
                          {weaponClass}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Recherche arme</label>
                    <input
                      type="text"
                      value={filters.hasSpecificWeapon || ''}
                      onChange={(e) => updateFilter('hasSpecificWeapon', e.target.value || undefined)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nom d'arme..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">D�g�ts min.</label>
                    <input
                      type="number"
                      value={filters.weaponMinDamage || ''}
                      onChange={(e) => updateFilter('weaponMinDamage', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                      min="0"
                      max="200"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Statistiques de filtrage */}
          <div className="flex items-center justify-between text-sm text-white/60 mt-4 pt-4 border-t border-white/20">
            <span>
              {loading ? 'Chargement...' : `${sortedOperators.length} op�rateur(s) affich�(s)`}
              {statistics && ` sur ${statistics.totalOperators} au total`}
            </span>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-blue-400 hover:text-blue-300 transition-colors flex items-center"
              >
                <i className="pi pi-times mr-2"></i>
                R�initialiser tous les filtres
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
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3 text-white/70">
              <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              <span>Analyse cross-API en cours...</span>
            </div>
          </div>
        )}

        {/* Grille/Liste des op�rateurs enrichis */}
        <AnimatePresence mode="wait">
          {!loading && sortedOperators && sortedOperators.length > 0 && (
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
              {sortedOperators.map((operator: EnrichedOperator, index: number) => (
                <motion.div
                  key={operator.safename}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={
                    viewMode === 'grid'
                      ? "group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden hover:bg-white/15 transition-all duration-300 hover:scale-105"
                      : "group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden hover:bg-white/15 transition-all duration-300"
                  }
                >
                  <Link href={`/operators/${operator.safename}`}>
                    {viewMode === 'grid' ? (
                      // Vue grille enrichie
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
                          {operator.hasUniqueWeapon && (
                            <div className="absolute top-2 left-2 px-2 py-1 rounded-lg text-xs font-medium bg-purple-500/20 text-purple-400">
                              ? Unique
                            </div>
                          )}
                        </div>
                        
                        <div className="text-center">
                          <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-300 transition-colors">
                            {operator.name}
                          </h3>
                          <p className="text-white/60 text-sm mb-2">{operator.realname}</p>
                          
                          <div className="grid grid-cols-2 gap-2 text-xs text-white/70 mb-3">
                            <div className="flex items-center justify-center">
                              <i className="pi pi-heart mr-1 text-red-400"></i>
                              {operator.health}
                            </div>
                            <div className="flex items-center justify-center">
                              <span className="mr-1">{getSpeedIcon(operator.speed)}</span>
                              {operator.speed}
                            </div>
                            <div className="flex items-center justify-center">
                              <i className="pi pi-bolt mr-1 text-yellow-400"></i>
                              {operator.weaponCount}
                            </div>
                            <div className="flex items-center justify-center">
                              <i className="pi pi-target mr-1 text-orange-400"></i>
                              {operator.averageWeaponDamage}
                            </div>
                          </div>
                          
                          {/* Types d'armes */}
                          <div className="flex flex-wrap justify-center gap-1 mb-2">
                            {operator.weaponTypes.slice(0, 3).map((type: string) => (
                              <span key={type} className="text-xs bg-white/10 px-2 py-1 rounded">
                                {getWeaponTypeIcon(type)}
                              </span>
                            ))}
                            {operator.weaponTypes.length > 3 && (
                              <span className="text-xs bg-white/10 px-2 py-1 rounded">+{operator.weaponTypes.length - 3}</span>
                            )}
                          </div>
                          
                          <div className="text-xs text-white/50">
                            {operator.unit}
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Vue liste enrichie
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
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                              {operator.name}
                            </h3>
                            {operator.hasUniqueWeapon && (
                              <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">?</span>
                            )}
                          </div>
                          <p className="text-white/60 text-sm">{operator.realname}</p>
                          <p className="text-white/50 text-xs">{operator.unit} � {operator.birthplace}</p>
                          
                          {/* Types d'armes en liste */}
                          <div className="flex flex-wrap gap-1 mt-1">
                            {operator.weaponTypes.map((type: string) => (
                              <span key={type} className="text-xs text-white/60">
                                {getWeaponTypeIcon(type)} {type}
                              </span>
                            ))}
                          </div>
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
                            <div className="text-white/60">{operator.weaponCount}</div>
                            <div className="text-xs text-white/50">Armes</div>
                          </div>
                          <div className="text-center">
                            <div className="text-white/60">{operator.averageWeaponDamage}</div>
                            <div className="text-xs text-white/50">D�g�ts</div>
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

        {/* Message aucun r�sultat */}
        {!loading && sortedOperators && sortedOperators.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="pi pi-search text-white/50 text-2xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Aucun op�rateur trouv�</h3>
            <p className="text-white/60 mb-4">
              Aucun op�rateur ne correspond � vos crit�res de recherche crois�e.
            </p>
            <button
              onClick={resetFilters}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              R�initialiser tous les filtres
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}