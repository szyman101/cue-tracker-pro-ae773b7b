
import { supabase } from "@/integrations/supabase/client";

// Check if a user profile exists in the Supabase database
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

// Create a profile for a user if it doesn't already exist
export const createProfileIfNotExists = async (userId: string, nickname: string): Promise<boolean> => {
  try {
    // First check if profile exists
    const profileExists = await checkProfileExists(userId);
    
    // If it doesn't exist, create it
    if (!profileExists) {
      console.log(`Tworzenie profilu dla użytkownika ${userId} (${nickname})`);
      
      // Add diagnostic logs
      console.log("Dane profilu do utworzenia:", {
        id: userId,
        nick: nickname || 'Gracz',
        role: 'player'
      });
      
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          nick: nickname || 'Gracz',
          role: 'player'
        })
        .select();
        
      if (error) {
        console.error("Error creating profile:", error);
        return false;
      }
      
      console.log(`Profil utworzony pomyślnie dla ${userId}:`, data);
      return true;
    }
    
    return true;
  } catch (error) {
    console.error("Error in createProfileIfNotExists:", error);
    return false;
  }
};
