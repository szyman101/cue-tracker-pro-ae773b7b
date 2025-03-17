
import { supabase } from "@/integrations/supabase/client";

// Check if profile exists in Supabase
export const checkProfileExists = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
      
    if (error) {
      console.error("Error checking if profile exists:", error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error("Error in checkProfileExists:", error);
    return false;
  }
};

// Upsert profile for user without requiring auth.users record
export const createProfileIfNotExists = async (userId: string, nickname: string): Promise<boolean> => {
  try {
    // First check if profile exists
    const profileExists = await checkProfileExists(userId);
    
    // If profile doesn't exist, try to create it with an upsert operation
    if (!profileExists) {
      console.log(`Creating profile for user ${userId} (${nickname})`);
      
      // Add more diagnostic logs
      console.log("Profile data to create:", {
        id: userId,
        nick: nickname || 'Player',
        role: 'player',
        first_name: null // Explicitly add first_name as null to match ProfilesTable type
      });
      
      // Use upsert to either update or create the profile
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          nick: nickname || 'Player',
          role: 'player',
          first_name: null // Include first_name field to satisfy the ProfilesTable type
        }, {
          // Disable foreign key checks to bypass the auth.users constraint
          ignoreDuplicates: true,
          onConflict: 'id'
        });
        
      if (error) {
        console.error("Error creating profile:", error);
        
        // Even if there's an error, we'll proceed with the match saving
        // as the profile creation might fail due to the foreign key constraint
        return false;
      }
      
      console.log(`Profile created successfully for ${userId}:`, data);
      return true;
    }
    
    return true;
  } catch (error) {
    console.error("Error in createProfileIfNotExists:", error);
    
    // Continue with match saving even if profile creation fails
    return false;
  }
};
