
import { supabase } from "@/integrations/supabase/client";
import { ensureUuid } from "../utils";

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
