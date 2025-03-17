
import { supabase } from "@/integrations/supabase/client";
import { Season } from "@/types";
import { ensureUuid } from "../utils";
import { saveSeasonMatchRelation } from "./relationships";

// Save a season to Supabase
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
    console.error("Error saving season to Supabase:", error);
    throw error;
  }
};

// Function to handle ending a season
export const endSeasonInSupabase = async (seasonId: string): Promise<void> => {
  try {
    const uuid = ensureUuid(seasonId);
    
    const { error } = await supabase
      .from('seasons')
      .update({ 
        active: false,
        end_date: new Date().toISOString()
      })
      .eq('id', uuid);
      
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error ending season in Supabase:", error);
    throw error;
  }
};

// Function to handle deleting a season
export const deleteSeasonFromSupabase = async (seasonId: string): Promise<void> => {
  try {
    const uuid = ensureUuid(seasonId);
    
    // First, delete all season-match relationships
    const { error: relationshipError } = await supabase
      .from('season_matches')
      .delete()
      .eq('season_id', uuid);
      
    if (relationshipError) {
      console.error("Error deleting season-match relationships:", relationshipError);
      // Continue with season deletion even if relationship deletion fails
    }
    
    // Then delete the season itself
    const { error } = await supabase
      .from('seasons')
      .delete()
      .eq('id', uuid);
      
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error deleting season from Supabase:", error);
    throw error;
  }
};
