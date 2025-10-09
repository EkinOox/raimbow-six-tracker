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
    const playlists = searchParams.get('playlists');

    // Création de la clé de cache
    const cacheKey = `maps_${name || 'all'}_${playlists || 'all'}`;
    
    // Vérification du cache
    const cachedResult = getCachedData(cacheKey);
    if (cachedResult) {
      console.log('🎯 Cache hit pour maps:', cacheKey);
      return NextResponse.json(cachedResult);
    }

    console.log('🔄 Récupération des maps depuis l\'API externe...');
    
    // Appel à l'API externe
    const apiUrl = `${R6_API_BASE_URL}/api/maps`;
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

    let maps = await response.json();

    // Déduplication des cartes par nom (garder seulement la première occurrence)
    const seenNames = new Set<string>();
    maps = maps.filter((map: { name: string }) => {
      if (seenNames.has(map.name)) {
        console.log(`⚠️ Carte dupliquée supprimée: ${map.name}`);
        return false;
      }
      seenNames.add(map.name);
      return true;
    });

    // Application des filtres côté serveur
    if (name) {
      maps = maps.filter((map: { name: string }) => 
        map.name.toLowerCase().includes(name.toLowerCase())
      );
    }

    if (playlists) {
      maps = maps.filter((map: { name: string; playlists: string }) => {
        const mapPlaylists = map.playlists?.toLowerCase() || '';
        const searchPlaylist = playlists.toLowerCase();
        return mapPlaylists.includes(searchPlaylist);
      });
    }

    const result = {
      maps,
      count: maps.length,
      cached: false,
      timestamp: new Date().toISOString()
    };

    // Mise en cache
    setCachedData(cacheKey, result);
    console.log(`✅ ${maps.length} maps récupérées et mises en cache`);

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Erreur API maps:', error);
    
    return NextResponse.json(
      { 
        error: 'Impossible de récupérer les maps',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
        maps: [],
        count: 0
      },
      { status: 500 }
    );
  }
}