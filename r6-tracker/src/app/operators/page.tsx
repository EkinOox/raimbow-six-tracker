'use client';

// Page Opérateurs avec Redux
// Encodage: UTF-8

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import SectionHeader from '../../components/ui/SectionHeader';
import { useOperators } from '../../hooks/useR6Data';
import { OperatorFilters } from '../../types/r6-api-types';

const roles = ['Tous', 'Attacker', 'Defender'];
const sides = ['Tous', 'ATK', 'DEF'];

export default function OperatorsPage() {
  const { operators, loading, error, loadOperators, updateFilters, filters } = useOperators();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('Tous');
  const [selectedSide, setSelectedSide] = useState('Tous');

  // Charger les opérateurs au montage du composant
  useEffect(() => {
    loadOperators();
  }, [loadOperators]);

  // Appliquer les filtres quand ils changent
  useEffect(() => {
    const applyFilters = () => {
      const newFilters: OperatorFilters = {};
      
      if (searchTerm.trim()) {
        newFilters.name = searchTerm.trim();
      }
      if (selectedRole !== 'Tous') {
        newFilters.roles = selectedRole;
      }
      if (selectedSide !== 'Tous') {
        newFilters.side = selectedSide;
      }
      
      updateFilters(newFilters);
    };

    const debounce = setTimeout(() => {
      applyFilters();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchTerm, selectedRole, selectedSide, updateFilters]);

  const getOperatorTypeColor = (side: string) => {
    return side === 'ATK' ? 'text-orange-400' : 'text-blue-400';
  };

  const getOperatorTypeBg = (side: string) => {
    return side === 'ATK' ? 'bg-orange-500/20' : 'bg-blue-500/20';
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* En-tête */}
        <SectionHeader
          title="Opérateurs"
          description="Découvrez tous les opérateurs Rainbow Six Siege avec leurs statistiques, biographies et capacités spéciales."
          icon="pi-users"
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
                Rechercher un opérateur
              </label>
              <div className="relative">
                <i className="pi pi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50"></i>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Ex: Ash, Thermite..."
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Filtre par rôle */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Rôle
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                {roles.map(role => (
                  <option key={role} value={role} className="bg-gray-800">
                    {role}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtre par côté */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Côté
              </label>
              <select
                value={selectedSide}
                onChange={(e) => setSelectedSide(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                {sides.map(side => (
                  <option key={side} value={side} className="bg-gray-800">
                    {side}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Statistiques de filtrage */}
          <div className="mt-4 flex items-center justify-between text-sm text-white/60">
            <span>
              {loading ? 'Chargement...' : `${operators.length} opérateur(s) trouvé(s)`}
            </span>
            {Object.keys(filters).length > 0 && (
              <button
                onClick={() => updateFilters({})}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                <i className="pi pi-times mr-1"></i>
                Effacer les filtres
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
              <span className="font-medium">Erreur de chargement</span>
            </div>
            <p className="text-red-300 mt-1">{error}</p>
          </motion.div>
        )}

        {/* Loading state */}
        {loading && operators.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3 text-white/70">
              <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              <span>Chargement des opérateurs...</span>
            </div>
          </div>
        )}

        {/* Grille des opérateurs */}
        <AnimatePresence mode="wait">
          {!loading && operators.length > 0 && (
            <motion.div
              key="operators-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
            >
              {operators.map((operator, index) => (
                <motion.div
                  key={operator.safename}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  className="group"
                >
                  <Link href={`/operators/${operator.safename}`}>
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 cursor-pointer">
                      {/* Icône de l'opérateur */}
                      <div className="relative w-20 h-20 mx-auto mb-4">
                        {operator.icon_url ? (
                          <Image
                            src={operator.icon_url}
                            alt={`Icône de ${operator.name}`}
                            fill
                            className="object-contain rounded-lg"
                            sizes="80px"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {operator.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Informations de l'opérateur */}
                      <div className="text-center">
                        <h3 className="text-lg font-bold text-white mb-1">
                          {operator.name}
                        </h3>
                        
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mb-2 ${getOperatorTypeBg(operator.side)}`}>
                          <span className={getOperatorTypeColor(operator.side)}>
                            {operator.roles}
                          </span>
                        </div>

                        <p className="text-white/60 text-sm mb-2">
                          {operator.realname}
                        </p>

                        <div className="flex items-center justify-center space-x-4 text-xs text-white/50">
                          <div className="flex items-center space-x-1">
                            <i className="pi pi-heart"></i>
                            <span>{operator.health}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <i className="pi pi-forward"></i>
                            <span>{operator.speed}</span>
                          </div>
                        </div>

                        <p className="text-white/40 text-xs mt-2">
                          {operator.unit}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message aucun résultat */}
        {!loading && operators.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="pi pi-search text-white/50 text-2xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Aucun opérateur trouvé
            </h3>
            <p className="text-white/60">
              Essayez de modifier vos critères de recherche ou de supprimer les filtres.
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}