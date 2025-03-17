import { supabase } from "@/integrations/supabase/client";
import { Match, Season, GameType, GameResult } from "@/types";
import * as db from "./db";
import { Json } from "@/integrations/supabase/types";

// Włączenie funkcji realtime dla tabel
const enableRealtimeForTable = async (tableName: string) => {
  try {
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

// Generuj prawidłowe UUID jeśli string nie jest już UUID
const ensureUuid = (id: string): string => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(id)) {
    return id;
  }
  
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (hash + Math.random() * 16) % 16 | 0;
    hash = Math.floor(hash / 16);
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
  
  return uuid;
};

// Zapisywanie meczu do Supabase
export const saveMatchToSupabase = async (match: Match): Promise<void> => {
  try {
    const gamesJson = match.games as unknown as Json;
    
    const playerA = ensureUuid(match.playerA);
    const playerB = ensureUuid(match.playerB);
    const winner = match.winner ? ensureUuid(match.winner) : null;
    const seasonId = match.seasonId ? ensureUuid(match.seasonId) : null;
    
    console.log("Saving match to Supabase with IDs:", {
      playerA,
      playerB,
      winner,
      seasonId,
      matchId: match.id
    });
    
    const { error } = await supabase
      .from('matches')
      .upsert({
        id: match.id,
        date: match.date,
        player_a: playerA,
        player_b: playerB,
        player_a_name: match.playerAName,
        player_b_name: match.playerBName,
        games: gamesJson,
        winner: winner,
        time_elapsed: match.timeElapsed,
        season_id: seasonId,
        games_to_win: match.gamesToWin,
        notes: match.notes
      });
      
    if (error) {
      console.error("Error details:", error);
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
    console.error("Błąd podczas zapisywania sezonu do Supabase:", error);
    throw error;
  }
};

// Zapisywanie relacji sezon-mecz
export const saveSeasonMatchRelation = async (seasonId: string, matchId: string): Promise<void> => {
  try {
    const safeSeasonId = ensureUuid(seasonId);
    const safeMatchId = ensureUuid(matchId);
    
    const { error } = await supabase
      .from('season_matches')
      .upsert({
        season_id: safeSeasonId,
        match_id: safeMatchId
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
    await db.initDB();
    
    const localMatches = await db.getMatches();
    console.log(`Znaleziono ${localMatches.length} lokalnych meczy do migracji`);
    
    const localSeasons = await db.getSeasons();
    console.log(`Znaleziono ${localSeasons.length} lokalnych sezonów do migracji`);
    
    for (const match of localMatches) {
      try {
        await saveMatchToSupabase(match);
        matchesMigrated++;
      } catch (error) {
        console.error(`Błąd podczas migracji meczu ${match.id}:`, error);
        errors.push(`Nie udało się zmigrować meczu ${match.id}: ${(error as Error).message}`);
      }
    }
    
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
