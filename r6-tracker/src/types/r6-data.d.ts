declare module 'r6-data.js' {
  interface PlayerData {
    id: string;
    username: string;
    platform: string;
    level: number;
    profilePicture: string;
    stats?: Record<string, unknown>;
    progress?: Record<string, unknown>;
  }

  interface RankData {
    season: string;
    rank: string;
    mmr: number;
    maxMmr?: number;
    lastMatch?: Record<string, unknown>;
  }

  class R6Data {
    constructor();
    getPlayer(username: string, platform: string): Promise<PlayerData>;
    getRank(username: string, platform: string): Promise<RankData>;
    getStats?(username: string, platform: string): Promise<Record<string, unknown>>;
  }

  export default R6Data;
}