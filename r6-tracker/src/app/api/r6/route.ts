import { NextRequest, NextResponse } from 'next/server';
import r6DataService from '../../../services/r6DataService';
import { Platform } from '../../../types/r6-data-types';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const platform = searchParams.get('platform') as Platform;
  const username = searchParams.get('username');
  const type = searchParams.get('type') || 'complete';

  if (!platform || !username) {
    return NextResponse.json(
      { error: 'Platform and username are required' },
      { status: 400 }
    );
  }

  // Validation de la plateforme
  const validPlatforms: Platform[] = ['pc', 'uplay', 'playstation', 'xbox'];
  if (!validPlatforms.includes(platform)) {
    return NextResponse.json(
      { error: 'Invalid platform. Use: pc, uplay, playstation, xbox' },
      { status: 400 }
    );
  }

  try {
    console.log(`Fetching ${type} data for ${username} on ${platform}`);
    
    let data;
    
    switch (type) {
      case 'info':
        data = await r6DataService.getAccountInfo(username, platform);
        break;
      case 'stats':
        data = await r6DataService.getPlayerStats(username, platform);
        break;
      case 'complete':
        data = await r6DataService.getPlayerStats(username, platform);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid type. Use: info, stats, or complete' },
          { status: 400 }
        );
    }
    
    console.log('R6 Data API Response received');

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('R6 Data API Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Erreurs spÃ©cifiques
    if (errorMessage.includes('Joueur non trouvÃ©')) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Player not found', 
          details: errorMessage 
        },
        { status: 404 }
      );
    }
    
    if (errorMessage.includes('nom d\'utilisateur')) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid username', 
          details: errorMessage 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch player data', 
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}

// Endpoint pour tester la connexion
export async function POST() {
  try {
    // Test simple avec les informations d'un joueur
    await r6DataService.getAccountInfo('Pengu', 'uplay');
    
    return NextResponse.json({
      success: true,
      message: 'R6 Data API connection successful',
      testUser: 'Pengu',
      testLevel: 'Unknown'
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'R6 Data API connection test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}