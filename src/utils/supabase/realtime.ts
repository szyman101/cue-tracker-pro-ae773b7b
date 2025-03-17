
import { supabase } from "@/integrations/supabase/client";

// Explicitly define your custom RPC parameters
interface EnableRealtimeParams {
  table_name: string;
}

export const enableRealtimeForTable = async (tableName: string) => {
  try {
    // @ts-ignore - Ignoring type checking for custom RPC function
    // This is necessary because the Supabase types don't include this custom function
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

// Setup realtime for all main tables
export const setupRealtimeForTables = async () => {
  await enableRealtimeForTable('matches');
  await enableRealtimeForTable('seasons');
  await enableRealtimeForTable('season_matches');
};
