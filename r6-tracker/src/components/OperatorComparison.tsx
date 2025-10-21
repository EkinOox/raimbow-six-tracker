'use client';

// Composant de comparaison d'opérateurs côte à côte
// Encodage: UTF-8

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Operator } from '@/types/r6-api-types';

interface OperatorComparisonProps {
  operators: Operator[];
  currentOperator?: Operator;
}

export default function OperatorComparison({ operators, currentOperator }: OperatorComparisonProps) {
  const [selectedOperators, setSelectedOperators] = useState<[Operator | null, Operator | null]>([
    currentOperator || null,
    null
  ]);
  const [searchTerms, setSearchTerms] = useState<[string, string]>(['', '']);

  const handleSelectOperator = (operator: Operator, index: 0 | 1) => {
    const newSelected: [Operator | null, Operator | null] = [...selectedOperators];
    newSelected[index] = operator;
    setSelectedOperators(newSelected);
    
    const newSearchTerms: [string, string] = [...searchTerms];
    newSearchTerms[index] = '';
    setSearchTerms(newSearchTerms);
  };

  const handleSearchChange = (value: string, index: 0 | 1) => {
    const newSearchTerms: [string, string] = [...searchTerms];
    newSearchTerms[index] = value;
    setSearchTerms(newSearchTerms);
  };

  const getFilteredOperators = (index: 0 | 1) => {
    if (!searchTerms[index]) return [];
    return operators.filter(op => 
      op.name.toLowerCase().includes(searchTerms[index].toLowerCase()) ||
      op.realname.toLowerCase().includes(searchTerms[index].toLowerCase())
    ).slice(0, 5);
  };

  const compareValue = (val1: number, val2: number, index: 0 | 1, reverse = false) => {
    if (!selectedOperators[0] || !selectedOperators[1]) return 'text-white';
    
    const comparison = reverse ? val1 < val2 : val1 > val2;
    
    if (index === 0) {
      if (comparison) return 'text-green-400';
      if (val1 === val2) return 'text-white';
      return 'text-orange-400';
    } else {
      if (!comparison && val1 !== val2) return 'text-green-400';
      if (val1 === val2) return 'text-white';
      return 'text-orange-400';
    }
  };

  const getSideColor = (side: string) => {
    return side === 'attacker' ? 'text-orange-400' : 'text-blue-400';
  };

  const getSideBg = (side: string) => {
    return side === 'attacker' ? 'bg-orange-500/20 border-orange-500/30' : 'bg-blue-500/20 border-blue-500/30';
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
        <i className="pi pi-users mr-3 text-purple-400"></i>
        Comparaison d&apos;opérateurs
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {[0, 1].map((index) => {
          const idx = index as 0 | 1;
          const operator = selectedOperators[idx];

          return (
            <div key={index} className="space-y-4">
              {/* Sélecteur d'opérateur */}
              <div className="relative">
                <label className="block text-sm font-medium text-white/80 mb-2">
                  {index === 0 ? 'Opérateur 1' : 'Opérateur 2'}
                  {currentOperator && index === 0 && ' (Actuel)'}
                </label>
                <div className="relative">
                  <i className="pi pi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 z-10"></i>
                  <input
                    type="text"
                    value={searchTerms[idx]}
                    onChange={(e) => handleSearchChange(e.target.value, idx)}
                    placeholder="Rechercher un opérateur..."
                    disabled={currentOperator && index === 0}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Résultats de recherche */}
                {searchTerms[idx] && getFilteredOperators(idx).length > 0 && (
                  <div className="absolute z-20 w-full mt-2 bg-gray-800 border border-white/20 rounded-xl overflow-hidden shadow-xl max-h-60 overflow-y-auto">
                    {getFilteredOperators(idx).map((op) => (
                      <button
                        key={op.safename}
                        onClick={() => handleSelectOperator(op, idx)}
                        className="w-full px-4 py-3 hover:bg-white/10 text-left text-white flex items-center space-x-3 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-700 flex-shrink-0">
                          <Image
                            src={op.icon_url || '/images/logo/r6-logo.png'}
                            alt={op.name}
                            width={40}
                            height={40}
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium">{op.name}</div>
                          <div className="text-xs text-white/60">{op.realname}</div>
                        </div>
                        <div className={`ml-auto px-2 py-1 text-xs rounded ${getSideBg(op.side)} ${getSideColor(op.side)}`}>
                          {op.side === 'attacker' ? 'ATK' : 'DEF'}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Carte de l'opérateur sélectionné */}
              {operator ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`border rounded-xl p-6 ${getSideBg(operator.side)}`}
                >
                  {/* Image et nom */}
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-700">
                      <Image
                        src={operator.icon_url || '/images/logo/r6-logo.png'}
                        alt={operator.name}
                        width={80}
                        height={80}
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">{operator.name}</h3>
                      <p className="text-white/70 text-sm">{operator.realname}</p>
                      <div className={`inline-block mt-2 px-2 py-1 text-xs rounded ${getSideColor(operator.side)}`}>
                        {operator.side === 'attacker' ? 'Attaquant' : 'Défenseur'}
                      </div>
                    </div>
                  </div>

                  {/* Stats comparées */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white/80 text-sm flex items-center">
                        <i className="pi pi-heart text-red-400 mr-2"></i>
                        Santé
                      </span>
                      <span className={`font-bold text-lg ${compareValue(
                        selectedOperators[0]?.health || 0,
                        selectedOperators[1]?.health || 0,
                        idx
                      )}`}>
                        {operator.health} HP
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-white/80 text-sm flex items-center">
                        <i className="pi pi-forward text-yellow-400 mr-2"></i>
                        Vitesse
                      </span>
                      <span className={`font-bold text-lg ${compareValue(
                        parseInt(selectedOperators[0]?.speed || '0'),
                        parseInt(selectedOperators[1]?.speed || '0'),
                        idx
                      )}`}>
                        {operator.speed} / 3
                      </span>
                    </div>

                    <div className="pt-3 border-t border-white/10">
                      <div className="text-white/60 text-xs mb-1">Rôle(s)</div>
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(operator.roles) ? (
                          operator.roles.map((role, i) => (
                            <span key={i} className="px-2 py-1 bg-white/10 text-white/80 text-xs rounded">
                              {role}
                            </span>
                          ))
                        ) : (
                          <span className="px-2 py-1 bg-white/10 text-white/80 text-xs rounded">
                            {operator.roles}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {!(currentOperator && index === 0) && (
                    <button
                      onClick={() => {
                        const newSelected: [Operator | null, Operator | null] = [...selectedOperators];
                        newSelected[idx] = null;
                        setSelectedOperators(newSelected);
                      }}
                      className="w-full mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors text-sm"
                    >
                      <i className="pi pi-times mr-2"></i>
                      Retirer
                    </button>
                  )}
                  
                  <Link
                    href={`/operators/${operator.safename}`}
                    className="block w-full mt-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors text-sm text-center"
                  >
                    <i className="pi pi-eye mr-2"></i>
                    Voir les détails
                  </Link>
                </motion.div>
              ) : (
                <div className="bg-white/5 border-2 border-dashed border-white/20 rounded-xl p-8 text-center">
                  <i className="pi pi-user text-white/30 text-4xl mb-3"></i>
                  <p className="text-white/50">Recherchez et sélectionnez un opérateur</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Résumé de la comparaison */}
      {selectedOperators[0] && selectedOperators[1] && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-xl p-6"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center">
            <i className="pi pi-chart-line mr-2 text-purple-400"></i>
            Analyse comparative
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white/10 rounded-lg">
              <div className="text-white/60 text-xs mb-2">Différence de santé</div>
              <div className={`text-2xl font-bold ${
                selectedOperators[0].health > selectedOperators[1].health ? 'text-green-400' :
                selectedOperators[0].health < selectedOperators[1].health ? 'text-red-400' : 'text-white'
              }`}>
                {selectedOperators[0].health > selectedOperators[1].health ? '+' : ''}
                {selectedOperators[0].health - selectedOperators[1].health}
              </div>
              <div className="text-xs text-white/50 mt-1">HP</div>
            </div>

            <div className="text-center p-3 bg-white/10 rounded-lg">
              <div className="text-white/60 text-xs mb-2">Différence de vitesse</div>
              <div className={`text-2xl font-bold ${
                parseInt(selectedOperators[0].speed) > parseInt(selectedOperators[1].speed) ? 'text-green-400' :
                parseInt(selectedOperators[0].speed) < parseInt(selectedOperators[1].speed) ? 'text-red-400' : 'text-white'
              }`}>
                {parseInt(selectedOperators[0].speed) > parseInt(selectedOperators[1].speed) ? '+' : ''}
                {parseInt(selectedOperators[0].speed) - parseInt(selectedOperators[1].speed)}
              </div>
              <div className="text-xs text-white/50 mt-1">Niveau</div>
            </div>

            <div className="text-center p-3 bg-white/10 rounded-lg">
              <div className="text-white/60 text-xs mb-2">Style</div>
              <div className="text-sm font-bold text-white">
                {selectedOperators[0].health >= 125 ? 'Tank' : parseInt(selectedOperators[0].speed) >= 3 ? 'Rush' : 'Équilibré'}
              </div>
              <div className="text-xs text-white/50 mt-1">vs</div>
              <div className="text-sm font-bold text-white">
                {selectedOperators[1].health >= 125 ? 'Tank' : parseInt(selectedOperators[1].speed) >= 3 ? 'Rush' : 'Équilibré'}
              </div>
            </div>

            <div className="text-center p-3 bg-white/10 rounded-lg">
              <div className="text-white/60 text-xs mb-2">Même côté ?</div>
              <div className={`text-2xl font-bold ${
                selectedOperators[0].side === selectedOperators[1].side ? 'text-green-400' : 'text-orange-400'
              }`}>
                {selectedOperators[0].side === selectedOperators[1].side ? 'Oui' : 'Non'}
              </div>
              <div className="text-xs text-white/50 mt-1">
                {selectedOperators[0].side === selectedOperators[1].side ? 'Même équipe' : 'Équipes opposées'}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/20">
            <p className="text-white/70 text-sm">
              <i className="pi pi-info-circle mr-2 text-blue-400"></i>
              <strong>{selectedOperators[0].name}</strong> et <strong>{selectedOperators[1].name}</strong>
              {selectedOperators[0].side === selectedOperators[1].side 
                ? ' peuvent être joués dans la même équipe. Pensez à la synergie entre leurs capacités !'
                : ' sont dans des équipes opposées. Analysez comment contrer les forces de chacun.'}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
