
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
