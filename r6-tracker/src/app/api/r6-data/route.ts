import { NextRequest, NextResponse } from 'next/server';
import R6Data from 'r6-data.js';

// Instance du client R6Data
const r6data = new R6Data();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const platform = searchParams.get('platform');
    const action = searchParams.get('action');

    if (!username || !platform) {
      return NextResponse.json(
        { success: false, error: 'Username et platform sont requis' },
        { status: 400 }
      );
    }

    // Validation des plateformes supportées
    const validPlatforms = ['pc', 'xbox', 'playstation', 'steam'];
    if (!validPlatforms.includes(platform.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: 'Platform non supportée. Utilisez: pc, xbox, playstation, steam' },
        { status: 400 }
      );
    }

    // Test de connexion
    if (action === 'test') {
      return NextResponse.json({
        success: true,
        data: { connected: true, message: 'Service R6Data disponible' }
      });
    }

    // Récupération des informations de base
    if (action === 'account') {
      const accountInfo = await r6data.getPlayer(username, platform);
      return NextResponse.json({
        success: true,
        data: accountInfo
      });
    }

    // Récupération des statistiques complètes
    if (action === 'stats' || !action) {
      const [playerData, seasonStats] = await Promise.all([
        r6data.getPlayer(username, platform),
        r6data.getRank(username, platform)
      ]);

      return NextResponse.json({
        success: true,
        data: {
          accountInfo: playerData,
          seasonStats: seasonStats,
          platform,
          username,
          lastUpdated: new Date().toISOString()
        }
      });
    }

    return NextResponse.json(
      { success: false, error: 'Action non reconnue' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Erreur API r6-data:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Erreur interne du serveur';

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, platform, action } = body;

    if (!username || !platform) {
      return NextResponse.json(
        { success: false, error: 'Username et platform sont requis' },
        { status: 400 }
      );
    }

    // Validation des plateformes supportées
    const validPlatforms = ['pc', 'xbox', 'playstation', 'steam'];
    if (!validPlatforms.includes(platform.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: 'Platform non supportée. Utilisez: pc, xbox, playstation, steam' },
        { status: 400 }
      );
    }

    // Récupération des statistiques complètes par défaut
    const [playerData, seasonStats] = await Promise.all([
      r6data.getPlayer(username, platform),
      r6data.getRank(username, platform)
    ]);

    return NextResponse.json({
      success: true,
      data: {
        accountInfo: playerData,
        seasonStats: seasonStats,
        platform,
        username,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Erreur API r6-data POST:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Erreur interne du serveur';

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}