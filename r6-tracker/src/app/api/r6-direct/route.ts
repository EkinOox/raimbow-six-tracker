import { NextRequest, NextResponse } from 'next/server';

// Interfaces pour typer les réponses de l'API R6 Tracker
interface R6TrackerStat {
  displayValue?: string;
  metadata?: {
    tierName?: string;
    iconUrl?: string;
  };
}

interface R6TrackerSegment {
  type: string;
  stats: Record<string, R6TrackerStat>;
}

interface R6TrackerProfile {
  platformInfo?: {
    platformUserHandle?: string;
    platformSlug?: string;
  };
  avatarUrl?: string;
  segments?: R6TrackerSegment[];
}

interface R6TrackerResponse {
  data: R6TrackerProfile;
}

// Service alternatif utilisant directement l'API R6 Tracker
async function fetchR6TrackerData(platform: string, username: string, type: string) {
  const baseUrl = 'https://r6.tracker.network/api/v1/standard/profile';
  
  // Conversion des plateformes
  const platformMap: { [key: string]: string } = {
    'pc': 'uplay',
    'psn': 'psn',
    'xbl': 'xbl'
  };
  
  const trackerPlatform = platformMap[platform] || platform;
  const url = `${baseUrl}/${trackerPlatform}/${encodeURIComponent(username)}`;
  
  try {
    console.log(`Fetching from R6 Tracker: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'R6-Tracker-App/1.0',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data: R6TrackerResponse = await response.json();
    console.log('R6 Tracker Response:', data);
    
    return transformR6TrackerData(data, type);
  } catch (error) {
    console.error('R6 Tracker API Error:', error);
    throw error;
  }
}

function transformR6TrackerData(data: R6TrackerResponse, type: string) {
  const profile = data.data;
  const segments = profile.segments || [];
  
  // Trouver le segment approprié
  let segment: R6TrackerSegment | undefined;
  switch (type) {
    case 'general':
      segment = segments.find((s) => s.type === 'overview');
      break;
    case 'ranked':
      segment = segments.find((s) => s.type === 'ranked');
      break;
    case 'casual':
      segment = segments.find((s) => s.type === 'casual');
      break;
    default:
      segment = segments[0];
  }
  
  if (!segment) {
    throw new Error(`No ${type} data available`);
  }
  
  const stats = segment.stats || {};
  
  // Transformer vers le format attendu par notre app
  const result = {
    name: profile.platformInfo?.platformUserHandle || 'Unknown',
    header: profile.avatarUrl || 'https://ubisoft-avatars.akamaized.net/default_256_256.png',
    url: `https://r6.tracker.network/profile/${profile.platformInfo?.platformSlug}/${profile.platformInfo?.platformUserHandle}`,
  };
  
  // Ajouter les stats spécifiques selon le type
  switch (type) {
    case 'general':
      return {
        ...result,
        level: stats.level?.displayValue || '1',
        kd: stats.kd?.displayValue || '0.00',
        kills: stats.kills?.displayValue || '0',
        deaths: stats.deaths?.displayValue || '0',
        win_: stats.wlPercentage?.displayValue || '0%',
        wins: stats.wins?.displayValue || '0',
        losses: stats.losses?.displayValue || '0',
        headshot_: stats.headshotAccuracy?.displayValue || '0%',
        time_played: stats.timePlayed?.displayValue || '0h',
        matches_played: stats.matchesPlayed?.displayValue || '0',
        total_xp: stats.totalXp?.displayValue || '0'
      };
      
    case 'ranked':
      return {
        ...result,
        rank: stats.rank?.metadata?.tierName || 'Unranked',
        mmr: stats.mmr?.displayValue || '0',
        kd: stats.kd?.displayValue || '0.00',
        kills: stats.kills?.displayValue || '0',
        deaths: stats.deaths?.displayValue || '0',
        win_: stats.wlPercentage?.displayValue || '0%',
        wins: stats.wins?.displayValue || '0',
        losses: stats.losses?.displayValue || '0',
        matches: stats.matchesPlayed?.displayValue || '0',
        rank_img: stats.rank?.metadata?.iconUrl || ''
      };
      
    case 'casual':
      return {
        ...result,
        kd: stats.kd?.displayValue || '0.00',
        kills: stats.kills?.displayValue || '0',
        deaths: stats.deaths?.displayValue || '0',
        win_: stats.wlPercentage?.displayValue || '0%',
        wins: stats.wins?.displayValue || '0',
        losses: stats.losses?.displayValue || '0',
        matches: stats.matchesPlayed?.displayValue || '0',
        time_played: stats.timePlayed?.displayValue || '0h'
      };
      
    default:
      return result;
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const platform = searchParams.get('platform');
  const username = searchParams.get('username');
  const type = searchParams.get('type') || 'general';

  if (!platform || !username) {
    return NextResponse.json(
      { error: 'Platform and username are required' },
      { status: 400 }
    );
  }

  try {
    const data = await fetchR6TrackerData(platform, username, type);
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch player data', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    // Test de connexion avec un utilisateur connu
    const testData = await fetchR6TrackerData('pc', 'Beaulo', 'general');
    
    return NextResponse.json({
      success: true,
      message: 'R6 Tracker API connection successful',
      testUser: testData?.name || 'Unknown'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'R6 Tracker API connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}