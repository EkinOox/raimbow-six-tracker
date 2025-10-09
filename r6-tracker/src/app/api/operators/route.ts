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
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCachedData(key: string, data: unknown) {
  cache.set(key, { data, timestamp: Date.now() });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const name = searchParams.get('name');
    const role = searchParams.get('role');
    const side = searchParams.get('side');

    // Création de la clé de cache
    const cacheKey = `operators_${name || 'all'}_${role || 'all'}_${side || 'all'}`;
    
    // Vérification du cache
    const cachedResult = getCachedData(cacheKey);
    if (cachedResult) {
      console.log('🎯 Cache hit pour opérateurs:', cacheKey);
      return NextResponse.json(cachedResult);
    }

    console.log('🔄 Récupération des opérateurs depuis l\'API externe...');
    
    // Appel à l'API externe
    const apiUrl = `${R6_API_BASE_URL}/api/operators`;
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(API_TIMEOUT)
    });

    if (!response.ok) {
      throw new Error(`API externe inaccessible: ${response.status}`);
    }

    let operators = await response.json();

    // Application des filtres côté serveur
    if (name) {
      operators = operators.filter((op: { name: string }) => 
        op.name.toLowerCase().includes(name.toLowerCase())
      );
    }

    if (role) {
      operators = operators.filter((op: { role: string }) => 
        op.role?.toLowerCase().includes(role.toLowerCase())
      );
    }

    if (side) {
      operators = operators.filter((op: { side: string }) => 
        op.side === side
      );
    }

    const result = {
      operators,
      count: operators.length,
      cached: false,
      timestamp: new Date().toISOString()
    };

    // Mise en cache
    setCachedData(cacheKey, result);
    console.log(`✅ ${operators.length} opérateurs récupérés et mis en cache`);

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Erreur API opérateurs:', error);
    
    return NextResponse.json(
      { 
        error: 'Impossible de récupérer les opérateurs',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
        operators: [],
        count: 0
      },
      { status: 500 }
    );
  }
}