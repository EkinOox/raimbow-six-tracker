import { NextRequest, NextResponse } from 'next/server';
import { r6DataAPI } from '../../../services/r6DataAPI';
import { Platform } from '../../../types/r6-types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const platform = searchParams.get('platform') as Platform;
    const action = searchParams.get('action');

    if (!username || !platform) {
      return NextResponse.json(
        { success: false, error: 'Username et platform sont requis' },
        { status: 400 }
      );
    }

    // Validation du username
    const validation = r6DataAPI.validateUsername(username);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Test de connexion
    if (action === 'test') {
      const isConnected = await r6DataAPI.testConnection();
      return NextResponse.json({
        success: true,
        data: { connected: isConnected }
      });
    }

    // Récupération des informations de compte
    if (action === 'account') {
      const accountInfo = await r6DataAPI.getAccountInfo(username, platform);
      return NextResponse.json({
        success: true,
        data: accountInfo
      });
    }

    // Récupération des statistiques complètes
    if (action === 'stats' || !action) {
      const [accountInfo, playerStats] = await Promise.all([
        r6DataAPI.getAccountInfo(username, platform),
        r6DataAPI.getPlayerStats(username, platform)
      ]);

      return NextResponse.json({
        success: true,
        data: {
          accountInfo,
          stats: playerStats,
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
    const { username, platform } = body;

    if (!username || !platform) {
      return NextResponse.json(
        { success: false, error: 'Username et platform sont requis' },
        { status: 400 }
      );
    }

    // Validation du username
    const validation = r6DataAPI.validateUsername(username);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Récupération des statistiques complètes
    const [accountInfo, playerStats] = await Promise.all([
      r6DataAPI.getAccountInfo(username, platform),
      r6DataAPI.getPlayerStats(username, platform)
    ]);

    return NextResponse.json({
      success: true,
      data: {
        accountInfo,
        stats: playerStats,
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