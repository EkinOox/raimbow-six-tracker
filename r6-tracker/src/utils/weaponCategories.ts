// Configuration des catégories d'armes avec couleurs et icônes
// Encodage: UTF-8

import { Weapon } from '@/types/r6-api-types';

export interface WeaponCategory {
  type: string;
  displayName: string;
  icon: string;
  gradient: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
  description: string;
  order: number;
}

export const WEAPON_CATEGORIES: Record<string, WeaponCategory> = {
  'Assault Rifle': {
    type: 'Assault Rifle',
    displayName: 'Fusils d\'Assaut',
    icon: 'pi-bolt',
    gradient: 'from-red-600 to-orange-600',
    borderColor: 'border-red-500/30',
    bgColor: 'bg-red-500/20',
    textColor: 'text-red-400',
    description: 'Armes polyvalentes pour engagements à moyenne portée',
    order: 1
  },
  'SMG': {
    type: 'SMG',
    displayName: 'Mitraillettes',
    icon: 'pi-flash',
    gradient: 'from-blue-600 to-cyan-600',
    borderColor: 'border-blue-500/30',
    bgColor: 'bg-blue-500/20',
    textColor: 'text-blue-400',
    description: 'Cadence de tir élevée, idéal pour le combat rapproché',
    order: 2
  },
  'LMG': {
    type: 'LMG',
    displayName: 'Mitrailleuses Légères',
    icon: 'pi-bars',
    gradient: 'from-purple-600 to-pink-600',
    borderColor: 'border-purple-500/30',
    bgColor: 'bg-purple-500/20',
    textColor: 'text-purple-400',
    description: 'Grande capacité de munitions pour le tir de suppression',
    order: 3
  },
  'Marksman Rifle': {
    type: 'Marksman Rifle',
    displayName: 'Fusils de Précision',
    icon: 'pi-eye',
    gradient: 'from-green-600 to-emerald-600',
    borderColor: 'border-green-500/30',
    bgColor: 'bg-green-500/20',
    textColor: 'text-green-400',
    description: 'Précision à longue portée avec tir semi-automatique',
    order: 4
  },
  'Sniper Rifle': {
    type: 'Sniper Rifle',
    displayName: 'Fusils de Sniper',
    icon: 'pi-crosshair',
    gradient: 'from-yellow-600 to-amber-600',
    borderColor: 'border-yellow-500/30',
    bgColor: 'bg-yellow-500/20',
    textColor: 'text-yellow-400',
    description: 'Dégâts maximaux à très longue portée',
    order: 5
  },
  'Shotgun': {
    type: 'Shotgun',
    displayName: 'Fusils à Pompe',
    icon: 'pi-times-circle',
    gradient: 'from-orange-600 to-red-600',
    borderColor: 'border-orange-500/30',
    bgColor: 'bg-orange-500/20',
    textColor: 'text-orange-400',
    description: 'Dégâts dévastateurs à courte portée',
    order: 6
  },
  'Machine Pistol': {
    type: 'Machine Pistol',
    displayName: 'Pistolets Automatiques',
    icon: 'pi-angle-double-right',
    gradient: 'from-indigo-600 to-blue-600',
    borderColor: 'border-indigo-500/30',
    bgColor: 'bg-indigo-500/20',
    textColor: 'text-indigo-400',
    description: 'Armes de poing à tir automatique',
    order: 7
  },
  'Handgun': {
    type: 'Handgun',
    displayName: 'Pistolets',
    icon: 'pi-circle',
    gradient: 'from-gray-600 to-slate-600',
    borderColor: 'border-gray-500/30',
    bgColor: 'bg-gray-500/20',
    textColor: 'text-gray-400',
    description: 'Armes de poing fiables en dernier recours',
    order: 8
  }
};

// Obtenir la catégorie d'une arme
export function getWeaponCategory(weaponType: string): WeaponCategory {
  return WEAPON_CATEGORIES[weaponType] || WEAPON_CATEGORIES['Handgun'];
}

// Grouper les armes par catégorie
export function groupWeaponsByCategory(weapons: Weapon[]) {
  const grouped: Record<string, Weapon[]> = {};
  
  weapons.forEach(weapon => {
    const categoryKey = weapon.type || 'Handgun';
    if (!grouped[categoryKey]) {
      grouped[categoryKey] = [];
    }
    grouped[categoryKey].push(weapon);
  });
  
  return grouped;
}

// Obtenir les catégories triées par ordre
export function getSortedCategories(): WeaponCategory[] {
  return Object.values(WEAPON_CATEGORIES).sort((a, b) => a.order - b.order);
}

// Calculer le score de popularité d'une arme
export function calculateWeaponPopularity(weapon: Weapon): number {
  // Plus l'arme est utilisée par d'opérateurs, plus elle est populaire
  const operatorCount = weapon.operators?.length || 0;
  return Math.min(100, operatorCount * 10);
}

// Calculer l'efficacité globale d'une arme (0-100)
export function calculateWeaponEffectiveness(weapon: Weapon): number {
  const damage = weapon.damage || 0;
  const fireRate = weapon.fireRate || 0;
  const mobility = weapon.mobility || 0;
  
  // Formule pondérée (ajustable selon le meta du jeu)
  const score = (damage * 0.4) + (fireRate / 15 * 0.35) + (mobility * 0.25);
  return Math.min(100, Math.round(score));
}

// Obtenir la recommandation d'utilisation
export function getWeaponRecommendation(weapon: Weapon): string {
  const effectiveness = calculateWeaponEffectiveness(weapon);
  
  if (effectiveness >= 80) return 'Meta Actuel - Fortement recommandé';
  if (effectiveness >= 65) return 'Très efficace - Recommandé';
  if (effectiveness >= 50) return 'Équilibré - Bon choix';
  if (effectiveness >= 35) return 'Situationnel - Utilisation spécifique';
  return 'Niche - Pour joueurs expérimentés';
}

// Obtenir le style de combat
export function getCombatStyle(weapon: Weapon): string {
  const fireRate = weapon.fireRate || 0;
  const damage = weapon.damage || 0;
  const mobility = weapon.mobility || 0;
  
  if (fireRate > 800 && mobility > 60) return 'Agressif - Rush et fragging';
  if (damage > 45 && fireRate < 650) return 'Tactique - Précision et positionnement';
  if (mobility > 70) return 'Mobile - Roaming et flanking';
  if (fireRate > 700 && damage < 35) return 'Suppression - Contrôle de zone';
  return 'Polyvalent - Adaptable';
}
