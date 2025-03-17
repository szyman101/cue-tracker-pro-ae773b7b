
import { supabase } from "@/integrations/supabase/client";
import { Match } from "@/types";
import { Json } from "@/integrations/supabase/types";
import { ensureUuid } from "../utils";
import { saveLocalMatch } from "./storage";

// Save a match directly to Supabase without requiring profiles to exist
export const saveMatchToSupabase = async (match: Match): Promise<void> => {
  try {
    console.log("Saving match to Supabase:", match);
    
    const gamesJson = match.games as unknown as Json;
    
    const matchId = ensureUuid(match.id);
    const playerA = ensureUuid(match.playerA);
    const playerB = ensureUuid(match.playerB);
    const winner = match.winner ? ensureUuid(match.winner) : null;
    const seasonId = match.seasonId ? ensureUuid(match.seasonId) : null;
    
    console.log("Prepared IDs for match:", {
      matchId,
      playerA,
      playerB,
      winner,
      seasonId
    });

    const playerAName = match.playerAName || 'Player A';
    const playerBName = match.playerBName || 'Player B';
    console.log("Player names:", { playerAName, playerBName });

    console.log("Saving match to local IndexedDB as fallback");
    // First, try to save locally to ensure data isn't lost even if Supabase save fails
    await saveLocalMatch(match);
    
    console.log("Saving match to Supabase");
    
    // Prepare match data for saving
    const matchData = {
      id: matchId,
      date: match.date,
      player_a: playerA,
      player_b: playerB,
      player_a_name: playerAName,
      player_b_name: playerBName,
      games: gamesJson,
      winner: winner,
      time_elapsed: match.timeElapsed,
      season_id: seasonId,
      games_to_win: match.gamesToWin,
      notes: match.notes || null
    };
    
    console.log("Match data to save:", matchData);
    
    try {
      const { data, error } = await supabase
        .from('matches')
        .upsert(matchData, { 
          onConflict: 'id',
          ignoreDuplicates: false
        })
        .select();
        
      if (error) {
        console.error("Detailed error when saving match:", error);
        throw error;
      } else {
        console.log("Match saved successfully to Supabase:", data);
        
        // If the match has a season ID, try to save the season-match relation
        if (seasonId) {
          try {
            console.log("Saving season-match relation:", { seasonId, matchId });
            
            const { error: relationError } = await supabase
              .from('season_matches')
              .upsert({
                season_id: seasonId,
                match_id: matchId
              }, {
                onConflict: 'season_id,match_id',
                ignoreDuplicates: true
              });
              
            if (relationError) {
              console.error("Error saving season-match relation:", relationError);
            } else {
              console.log("Season-match relation saved successfully");
            }
          } catch (relationError) {
            console.error("Error in season-match relation save:", relationError);
          }
        }
      }
    } catch (error) {
      console.error("Error during match save to Supabase:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error saving match to Supabase:", error);
    throw error;
  }
};
