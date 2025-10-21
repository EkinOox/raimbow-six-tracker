'use client';

// Composant de comparaison d'armes côte à côte
// Encodage: UTF-8

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Weapon } from '@/types/r6-api-types';
import { 
  getWeaponCategory, 
  calculateWeaponEffectiveness 
} from '@/utils/weaponCategories';

interface WeaponComparisonProps {
  weapons: Weapon[];
}

export default function WeaponComparison({ weapons }: WeaponComparisonProps) {
  const [selectedWeapons, setSelectedWeapons] = useState<[Weapon | null, Weapon | null]>([null, null]);
  const [searchTerms, setSearchTerms] = useState<[string, string]>(['', '']);

  const handleSelectWeapon = (weapon: Weapon, index: 0 | 1) => {
    const newSelected: [Weapon | null, Weapon | null] = [...selectedWeapons];
    newSelected[index] = weapon;
    setSelectedWeapons(newSelected);
    
    // Clear search
    const newSearchTerms: [string, string] = [...searchTerms];
    newSearchTerms[index] = '';
    setSearchTerms(newSearchTerms);
  };

  const handleSearchChange = (value: string, index: 0 | 1) => {
    const newSearchTerms: [string, string] = [...searchTerms];
    newSearchTerms[index] = value;
    setSearchTerms(newSearchTerms);
  };

  const getFilteredWeapons = (index: 0 | 1) => {
    if (!searchTerms[index]) return [];
    return weapons.filter(w => 
      w.name.toLowerCase().includes(searchTerms[index].toLowerCase())
    ).slice(0, 5);
  };

  const compareValue = (val1: number, val2: number, index: 0 | 1) => {
    if (!selectedWeapons[0] || !selectedWeapons[1]) return 'text-white';
    
    if (index === 0) {
      if (val1 > val2) return 'text-green-400';
      if (val1 < val2) return 'text-red-400';
    } else {
      if (val2 > val1) return 'text-green-400';
      if (val2 < val1) return 'text-red-400';
    }
    return 'text-white';
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
        <i className="pi pi-sync mr-3 text-purple-400"></i>
        Comparaison d&apos;armes
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[0, 1].map((index) => {
          const idx = index as 0 | 1;
          const weapon = selectedWeapons[idx];
          const category = weapon ? getWeaponCategory(weapon.type) : null;
          const effectiveness = weapon ? calculateWeaponEffectiveness(weapon) : 0;

          return (
            <div key={index} className="space-y-4">
              {/* Sélecteur d'arme */}
              <div className="relative">
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Arme {index + 1}
                </label>
                <div className="relative">
                  <i className="pi pi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 z-10"></i>
                  <input
                    type="text"
                    value={searchTerms[idx]}
                    onChange={(e) => handleSearchChange(e.target.value, idx)}
                    placeholder="Rechercher une arme..."
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Résultats de recherche */}
                {searchTerms[idx] && getFilteredWeapons(idx).length > 0 && (
                  <div className="absolute z-20 w-full mt-2 bg-gray-800 border border-white/20 rounded-xl overflow-hidden shadow-xl">
                    {getFilteredWeapons(idx).map((w) => (
                      <button
                        key={w.name}
                        onClick={() => handleSelectWeapon(w, idx)}
                        className="w-full px-4 py-3 hover:bg-white/10 text-left text-white flex items-center space-x-3 transition-colors"
                      >
                        <i className={`pi ${getWeaponCategory(w.type).icon} text-white/70`}></i>
                        <div>
                          <div className="font-medium">{w.name}</div>
                          <div className="text-xs text-white/60">{w.type}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Carte de l'arme sélectionnée */}
              {weapon && category ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`bg-gradient-to-br ${category.gradient} rounded-xl p-6 border ${category.borderColor}`}
                >
                  {/* Image */}
                  <div className="h-32 flex items-center justify-center mb-4 bg-black/20 rounded-lg">
                    {weapon.image_url ? (
                      <Image
                        src={weapon.image_url}
                        alt={weapon.name}
                        width={150}
                        height={75}
                        className="object-contain"
                      />
                    ) : (
                      <i className={`pi ${category.icon} text-white/30 text-4xl`}></i>
                    )}
                  </div>

                  {/* Info */}
                  <h3 className="text-xl font-bold text-white mb-2">{weapon.name}</h3>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-white/80 text-sm">{weapon.type}</span>
                    <span className="px-3 py-1 bg-black/30 rounded-full text-white font-bold text-sm">
                      {effectiveness}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white/80 text-sm">Dégâts</span>
                      <span className={`font-bold text-lg ${compareValue(selectedWeapons[0]?.damage || 0, selectedWeapons[1]?.damage || 0, idx)}`}>
                        {weapon.damage}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/80 text-sm">Cadence</span>
                      <span className={`font-bold text-lg ${compareValue(selectedWeapons[0]?.fireRate || 0, selectedWeapons[1]?.fireRate || 0, idx)}`}>
                        {weapon.fireRate}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/80 text-sm">Mobilité</span>
                      <span className={`font-bold text-lg ${compareValue(selectedWeapons[0]?.mobility || 0, selectedWeapons[1]?.mobility || 0, idx)}`}>
                        {weapon.mobility}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/80 text-sm">Capacité</span>
                      <span className={`font-bold text-lg ${compareValue(selectedWeapons[0]?.capacity || 0, selectedWeapons[1]?.capacity || 0, idx)}`}>
                        {weapon.capacity}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const newSelected: [Weapon | null, Weapon | null] = [...selectedWeapons];
                      newSelected[idx] = null;
                      setSelectedWeapons(newSelected);
                    }}
                    className="w-full mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
                  >
                    <i className="pi pi-times mr-2"></i>
                    Retirer
                  </button>
                </motion.div>
              ) : (
                <div className="bg-white/5 border-2 border-dashed border-white/20 rounded-xl p-8 text-center">
                  <i className="pi pi-search text-white/30 text-4xl mb-3"></i>
                  <p className="text-white/50">Recherchez et sélectionnez une arme</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Résumé de la comparaison */}
      {selectedWeapons[0] && selectedWeapons[1] && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-6"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center">
            <i className="pi pi-chart-line mr-2 text-blue-400"></i>
            Résumé de la comparaison
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-white/60 text-sm mb-1">DPS Théorique</div>
              <div className="text-2xl font-bold text-white">
                {Math.round((selectedWeapons[0].damage * selectedWeapons[0].fireRate) / 60)}
              </div>
              <div className="text-xs text-white/50">vs</div>
              <div className="text-2xl font-bold text-white">
                {Math.round((selectedWeapons[1].damage * selectedWeapons[1].fireRate) / 60)}
              </div>
            </div>

            <div className="text-center">
              <div className="text-white/60 text-sm mb-1">Efficacité</div>
              <div className="text-2xl font-bold text-white">
                {calculateWeaponEffectiveness(selectedWeapons[0])}
              </div>
              <div className="text-xs text-white/50">vs</div>
              <div className="text-2xl font-bold text-white">
                {calculateWeaponEffectiveness(selectedWeapons[1])}
              </div>
            </div>

            <div className="text-center">
              <div className="text-white/60 text-sm mb-1">Temps/Chargeur</div>
              <div className="text-2xl font-bold text-white">
                {((selectedWeapons[0].capacity / selectedWeapons[0].fireRate) * 60).toFixed(1)}s
              </div>
              <div className="text-xs text-white/50">vs</div>
              <div className="text-2xl font-bold text-white">
                {((selectedWeapons[1].capacity / selectedWeapons[1].fireRate) * 60).toFixed(1)}s
              </div>
            </div>

            <div className="text-center">
              <div className="text-white/60 text-sm mb-1">Opérateurs</div>
              <div className="text-2xl font-bold text-white">
                {selectedWeapons[0].operators?.length || 0}
              </div>
              <div className="text-xs text-white/50">vs</div>
              <div className="text-2xl font-bold text-white">
                {selectedWeapons[1].operators?.length || 0}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
