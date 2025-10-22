/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';

// Import dynamique de r6-data.js
let r6Info: any = null;

async function getR6Info() {
  if (!r6Info) {
    try {
      // Import dynamique pour éviter les problèmes SSR
      const r6Module = await import('r6-data.js');
      r6Info = r6Module.default || r6Module;
    } catch (error) {
      console.error('❌ Erreur import r6-data.js:', error);
      throw new Error('Impossible de charger r6-data.js');
    }
  }
  return r6Info;
}

// Fonction pour gérer les requêtes r6-data.js côté serveur (évite CORS)
// Mapping des plateformes pour r6-data.js
// Note: différentes méthodes de l'API acceptent différents formats
function normalizePlatform(platform: string, method?: string): string {
  const platformLower = platform.toLowerCase();
  
  // Pour getAccountInfo et getPlayerStats, utiliser les noms complets
  if (method === 'getAccountInfo' || method === 'getPlayerStats') {
    const platformMapFull: { [key: string]: string } = {
      'pc': 'uplay',
      'uplay': 'uplay',
      'playstation': 'psn',
      'psn': 'psn',
      'xbox': 'xbl',
      'xbl': 'xbl'
    };
    return platformMapFull[platformLower] || platform;
  }
  
  // Pour getId et getStats, utiliser les codes courts
  const platformMapShort: { [key: string]: string } = {
    'uplay': 'pc',
    'pc': 'pc',
    'playstation': 'psn',
    'psn': 'psn',
    'xbox': 'xbl',
    'xbl': 'xbl'
  };
  
  return platformMapShort[platformLower] || platform;
}

export async function POST(request: NextRequest) {
  try {
    const { action, params } = await request.json();
    
    const r6 = await getR6Info();
    let result;
    
    switch (action) {
      case 'getServiceStatus':
        result = await r6.getServiceStatus();
        break;
        
      case 'getId':
        const { platform, username } = params;
        const normalizedIdPlatform = normalizePlatform(platform, 'getId');
        
        try {
          result = await r6.getId(normalizedIdPlatform, username);
          
          if (!result || !result.length) {
            throw new Error(`Joueur "${username}" introuvable sur ${platform}`);
          }
        } catch (err: any) {
          console.error('❌ Erreur getId:', err?.message || err);
          const errorMsg = err?.response?.status === 404 
            ? `Joueur "${username}" non trouvé sur la plateforme ${platform}.`
            : err?.response?.status === 400
            ? `Nom d'utilisateur "${username}" invalide. Vérifiez le format.`
            : err?.message || 'Erreur lors de la recherche du joueur';
          throw new Error(errorMsg);
        }
        break;
        
      case 'getStats':
        const { platform: statsPlatform, playerId } = params;
        const normalizedStatsPlatform = normalizePlatform(statsPlatform, 'getStats');
        
        try {
          result = await r6.getStats(normalizedStatsPlatform, playerId);
        } catch (err: any) {
          console.error('❌ Erreur getStats:', err?.message || err);
          throw new Error(err?.message || 'Erreur lors de la récupération des statistiques');
        }
        break;
        
      case 'getAccountInfo':
        const { nameOnPlatform, platformType } = params;
        const normalizedAccountPlatform = normalizePlatform(platformType, 'getAccountInfo');
      
        try {
          result = await r6.getAccountInfo({
            nameOnPlatform,
            platformType: normalizedAccountPlatform
          });
          
          if (!result) {
            throw new Error(`Joueur "${nameOnPlatform}" introuvable sur ${platformType}`);
          }
        } catch (err: any) {
          console.error('❌ Erreur détaillée:', {
            message: err?.message,
            status: err?.response?.status,
            statusText: err?.response?.statusText,
            data: err?.response?.data,
            config: err?.config
          });
          
          const errorMsg = err?.response?.status === 404 
            ? `Joueur "${nameOnPlatform}" non trouvé sur la plateforme ${platformType}. Vérifiez l'orthographe et la plateforme.`
            : err?.response?.status === 400
            ? `Paramètres invalides pour "${nameOnPlatform}". ${err?.response?.data?.details?.message || 'Vérifiez le nom et la plateforme.'}`
            : err?.message || 'Erreur lors de la recherche du joueur';
          
          console.error('❌ Erreur getAccountInfo:', errorMsg);
          throw new Error(errorMsg);
        }
        break;
        
      case 'getPlayerStats':
        const { nameOnPlatform: statsNameOnPlatform, platformType: statsPlatformType, platform_families } = params;
        const normalizedPlayerStatsPlatform = normalizePlatform(statsPlatformType, 'getPlayerStats');
        
        try {
          result = await r6.getPlayerStats({
            nameOnPlatform: statsNameOnPlatform,
            platformType: normalizedPlayerStatsPlatform,
            platform_families
          });
        } catch (err: any) {
          console.error('❌ Erreur getPlayerStats:', err?.message || err);
          throw new Error(err?.message || 'Erreur lors de la récupération des statistiques du joueur');
        }
        break;
        
      // Note: getSeasonStats n'existe pas dans r6-data.js
    // Utiliser getPlayerStats pour les statistiques de la saison actuelle
        
      default:
        return NextResponse.json(
          { error: `Action non supportée: ${action}` },
          { status: 400 }
        );
    }
    
    return NextResponse.json({ 
      success: true, 
      data: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ API Proxy erreur:', error);

    const anyErr: any = error;
    const status = anyErr?.response?.status || 500;
    const message = anyErr?.response?.data?.message || anyErr?.message || 'Erreur inconnue';

    return NextResponse.json(
      {
        success: false,
        error: message,
        timestamp: new Date().toISOString()
      },
      { status }
    );
  }
}

// Gestion des requêtes OPTIONS pour CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}