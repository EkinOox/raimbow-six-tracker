'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Weapon } from '@/types/r6-api-types';
import { 
  getWeaponCategory, 
  calculateWeaponEffectiveness 
} from '@/utils/weaponCategories';
import { getWeaponImageUrl } from '@/utils/weaponImages';

interface WeaponCardProps {
  weapon: Weapon;
  index: number;
}

export default function WeaponCard({ weapon, index }: WeaponCardProps) {
  const category = getWeaponCategory(weapon.type);
  const effectiveness = calculateWeaponEffectiveness(weapon);
  
  // Créer l'URL sécurisée pour le lien
  const weaponSlug = weapon.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  // Normaliser le champ operators en tableau
  const getOperatorsList = (): string[] => {
    if (!weapon.operators) return [];
    if (Array.isArray(weapon.operators)) return weapon.operators;
    if (typeof weapon.operators === 'string') {
      return weapon.operators.split(';').map(op => op.trim()).filter(op => op.length > 0);
    }
    return [];
  };
  
  const operatorsList = getOperatorsList();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
      className="group h-full"
    >
      <Link href={`/weapons/${weaponSlug}`}>
        <div className={`bg-white/10 backdrop-blur-xl border ${category.borderColor} rounded-2xl overflow-hidden hover:bg-white/15 transition-all duration-300 cursor-pointer h-full flex flex-col shadow-lg hover:shadow-xl`}>
          {/* Image de l'arme avec gradient de catégorie */}
          <div className={`relative h-40 bg-gradient-to-br ${category.gradient} flex items-center justify-center p-4`}>
            <Image
              src={getWeaponImageUrl(weapon.name, weapon.image_url)}
              alt={`Arme ${weapon.name}`}
              width={160}
              height={80}
              className="object-contain drop-shadow-2xl"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/logo/r6x-logo-ww.avif';
              }}
            />
            
            {/* Badges en haut */}
            <div className="absolute top-3 left-3 flex gap-2">
              <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                weapon.family === 'ATK' 
                  ? 'bg-orange-500/30 text-orange-200 border border-orange-400/50 backdrop-blur-sm' 
                  : 'bg-blue-500/30 text-blue-200 border border-blue-400/50 backdrop-blur-sm'
              }`}>
                {weapon.family === 'ATK' ? 'ATK' : 'DEF'}
              </span>
            </div>

            {/* Score d'efficacité */}
            <div className="absolute top-3 right-3">
              <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
                <div className="flex items-center space-x-1">
                  <i className="pi pi-star-fill text-yellow-400 text-xs"></i>
                  <span className="text-white font-bold text-sm">{effectiveness}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Informations de l'arme */}
          <div className="p-5 flex-1 flex flex-col">
            {/* Nom et type */}
            <div className="mb-3">
              <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-300 transition-colors">
                {weapon.name}
              </h3>
              <div className="flex items-center space-x-2">
                <span className={`text-sm ${category.textColor} font-medium`}>
                  <i className={`pi ${category.icon} mr-1`}></i>
                  {category.displayName}
                </span>
              </div>
            </div>

            {/* Statistiques principales */}
            <div className="space-y-2.5 mb-4 flex-1">
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/60 flex items-center">
                  <i className="pi pi-bolt mr-2 text-red-400"></i>
                  Dégâts
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-red-500 to-orange-500"
                      style={{ width: `${Math.min(100, (weapon.damage / 60) * 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-white font-bold text-sm w-8 text-right">{weapon.damage}</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-white/60 flex items-center">
                  <i className="pi pi-sync mr-2 text-blue-400"></i>
                  Cadence
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                      style={{ width: `${Math.min(100, (weapon.fireRate / 1200) * 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-white font-bold text-sm w-8 text-right">{weapon.fireRate}</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-white/60 flex items-center">
                  <i className="pi pi-forward mr-2 text-green-400"></i>
                  Mobilité
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                      style={{ width: `${weapon.mobility}%` }}
                    ></div>
                  </div>
                  <span className="text-white font-bold text-sm w-8 text-right">{weapon.mobility}</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-white/60 flex items-center">
                  <i className="pi pi-box mr-2 text-purple-400"></i>
                  Capacité
                </span>
                <span className="text-white font-bold text-sm">{weapon.capacity}</span>
              </div>
            </div>

            {/* Opérateurs utilisant cette arme */}
            {operatorsList.length > 0 && (
              <div className="mt-auto pt-3 border-t border-white/10">
                <p className="text-xs text-white/50 mb-2 flex items-center">
                  <i className="pi pi-users mr-1"></i>
                  {operatorsList.length} opérateur(s)
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {operatorsList.slice(0, 4).map((op: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-white/10 text-white/80 text-xs rounded-lg font-medium hover:bg-white/20 transition-colors"
                    >
                      {op}
                    </span>
                  ))}
                  {operatorsList.length > 4 && (
                    <span className="px-2 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white/70 text-xs rounded-lg font-medium border border-white/10">
                      +{operatorsList.length - 4}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
