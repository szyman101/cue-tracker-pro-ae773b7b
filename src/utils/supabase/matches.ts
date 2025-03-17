
import { supabase } from "@/integrations/supabase/client";
import { Match, GameType } from "@/types";
import { Json } from "@/integrations/supabase/types";
import { ensureUuid } from "./utils";
import { createProfileIfNotExists } from "./profiles";

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

    // We'll still try to create profiles but continue even if they fail
    try {
      console.log("Checking/creating profile for player A:", playerA, playerAName);
      await createProfileIfNotExists(playerA, playerAName);
    } catch (error) {
      console.error("Error creating profile for player A:", error);
      // Continue even if profile creation fails
    }
    
    try {
      console.log("Checking/creating profile for player B:", playerB, playerBName);
      await createProfileIfNotExists(playerB, playerBName);
    } catch (error) {
      console.error("Error creating profile for player B:", error);
      // Continue even if profile creation fails
    }
    
    if (winner) {
      try {
        const winnerName = winner === playerA ? playerAName : playerBName;
        console.log("Checking/creating profile for winner:", winner, winnerName);
        await createProfileIfNotExists(winner, winnerName);
      } catch (error) {
        console.error("Error creating profile for winner:", error);
        // Continue even if profile creation fails
      }
    }
    
    console.log("Saving match to local IndexedDB as fallback");
    // First, try to save locally to ensure data isn't lost even if Supabase save fails
    try {
      // Use the local IndexedDB database to save the match
      const db = await window.indexedDB.open("billiards-tracker", 1);
      db.onsuccess = () => {
        const database = db.result;
        const transaction = database.transaction("matches", "readwrite");
        const store = transaction.objectStore("matches");
        store.put(match);
        console.log("Match saved to local IndexedDB successfully");
      };
    } catch (localError) {
      console.error("Error saving match to local IndexedDB:", localError);
    }
    
    console.log("Saving match to Supabase after profile creation attempts");
    
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

// Delete a match from Supabase
export const deleteMatchFromSupabase = async (matchId: string): Promise<void> => {
  try {
    console.log("Deleting match from Supabase:", matchId);
    
    const uuid = ensureUuid(matchId);
    
    // First, remove any season-match relations for this match
    const { error: relationError } = await supabase
      .from('season_matches')
      .delete()
      .eq('match_id', uuid);
      
    if (relationError) {
      console.error("Error deleting season-match relations:", relationError);
      // Continue with match deletion even if relation deletion fails
    }
    
    // Then delete the match itself
    const { error } = await supabase
      .from('matches')
      .delete()
      .eq('id', uuid);
      
    if (error) {
      console.error("Error deleting match:", error);
      throw error;
    }
    
    console.log("Match deleted successfully from Supabase");
  } catch (error) {
    console.error("Error deleting match from Supabase:", error);
    throw error;
  }
};
