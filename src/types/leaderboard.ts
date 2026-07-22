export interface LeaderboardEntry {
  id: number;
  player_name: string;
  score: number;
  created_at: string;
}

export interface NewLeaderboardEntry {
  player_name: string;
  score: number;
}