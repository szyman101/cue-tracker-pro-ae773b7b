
import { supabase } from "@/integrations/supabase/client";
import { ensureUuid } from "../utils";

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

// Save season-match relationship with retry mechanism
export const saveSeasonMatchRelation = async (seasonId: string, matchId: string, maxRetries = 3): Promise<void> => {
  try {
    const safeSeasonId = ensureUuid(seasonId);
    const safeMatchId = ensureUuid(matchId);
    
    // Sprawdź, czy mecz istnieje w bazie przed dodaniem relacji
    const { data: matchExists, error: matchCheckError } = await supabase
      .from('matches')
      .select('id')
      .eq('id', safeMatchId)
      .single();
    
    if (matchCheckError) {
      console.warn(`Match with ID ${safeMatchId} not found in database. Will retry later.`);
      
      if (maxRetries > 0) {
        // Czekaj 1 sekundę przed kolejną próbą
        console.log(`Retrying save season-match relation. Retries left: ${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return saveSeasonMatchRelation(seasonId, matchId, maxRetries - 1);
      } else {
        throw new Error(`Failed to save season-match relation after multiple retries: match ${safeMatchId} not found`);
      }
    }
    
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
    
    console.log(`Successfully saved season-match relation: season ${safeSeasonId} - match ${safeMatchId}`);
  } catch (error) {
    console.error("Error saving season-match relationship:", error);
    throw error;
  }
};
