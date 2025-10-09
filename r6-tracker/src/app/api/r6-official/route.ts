import { NextRequest, NextResponse } from 'next/server';
import { R6GeneralStats, R6RankedStats, R6CasualStats } from '@/types/r6Api';

// Interface pour l'API R6 (côté serveur seulement)
interface R6ApiServerService {
  validateUsername(username: string, platform: string): Promise<boolean>;
  getGeneralStats(username: string, platform: string): Promise<R6GeneralStats>;
  getRankedStats(username: string, platform: string): Promise<R6RankedStats>;
  getCasualStats(username: string, platform: string): Promise<R6CasualStats>;
}

// Désactivation temporaire du type any pour l'API externe
/* eslint-disable @typescript-eslint/no-explicit-any */
class R6ApiServer implements R6ApiServerService {
  private r6api: any = null;
  private isAuthenticated = false;

  constructor() {
    this.initializeAPI();
  }

  private async initializeAPI(): Promise<void> {
    try {
      // Import dynamique côté serveur uniquement
      // @ts-expect-error - Problème temporaire avec les types r6api.js
      const R6API = (await import('r6api.js')).default;
      
      if (!process.env.UBISOFT_EMAIL || !process.env.UBISOFT_PASSWORD) {
        console.warn('⚠️ Variables d\'environnement Ubisoft manquantes');
        return;
      }

      this.r6api = new R6API({
        email: process.env.UBISOFT_EMAIL,
        password: process.env.UBISOFT_PASSWORD,
      });

      this.isAuthenticated = true;
      console.log('✅ API R6 initialisée côté serveur');
    } catch (error) {
      console.error('❌ Erreur d\'initialisation de l\'API R6:', error);
    }
  }

  private mapPlatform(platform: string): string {
    const platformMap: { [key: string]: string } = {
      'uplay': 'uplay',
      'steam': 'steam', 
      'epic': 'epic',
      'xbox': 'xbl',
      'playstation': 'psn'
    };
    return platformMap[platform.toLowerCase()] || 'uplay';
  }

  async validateUsername(username: string, platform: string): Promise<boolean> {
    try {
      if (!this.r6api) await this.initializeAPI();
      if (!this.r6api) return false;

      const mappedPlatform = this.mapPlatform(platform);
      const players = await this.r6api.findByUsername(mappedPlatform, username);
      
      return players && players.length > 0;
    } catch (error) {
      console.error('❌ Erreur validation username:', error);
      return false;
    }
  }

  async getGeneralStats(username: string, platform: string): Promise<R6GeneralStats> {
    try {
      if (!this.r6api) await this.initializeAPI();
      if (!this.r6api) throw new Error('API R6 non disponible');

      const mappedPlatform = this.mapPlatform(platform);
      
      const players = await this.r6api.findByUsername(mappedPlatform, username);
      if (!players || players.length === 0) {
        throw new Error('Joueur non trouvé');
      }

      const player = players[0];
      
      const [stats, level, playtime] = await Promise.all([
        this.r6api.getStats(mappedPlatform, player.id),
        this.r6api.getLevel(mappedPlatform, player.id),
        this.r6api.getPlaytime(mappedPlatform, player.id)
      ]);

      return {
        username: player.username,
        platform: platform,
        level: level?.[0]?.level || 0,
        totalTimePlayed: playtime?.[0]?.general || 0,
        totalKills: stats?.[0]?.general?.kills || 0,
        totalDeaths: stats?.[0]?.general?.deaths || 0,
        totalWins: stats?.[0]?.general?.wins || 0,
        totalLosses: stats?.[0]?.general?.losses || 0,
        kdRatio: this.calculateRatio(stats?.[0]?.general?.kills, stats?.[0]?.general?.deaths),
        wlRatio: this.calculateRatio(stats?.[0]?.general?.wins, stats?.[0]?.general?.losses)
      };
    } catch (error) {
      console.error('❌ Erreur récupération stats générales:', error);
      throw error;
    }
  }

