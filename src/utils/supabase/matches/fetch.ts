
import { supabase } from "@/integrations/supabase/client";
import { Match, GameType } from "@/types";

// Fetch all matches from Supabase
export const fetchMatchesFromSupabase = async (): Promise<Match[]> => {
  try {
    const { data, error } = await supabase
      .from('matches')
      .select('*');
      
    if (error) {
      throw error;
    }
    
    return data.map(match => {
      const gamesData = match.games as unknown;
      const games = Array.isArray(gamesData) 
        ? gamesData.map(game => ({
            type: (game as any).type as GameType,
            scoreA: (game as any).scoreA as number,
            scoreB: (game as any).scoreB as number,
            winner: (game as any).winner as string,
            breakAndRun: (game as any).breakAndRun as boolean | undefined
          })) 
        : [];
      
      return {
        id: match.id,
        date: match.date,
        playerA: match.player_a,
        playerB: match.player_b,
        playerAName: match.player_a_name || '',
        playerBName: match.player_b_name || '',
        games: games,
        winner: match.winner || '',
        timeElapsed: match.time_elapsed || 0,
        seasonId: match.season_id || undefined,
        gamesToWin: match.games_to_win || 3,
        notes: match.notes || undefined
      };
    });
  } catch (error) {
    console.error("Error while fetching matches from Supabase:", error);
    return [];
  }
};
