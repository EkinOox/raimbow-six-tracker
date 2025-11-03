/**
 * Schémas de validation Zod pour les filtres et recherches
 */

import { z } from 'zod';

/**
 * Schéma de recherche de joueur
 */
export const searchQuerySchema = z.object({
  username: z.string()
    .min(1, 'Le nom d\'utilisateur est requis')
    .max(50, 'Le nom d\'utilisateur est trop long')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Le nom d\'utilisateur contient des caractères invalides'),
  platform: z.enum(['uplay', 'psn', 'xbl'], {
    message: 'Plateforme invalide',
  }).optional().default('uplay'),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;

/**
 * Schéma de filtres pour les opérateurs
 */
export const operatorFiltersSchema = z.object({
  side: z.enum(['all', 'attacker', 'defender'], {
    message: 'Côté invalide',
  }).optional().default('all'),
  
  role: z.enum([
    'all',
    'anti-entry',
    'anti-gadget',
    'breach',
    'crowd-control',
    'intel',
    'map-control',
    'secure',
    'support',
    'trapper',
  ], {
    message: 'Rôle invalide',
  }).optional().default('all'),
  
  squad: z.enum([
    'all',
    'wolfguard',
    'redhammer',
    'viperstrike',
    'nighthaven',
    'cbrn',
    'gis',
    'apexpredators',
    'ghosteyes',
    'rainbow',
    'other',
  ], {
    message: 'Équipe invalide',
  }).optional().default('all'),
  
  organization: z.string().optional(),
  
  difficulty: z.enum(['all', '1', '2', '3'], {
    message: 'Difficulté invalide',
  }).optional().default('all'),
  
  speed: z.enum(['all', '1', '2', '3'], {
    message: 'Vitesse invalide',
  }).optional().default('all'),
  
  search: z.string().max(100).optional(),
  
  sortBy: z.enum([
    'name',
    'side',
    'role',
    'speed',
    'difficulty',
    'releaseDate',
  ]).optional().default('name'),
  
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

export type OperatorFilters = z.infer<typeof operatorFiltersSchema>;

/**
 * Schéma de filtres pour les armes
 */
export const weaponFiltersSchema = z.object({
  type: z.enum([
    'all',
    'assault_rifle',
    'submachine_gun',
    'light_machine_gun',
    'marksman_rifle',
    'shotgun',
    'handgun',
    'machine_pistol',
    'shield',
  ], {
    message: 'Type d\'arme invalide',
  }).optional().default('all'),
  
  side: z.enum(['all', 'attacker', 'defender'], {
    message: 'Côté invalide',
  }).optional().default('all'),
  
  operator: z.string().max(50).optional(),
  
  search: z.string().max(100).optional(),
  
  sortBy: z.enum([
    'name',
    'damage',
    'fireRate',
    'mobility',
    'capacity',
  ]).optional().default('name'),
  
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  
  minDamage: z.number().min(0).max(200).optional(),
  maxDamage: z.number().min(0).max(200).optional(),
  
  minFireRate: z.number().min(0).max(2000).optional(),
  maxFireRate: z.number().min(0).max(2000).optional(),
});

export type WeaponFilters = z.infer<typeof weaponFiltersSchema>;

/**
 * Schéma de filtres pour les maps
 */
export const mapFiltersSchema = z.object({
  playlist: z.enum([
    'all',
    'ranked',
    'unranked',
    'quick',
    'arcade',
    'custom',
  ], {
    message: 'Playlist invalide',
  }).optional().default('all'),
  
  search: z.string().max(100).optional(),
  
  sortBy: z.enum([
    'name',
    'releaseDate',
    'size',
  ]).optional().default('name'),
  
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  
  location: z.string().max(50).optional(),
  
  year: z.number().min(2015).max(new Date().getFullYear()).optional(),
});

export type MapFilters = z.infer<typeof mapFiltersSchema>;

/**
 * Schéma pour la comparaison de joueurs
 */
export const playerComparisonSchema = z.object({
  players: z.array(z.object({
    username: z.string().min(1).max(50),
    platform: z.enum(['uplay', 'psn', 'xbl']),
  })).min(2, 'Au moins 2 joueurs requis').max(4, 'Maximum 4 joueurs'),
  
  stats: z.array(z.enum([
    'kills',
    'deaths',
    'kd',
    'wins',
    'losses',
    'wl',
    'playtime',
    'headshots',
    'melee',
    'penetration',
  ])).optional(),
});

export type PlayerComparison = z.infer<typeof playerComparisonSchema>;

/**
 * Schéma pour la comparaison d'opérateurs
 */
export const operatorComparisonSchema = z.object({
  operators: z.array(z.string()).min(2).max(6),
  compareBy: z.enum([
    'stats',
    'loadout',
    'abilities',
    'all',
  ]).optional().default('all'),
});

export type OperatorComparison = z.infer<typeof operatorComparisonSchema>;

/**
 * Validation des paramètres d'URL
 */
export function validateSearchParams<T extends z.ZodSchema>(
  schema: T,
  params: unknown
): z.infer<T> | { error: string } {
  try {
    return schema.parse(params);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }
    return { error: 'Paramètres invalides' };
  }
}
