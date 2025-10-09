'use client';

// Page de comparaison avancée d'opérateurs avec données croisées
// Encodage: UTF-8

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import SectionHeader from '../../components/ui/SectionHeader';
import { useCrossAPIData, EnrichedOperator } from '../../hooks/useCrossAPIData';

export default function ComparisonPage() {
  const { operators, loading, error } = useCrossAPIData();
  const [selectedOperators, setSelectedOperators] = useState<EnrichedOperator[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [comparisonMode, setComparisonMode] = useState<'stats' | 'weapons' | 'overview'>('overview');

  // Filtrage des opérateurs pour la sélection
  const filteredOperators = useMemo(() => {
    if (!operators) return [];
    return operators.filter(op => 
      op.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.realname.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [operators, searchTerm]);

  // Ajouter un opérateur à la comparaison
  const addOperator = (operator: EnrichedOperator) => {
    if (selectedOperators.length < 4 && !selectedOperators.find(op => op.safename === operator.safename)) {
      setSelectedOperators([...selectedOperators, operator]);
    }
  };

  // Retirer un opérateur de la comparaison
  const removeOperator = (safename: string) => {
    setSelectedOperators(selectedOperators.filter(op => op.safename !== safename));
  };

  // Calculer les statistiques comparatives
  const comparisonStats = useMemo(() => {
    if (selectedOperators.length < 2) return null;

    const stats = {
      health: { min: Math.min(...selectedOperators.map(op => op.health)), max: Math.max(...selectedOperators.map(op => op.health)) },
      speed: { min: Math.min(...selectedOperators.map(op => parseInt(op.speed))), max: Math.max(...selectedOperators.map(op => parseInt(op.speed))) },
      weaponCount: { min: Math.min(...selectedOperators.map(op => op.weaponCount)), max: Math.max(...selectedOperators.map(op => op.weaponCount)) },
      avgDamage: { min: Math.min(...selectedOperators.map(op => op.averageWeaponDamage)), max: Math.max(...selectedOperators.map(op => op.averageWeaponDamage)) },
      commonWeaponTypes: [] as string[],
      uniqueWeaponTypes: [] as string[]
    };

    // Analyser les types d'armes communs et uniques
    const allWeaponTypes = selectedOperators.flatMap(op => op.weaponTypes);
    const weaponTypeCounts = allWeaponTypes.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    stats.commonWeaponTypes = Object.keys(weaponTypeCounts).filter(type => weaponTypeCounts[type] === selectedOperators.length);
    stats.uniqueWeaponTypes = Object.keys(weaponTypeCounts).filter(type => weaponTypeCounts[type] === 1);

    return stats;
  }, [selectedOperators]);

  // Fonction pour obtenir la couleur selon la performance relative
  const getPerformanceColor = (value: number, min: number, max: number, isHigherBetter: boolean = true) => {
    if (min === max) return 'text-white';
    const normalized = (value - min) / (max - min);
    if (isHigherBetter) {
      if (normalized >= 0.8) return 'text-green-400';
      if (normalized >= 0.6) return 'text-yellow-400';
      if (normalized >= 0.4) return 'text-orange-400';
      return 'text-red-400';
    } else {
      if (normalized <= 0.2) return 'text-green-400';
      if (normalized <= 0.4) return 'text-yellow-400';
      if (normalized <= 0.6) return 'text-orange-400';
      return 'text-red-400';
    }
  };

  const getOperatorTypeColor = (side: string) => side === 'ATK' ? 'text-orange-400' : 'text-blue-400';
  const getOperatorTypeBg = (side: string) => side === 'ATK' ? 'bg-orange-500/20' : 'bg-blue-500/20';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          title="Operator Comparison Tool"
          description="Comparez jusqu'à 4 opérateurs avec leurs statistiques, armements et capacités tactiques"
          icon="pi-chart-bar"
          useLogo={true}
        />

        {/* Interface de sélection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Recherche d'opérateurs */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-white/80 mb-2">
                <i className="pi pi-search mr-2"></i>
                Rechercher des opérateurs à comparer
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nom d'opérateur..."
              />
              
              {/* Liste des opérateurs disponibles */}
              {searchTerm && (
                <div className="mt-2 max-h-40 overflow-y-auto bg-white/10 border border-white/20 rounded-xl">
                  {filteredOperators.slice(0, 10).map((operator) => (
                    <button
                      key={operator.safename}
                      onClick={() => addOperator(operator)}
                      disabled={selectedOperators.length >= 4 || selectedOperators.some(op => op.safename === operator.safename)}
                      className="w-full flex items-center p-3 text-left hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="w-8 h-8 rounded overflow-hidden mr-3">
                        <Image
                          src={operator.icon_url || '/images/logo/r6-logo.png'}
                          alt={operator.name}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="text-white font-medium">{operator.name}</div>
                        <div className="text-white/60 text-sm">{operator.realname}</div>
                      </div>
                      <div className={`ml-auto px-2 py-1 rounded text-xs ${getOperatorTypeBg(operator.side)} ${getOperatorTypeColor(operator.side)}`}>
                        {operator.side}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mode de comparaison */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                <i className="pi pi-eye mr-2"></i>
                Mode de vue
              </label>
              <div className="flex bg-white/10 rounded-xl overflow-hidden">
                <button
                  onClick={() => setComparisonMode('overview')}
                  className={`px-4 py-3 transition-colors ${
                    comparisonMode === 'overview' ? 'bg-blue-500 text-white' : 'text-white/70 hover:text-white'
                  }`}
                >
                  Vue d&apos;ensemble
                </button>
                <button
                  onClick={() => setComparisonMode('stats')}
                  className={`px-4 py-3 transition-colors ${
                    comparisonMode === 'stats' ? 'bg-blue-500 text-white' : 'text-white/70 hover:text-white'
                  }`}
                >
                  Statistiques
                </button>
                <button
                  onClick={() => setComparisonMode('weapons')}
                  className={`px-4 py-3 transition-colors ${
                    comparisonMode === 'weapons' ? 'bg-blue-500 text-white' : 'text-white/70 hover:text-white'
                  }`}
                >
                  Armement
                </button>
              </div>
            </div>
          </div>

          {/* Opérateurs sélectionnés */}
          {selectedOperators.length > 0 && (
            <div className="mt-6 pt-6 border-t border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">
                  Opérateurs sélectionnés ({selectedOperators.length}/4)
                </h3>
                <button
                  onClick={() => setSelectedOperators([])}
                  className="text-red-400 hover:text-red-300 transition-colors text-sm"
                >
                  <i className="pi pi-trash mr-1"></i>
                  Tout supprimer
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                {selectedOperators.map((operator) => (
                  <div
                    key={operator.safename}
                    className="flex items-center bg-white/10 border border-white/20 rounded-xl p-3"
                  >
                    <div className="w-8 h-8 rounded overflow-hidden mr-3">
                      <Image
                        src={operator.icon_url || '/images/logo/r6-logo.png'}
                        alt={operator.name}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="mr-3">
                      <div className="text-white font-medium text-sm">{operator.name}</div>
                      <div className={`text-xs ${getOperatorTypeColor(operator.side)}`}>{operator.side}</div>
                    </div>
                    <button
                      onClick={() => removeOperator(operator.safename)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <i className="pi pi-times"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Comparaison détaillée */}
        {selectedOperators.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            {/* Analyse comparative */}
            {comparisonStats && (
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <i className="pi pi-chart-line mr-2 text-blue-400"></i>
                  Analyse comparative
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{comparisonStats.commonWeaponTypes.length}</div>
                    <div className="text-white/60 text-sm">Types d&apos;armes communs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-400">{comparisonStats.uniqueWeaponTypes.length}</div>
                    <div className="text-white/60 text-sm">Types d&apos;armes uniques</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{comparisonStats.health.max - comparisonStats.health.min}</div>
                    <div className="text-white/60 text-sm">Écart de santé</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{comparisonStats.avgDamage.max - comparisonStats.avgDamage.min}</div>
                    <div className="text-white/60 text-sm">Écart de dégâts</div>
                  </div>
                </div>
              </div>
            )}

            {/* Tableau de comparaison */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-white/20">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <i className="pi pi-table mr-2 text-blue-400"></i>
                  Comparaison détaillée - {comparisonMode === 'overview' ? 'Vue d\'ensemble' : comparisonMode === 'stats' ? 'Statistiques' : 'Armement'}
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-white/5">
                      <th className="text-left p-4 text-white/80 font-medium">Critère</th>
                      {selectedOperators.map((operator) => (
                        <th key={operator.safename} className="text-center p-4 text-white/80 font-medium min-w-32">
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 rounded-xl overflow-hidden mb-2">
                              <Image
                                src={operator.icon_url || '/images/logo/r6-logo.png'}
                                alt={operator.name}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="text-sm font-bold">{operator.name}</div>
                            <div className={`text-xs ${getOperatorTypeColor(operator.side)}`}>{operator.side}</div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonMode === 'overview' && (
                      <>
                        <tr className="border-t border-white/10">
                          <td className="p-4 text-white/80">Nom réel</td>
                          {selectedOperators.map((operator) => (
                            <td key={operator.safename} className="p-4 text-center text-white">
                              {operator.realname}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-t border-white/10">
                          <td className="p-4 text-white/80">Unité</td>
                          {selectedOperators.map((operator) => (
                            <td key={operator.safename} className="p-4 text-center text-white text-sm">
                              {operator.unit}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-t border-white/10">
                          <td className="p-4 text-white/80">Pays</td>
                          {selectedOperators.map((operator) => (
                            <td key={operator.safename} className="p-4 text-center text-white">
                              {operator.birthplace}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-t border-white/10">
                          <td className="p-4 text-white/80">Saison</td>
                          {selectedOperators.map((operator) => (
                            <td key={operator.safename} className="p-4 text-center text-white">
                              {operator.season_introduced}
                            </td>
                          ))}
                        </tr>
                      </>
                    )}

                    {comparisonMode === 'stats' && comparisonStats && (
                      <>
                        <tr className="border-t border-white/10">
                          <td className="p-4 text-white/80">Santé</td>
                          {selectedOperators.map((operator) => (
                            <td key={operator.safename} className="p-4 text-center">
                              <span className={`font-bold ${getPerformanceColor(operator.health, comparisonStats.health.min, comparisonStats.health.max)}`}>
                                {operator.health}
                              </span>
                            </td>
                          ))}
                        </tr>
                        <tr className="border-t border-white/10">
                          <td className="p-4 text-white/80">Vitesse</td>
                          {selectedOperators.map((operator) => (
                            <td key={operator.safename} className="p-4 text-center">
                              <span className={`font-bold ${getPerformanceColor(parseInt(operator.speed), comparisonStats.speed.min, comparisonStats.speed.max)}`}>
                                {operator.speed} ⭐
                              </span>
                            </td>
                          ))}
                        </tr>
                        <tr className="border-t border-white/10">
                          <td className="p-4 text-white/80">Nombre d&apos;armes</td>
                          {selectedOperators.map((operator) => (
                            <td key={operator.safename} className="p-4 text-center">
                              <span className={`font-bold ${getPerformanceColor(operator.weaponCount, comparisonStats.weaponCount.min, comparisonStats.weaponCount.max)}`}>
                                {operator.weaponCount}
                              </span>
                            </td>
                          ))}
                        </tr>
                        <tr className="border-t border-white/10">
                          <td className="p-4 text-white/80">Dégâts moyens</td>
                          {selectedOperators.map((operator) => (
                            <td key={operator.safename} className="p-4 text-center">
                              <span className={`font-bold ${getPerformanceColor(operator.averageWeaponDamage, comparisonStats.avgDamage.min, comparisonStats.avgDamage.max)}`}>
                                {operator.averageWeaponDamage}
                              </span>
                            </td>
                          ))}
                        </tr>
                        <tr className="border-t border-white/10">
                          <td className="p-4 text-white/80">Arme unique</td>
                          {selectedOperators.map((operator) => (
                            <td key={operator.safename} className="p-4 text-center">
                              <span className={operator.hasUniqueWeapon ? 'text-purple-400' : 'text-white/60'}>
                                {operator.hasUniqueWeapon ? '⭐ Oui' : 'Non'}
                              </span>
                            </td>
                          ))}
                        </tr>
                      </>
                    )}

                    {comparisonMode === 'weapons' && (
                      <>
                        <tr className="border-t border-white/10">
                          <td className="p-4 text-white/80">Types d&apos;armes</td>
                          {selectedOperators.map((operator) => (
                            <td key={operator.safename} className="p-4">
                              <div className="flex flex-wrap justify-center gap-1">
                                {operator.weaponTypes.map((type: string) => (
                                  <span key={type} className="text-xs bg-white/10 px-2 py-1 rounded text-white/80">
                                    {type}
                                  </span>
                                ))}
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr className="border-t border-white/10">
                          <td className="p-4 text-white/80">Armes principales</td>
                          {selectedOperators.map((operator) => (
                            <td key={operator.safename} className="p-4">
                              <div className="space-y-1">
                                {operator.weapons.filter(w => w.class === 'Primary').slice(0, 3).map((weapon, idx) => (
                                  <div key={idx} className="text-xs text-center">
                                    <div className="text-white font-medium">{weapon.name}</div>
                                    <div className="text-white/60">{weapon.damage} DMG</div>
                                  </div>
                                ))}
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr className="border-t border-white/10">
                          <td className="p-4 text-white/80">Armes secondaires</td>
                          {selectedOperators.map((operator) => (
                            <td key={operator.safename} className="p-4">
                              <div className="space-y-1">
                                {operator.weapons.filter(w => w.class === 'Secondary').slice(0, 2).map((weapon, idx) => (
                                  <div key={idx} className="text-xs text-center">
                                    <div className="text-white font-medium">{weapon.name}</div>
                                    <div className="text-white/60">{weapon.damage} DMG</div>
                                  </div>
                                ))}
                              </div>
                            </td>
                          ))}
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Message d'aide */}
        {selectedOperators.length < 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="pi pi-chart-bar text-white/50 text-2xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Commencez votre comparaison</h3>
            <p className="text-white/60 mb-4">
              Sélectionnez au moins 2 opérateurs pour démarrer l&apos;analyse comparative.
            </p>
            <p className="text-white/50 text-sm">
              Vous pouvez comparer jusqu&apos;à 4 opérateurs simultanément.
            </p>
          </motion.div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3 text-white/70">
              <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              <span>Chargement des données de comparaison...</span>
            </div>
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-500/20 border border-red-500/30 rounded-2xl p-6"
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
      </div>
    </div>
  );
}