  async getRankedStats(username: string, platform: string): Promise<R6RankedStats> {
    try {
      if (!this.r6api) await this.initializeAPI();
      if (!this.r6api) throw new Error('API R6 non disponible');

      const mappedPlatform = this.mapPlatform(platform);
      
      const players = await this.r6api.findByUsername(mappedPlatform, username);
      if (!players || players.length === 0) {
        throw new Error('Joueur non trouvé');
      }

      const player = players[0];
      const rankedStats = await this.r6api.getRank(mappedPlatform, player.id);

      if (!rankedStats || rankedStats.length === 0) {
        return {
          username: player.username,
          platform: platform,
          currentRank: 'Non classé',
          currentMmr: 0,
          maxMmr: 0,
          wins: 0,
          losses: 0,
          abandons: 0,
          kills: 0,
          deaths: 0,
          kdRatio: '0.00'
        };
      }

      const ranked = rankedStats[0];

      return {
        username: player.username,
        platform: platform,
        currentRank: ranked.rank_text || 'Non classé',
        currentMmr: ranked.mmr || 0,
        maxMmr: ranked.max_mmr || 0,
        wins: ranked.wins || 0,
        losses: ranked.losses || 0,
        abandons: ranked.abandons || 0,
        kills: ranked.kills || 0,
        deaths: ranked.deaths || 0,
        kdRatio: this.calculateRatio(ranked.kills, ranked.deaths)
      };
    } catch (error) {
      console.error('❌ Erreur récupération stats ranked:', error);
      throw error;
    }
  }

  async getCasualStats(username: string, platform: string): Promise<R6CasualStats> {
    try {
      if (!this.r6api) await this.initializeAPI();
      if (!this.r6api) throw new Error('API R6 non disponible');

      const mappedPlatform = this.mapPlatform(platform);
      
      const players = await this.r6api.findByUsername(mappedPlatform, username);
      if (!players || players.length === 0) {
        throw new Error('Joueur non trouvé');
      }

      const player = players[0];
      const stats = await this.r6api.getStats(mappedPlatform, player.id);

      if (!stats || stats.length === 0) {
        return {
          username: player.username,
          platform: platform,
          wins: 0,
          losses: 0,
          kills: 0,
          deaths: 0,
          kdRatio: '0.00',
          wlRatio: '0.00'
        };
      }

      const casual = stats[0].casual || stats[0].general;

      return {
        username: player.username,
        platform: platform,
        wins: casual?.wins || 0,
        losses: casual?.losses || 0,
        kills: casual?.kills || 0,
        deaths: casual?.deaths || 0,
        kdRatio: this.calculateRatio(casual?.kills, casual?.deaths),
        wlRatio: this.calculateRatio(casual?.wins, casual?.losses)
      };
    } catch (error) {
      console.error('❌ Erreur récupération stats casual:', error);
      throw error;
    }
  }

  private calculateRatio(numerator?: number, denominator?: number): string {
    if (!numerator || !denominator || denominator === 0) return '0.00';
    return (numerator / denominator).toFixed(2);
  }
}

// Instance singleton pour l'API
let r6ApiInstance: R6ApiServer | null = null;

function getR6ApiInstance(): R6ApiServer {
  if (!r6ApiInstance) {
    r6ApiInstance = new R6ApiServer();
  }
  return r6ApiInstance;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const username = searchParams.get('username');
    const platform = searchParams.get('platform');

    if (!action) {
      return NextResponse.json({ 
        success: false, 
        error: 'Action requise' 
      }, { status: 400 });
    }

    const apiService = getR6ApiInstance();

    switch (action) {
      case 'validate':
        if (!username || !platform) {
          return NextResponse.json({ 
            success: false, 
            error: 'Username et platform requis' 
          }, { status: 400 });
        }
        
        const isValid = await apiService.validateUsername(username, platform);
        return NextResponse.json({ 
          success: true, 
          data: { valid: isValid } 
        });

      case 'general':
        if (!username || !platform) {
          return NextResponse.json({ 
            success: false, 
            error: 'Username et platform requis' 
          }, { status: 400 });
        }
        
        const generalStats = await apiService.getGeneralStats(username, platform);
        return NextResponse.json({ 
          success: true, 
          data: generalStats 
        });

      case 'ranked':
        if (!username || !platform) {
          return NextResponse.json({ 
            success: false, 
            error: 'Username et platform requis' 
          }, { status: 400 });
        }
        
        const rankedStats = await apiService.getRankedStats(username, platform);
        return NextResponse.json({ 
          success: true, 
          data: rankedStats 
        });

      case 'casual':
        if (!username || !platform) {
          return NextResponse.json({ 
            success: false, 
            error: 'Username et platform requis' 
          }, { status: 400 });
        }
        
        const casualStats = await apiService.getCasualStats(username, platform);
        return NextResponse.json({ 
          success: true, 
          data: casualStats 
        });

      case 'test':
        return NextResponse.json({ 
          success: true, 
          data: { 
            connected: true,
            hasCredentials: !!(process.env.UBISOFT_EMAIL && process.env.UBISOFT_PASSWORD)
          } 
        });

      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Action non supportée' 
        }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ Erreur API R6 officielle:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur inconnue' 
    }, { status: 500 });
  }
}