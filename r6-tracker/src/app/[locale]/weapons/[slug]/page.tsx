'use client';

// Page détail d'une arme avec toutes les statistiques
// Encodage: UTF-8

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Weapon } from '@/types/r6-api-types';
import { Link, useRouter } from '@/i18n/navigation';
import { 
  getWeaponCategory, 
  calculateWeaponEffectiveness,
  getWeaponRecommendation,
  getCombatStyle,
  calculateWeaponPopularity
} from '@/utils/weaponCategories';
import { getWeaponImageUrl } from '@/utils/weaponImages';

export default function WeaponDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [weapon, setWeapon] = useState<Weapon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction helper pour normaliser le champ operators en tableau
  const getOperatorsList = (weapon: Weapon): string[] => {
    if (!weapon.operators) return [];
    
    // Si c'est déjà un tableau
    if (Array.isArray(weapon.operators)) {
      return weapon.operators;
    }
    
    // Si c'est une string "Op1; Op2"
    if (typeof weapon.operators === 'string') {
      return weapon.operators.split(';').map(op => op.trim()).filter(op => op.length > 0);
    }
    
    return [];
  };

  useEffect(() => {
    const fetchWeapon = async () => {
      try {
        setLoading(true);
        // Récupérer toutes les armes et trouver celle qui correspond
        const response = await fetch('/api/weapons');
        if (!response.ok) throw new Error('Erreur lors du chargement des armes');
        
        const weapons: Weapon[] = await response.json();
        const weaponSlug = params.slug as string;
        
        // Trouver l'arme correspondant au slug
        const foundWeapon = weapons.find(w => {
          const slug = w.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          return slug === weaponSlug;
        });

        if (!foundWeapon) {
          throw new Error('Arme introuvable');
        }

        setWeapon(foundWeapon);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    fetchWeapon();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="container mx-auto py-16 px-4">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-3 text-white/70">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            <span>Chargement de l&apos;arme...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !weapon) {
    return (
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="pi pi-exclamation-triangle text-red-400 text-3xl"></i>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Arme introuvable</h1>
          <p className="text-white/60 mb-6">{error || 'Cette arme n\'existe pas.'}</p>
          <button
            onClick={() => router.push('/weapons')}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
          >
            <i className="pi pi-arrow-left mr-2"></i>
            Retour aux armes
          </button>
        </div>
      </div>
    );
  }

  const category = getWeaponCategory(weapon.type);
  const effectiveness = calculateWeaponEffectiveness(weapon);
  const recommendation = getWeaponRecommendation(weapon);
  const combatStyle = getCombatStyle(weapon);
  const popularity = calculateWeaponPopularity(weapon);

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Bouton retour */}
        <Link
          href="/weapons"
          className="inline-flex items-center space-x-2 text-white/70 hover:text-white mb-6 transition-colors"
        >
          <i className="pi pi-arrow-left"></i>
          <span>Retour aux armes</span>
        </Link>

        {/* En-tête de l'arme */}
        <div className={`bg-gradient-to-r ${category.gradient} rounded-3xl p-8 mb-8 border ${category.borderColor} shadow-2xl`}>
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Image de l'arme */}
            <div className="flex-shrink-0 w-full lg:w-96 h-64 bg-black/20 rounded-2xl flex items-center justify-center p-6 border border-white/10">
              <Image
                src={getWeaponImageUrl(weapon.name, weapon.image_url)}
                alt={weapon.name}
                width={350}
                height={175}
                className="object-contain drop-shadow-2xl"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/images/logo/r6x-logo-ww.avif';
                }}
              />
            </div>

            {/* Informations principales */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 text-sm rounded-full font-medium ${
                      weapon.family === 'ATK' 
                        ? 'bg-orange-400/30 text-orange-100 border border-orange-300/50' 
                        : 'bg-blue-400/30 text-blue-100 border border-blue-300/50'
                    }`}>
                      {weapon.family === 'ATK' ? 'ATTAQUE' : 'DÉFENSE'}
                    </span>
                    <span className={`px-3 py-1 text-sm rounded-full font-medium ${category.bgColor} ${category.textColor} border ${category.borderColor}`}>
                      <i className={`pi ${category.icon} mr-1`}></i>
                      {category.displayName}
                    </span>
                  </div>
                  <h1 className="text-5xl font-black text-white mb-3">{weapon.name}</h1>
                  <p className="text-white/90 text-lg">{category.description}</p>
                </div>
                
                {/* Score d'efficacité */}
                <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-4 border border-white/20 text-center">
                  <div className="text-white/70 text-sm mb-1">Score</div>
                  <div className="text-4xl font-bold text-white">{effectiveness}</div>
                  <div className="flex items-center justify-center mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <i
                        key={star}
                        className={`pi pi-star-fill text-xl ${
                          star <= effectiveness / 20 ? 'text-yellow-400' : 'text-white/20'
                        }`}
                      ></i>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommandation et style de combat */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center space-x-2 mb-2">
                    <i className="pi pi-check-circle text-green-400"></i>
                    <span className="text-white/80 text-sm font-medium">Recommandation</span>
                  </div>
                  <p className="text-white font-semibold">{recommendation}</p>
                </div>

                <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center space-x-2 mb-2">
                    <i className="pi pi-shield text-blue-400"></i>
                    <span className="text-white/80 text-sm font-medium">Style de combat</span>
                  </div>
                  <p className="text-white font-semibold">{combatStyle}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques détaillées */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Statistiques principales */}
          <div className="lg:col-span-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <i className="pi pi-chart-bar mr-3 text-blue-400"></i>
              Statistiques de combat
            </h2>

            <div className="space-y-6">
              {/* Dégâts */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-medium flex items-center">
                    <i className="pi pi-bolt mr-2 text-red-400"></i>
                    Dégâts par balle
                  </span>
                  <span className="text-2xl font-bold text-white">{weapon.damage}</span>
                </div>
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(100, (weapon.damage / 60) * 100)}%` }}
                  ></div>
                </div>
                <p className="text-white/60 text-sm mt-1">
                  {weapon.damage >= 45 ? 'Dégâts très élevés' : weapon.damage >= 35 ? 'Dégâts élevés' : weapon.damage >= 25 ? 'Dégâts modérés' : 'Dégâts faibles'}
                </p>
              </div>

              {/* Cadence de tir */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-medium flex items-center">
                    <i className="pi pi-sync mr-2 text-blue-400"></i>
                    Cadence de tir
                  </span>
                  <span className="text-2xl font-bold text-white">{weapon.fireRate} <span className="text-sm text-white/60">RPM</span></span>
                </div>
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(100, (weapon.fireRate / 1200) * 100)}%` }}
                  ></div>
                </div>
                <p className="text-white/60 text-sm mt-1">
                  {weapon.fireRate >= 800 ? 'Cadence très rapide' : weapon.fireRate >= 650 ? 'Cadence rapide' : weapon.fireRate >= 500 ? 'Cadence modérée' : 'Cadence lente'}
                </p>
              </div>

              {/* Mobilité */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-medium flex items-center">
                    <i className="pi pi-forward mr-2 text-green-400"></i>
                    Mobilité
                  </span>
                  <span className="text-2xl font-bold text-white">{weapon.mobility}</span>
                </div>
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000"
                    style={{ width: `${weapon.mobility}%` }}
                  ></div>
                </div>
                <p className="text-white/60 text-sm mt-1">
                  {weapon.mobility >= 70 ? 'Très mobile' : weapon.mobility >= 50 ? 'Mobile' : weapon.mobility >= 30 ? 'Peu mobile' : 'Très peu mobile'}
                </p>
              </div>

              {/* Capacité */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-medium flex items-center">
                    <i className="pi pi-box mr-2 text-purple-400"></i>
                    Capacité du chargeur
                  </span>
                  <span className="text-2xl font-bold text-white">{weapon.capacity} <span className="text-sm text-white/60">balles</span></span>
                </div>
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(100, (weapon.capacity / 50) * 100)}%` }}
                  ></div>
                </div>
                <p className="text-white/60 text-sm mt-1">
                  {weapon.capacity >= 40 ? 'Très grande capacité' : weapon.capacity >= 25 ? 'Grande capacité' : weapon.capacity >= 15 ? 'Capacité moyenne' : 'Petite capacité'}
                </p>
              </div>
            </div>
          </div>

          {/* Informations complémentaires */}
          <div className="space-y-6">
            {/* Popularité */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <i className="pi pi-users mr-2 text-yellow-400"></i>
                Popularité
              </h3>
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-white mb-2">{popularity}%</div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
                    style={{ width: `${popularity}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-white/70 text-sm text-center">
                Basé sur le nombre d&apos;opérateurs utilisant cette arme
              </p>
            </div>

            {/* Classe d'arme */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <i className="pi pi-tag mr-2 text-blue-400"></i>
                Classification
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-white/60 text-sm">Type</span>
                  <p className="text-white font-semibold">{weapon.type}</p>
                </div>
                <div>
                  <span className="text-white/60 text-sm">Classe</span>
                  <p className="text-white font-semibold">{weapon.class || 'Non spécifié'}</p>
                </div>
                <div>
                  <span className="text-white/60 text-sm">Disponible pour</span>
                  <p className="text-white font-semibold capitalize">
                    {weapon.family === 'ATK' ? 'Attaquants' : 'Défenseurs'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Opérateurs utilisant cette arme */}
        {weapon.operators && weapon.operators.length > 0 && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <i className="pi pi-users mr-3 text-blue-400"></i>
              Opérateurs utilisant {weapon.name}
              <span className="ml-3 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                {getOperatorsList(weapon).length}
              </span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {getOperatorsList(weapon).map((operatorName: string, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group"
                >
                  <Link href={`/operators/${operatorName.toLowerCase().replace(/\s+/g, '-')}`}>
                    <div className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 rounded-xl p-4 transition-all duration-300 cursor-pointer text-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                        <i className="pi pi-user text-white text-xl"></i>
                      </div>
                      <p className="text-white font-medium text-sm group-hover:text-blue-300 transition-colors">
                        {operatorName}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Conseils d'utilisation */}
        <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
            <i className="pi pi-lightbulb mr-3 text-yellow-400"></i>
            Conseils d&apos;utilisation
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-black/20 rounded-xl p-4 border border-white/10">
              <h3 className="text-white font-semibold mb-2 flex items-center">
                <i className="pi pi-check text-green-400 mr-2"></i>
                Points forts
              </h3>
              <ul className="space-y-1 text-white/80 text-sm">
                {weapon.damage >= 40 && <li>• Dégâts élevés par balle</li>}
                {weapon.fireRate >= 750 && <li>• Excellente cadence de tir</li>}
                {weapon.mobility >= 60 && <li>• Bonne mobilité</li>}
                {weapon.capacity >= 30 && <li>• Grande capacité de chargeur</li>}
                {popularity >= 50 && <li>• Populaire auprès des joueurs</li>}
              </ul>
            </div>

            <div className="bg-black/20 rounded-xl p-4 border border-white/10">
              <h3 className="text-white font-semibold mb-2 flex items-center">
                <i className="pi pi-info-circle text-blue-400 mr-2"></i>
                Recommandations
              </h3>
              <ul className="space-y-1 text-white/80 text-sm">
                {weapon.damage >= 40 && <li>• Visez la tête pour éliminer rapidement</li>}
                {weapon.fireRate >= 750 && <li>• Parfait pour le spray control</li>}
                {weapon.mobility >= 60 && <li>• Idéal pour le roaming</li>}
                {weapon.fireRate < 500 && <li>• Privilégiez les tirs précis</li>}
                {weapon.capacity < 20 && <li>• Gérez vos munitions avec soin</li>}
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
