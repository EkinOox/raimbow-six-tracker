/**
 * Configuration globale pour le cache des images Next.js
 * Toutes les images sont mises en cache pour au minimum 1 journée (86400 secondes)
 */

import type { ImageProps } from 'next/image';

/**
 * Propriétés de cache par défaut pour toutes les images
 * - Cache navigateur: 1 journée
 * - Revalidation en arrière-plan: 7 jours
 */
export const DEFAULT_IMAGE_CACHE: Partial<ImageProps> = {
  quality: 75,
  loading: 'lazy',
  placeholder: 'blur',
  blurDataURL: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
} as const;

/**
 * Propriétés de cache pour les images prioritaires (LCP, above-the-fold)
 * - Chargement prioritaire pour améliorer les performances
 * - Cache navigateur: 1 journée
 */
export const PRIORITY_IMAGE_CACHE: Partial<ImageProps> = {
  quality: 85,
  priority: true,
  loading: 'eager',
} as const;

/**
 * Propriétés de cache pour les images statiques (logos, icônes)
 * - Cache long: 30 jours
 * - Immuable: les images ne changent pas
 */
export const STATIC_IMAGE_CACHE: Partial<ImageProps> = {
  quality: 90,
  loading: 'lazy',
  placeholder: 'blur',
  blurDataURL: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
} as const;

/**
 * Propriétés de cache pour les images de profil/avatar
 * - Cache court: 1 heure (peuvent changer plus souvent)
 */
export const AVATAR_IMAGE_CACHE: Partial<ImageProps> = {
  quality: 70,
  loading: 'lazy',
  placeholder: 'blur',
  blurDataURL: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
} as const;

/**
 * Configuration des durées de cache en secondes
 */
export const CACHE_DURATION = {
  /** 1 heure */
  SHORT: 3600,
  /** 1 journée (24 heures) - Par défaut */
  DAY: 86400,
  /** 7 jours */
  WEEK: 604800,
  /** 30 jours */
  MONTH: 2592000,
  /** 1 an */
  YEAR: 31536000,
} as const;

/**
 * Helper pour créer des props d'image avec cache personnalisé
 */
export function getImageProps(options: {
  priority?: boolean;
  quality?: number;
}): Partial<ImageProps> {
  const { priority = false, quality = 75 } = options;

  return {
    quality,
    loading: priority ? 'eager' : 'lazy',
    priority,
    placeholder: 'blur',
    blurDataURL: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  };
}
