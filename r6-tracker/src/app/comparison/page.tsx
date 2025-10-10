'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import SectionHeader from '../../components/ui/SectionHeader';
import { useCrossAPIData, EnrichedOperator, SynergyData } from '../../hooks/useCrossAPIData';

export default function AdvancedComparisonPage() {
  const {
    operators,
    weapons,
    maps,
    loading,
    error,
    analyzeSynergies
  } = useCrossAPIData();

  const [selectedOperators, setSelectedOperators] = useState<EnrichedOperator[]>([]);
  const [comparisonMode, setComparisonMode] = useState<'operators' | 'weapons' | 'maps'>('operators');
  const [showSynergies, setShowSynergies] = useState(false);
  const [synergiesData, setSynergiesData] = useState<SynergyData | null>(null);

  const handleOperatorSelect = (operator: EnrichedOperator) => {
    if (selectedOperators.find(op => op.name === operator.name)) {
      setSelectedOperators(prev => prev.filter(op => op.name !== operator.name));
    } else if (selectedOperators.length < 4) {
      setSelectedOperators(prev => [...prev, operator]);
    }
  };

  const handleAnalyzeSynergies = () => {
    if (selectedOperators.length > 0) {
      const data = analyzeSynergies(selectedOperators);
      setSynergiesData(data);
      setShowSynergies(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Chargement des données avancées...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">Erreur: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <SectionHeader 
          title="Comparaison Avancée R6"
          description="Analyse croisée des opérateurs, armes et cartes avec synergies intelligentes"
        />

        {/* Modes de comparaison */}
        <div className="flex justify-center space-x-4 mb-8">
          {(['operators', 'weapons', 'maps'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setComparisonMode(mode)}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                comparisonMode === mode
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {mode === 'operators' ? 'Opérateurs' : mode === 'weapons' ? 'Armes' : 'Cartes'}
            </button>
          ))}
        </div>

        {/* Section de sélection d'opérateurs */}
        {comparisonMode === 'operators' && (
          <motion.div 
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-xl font-bold text-white mb-4">
              Sélection d&apos;opérateurs ({selectedOperators.length}/4)
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
              {operators.slice(0, 24).map((operator) => (
                <motion.div
                  key={operator.name}
                  className={`relative p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                    selectedOperators.find(op => op.name === operator.name)
                      ? 'bg-blue-600 border-2 border-blue-400'
                      : 'bg-white/10 border border-white/20 hover:bg-white/20'
                  }`}
                  onClick={() => handleOperatorSelect(operator)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-2 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{operator.name.charAt(0)}</span>
                    </div>
                    <h4 className="text-white font-medium text-sm mb-1">{operator.name}</h4>
                    <p className="text-white/60 text-xs">{operator.side}</p>
                  </div>
                  
                  {selectedOperators.find(op => op.name === operator.name) && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {selectedOperators.length > 0 && (
              <div className="flex justify-center">
                <button
                  onClick={handleAnalyzeSynergies}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-medium rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-200"
                >
                  Analyser les Synergies ({selectedOperators.length} opérateurs)
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Résultats des synergies */}
        {showSynergies && synergiesData && (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Meilleures combinaisons Opérateur-Arme */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">🎯 Meilleures Combinaisons Opérateur-Arme</h3>
              <div className="space-y-3">
                {synergiesData.bestOperatorWeaponCombos?.slice(0, 5).map((combo, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 bg-white/5 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-blue-400 font-medium">{combo.operator.name}</span>
                        <span className="text-white/60">+</span>
                        <span className="text-green-400 font-medium">{combo.weapon.name}</span>
                      </div>
                      <p className="text-white/60 text-sm">{combo.reasons.join(', ')}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-yellow-400 font-bold">{Math.round(combo.synergyScore)}</div>
                      <div className="text-white/60 text-xs">Score</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommandations de cartes */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">🗺️ Recommandations de Cartes</h3>
              <div className="space-y-3">
                {synergiesData.mapOperatorRecommendations?.slice(0, 5).map((rec, index) => (
                  <div key={index} className="p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-purple-400 font-medium">{rec.map.name}</span>
                      <span className="text-white/60 text-sm">{rec.reasoning}</span>
                    </div>
                    <div className="flex space-x-4 text-sm">
                      <div>
                        <span className="text-red-400">Attaque: </span>
                        <span className="text-white">{rec.recommendedAttackers.map(op => op.name).join(', ')}</span>
                      </div>
                      <div>
                        <span className="text-blue-400">Défense: </span>
                        <span className="text-white">{rec.recommendedDefenders.map(op => op.name).join(', ')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Efficacité des armes */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">⚔️ Efficacité des Armes</h3>
              <div className="space-y-3">
                {synergiesData.weaponEffectiveness?.slice(0, 5).map((weapon, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 bg-white/5 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-green-400 font-medium">{weapon.weapon.name}</span>
                        <span className="text-white/60">({weapon.weapon.type})</span>
                      </div>
                      <div className="text-white/60 text-sm">
                        Meilleurs opérateurs: {weapon.bestOperators.join(', ')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-yellow-400 font-bold">{weapon.effectivenessScore}</div>
                      <div className="text-white/60 text-xs">Efficacité</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Statistiques globales */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">{operators.length}</div>
            <div className="text-white/70">Opérateurs Analysés</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">{weapons.length}</div>
            <div className="text-white/70">Armes Référencées</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">{maps.length}</div>
            <div className="text-white/70">Cartes Étudiées</div>
          </div>
        </div>
      </div>
    </div>
  );
}