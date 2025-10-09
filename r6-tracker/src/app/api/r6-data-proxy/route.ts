import { NextRequest, NextResponse } from 'next/server';

// Import dynamique de r6-data.js
let r6Info: any = null;

async function getR6Info() {
  if (!r6Info) {
    try {
      // Import dynamique pour éviter les problèmes SSR
      const r6Module = await import('r6-data.js');
      r6Info = r6Module.default || r6Module;
      console.log('📦 r6-data.js chargé côté serveur');
    } catch (error) {
      console.error('❌ Erreur import r6-data.js:', error);
      throw new Error('Impossible de charger r6-data.js');
    }
  }
  return r6Info;
}

// Fonction pour gérer les requêtes r6-data.js côté serveur (évite CORS)
export async function POST(request: NextRequest) {
  try {
    const { action, params } = await request.json();
    
    console.log(`🔄 API Proxy: ${action}`, params);
    
    const r6 = await getR6Info();
    let result;
    
    switch (action) {
      case 'getServiceStatus':
        result = await r6.getServiceStatus();
        break;
        
      case 'getId':
        const { platform, username } = params;
        result = await r6.getId(platform, username);
        break;
        
      case 'getStats':
        const { platform: statsPlatform, playerId } = params;
        result = await r6.getStats(statsPlatform, playerId);
        break;
        
      case 'getAccountInfo':
        const { nameOnPlatform, platformType } = params;
        result = await r6.getAccountInfo({
          nameOnPlatform,
          platformType
        });
        break;
        
      case 'getPlayerStats':
        const { nameOnPlatform: statsNameOnPlatform, platformType: statsPlatformType, platform_families } = params;
        result = await r6.getPlayerStats({
          nameOnPlatform: statsNameOnPlatform,
          platformType: statsPlatformType,
          platform_families
        });
        break;
        
      default:
        return NextResponse.json(
          { error: `Action non supportée: ${action}` },
          { status: 400 }
        );
    }
    
    console.log(`✅ API Proxy: ${action} réussi`, result);
    
    return NextResponse.json({ 
      success: true, 
      data: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ API Proxy erreur:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
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