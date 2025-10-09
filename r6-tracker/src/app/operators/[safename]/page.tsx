'use client';

// Page de détail d'un opérateur complète avec corrélation d'armes
// Encodage: UTF-8

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useOperators, useWeapons } from '../../../hooks/useR6Data';
import { Operator, Weapon } from '../../../types/r6-api-types';

export default function OperatorDetailPage() {
  const { safename } = useParams();
  const { operators, loading: operatorsLoading, error: operatorsError, loadOperators } = useOperators();
  const { weapons, loading: weaponsLoading, loadWeapons } = useWeapons();
  const [operator, setOperator] = useState<Operator | null>(null);

  // Charger les opérateurs et armes
  useEffect(() => {
    if (!operators || operators.length === 0) {
      loadOperators();
    }
    if (!weapons || weapons.length === 0) {
      loadWeapons();
    }
  }, [operators, weapons, loadOperators, loadWeapons]);

  useEffect(() => {
    if (operators && operators.length > 0 && safename) {
      const foundOperator = operators.find((op: Operator) =>
        op.safename === safename
      );
      setOperator(foundOperator || null);
    }
  }, [operators, safename]);

  // Corrélation avec les armes
  const operatorWeapons = useMemo(() => {
    if (!operator || !weapons || weapons.length === 0) return { primary: [], secondary: [] };

    const primary = weapons.filter((weapon: Weapon) => 
      weapon.availableFor?.includes(operator.name) && 
      ['Assault Rifle', 'SMG', 'LMG', 'Shotgun', 'DMR', 'Sniper Rifle'].includes(weapon.type)
    );

    const secondary = weapons.filter((weapon: Weapon) =>
      weapon.availableFor?.includes(operator.name) && 
      ['Pistol', 'Machine Pistol', 'Revolver'].includes(weapon.type)
    );

    return { primary, secondary };
  }, [operator, weapons]);

  const getOperatorTypeColor = (side: string) => {
    return side === 'attacker' ? 'text-orange-400' : 'text-blue-400';
  };

  const getOperatorTypeBg = (side: string) => {
    return side === 'attacker' ? 'bg-orange-500/20' : 'bg-blue-500/20';
  };

  const getSideDisplay = (side: string) => {
    return side === 'attacker' ? 'Attaquant' : 'Défenseur';
  };

  const getSpeedIcon = (speed: string) => {
    const speedNum = parseInt(speed);
    if (speedNum === 3) return '⚡⚡⚡';
    if (speedNum === 2) return '⚡⚡☆';
    return '⚡☆☆';
  };

  const getSpeedLabel = (speed: string) => {
    const speedNum = parseInt(speed);
    if (speedNum === 3) return 'Rapide';
    if (speedNum === 2) return 'Moyen';
    return 'Lent';
  };

  const getArmorIcon = (health: number) => {
    if (health >= 125) return '🛡️🛡️🛡️';
    if (health >= 110) return '🛡️🛡️☆';
    return '🛡️☆☆';
  };

  const getArmorLabel = (health: number) => {
    if (health >= 125) return 'Lourd (3 armures)';
    if (health >= 110) return 'Moyen (2 armures)';
    return 'Léger (1 armure)';
  };

  if (operatorsLoading && (!operators || operators.length === 0)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="flex items-center space-x-3 text-white/70">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          <span className="text-lg">Chargement de l&apos;opérateur...</span>
        </div>
      </div>
    );
  }

  if (operatorsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="pi pi-exclamation-triangle text-red-400 text-2xl"></i>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Erreur de chargement</h2>
          <p className="text-red-300 mb-4">{operatorsError}</p>
          <Link
            href="/operators"
            className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Retour aux opérateurs
          </Link>
        </div>
      </div>
    );
  }

  if (!operator) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="pi pi-user text-white/50 text-2xl"></i>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Opérateur non trouvé</h2>
          <p className="text-white/60 mb-4">
            L&apos;opérateur avec l&apos;identifiant &quot;{safename}&quot; n&apos;existe pas.
          </p>
          <Link
            href="/operators"
            className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Retour aux opérateurs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <Link
            href="/operators"
            className="inline-flex items-center text-white/70 hover:text-white transition-colors"
          >
            <i className="pi pi-arrow-left mr-2"></i>
            Retour aux opérateurs
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Colonne principale - Image et info de base */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden mb-6"
            >
              {/* Image principale */}
              <div className="relative aspect-square bg-gradient-to-br from-slate-800 to-slate-900">
                <Image
                  src={operator.icon_url || '/images/logo/r6-logo.png'}
                  alt={operator.name}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/logo/r6-logo.png';
                  }}
                />
                <div className="absolute top-4 right-4">
                  <div className={`px-3 py-1 rounded-lg text-sm font-medium ${getOperatorTypeBg(operator.side)} ${getOperatorTypeColor(operator.side)}`}>
                    {getSideDisplay(operator.side)}
                  </div>
                </div>
              </div>

              {/* Nom et titre */}
              <div className="p-6">
                <h1 className="text-3xl font-bold text-white mb-2">{operator.name}</h1>
                <p className="text-white/70 text-lg mb-4">{operator.realname}</p>
                
                {/* Badges des rôles */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {Array.isArray(operator.roles) ? (
                    operator.roles.map((role, index) => (
                      <span key={index} className={`px-3 py-1 rounded-full text-xs font-medium ${getOperatorTypeBg(operator.side)} ${getOperatorTypeColor(operator.side)}`}>
                        {role}
                      </span>
                    ))
                  ) : (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getOperatorTypeBg(operator.side)} ${getOperatorTypeColor(operator.side)}`}>
                      {operator.roles}
                    </span>
                  )}
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/70">
                    {operator.unit}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/70">
                    {operator.season_introduced}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Statistiques */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4">
                <i className="pi pi-chart-bar mr-2"></i>
                Statistiques de combat
              </h3>
              
              <div className="space-y-4">
                {/* Santé/Armure */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <i className="pi pi-heart mr-2 text-red-400"></i>
                    <span className="text-white/70">Santé & Armure</span>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end space-x-2 mb-1">
                      <span className="text-white font-medium">{operator.health} HP</span>
                      <span>{getArmorIcon(operator.health)}</span>
                    </div>
                    <div className="text-xs text-white/60">{getArmorLabel(operator.health)}</div>
                  </div>
                </div>

                {/* Vitesse */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="mr-2">{getSpeedIcon(operator.speed)}</span>
                    <span className="text-white/70">Vitesse</span>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end space-x-2 mb-1">
                      <span className="text-white font-medium">Niveau {operator.speed}</span>
                    </div>
                    <div className="text-xs text-white/60">{getSpeedLabel(operator.speed)}</div>
                  </div>
                </div>

                {/* Difficulté (basée sur la vitesse et santé) */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <i className="pi pi-star mr-2 text-yellow-400"></i>
                    <span className="text-white/70">Difficulté</span>
                  </div>
                  <div className="text-right">
                    <div className="flex space-x-1">
                      {[...Array(3)].map((_, i) => (
                        <i
                          key={i}
                          className={`pi pi-star ${ 
                            i < (parseInt(operator.speed) + (operator.health > 110 ? 0 : 1)) / 2 
                              ? 'text-yellow-400' 
                              : 'text-white/20'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Colonne des détails */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations personnelles */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4">
                <i className="pi pi-user mr-2"></i>
                Informations personnelles
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between py-2 border-b border-white/10">
                  <span className="text-white/70">Nom réel</span>
                  <span className="text-white font-medium">{operator.realname}</span>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b border-white/10">
                  <span className="text-white/70">Âge</span>
                  <span className="text-white font-medium">{operator.age} ans</span>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b border-white/10">
                  <span className="text-white/70">Date de naissance</span>
                  <span className="text-white font-medium">{operator.date_of_birth}</span>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b border-white/10">
                  <span className="text-white/70">Lieu de naissance</span>
                  <span className="text-white font-medium">{operator.birthplace}</span>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b border-white/10">
                  <span className="text-white/70">Unité militaire</span>
                  <span className="text-white font-medium">{operator.unit}</span>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b border-white/10">
                  <span className="text-white/70">Code pays</span>
                  <span className="text-white font-medium uppercase">{operator.country_code}</span>
                </div>
              </div>
            </motion.div>

            {/* Armement */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4">
                <i className="pi pi-shield mr-2"></i>
                Armement disponible
                {weaponsLoading && <span className="text-sm text-white/50 ml-2">(Chargement...)</span>}
              </h3>
              
              {/* Armes principales */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-white/90 mb-3 flex items-center">
                  <i className="pi pi-angle-right mr-2 text-orange-400"></i>
                  Armes principales
                </h4>
                
                {operatorWeapons.primary.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {operatorWeapons.primary.map((weapon: Weapon, index: number) => (
                      <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-white font-medium">{weapon.name}</h5>
                          <span className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded">
                            {weapon.type}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-white/70">
                          <div>Dégâts: <span className="text-red-400 font-medium">{weapon.damage}</span></div>
                          <div>Cadence: <span className="text-yellow-400 font-medium">{weapon.fireRate}</span></div>
                          <div>Mobilité: <span className="text-blue-400 font-medium">{weapon.mobility}</span></div>
                          <div>Capacité: <span className="text-green-400 font-medium">{weapon.capacity}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-white/50 text-center py-4 bg-white/5 rounded-xl">
                    {weaponsLoading ? 'Chargement des armes...' : 'Aucune arme principale référencée'}
                  </div>
                )}
              </div>

              {/* Armes secondaires */}
              <div>
                <h4 className="text-lg font-semibold text-white/90 mb-3 flex items-center">
                  <i className="pi pi-angle-right mr-2 text-blue-400"></i>
                  Armes secondaires
                </h4>
                
                {operatorWeapons.secondary.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {operatorWeapons.secondary.map((weapon: Weapon, index: number) => (
                      <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-white font-medium">{weapon.name}</h5>
                          <span className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded">
                            {weapon.type}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-white/70">
                          <div>Dégâts: <span className="text-red-400 font-medium">{weapon.damage}</span></div>
                          <div>Cadence: <span className="text-yellow-400 font-medium">{weapon.fireRate}</span></div>
                          <div>Mobilité: <span className="text-blue-400 font-medium">{weapon.mobility}</span></div>
                          <div>Capacité: <span className="text-green-400 font-medium">{weapon.capacity}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-white/50 text-center py-4 bg-white/5 rounded-xl">
                    {weaponsLoading ? 'Chargement des armes...' : 'Aucune arme secondaire référencée'}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Actions rapides */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4">
                <i className="pi pi-gamepad mr-2"></i>
                Actions rapides
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href="/comparison"
                  className="flex items-center justify-center p-4 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-300 hover:bg-blue-600/30 transition-colors"
                >
                  <i className="pi pi-chart-line mr-2"></i>
                  Comparer cet opérateur
                </Link>
                
                <Link
                  href="/operators"
                  className="flex items-center justify-center p-4 bg-green-600/20 border border-green-500/30 rounded-xl text-green-300 hover:bg-green-600/30 transition-colors"
                >
                  <i className="pi pi-users mr-2"></i>
                  Voir tous les opérateurs
                </Link>
                
                <Link
                  href="/weapons"
                  className="flex items-center justify-center p-4 bg-orange-600/20 border border-orange-500/30 rounded-xl text-orange-300 hover:bg-orange-600/30 transition-colors"
                >
                  <i className="pi pi-shield mr-2"></i>
                  Explorer les armes
                </Link>
                
                <Link
                  href="/maps"
                  className="flex items-center justify-center p-4 bg-purple-600/20 border border-purple-500/30 rounded-xl text-purple-300 hover:bg-purple-600/30 transition-colors"
                >
                  <i className="pi pi-map mr-2"></i>
                  Découvrir les cartes
                </Link>
              </div>
            </motion.div>

            {/* Informations sur les données */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4"
            >
              <div className="flex items-start">
                <i className="pi pi-info-circle text-blue-400 mr-3 mt-1"></i>
                <div>
                  <h4 className="text-blue-300 font-semibold mb-1">Corrélation automatique</h4>
                  <p className="text-blue-200/80 text-sm">
                    Les armes affichées sont automatiquement corrélées avec cet opérateur basé sur les données disponibles de l&apos;API Rainbow Six Siege. 
                    Certaines armes récentes ou spécialisées peuvent ne pas être référencées.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
