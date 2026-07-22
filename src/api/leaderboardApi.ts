import { supabase } from "../lib/supabase";
import type {
  LeaderboardEntry,
  NewLeaderboardEntry,
} from "../types/leaderboard";

export async function getLeaderboard(): Promise<
  LeaderboardEntry[]
> {
  const { data, error } = await supabase
    .from("leaderboard")
    .select(
      "id, player_name, score, created_at"
    )
    .order("score", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(
      `Unable to retrieve leaderboard: ${error.message}`
    );
  }

  return data ?? [];
}

export async function addLeaderboardEntry(
  entry: NewLeaderboardEntry
): Promise<LeaderboardEntry> {
  const { data, error } = await supabase
    .from("leaderboard")
    .insert(entry)
    .select(
      "id, player_name, score, created_at"
    )
    .single();

  if (error) {
    throw new Error(
      `Unable to add leaderboard entry: ${error.message}`
    );
  }

  return data;
}