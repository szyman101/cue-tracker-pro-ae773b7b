
import { supabase } from "@/integrations/supabase/client";
import { Season, GameType } from "@/types";

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
