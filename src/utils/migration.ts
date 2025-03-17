
import { supabase } from "@/integrations/supabase/client";
import { Match, Season, User } from "@/types";
import * as db from "./db";
import { toast } from "@/hooks/use-toast";

// Funkcja migrująca dane użytkownika do Supabase
export const migrateToSupabase = async (): Promise<{
  success: boolean;
  matchesMigrated: number;
  seasonsMigrated: number;
}> => {
  let matchesMigrated = 0;
  let seasonsMigrated = 0;

  try {
    // Pobierz dane z IndexedDB
    const localMatches = await db.getMatches();
    const localSeasons = await db.getSeasons();

    console.log("Dane do migracji:", { localMatches, localSeasons });

    // Sprawdź istniejące dane w Supabase, żeby unikać duplikatów
    const { data: existingMatches } = await supabase
      .from("matches")
      .select("id");
    
    const { data: existingSeasons } = await supabase
      .from("seasons")
      .select("id");

    const existingMatchIds = new Set(existingMatches?.map(m => m.id) || []);
    const existingSeasonIds = new Set(existingSeasons?.map(s => s.id) || []);

    console.log("Istniejące dane w Supabase:", { 
      existingMatchIds: Array.from(existingMatchIds),
      existingSeasonIds: Array.from(existingSeasonIds)
    });

    // Migruj sezony
    if (localSeasons.length > 0) {
      const seasonsToMigrate = localSeasons.filter(season => !existingSeasonIds.has(season.id));
      
      if (seasonsToMigrate.length > 0) {
        console.log("Migrowanie sezonów:", seasonsToMigrate);
        
        // Przygotuj dane sezonu do Supabase
        const preparedSeasons = seasonsToMigrate.map(season => ({
          id: season.id,
          name: season.name,
          start_date: season.startDate,
          end_date: season.endDate,
          game_types: season.gameTypes,
          matches_to_win: season.matchesToWin,
          break_rule: season.breakRule,
          prize: season.prize,
          active: season.active,
          winner: season.winner,
          games_per_match: season.gamesPerMatch,
          stake: season.stake
        }));
        
        const { error: seasonsError } = await supabase
          .from("seasons")
          .insert(preparedSeasons);
          
        if (seasonsError) {
          console.error("Błąd podczas migracji sezonów:", seasonsError);
          throw new Error(`Błąd migracji sezonów: ${seasonsError.message}`);
        }
        
        seasonsMigrated = seasonsToMigrate.length;
        console.log(`Zmigrowano ${seasonsMigrated} sezonów`);
      } else {
        console.log("Brak nowych sezonów do migracji");
      }
    }
    
    // Migruj mecze
    if (localMatches.length > 0) {
      const matchesToMigrate = localMatches.filter(match => !existingMatchIds.has(match.id));
      
      if (matchesToMigrate.length > 0) {
        console.log("Migrowanie meczów:", matchesToMigrate);
        
        // Przygotuj dane meczu do Supabase
        const preparedMatches = matchesToMigrate.map(match => ({
          id: match.id,
          date: match.date,
          player_a: match.playerA,
          player_b: match.playerB,
          player_a_name: match.playerAName,
          player_b_name: match.playerBName,
          games: match.games,
          winner: match.winner,
          season_id: match.seasonId,
          time_elapsed: match.timeElapsed,
          notes: match.notes,
          games_to_win: match.gamesToWin
        }));
        
        const { error: matchesError } = await supabase
          .from("matches")
          .insert(preparedMatches);
          
        if (matchesError) {
          console.error("Błąd podczas migracji meczów:", matchesError);
          throw new Error(`Błąd migracji meczów: ${matchesError.message}`);
        }
        
        // Dodaj połączenia sezon-mecz dla każdego meczu powiązanego z sezonem
        const seasonMatchConnections = matchesToMigrate
          .filter(match => match.seasonId)
          .map(match => ({
            season_id: match.seasonId,
            match_id: match.id
          }));
          
        if (seasonMatchConnections.length > 0) {
          console.log("Dodawanie powiązań sezon-mecz:", seasonMatchConnections);
          
          const { error: connectionsError } = await supabase
            .from("season_matches")
            .insert(seasonMatchConnections);
            
          if (connectionsError) {
            console.error("Błąd podczas dodawania powiązań sezon-mecz:", connectionsError);
            // Nie przerywamy migracji, tylko logujemy błąd
          }
        }
        
        matchesMigrated = matchesToMigrate.length;
        console.log(`Zmigrowano ${matchesMigrated} meczów`);
      } else {
        console.log("Brak nowych meczów do migracji");
      }
    }
    
    return { success: true, matchesMigrated, seasonsMigrated };
  } catch (error) {
    console.error("Błąd podczas migracji danych:", error);
    return { success: false, matchesMigrated, seasonsMigrated };
  }
};
