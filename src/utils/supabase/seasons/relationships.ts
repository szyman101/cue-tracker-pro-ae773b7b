
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

// Save season-match relationship
export const saveSeasonMatchRelation = async (seasonId: string, matchId: string): Promise<void> => {
  try {
    const safeSeasonId = ensureUuid(seasonId);
    const safeMatchId = ensureUuid(matchId);
    
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
  } catch (error) {
    console.error("Error saving season-match relationship:", error);
    throw error;
  }
};
