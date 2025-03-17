
import { supabase } from "@/integrations/supabase/client";
import { Season, GameType } from "@/types";
import { ensureUuid } from "./utils";

// Fetch all seasons from Supabase
export const fetchSeasonsFromSupabase = async (): Promise<Season[]> => {
  try {
    const { data, error } = await supabase
      .from('seasons')
      .select('*');
      
    if (error) {
      throw error;
    }
    
    return data.map(season => {
      const gameTypes = season.game_types as unknown as GameType[];
      
      return {
        id: season.id,
        name: season.name,
        startDate: season.start_date,
        endDate: season.end_date || undefined,
        gameTypes: gameTypes,
        matchesToWin: season.matches_to_win,
        breakRule: season.break_rule as "winner" | "alternate",
        prize: season.prize || undefined,
        active: season.active,
        matches: [], // Relationships will be fetched separately
        winner: season.winner || undefined,
        gamesPerMatch: season.games_per_match || undefined,
        stake: season.stake ? Number(season.stake) : undefined
      };
    });
  } catch (error) {
    console.error("Error while fetching seasons from Supabase:", error);
    return [];
  }
};

// Fetch season-match relationships
export const fetchSeasonMatches = async (): Promise<{seasonId: string, matchId: string}[]> => {
  try {
    const { data, error } = await supabase
      .from('season_matches')
      .select('*');
      
    if (error) {
      throw error;
    }
    
    return data.map(rel => ({
      seasonId: rel.season_id,
      matchId: rel.match_id
    }));
  } catch (error) {
    console.error("Error while fetching season-match relationships:", error);
    return [];
  }
};

// Save a season to Supabase
export const saveSeasonToSupabase = async (season: Season): Promise<void> => {
  try {
    const seasonId = ensureUuid(season.id);
    const winnerId = season.winner ? ensureUuid(season.winner) : null;
    
    const { error } = await supabase
      .from('seasons')
      .upsert({
        id: seasonId,
        name: season.name,
        start_date: season.startDate,
        end_date: season.endDate,
        game_types: season.gameTypes,
        matches_to_win: season.matchesToWin,
        break_rule: season.breakRule,
        prize: season.prize,
        active: season.active,
        winner: winnerId,
        games_per_match: season.gamesPerMatch,
        stake: season.stake
      });
      
    if (error) {
      throw error;
    }
    
    for (const matchId of season.matches) {
      await saveSeasonMatchRelation(seasonId, matchId);
    }
  } catch (error) {
    console.error("Error saving season to Supabase:", error);
    throw error;
  }
};

// Save season-match relationship
export const saveSeasonMatchRelation = async (seasonId: string, matchId: string): Promise<void> => {
  try {
    const safeSeasonId = ensureUuid(seasonId);
    const safeMatchId = ensureUuid(matchId);
    
    const { error } = await supabase
      .from('season_matches')
      .upsert({
        season_id: safeSeasonId,
        match_id: safeMatchId
      }, {
        onConflict: 'season_id,match_id',
        ignoreDuplicates: true
      });
      
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error saving season-match relationship:", error);
    throw error;
  }
};
