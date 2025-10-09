'use client';

// Page de détail d'un opérateur avec armes et compétences
// Encodage: UTF-8

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useOperators } from '../../../hooks/useR6Data';
import { R6Operator } from '../../../types/r6-api-types';

export default function OperatorDetailPage() {
  const { safename } = useParams();
  const { operators, loading, error, loadOperators } = useOperators();
  const [operator, setOperator] = useState<R6Operator | null>(null);

  // Charger les opérateurs et trouver celui correspondant au safename
  useEffect(() => {
    if (operators.length === 0) {
      loadOperators();
    }
  }, [operators.length, loadOperators]);

  useEffect(() => {
    if (operators.length > 0 && safename) {
      const foundOperator = operators.find(op => 
        op.safename === safename || 
        op.name.toLowerCase().replace(/\s+/g, '-') === safename
      );
      setOperator(foundOperator || null);
    }
  }, [operators, safename]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-3 text-white/70">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          <span className="text-lg">Chargement de l&apos;opérateur...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="pi pi-exclamation-triangle text-red-400 text-2xl"></i>
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">Erreur de chargement</h2>
          <p className="text-white/60 mb-4">{error}</p>
          <Link href="/operators" className="text-blue-400 hover:text-blue-300 transition-colors">
            Retour aux opérateurs
          </Link>
        </div>
      </div>
    );
  }

  if (!operator) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="pi pi-search text-white/50 text-2xl"></i>
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">Opérateur non trouvé</h2>
          <p className="text-white/60 mb-4">
            L&apos;opérateur demandé n&apos;existe pas ou n&apos;est plus disponible.
          </p>
          <Link href="/operators" className="text-blue-400 hover:text-blue-300 transition-colors">
            Retour aux opérateurs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* Bouton de retour */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Link 
              href="/operators"
              className="inline-flex items-center space-x-2 text-white/60 hover:text-white transition-colors"
            >
              <i className="pi pi-arrow-left"></i>
              <span>Retour aux opérateurs</span>
            </Link>
          </motion.div>

          {/* En-tête de l'opérateur */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden mb-8"
          >
            <div className="relative">
              {/* Image de fond */}
              <div className="h-64 md:h-80 relative bg-gradient-to-br from-blue-600 to-purple-600">
                {operator.image_url && (
                  <Image
                    src={operator.image_url}
                    alt={operator.name}
                    fill
                    className="object-cover"
                    priority
                  />
                )}
                <div className="absolute inset-0 bg-black/40"></div>
              </div>

              {/* Informations principales */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <div className="flex items-end space-x-4">
                  {/* Avatar */}
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-4 border-white/20 bg-white/10 backdrop-blur-xl">
                    {operator.iconUrl ? (
                      <Image
                        src={operator.iconUrl}
                        alt={`Icône ${operator.name}`}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <i className="pi pi-user text-white/50 text-2xl"></i>
                      </div>
                    )}
                  </div>

                  {/* Nom et informations */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h1 className="text-3xl md:text-4xl font-bold text-white">
                        {operator.name}
                      </h1>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        operator.side === 'ATK' 
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' 
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        {operator.side === 'ATK' ? 'Attaquant' : 'Défenseur'}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-white/80">
                      <div className="flex items-center space-x-2">
                        <i className="pi pi-flag text-sm"></i>
                        <span>{operator.country}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <i className="pi pi-users text-sm"></i>
                        <span>{operator.unit}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <i className="pi pi-star text-sm"></i>
                        <span>Vitesse: {operator.speed}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <i className="pi pi-shield text-sm"></i>
                        <span>Armure: {operator.armor}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contenu principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Colonne principale */}
            <div className="lg:col-span-2 space-y-8">
              {/* Compétences */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
              >
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                  <i className="pi pi-bolt text-yellow-400"></i>
                  <span>Compétences</span>
                </h2>

                <div className="space-y-6">
                  {/* Compétence unique */}
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-start space-x-4">
                      {operator.uniqueAbility?.iconUrl && (
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/10">
                          <Image
                            src={operator.uniqueAbility.iconUrl}
                            alt={operator.uniqueAbility.name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {operator.uniqueAbility?.name || 'Compétence unique'}
                        </h3>
                        <p className="text-white/70 leading-relaxed">
                          {operator.uniqueAbility?.description || 'Description non disponible'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Compétences additionnelles */}
                  {operator.abilities && operator.abilities.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-lg font-semibold text-white">Compétences additionnelles</h4>
                      {operator.abilities.map((ability, index) => (
                        <div key={index} className="p-3 bg-white/5 rounded-lg border border-white/10">
                          <div className="flex items-start space-x-3">
                            {ability.iconUrl && (
                              <div className="w-8 h-8 rounded overflow-hidden bg-white/10">
                                <Image
                                  src={ability.iconUrl}
                                  alt={ability.name}
                                  width={32}
                                  height={32}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div>
                              <h5 className="font-medium text-white">{ability.name}</h5>
                              <p className="text-sm text-white/60 mt-1">{ability.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Armes */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
              >
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                  <i className="pi pi-bolt text-orange-400"></i>
                  <span>Arsenal</span>
                </h2>

                <div className="space-y-6">
                  {/* Armes primaires */}
                  {operator.weapons?.primary && operator.weapons.primary.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Armes primaires</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {operator.weapons.primary.map((weapon, index) => (
                          <Link
                            key={index}
                            href={`/weapons/${weapon.toLowerCase().replace(/\s+/g, '-')}`}
                            className="block p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors group"
                          >
                            <div className="flex items-center space-x-3">
                              <i className="pi pi-bolt text-orange-400 text-xl"></i>
                              <div>
                                <h4 className="font-medium text-white group-hover:text-orange-400 transition-colors">
                                  {weapon}
                                </h4>
                                <p className="text-xs text-white/50">Arme primaire</p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Armes secondaires */}
                  {operator.weapons?.secondary && operator.weapons.secondary.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Armes secondaires</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {operator.weapons.secondary.map((weapon, index) => (
                          <Link
                            key={index}
                            href={`/weapons/${weapon.toLowerCase().replace(/\s+/g, '-')}`}
                            className="block p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors group"
                          >
                            <div className="flex items-center space-x-3">
                              <i className="pi pi-circle text-blue-400 text-lg"></i>
                              <div>
                                <h4 className="font-medium text-white group-hover:text-blue-400 transition-colors">
                                  {weapon}
                                </h4>
                                <p className="text-xs text-white/50">Arme secondaire</p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Gadgets */}
                  {operator.gadgets && operator.gadgets.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Gadgets</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {operator.gadgets.map((gadget, index) => (
                          <div key={index} className="p-4 bg-white/5 rounded-xl border border-white/10">
                            <div className="flex items-center space-x-3">
                              <i className="pi pi-cog text-purple-400 text-lg"></i>
                              <div>
                                <h4 className="font-medium text-white">{gadget}</h4>
                                <p className="text-xs text-white/50">Gadget</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Statistiques */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
              >
                <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                  <i className="pi pi-chart-bar text-green-400"></i>
                  <span>Statistiques</span>
                </h2>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-white/10">
                    <span className="text-white/70">Vitesse</span>
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        {[...Array(3)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i < operator.speed ? 'bg-green-400' : 'bg-white/20'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-white font-medium">{operator.speed}/3</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-white/10">
                    <span className="text-white/70">Armure</span>
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        {[...Array(3)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i < operator.armor ? 'bg-blue-400' : 'bg-white/20'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-white font-medium">{operator.armor}/3</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-3">
                    <span className="text-white/70">Difficulté</span>
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        {[...Array(3)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i < (operator.difficulty || 1) ? 'bg-yellow-400' : 'bg-white/20'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-white font-medium">{operator.difficulty || 1}/3</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Informations détaillées */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
              >
                <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                  <i className="pi pi-info-circle text-blue-400"></i>
                  <span>Informations</span>
                </h2>

                <div className="space-y-4">
                  {operator.realName && (
                    <div>
                      <span className="text-white/70 text-sm block">Nom réel</span>
                      <span className="text-white font-medium">{operator.realName}</span>
                    </div>
                  )}

                  {operator.dateOfBirth && (
                    <div>
                      <span className="text-white/70 text-sm block">Date de naissance</span>
                      <span className="text-white font-medium">{operator.dateOfBirth}</span>
                    </div>
                  )}

                  {operator.placeOfBirth && (
                    <div>
                      <span className="text-white/70 text-sm block">Lieu de naissance</span>
                      <span className="text-white font-medium">{operator.placeOfBirth}</span>
                    </div>
                  )}

                  {operator.height && (
                    <div>
                      <span className="text-white/70 text-sm block">Taille</span>
                      <span className="text-white font-medium">{operator.height}</span>
                    </div>
                  )}

                  {operator.weight && (
                    <div>
                      <span className="text-white/70 text-sm block">Poids</span>
                      <span className="text-white font-medium">{operator.weight}</span>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Rôle et description */}
              {operator.role && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
                >
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                    <i className="pi pi-briefcase text-purple-400"></i>
                    <span>Rôle</span>
                  </h2>

                  <div className="space-y-3">
                    <div className="inline-flex items-center px-3 py-2 bg-purple-500/20 text-purple-400 rounded-lg border border-purple-500/30">
                      <span className="font-medium">{operator.role}</span>
                    </div>
                    
                    {operator.bio && (
                      <p className="text-white/70 text-sm leading-relaxed">
                        {operator.bio}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}