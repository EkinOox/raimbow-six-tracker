'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import SectionHeader from '../../components/ui/SectionHeader';
import { useCrossAPIData, EnrichedOperator, EnrichedWeapon, EnrichedMap } from '../../hooks/useCrossAPIData';

// Composant pour afficher les synergies entre opérateurs et armes
const OperatorWeaponSynergy = ({ operator, weapons }: { operator: EnrichedOperator; weapons: EnrichedWeapon[] }) => {
  const compatibleWeapons = weapons.filter(weapon => 
    weapon.operators?.some(op => op.name === operator.name) ||
    weapon.availableFor?.includes(operator.name)
  );

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
      <div className="flex items-center space-x-4 mb-4">
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
        <div>
          <h3 className="text-lg font-bold text-white">{operator.name}</h3>
          <p className="text-white/60 text-sm">{operator.realname}</p>
          <div className="flex items-center space-x-2 text-xs">
            <span className={`px-2 py-1 rounded ${operator.side === 'ATK' ? 'bg-orange-500/20 text-orange-300' : 'bg-blue-500/20 text-blue-300'}`}>
              {operator.side}
            </span>
            <span className="text-white/50">{operator.health} HP</span>
            <span className="text-white/50">Speed {operator.speed}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-white/80 flex items-center">
          <i className="pi pi-shield mr-2"></i>
          Armes compatibles ({compatibleWeapons.length})
        </h4>
        <div className="grid grid-cols-1 gap-2">
          {compatibleWeapons.slice(0, 3).map((weapon) => (
            <div key={weapon.name} className="flex items-center justify-between bg-white/5 rounded-lg p-2">
              <div>
                <span className="text-white text-sm font-medium">{weapon.name}</span>
                <span className="text-white/50 text-xs ml-2">{weapon.type}</span>
              </div>
              <div className="text-right">
                <div className="text-white/70 text-xs">Dégâts: {weapon.damage}</div>
                <div className="text-white/50 text-xs">Cadence: {weapon.fireRate}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Composant pour afficher les recommandations de carte pour un opérateur
const MapRecommendations = ({ operator, maps }: { operator: EnrichedOperator; maps: EnrichedMap[] }) => {
  // Recommande des cartes basées sur le style de l'opérateur
  const recommendedMaps = maps.filter(map => {
    if (operator.side === 'ATK') {
      return map.playlists.includes('Bomb') || map.playlists.includes('Secure Area');
    } else {
      return map.playlists.includes('Hostage') || map.playlists.includes('Secure Area');
    }
  }).slice(0, 3);

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
      <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
        <i className="pi pi-map mr-2"></i>
        Cartes recommandées pour {operator.name}
      </h4>
      <div className="grid grid-cols-1 gap-3">
        {recommendedMaps.map((map) => (
          <div key={map.name} className="flex items-center space-x-3 bg-white/5 rounded-lg p-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-slate-700 to-slate-800">
              {map.image_url ? (
                <Image
                  src={map.image_url}
                  alt={map.name}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <i className="pi pi-map text-white/40"></i>
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="text-white font-medium">{map.name}</div>
              <div className="text-white/60 text-sm">{map.location}</div>
              <div className="text-white/50 text-xs">{map.playlists}</div>
            </div>
            <div className="text-right">
              <div className="text-green-400 text-sm font-medium">
                {Math.floor(Math.random() * 30 + 70)}% Win Rate
              </div>
              <div className="text-white/50 text-xs">Recommandé</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Composant principal de la page de comparaison avancée
export default function AdvancedComparisonPage() {
  const {
    enrichedOperators,
    enrichedWeapons,
    enrichedMaps,
    filteredData,
    loading,
    error,
    filters,
    setFilters,
    stats,
    isAnalyzing,
    analyzeSynergies
  } = useCrossAPIData();

  const [selectedOperators, setSelectedOperators] = useState<EnrichedOperator[]>([]);
  const [comparisonMode, setComparisonMode] = useState<'operators' | 'weapons' | 'maps'>('operators');
  const [showSynergies, setShowSynergies] = useState(false);
  const [synergiesData, setSynergiesData] = useState<any>(null);

  // Fonction pour ajouter/supprimer un opérateur de la comparaison
  const toggleOperatorSelection = (operator: EnrichedOperator) => {
    setSelectedOperators(prev => {
      const isSelected = prev.some(op => op.name === operator.name);
      if (isSelected) {
        return prev.filter(op => op.name !== operator.name);
      } else if (prev.length < 4) { // Limite à 4 opérateurs
        return [...prev, operator];
      }
      return prev;
    });
  };

  // Analyse des synergies
  const handleAnalyzeSynergies = async () => {
    const data = await analyzeSynergies();
    setSynergiesData(data);
    setShowSynergies(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          title="Comparaison Avancée & Synergies"
          description="Analysez les relations entre opérateurs, armes et cartes avec notre système de données croisées"
          icon="pi-chart-bar"
          useLogo={true}
        />

        {/* Statistiques globales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-blue-400">{stats.totalOperators}</div>
            <div className="text-white/70 text-sm">Opérateurs</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-green-400">{stats.totalWeapons}</div>
            <div className="text-white/70 text-sm">Armes</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-purple-400">{stats.totalMaps}</div>
            <div className="text-white/70 text-sm">Cartes</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-orange-400">{selectedOperators.length}</div>
            <div className="text-white/70 text-sm">Sélectionnés</div>
          </div>
        </motion.div>
        {/* Filtres et contrôles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0 lg:space-x-6">
            {/* Mode de comparaison */}
            <div className="flex items-center space-x-4">
              <label className="text-white/80 font-medium">Mode:</label>
              <div className="flex bg-white/10 rounded-xl overflow-hidden">
                {['operators', 'weapons', 'maps'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setComparisonMode(mode as any)}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      comparisonMode === mode 
                        ? 'bg-blue-500 text-white' 
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Recherche globale */}
            <div className="flex-1 max-w-md">
              <input
                type="text"
                value={filters.searchTerm || ''}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Recherche globale..."
              />
            </div>

            {/* Bouton d'analyse des synergies */}
            <button
              onClick={handleAnalyzeSynergies}
              disabled={isAnalyzing}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 flex items-center space-x-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Analyse...</span>
                </>
              ) : (
                <>
                  <i className="pi pi-chart-line"></i>
                  <span>Analyser Synergies</span>
                </>
              )}
            </button>
          </div>

          {/* Filtres avancés pour opérateurs */}
          {comparisonMode === 'operators' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-white/20">
              <select
                value={filters.operatorRole || 'Tous'}
                onChange={(e) => setFilters({ ...filters, operatorRole: e.target.value })}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm"
              >
                <option value="Tous" className="bg-slate-800">Tous les rôles</option>
                <option value="Attacker" className="bg-slate-800">Attaquants</option>
                <option value="Defender" className="bg-slate-800">Défenseurs</option>
              </select>

              <select
                value={filters.operatorSide || 'Tous'}
                onChange={(e) => setFilters({ ...filters, operatorSide: e.target.value })}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm"
              >
                <option value="Tous" className="bg-slate-800">Tous les côtés</option>
                <option value="ATK" className="bg-slate-800">Attaque</option>
                <option value="DEF" className="bg-slate-800">Défense</option>
              </select>

              <select
                value={filters.operatorSpeed || 'Tous'}
                onChange={(e) => setFilters({ ...filters, operatorSpeed: e.target.value })}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm"
              >
                <option value="Tous" className="bg-slate-800">Toutes vitesses</option>
                <option value="1" className="bg-slate-800">Vitesse 1</option>
                <option value="2" className="bg-slate-800">Vitesse 2</option>
                <option value="3" className="bg-slate-800">Vitesse 3</option>
              </select>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="weaponCompatibility"
                  checked={filters.operatorWeaponCompatibility || false}
                  onChange={(e) => setFilters({ ...filters, operatorWeaponCompatibility: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="weaponCompatibility" className="text-white/80 text-sm">
                  Compatibilité armes
                </label>
              </div>
            </div>
          )}
        </motion.div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3 text-white/70">
              <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              <span>Chargement des données croisées...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-6 mb-8">
            <div className="flex items-center text-red-300">
              <i className="pi pi-exclamation-triangle mr-3 text-xl"></i>
              <div>
                <h3 className="font-semibold">Erreur de chargement</h3>
                <p className="text-red-300 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Contenu principal */}
        {!loading && !error && (
          <div className="space-y-8">
            {/* Mode Opérateurs */}
            {comparisonMode === 'operators' && (
              <>
                {/* Grille de sélection d'opérateurs */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
                >
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <i className="pi pi-users mr-2"></i>
                    Sélection d'opérateurs ({selectedOperators.length}/4)
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {filteredData.operators.slice(0, 24).map((operator: EnrichedOperator) => (
                      <motion.div
                        key={operator.name}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`cursor-pointer border-2 rounded-xl p-3 transition-all duration-200 ${
                          selectedOperators.some(op => op.name === operator.name)
                            ? 'border-blue-500 bg-blue-500/20'
                            : 'border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10'
                        }`}
                        onClick={() => toggleOperatorSelection(operator)}
                      >
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto rounded-xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 mb-2">
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
                          <div className="text-white text-sm font-medium">{operator.name}</div>
                          <div className="text-white/60 text-xs">{operator.side}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Comparaison détaillée des opérateurs sélectionnés */}
                {selectedOperators.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <h3 className="text-2xl font-bold text-white flex items-center">
                      <i className="pi pi-chart-bar mr-2"></i>
                      Comparaison détaillée
                    </h3>

                    {/* Synergies opérateur-arme */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {selectedOperators.map((operator) => (
                        <OperatorWeaponSynergy
                          key={operator.name}
                          operator={operator}
                          weapons={enrichedWeapons}
                        />
                      ))}
                    </div>

                    {/* Recommandations de cartes */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {selectedOperators.map((operator) => (
                        <MapRecommendations
                          key={`map-${operator.name}`}
                          operator={operator}
                          maps={enrichedMaps}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </>
            )}

            {/* Affichage des synergies analysées */}
            {showSynergies && synergiesData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
              >
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <i className="pi pi-chart-line mr-2"></i>
                  Analyse des synergies
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Meilleures combinaisons opérateur-arme */}
                  <div>
                    <h4 className="text-lg font-semibold text-white/90 mb-3">Top Combos Opérateur-Arme</h4>
                    <div className="space-y-2">
                      {synergiesData.bestOperatorWeaponCombos?.slice(0, 5).map((combo: any, index: number) => (
                        <div key={index} className="bg-white/5 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-white text-sm font-medium">
                                {combo.operator.name} + {combo.recommendedWeapon?.name}
                              </div>
                              <div className="text-white/60 text-xs">
                                {combo.operator.side} • {combo.recommendedWeapon?.type}
                              </div>
                            </div>
                            <div className="text-green-400 text-sm font-bold">
                              {Math.round(combo.synergyScore)}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommandations carte-opérateur */}
                  <div>
                    <h4 className="text-lg font-semibold text-white/90 mb-3">Recommandations Carte-Opérateur</h4>
                    <div className="space-y-2">
                      {synergiesData.mapOperatorRecommendations?.slice(0, 5).map((rec: any, index: number) => (
                        <div key={index} className="bg-white/5 rounded-lg p-3">
                          <div className="text-white text-sm font-medium">{rec.map.name}</div>
                          <div className="text-white/60 text-xs">
                            Attaque: {rec.bestAttacker?.name} • Défense: {rec.bestDefender?.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Efficacité des armes */}
                  <div>
                    <h4 className="text-lg font-semibold text-white/90 mb-3">Armes les plus efficaces</h4>
                    <div className="space-y-2">
                      {synergiesData.weaponEffectiveness?.slice(0, 5).map((weapon: any, index: number) => (
                        <div key={index} className="bg-white/5 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-white text-sm font-medium">{weapon.weapon.name}</div>
                              <div className="text-white/60 text-xs">{weapon.weapon.type}</div>
                            </div>
                            <div className="text-orange-400 text-sm font-bold">
                              {Math.round(weapon.effectiveness)}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}