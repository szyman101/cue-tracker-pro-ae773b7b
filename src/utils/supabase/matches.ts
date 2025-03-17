
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
    console.error("Błąd podczas pobierania meczy z Supabase:", error);
    return [];
  }
};

// Save a match to Supabase
export const saveMatchToSupabase = async (match: Match): Promise<void> => {
  try {
    // Add diagnostic logs
    console.log("Zapisuję mecz do Supabase:", match);
    
    const gamesJson = match.games as unknown as Json;
    
    // Prepare proper UUIDs
    const matchId = ensureUuid(match.id);
    const playerA = ensureUuid(match.playerA);
    const playerB = ensureUuid(match.playerB);
    const winner = match.winner ? ensureUuid(match.winner) : null;
    const seasonId = match.seasonId ? ensureUuid(match.seasonId) : null;
    
    console.log("Przygotowane ID dla meczu:", {
      matchId,
      playerA,
      playerB,
      winner,
      seasonId
    });

    // Make sure we have player names
    const playerAName = match.playerAName || 'Gracz A';
    const playerBName = match.playerBName || 'Gracz B';
    console.log("Nazwy graczy:", { playerAName, playerBName });

    // Make sure player profiles exist
    try {
      console.log("Sprawdzam/tworzę profil gracza A:", playerA, playerAName);
      await createProfileIfNotExists(playerA, playerAName);
    } catch (error) {
      console.error("Błąd podczas tworzenia profilu gracza A:", error);
    }
    
    try {
      console.log("Sprawdzam/tworzę profil gracza B:", playerB, playerBName);
      await createProfileIfNotExists(playerB, playerBName);
    } catch (error) {
      console.error("Błąd podczas tworzenia profilu gracza B:", error);
    }
    
    if (winner) {
      try {
        const winnerName = winner === playerA ? playerAName : playerBName;
        console.log("Sprawdzam/tworzę profil zwycięzcy:", winner, winnerName);
        await createProfileIfNotExists(winner, winnerName);
      } catch (error) {
        console.error("Błąd podczas tworzenia profilu zwycięzcy:", error);
      }
    }
    
    console.log("Zapisywanie meczu do Supabase po stworzeniu profili");
    
    // Prepare data for saving
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
      notes: match.notes
    };
    
    console.log("Dane meczu do zapisania:", matchData);
    
    const { data, error } = await supabase
      .from('matches')
      .upsert(matchData)
      .select();
      
    if (error) {
      console.error("Szczegółowy błąd zapisu meczu:", error);
      throw error;
    } else {
      console.log("Mecz zapisany pomyślnie w Supabase:", data);
    }
  } catch (error) {
    console.error("Błąd podczas zapisywania meczu do Supabase:", error);
    throw error;
  }
};
