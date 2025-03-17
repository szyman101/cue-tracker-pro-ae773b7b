
import { supabase } from "@/integrations/supabase/client";
import * as db from "../db";
import { saveMatchToSupabase } from './matches';
import { saveSeasonToSupabase } from './seasons';

// Migrate all data from IndexedDB to Supabase
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
