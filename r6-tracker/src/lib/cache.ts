/**
 * Système de cache unifié pour l'application
 * Utilise la mémoire en développement et Redis en production
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheOptions {
  ttl?: number; // Time to live en millisecondes
  key: string;
}

class MemoryCache {
  private cache: Map<string, CacheEntry<unknown>>;

  constructor() {
    this.cache = new Map();
    
    // Nettoyage automatique toutes les 5 minutes
    if (typeof window === 'undefined') {
      setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }
  }

  /**
   * Récupère une valeur du cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    const isExpired = now - entry.timestamp > entry.ttl;

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Stocke une valeur dans le cache
   */
  set<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Supprime une clé du cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Supprime toutes les clés correspondant à un pattern
   */
  deletePattern(pattern: string): number {
    let count = 0;
    const regex = new RegExp(pattern);

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }

    return count;
  }

  /**
   * Nettoie les entrées expirées
   */
  cleanup(): number {
    const now = Date.now();
    let count = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        count++;
      }
    }

    return count;
  }

  /**
   * Vide complètement le cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Retourne le nombre d'entrées dans le cache
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Vérifie si une clé existe dans le cache
   */
  has(key: string): boolean {
    const data = this.get(key);
    return data !== null;
  }
}

// Instance singleton du cache
const cache = new MemoryCache();

/**
 * TTL prédéfinis pour différents types de données
 */
export const CacheTTL = {
  STATIC: 60 * 60 * 1000, // 1 heure - Données statiques (operators, weapons, maps)
  PLAYER: 5 * 60 * 1000, // 5 minutes - Stats joueurs
  SHORT: 1 * 60 * 1000, // 1 minute - Données volatiles
  LONG: 24 * 60 * 60 * 1000, // 24 heures - Données très statiques
} as const;

/**
 * Clés de cache prédéfinies
 */
export const CacheKeys = {
  OPERATORS: 'operators:all',
  WEAPONS: 'weapons:all',
  MAPS: 'maps:all',
  PLAYER: (username: string, platform: string) => `player:${platform}:${username.toLowerCase()}`,
  FAVORITES: (userId: string) => `favorites:${userId}`,
  R6_DATA: (endpoint: string) => `r6data:${endpoint}`,
} as const;

/**
 * Récupère une valeur du cache ou la calcule si elle n'existe pas
 */
export async function getCached<T>(
  options: CacheOptions,
  fetcher: () => Promise<T>
): Promise<T> {
  const { key, ttl = CacheTTL.STATIC } = options;

  // Vérifier si la donnée est en cache
  const cached = cache.get<T>(key);
  
  if (cached !== null) {
    return cached;
  }

  // Sinon, récupérer la donnée
  const data = await fetcher();

  // Stocker en cache
  cache.set(key, data, ttl);

  return data;
}

/**
 * Invalide une ou plusieurs entrées du cache
 */
export function invalidateCache(keyOrPattern: string): void {
  if (keyOrPattern.includes('*')) {
    cache.deletePattern(keyOrPattern.replace(/\*/g, '.*'));
  } else {
    cache.delete(keyOrPattern);
  }
}

/**
 * Invalide tout le cache
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * Statistiques du cache
 */
export function getCacheStats() {
  return {
    size: cache.size(),
    // En production, on pourrait ajouter hit rate, miss rate, etc.
  };
}

// Export de l'instance pour usage avancé
export { cache };

/**
 * Helper pour wrapper les routes API avec du cache
 */
export function withCache<T>(
  key: string,
  ttl: number,
  handler: () => Promise<T>
) {
  return getCached({ key, ttl }, handler);
}

/**
 * Revalidation manuelle du cache (pour ISR / On-demand revalidation)
 */
export async function revalidateCache(
  keys: string | string[]
): Promise<{ revalidated: boolean; message: string }> {
  try {
    const keysArray = Array.isArray(keys) ? keys : [keys];
    
    keysArray.forEach(key => {
      invalidateCache(key);
    });

    return {
      revalidated: true,
      message: `Cache invalidated for: ${keysArray.join(', ')}`,
    };
  } catch (error) {
    console.error('Error revalidating cache:', error);
    return {
      revalidated: false,
      message: 'Failed to revalidate cache',
    };
  }
}

// Types exportés
export type { CacheOptions, CacheEntry };
