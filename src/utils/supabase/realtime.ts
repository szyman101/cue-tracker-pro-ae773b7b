
import { supabase } from "@/integrations/supabase/client";

// Enable realtime functionality for a specific table
export const enableRealtimeForTable = async (tableName: string) => {
  try {
    // Use any type to bypass type checking for RPC parameters
    // This is necessary because the Supabase types don't include this custom RPC function
    const { error } = await supabase.rpc('enable_realtime', {
      table_name: tableName
    } as any);
    
    if (error) {
      console.error(`Błąd podczas włączania realtime dla tabeli ${tableName}:`, error);
    } else {
      console.log(`Realtime włączone dla tabeli ${tableName}`);
    }
  } catch (error) {
    console.error(`Błąd podczas włączania realtime:`, error);
  }
};

// Setup realtime for all main tables
export const setupRealtimeForTables = async () => {
  await enableRealtimeForTable('matches');
  await enableRealtimeForTable('seasons');
  await enableRealtimeForTable('season_matches');
};
