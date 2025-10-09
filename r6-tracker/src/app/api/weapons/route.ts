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
    let filteredData = data;

    // Filtrage côté serveur
    if (name || type || family) {
      filteredData = data.filter((weapon: { name?: string; type?: string; family?: string }) => {
        const matchName = !name || weapon.name?.toLowerCase().includes(name.toLowerCase());
        const matchType = !type || weapon.type?.toLowerCase() === type.toLowerCase();
        const matchFamily = !family || weapon.family?.toLowerCase().includes(family.toLowerCase());
        
        return matchName && matchType && matchFamily;
      });
    }

    // Mise en cache
    setCachedData(cacheKey, filteredData);
    
    console.log(`✅ ${filteredData.length} armes récupérées et mises en cache`);
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