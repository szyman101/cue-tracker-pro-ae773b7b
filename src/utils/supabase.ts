
import { supabase } from "@/integrations/supabase/client";
import { Match, Season, GameType, GameResult } from "@/types";
import * as db from "./db";
import { Json } from "@/integrations/supabase/types";

// Włączenie funkcji realtime dla tabel
const enableRealtimeForTable = async (tableName: string) => {
  try {
    // Fixed type error by properly typing the RPC function call
    const { error } = await supabase.rpc('enable_realtime', {
      table_name: tableName
    });
    
    if (error) {
      console.error(`Błąd podczas włączania realtime dla tabeli ${tableName}:`, error);
    } else {
      console.log(`Realtime włączone dla tabeli ${tableName}`);
    }
  } catch (error) {
    console.error(`Błąd podczas włączania realtime:`, error);
  }
};

// Uruchom włączenie realtime dla głównych tabel - można wywołać raz przy starcie aplikacji
export const setupRealtimeForTables = async () => {
  await enableRealtimeForTable('matches');
  await enableRealtimeForTable('seasons');
  await enableRealtimeForTable('season_matches');
};

// Pobieranie meczy z Supabase
export const fetchMatchesFromSupabase = async (): Promise<Match[]> => {
  try {
    const { data, error } = await supabase
      .from('matches')
      .select('*');
      
    if (error) {
      throw error;
    }
    
    return data.map(match => {
      // Fixed type conversion issue by properly casting the data
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

// Pobieranie sezonów z Supabase
export const fetchSeasonsFromSupabase = async (): Promise<Season[]> => {
  try {
    const { data, error } = await supabase
      .from('seasons')
      .select('*');
      
    if (error) {
      throw error;
    }
    
    return data.map(season => {
      // Added proper type conversion for game_types array
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
        matches: [], // Relacje będą pobierane osobno
        winner: season.winner || undefined,
        gamesPerMatch: season.games_per_match || undefined,
        stake: season.stake ? Number(season.stake) : undefined
      };
    });
  } catch (error) {
    console.error("Błąd podczas pobierania sezonów z Supabase:", error);
    return [];
  }
};

// Pobieranie powiązań meczy i sezonów
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
    console.error("Błąd podczas pobierania powiązań sezon-mecz:", error);
    return [];
  }
};

// Zapisywanie meczu do Supabase
export const saveMatchToSupabase = async (match: Match): Promise<void> => {
  try {
    // Convert GameResult[] to Json with proper type casting
    const gamesJson = match.games as unknown as Json;
    
    const { error } = await supabase
      .from('matches')
      .upsert({
        id: match.id,
        date: match.date,
        player_a: match.playerA,
        player_b: match.playerB,
        player_a_name: match.playerAName,
        player_b_name: match.playerBName,
        games: gamesJson,
        winner: match.winner,
        time_elapsed: match.timeElapsed,
        season_id: match.seasonId,
        games_to_win: match.gamesToWin,
        notes: match.notes
      });
      
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Błąd podczas zapisywania meczu do Supabase:", error);
    throw error;
  }
};

// Zapisywanie sezonu do Supabase
export const saveSeasonToSupabase = async (season: Season): Promise<void> => {
  try {
    const { error } = await supabase
      .from('seasons')
      .upsert({
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
      });
      
    if (error) {
      throw error;
    }
    
    // Zapisywanie powiązań mecz-sezon
    for (const matchId of season.matches) {
      await saveSeasonMatchRelation(season.id, matchId);
    }
  } catch (error) {
    console.error("Błąd podczas zapisywania sezonu do Supabase:", error);
    throw error;
  }
};

// Zapisywanie relacji sezon-mecz
export const saveSeasonMatchRelation = async (seasonId: string, matchId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('season_matches')
      .upsert({
        season_id: seasonId,
        match_id: matchId
      });
      
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Błąd podczas zapisywania relacji sezon-mecz:", error);
    throw error;
  }
};

// Migracja wszystkich danych z IndexedDB do Supabase
export const migrateDataToSupabase = async (): Promise<{
  matchesMigrated: number,
  seasonsMigrated: number,
  errors: string[]
}> => {
  const errors: string[] = [];
  let matchesMigrated = 0;
  let seasonsMigrated = 0;
  
  try {
    // Inicjalizacja IndexedDB
    await db.initDB();
    
    // Pobierz wszystkie mecze z IndexedDB
    const localMatches = await db.getMatches();
    console.log(`Znaleziono ${localMatches.length} lokalnych meczy do migracji`);
    
    // Pobierz wszystkie sezony z IndexedDB
    const localSeasons = await db.getSeasons();
    console.log(`Znaleziono ${localSeasons.length} lokalnych sezonów do migracji`);
    
    // Migruj mecze
    for (const match of localMatches) {
      try {
        await saveMatchToSupabase(match);
        matchesMigrated++;
      } catch (error) {
        console.error(`Błąd podczas migracji meczu ${match.id}:`, error);
        errors.push(`Nie udało się zmigrować meczu ${match.id}: ${(error as Error).message}`);
      }
    }
    
    // Migruj sezony
    for (const season of localSeasons) {
      try {
        await saveSeasonToSupabase(season);
        seasonsMigrated++;
      } catch (error) {
        console.error(`Błąd podczas migracji sezonu ${season.id}:`, error);
        errors.push(`Nie udało się zmigrować sezonu ${season.id}: ${(error as Error).message}`);
      }
    }
    
    console.log(`Migracja zakończona. Zmigrowano ${matchesMigrated} meczy i ${seasonsMigrated} sezonów.`);
    
    return {
      matchesMigrated,
      seasonsMigrated,
      errors
    };
  } catch (error) {
    console.error("Błąd podczas migracji danych:", error);
    errors.push(`Ogólny błąd migracji: ${(error as Error).message}`);
    
    return {
      matchesMigrated,
      seasonsMigrated,
      errors
    };
  }
};
