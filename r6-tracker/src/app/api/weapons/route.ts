import { NextRequest, NextResponse } from 'next/server';

// Cache simple en mémoire
interface CacheEntry {
  data: unknown;
  timestamp: number;
}
const cache = new Map<string, CacheEntry>();
const CACHE_DURATION = parseInt(process.env.CACHE_DURATION || '1800000'); // 30 minutes par défaut

// Configuration des APIs
const R6_API_BASE_URL = process.env.R6_API_BASE_URL || 'https://r6-api.vercel.app';
const API_TIMEOUT = parseInt(process.env.API_TIMEOUT || '10000');
const USER_AGENT = process.env.USER_AGENT || 'R6-Tracker-App/1.0';

function getCachedData(key: string) {
  const cached = cache.get(key);
  if (!cached) return null;
  
  const now = Date.now();
  if (now - cached.timestamp > CACHE_DURATION) {
    cache.delete(key);
    return null;
  }
  
  return cached.data;
}

function setCachedData(key: string, data: unknown) {
  cache.set(key, { data, timestamp: Date.now() });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const name = searchParams.get('name');
    const type = searchParams.get('type');
    const family = searchParams.get('family');

    // Création de la clé de cache
    const cacheKey = `weapons_${name || 'all'}_${type || 'all'}_${family || 'all'}`;
    
    // Vérification du cache
    const cachedResult = getCachedData(cacheKey);
    if (cachedResult) {
      console.log('🎯 Cache hit pour armes:', cacheKey);
      return NextResponse.json(cachedResult);
    }

    console.log('🔄 Récupération des armes depuis l\'API externe...');
    
    // Appel à l'API externe
    const apiUrl = `${R6_API_BASE_URL}/api/weapons`;
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(API_TIMEOUT)
    });

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transformer les données pour correspondre à notre interface
    const transformedData = data.map((weapon: {
      name: string;
      type: string;
      stats_damage?: number;
      stats_firerate?: number;
      stats_ammo?: number;
      stats_maxammo?: number;
      stats_difficulty?: number;
      operators?: string;
      scopes?: string;
      barrels?: string;
      grips?: string;
      image_url?: string;
      family?: string;
    }) => ({
      name: weapon.name,
      type: weapon.type,
      damage: weapon.stats_damage || 0,
      fireRate: weapon.stats_firerate || 0,
      mobility: weapon.stats_difficulty ? (5 - weapon.stats_difficulty) * 10 : 25, // Estimation basée sur difficulté
      capacity: weapon.stats_ammo || 0,
      class: weapon.type,
      availableFor: weapon.operators ? weapon.operators.split(';').map(op => op.trim()) : [],
      operators: weapon.operators,
      image_url: weapon.image_url,
      family: weapon.family,
      // Stats additionnelles si disponibles
      reloadTime: undefined, // Non fourni par l'API
      range: undefined, // Non fourni par l'API
      accuracy: undefined, // Non fourni par l'API
      controlability: weapon.stats_difficulty, // Utiliser difficulty comme proxy
      penetration: undefined, // Non fourni par l'API
      fireMode: undefined, // Non fourni par l'API
      sights: weapon.scopes ? weapon.scopes.split(';').map(s => s.trim()).filter(s => s) : [],
      barrels: weapon.barrels ? weapon.barrels.split(';').map(b => b.trim()).filter(b => b) : [],
      grips: weapon.grips ? weapon.grips.split(';').map(g => g.trim()).filter(g => g) : [],
      underBarrels: undefined, // Non fourni par l'API
    }));
    
    let filteredData = transformedData;

    // Filtrage côté serveur
    if (name || type || family) {
      filteredData = transformedData.filter((weapon: { name?: string; type?: string; family?: string }) => {
        const matchName = !name || weapon.name?.toLowerCase().includes(name.toLowerCase());
        const matchType = !type || weapon.type?.toLowerCase() === type.toLowerCase();
        const matchFamily = !family || weapon.family?.toLowerCase().includes(family.toLowerCase());
        
        return matchName && matchType && matchFamily;
      });
    }

    // Mise en cache
    setCachedData(cacheKey, filteredData);
    
    console.log(`✅ ${filteredData.length} armes transformées et mises en cache`);
    return NextResponse.json(filteredData);

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des armes:', error);
    
    // Essayer de retourner les données en cache même expirées
    const { searchParams } = request.nextUrl;
    const name = searchParams.get('name');
    const type = searchParams.get('type');
    const family = searchParams.get('family');
    const cacheKey = `weapons_${name || 'all'}_${type || 'all'}_${family || 'all'}`;
    
    const expiredCache = cache.get(cacheKey);
    if (expiredCache) {
      console.log('⚠️ Utilisation du cache expiré en fallback');
      return NextResponse.json(expiredCache.data);
    }
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de la récupération des armes',
        message: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}