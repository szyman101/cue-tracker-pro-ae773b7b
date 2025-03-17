import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User, Match, Season } from "../types";
import { initialUsers } from "../data/initialData";
import * as db from "../utils/db";
import * as supabaseUtils from "../utils/supabase";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DataContextType {
  users: User[];
  matches: Match[];
  seasons: Season[];
  getUserById: (id: string) => User | undefined;
  getUserMatches: (userId: string) => Match[];
  getUserSeasons: (userId: string) => Season[];
  getSeasonMatches: (seasonId: string) => Match[];
  getActiveSeasons: () => Season[];
  addMatch: (match: Match) => void;
  addSeason: (season: Season) => void;
  updateSeasonWithMatch: (seasonId: string, matchId: string) => void;
  clearMatches: () => void;
  clearSeasons: () => void;
  deleteSeason: (seasonId: string) => void;
  endSeason: (seasonId: string, winnerId?: string) => void;
  isUsingSupabase: boolean;
  toggleDataSource: () => void;
  syncWithSupabase: () => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users] = useState<User[]>(initialUsers);
  const [matches, setMatches] = useState<Match[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingSupabase, setIsUsingSupabase] = useState(true); // Domyślnie Supabase

  // Subskrypcja do zmian w czasie rzeczywistym
  useEffect(() => {
    if (!isUsingSupabase) return;
    
    // Kanał nasłuchujący zmian w mecach
    const matchesChannel = supabase
      .channel('public:matches')
      .on('postgres_changes', {
        event: '*', 
        schema: 'public', 
        table: 'matches'
      }, (payload) => {
        console.log('Zmiana w tabeli matches:', payload);
        syncWithSupabase();
      })
      .subscribe();
      
    // Kanał nasłuchujący zmian w sezonach
    const seasonsChannel = supabase
      .channel('public:seasons')
      .on('postgres_changes', {
        event: '*', 
        schema: 'public', 
        table: 'seasons'
      }, (payload) => {
        console.log('Zmiana w tabeli seasons:', payload);
        syncWithSupabase();
      })
      .subscribe();
      
    // Kanał nasłuchujący zmian w relacjach sezon-mecz
    const seasonMatchesChannel = supabase
      .channel('public:season_matches')
      .on('postgres_changes', {
        event: '*', 
        schema: 'public', 
        table: 'season_matches'
      }, (payload) => {
        console.log('Zmiana w tabeli season_matches:', payload);
        syncWithSupabase();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(matchesChannel);
      supabase.removeChannel(seasonsChannel);
      supabase.removeChannel(seasonMatchesChannel);
    };
  }, [isUsingSupabase, syncWithSupabase]);

  // Funkcja do przełączania źródła danych
  const toggleDataSource = () => {
    // Funkcja pozostawiona dla kompletności, ale przełącznik jest wyłączony w UI
    setIsUsingSupabase(!isUsingSupabase);
  };

  // Funkcja do synchronizacji danych z Supabase
  const syncWithSupabase = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Pobierz dane z Supabase
      const supabaseMatches = await supabaseUtils.fetchMatchesFromSupabase();
      const supabaseSeasons = await supabaseUtils.fetchSeasonsFromSupabase();
      const seasonMatches = await supabaseUtils.fetchSeasonMatches();
      
      // Uzupełnij informacje o meczach w sezonach
      const enhancedSeasons = supabaseSeasons.map(season => {
        const matches = seasonMatches
          .filter(rel => rel.seasonId === season.id)
          .map(rel => rel.matchId);
        
        return {
          ...season,
          matches
        };
      });
      
      // Ustaw dane w stanie
      setMatches(supabaseMatches);
      setSeasons(enhancedSeasons);
      
      console.log("Dane zsynchronizowane z Supabase:", {
        matches: supabaseMatches.length,
        seasons: enhancedSeasons.length
      });
      
      toast({
        title: "Dane zaktualizowane",
        description: "Dane zostały pomyślnie zsynchronizowane z Supabase.",
        duration: 3000
      });
    } catch (error) {
      console.error("Błąd podczas synchronizacji z Supabase:", error);
      toast({
        title: "Błąd synchronizacji",
        description: "Nie udało się zsynchronizować danych z Supabase.",
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load data from source on initialization and when source changes
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        if (isUsingSupabase) {
          // Załaduj dane z Supabase
          await syncWithSupabase();
        } else {
          // Załaduj dane z IndexedDB
          await db.initDB();
          
          // Fetch data
          const loadedMatches = await db.getMatches();
          const loadedSeasons = await db.getSeasons();
          
          console.log("Loaded matches from IndexedDB:", loadedMatches);
          console.log("Loaded seasons from IndexedDB:", loadedSeasons);
          
          setMatches(Array.isArray(loadedMatches) ? loadedMatches : []);
          setSeasons(Array.isArray(loadedSeasons) ? loadedSeasons : []);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        // Initialize empty arrays in case of errors
        setMatches([]);
        setSeasons([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isUsingSupabase, syncWithSupabase]);

  // Save matches to selected data source when they change
  useEffect(() => {
    if (isLoading) return;
    
    const saveMatches = async () => {
      try {
        if (Array.isArray(matches)) {
          if (isUsingSupabase) {
            // Zapisz mecze do Supabase - indywidualnie zostanie obsłużone przy dodawaniu/aktualizacji
            console.log("Używanie Supabase jako źródła danych - mecze zapisywane przy dodawaniu");
          } else {
            // Zapisz mecze do IndexedDB
            for (const match of matches) {
              await db.addMatch(match);
            }
            console.log("Mecze zapisane do IndexedDB:", matches.length);
          }
        }
      } catch (error) {
        console.error("Error saving matches:", error);
      }
    };

    saveMatches();
  }, [matches, isLoading, isUsingSupabase]);

  // Save seasons to selected data source when they change
  useEffect(() => {
    if (isLoading) return;
    
    const saveSeasons = async () => {
      try {
        if (Array.isArray(seasons)) {
          if (isUsingSupabase) {
            // Zapisz sezony do Supabase - indywidualnie zostanie obsłużone przy dodawaniu/aktualizacji
            console.log("Używanie Supabase jako źródła danych - sezony zapisywane przy dodawaniu");
          } else {
            // Zapisz sezony do IndexedDB
            for (const season of seasons) {
              await db.addSeason(season);
            }
            console.log("Sezony zapisane do IndexedDB:", seasons.length);
          }
        }
      } catch (error) {
        console.error("Error saving seasons:", error);
      }
    };

    saveSeasons();
  }, [seasons, isLoading, isUsingSupabase]);

  const getUserById = (id: string) => {
    return users.find(user => user.id === id);
  };

  const getUserMatches = (userId: string) => {
    return matches ? matches.filter(match => match.playerA === userId || match.playerB === userId) : [];
  };

  const getUserSeasons = (userId: string) => {
    if (!matches || !seasons) return [];
    const userMatches = getUserMatches(userId);
    const seasonIds = Array.from(new Set(userMatches.map(match => match.seasonId).filter(Boolean)));
    return seasons.filter(season => seasonIds.includes(season.id));
  };

  const getSeasonMatches = (seasonId: string) => {
    return matches ? matches.filter(match => match.seasonId === seasonId) : [];
  };

  const getActiveSeasons = () => {
    return seasons ? seasons.filter(season => season.active) : [];
  };

  const addMatch = async (match: Match) => {
    setMatches(prev => {
      if (!prev) return [match];
      
      const matchIndex = prev.findIndex(m => m.id === match.id);
      if (matchIndex >= 0) {
        // Replace existing match
        const updatedMatches = [...prev];
        updatedMatches[matchIndex] = match;
        return updatedMatches;
      } else {
        // Add as new match
        return [...prev, match];
      }
    });
    
    // Zapisz mecz do odpowiedniego źródła danych
    try {
      if (isUsingSupabase) {
        await supabaseUtils.saveMatchToSupabase(match);
        console.log("Mecz zapisany do Supabase:", match.id);
      } else {
        await db.addMatch(match);
        console.log("Mecz zapisany do IndexedDB:", match.id);
      }
    } catch (error) {
      console.error("Błąd podczas zapisywania meczu:", error);
      toast({
        title: "Błąd zapisu",
        description: "Nie udało się zapisać meczu. Spróbuj ponownie.",
        variant: "destructive"
      });
    }
  };

  const addSeason = async (season: Season) => {
    setSeasons(prev => prev ? [...prev, season] : [season]);
    
    // Zapisz sezon do odpowiedniego źródła danych
    try {
      if (isUsingSupabase) {
        await supabaseUtils.saveSeasonToSupabase(season);
        console.log("Sezon zapisany do Supabase:", season.id);
      } else {
        await db.addSeason(season);
        console.log("Sezon zapisany do IndexedDB:", season.id);
      }
    } catch (error) {
      console.error("Błąd podczas zapisywania sezonu:", error);
      toast({
        title: "Błąd zapisu",
        description: "Nie udało się zapisać sezonu. Spróbuj ponownie.",
        variant: "destructive"
      });
    }
  };

  const updateSeasonWithMatch = async (seasonId: string, matchId: string) => {
    setSeasons(prev => {
      if (!prev) return prev;
      
      return prev.map(season => {
        if (season.id === seasonId) {
          // Add match ID only if it doesn't already exist in the matches array
          if (!season.matches.includes(matchId)) {
            return { ...season, matches: [...season.matches, matchId] };
          }
        }
        return season;
      });
    });
    
    // Zaktualizuj relację sezon-mecz w odpowiednim źródle danych
    try {
      if (isUsingSupabase) {
        await supabaseUtils.saveSeasonMatchRelation(seasonId, matchId);
        console.log("Relacja sezon-mecz zapisana do Supabase:", { seasonId, matchId });
      } else {
        // W przypadku IndexedDB relacja jest przechowywana bezpośrednio w obiekcie sezonu
        const updatedSeason = seasons.find(s => s.id === seasonId);
        if (updatedSeason) {
          await db.addSeason(updatedSeason);
        }
      }
    } catch (error) {
      console.error("Błąd podczas aktualizacji relacji sezon-mecz:", error);
      toast({
        title: "Błąd zapisu",
        description: "Nie udało się zaktualizować relacji sezon-mecz. Spróbuj ponownie.",
        variant: "destructive"
      });
    }
  };

  // Clear all matches
  const clearMatches = async () => {
    try {
      if (isUsingSupabase) {
        // Tutaj można dodać logikę czyszczenia danych w Supabase, ale wymaga to ostrożności
        console.warn("Czyszczenie wszystkich meczy w Supabase nie jest zaimplementowane ze względów bezpieczeństwa");
        toast({
          title: "Operacja niemożliwa",
          description: "Czyszczenie danych w Supabase jest zablokowane ze względów bezpieczeństwa.",
          variant: "destructive"
        });
      } else {
        await db.clearMatches();
        setMatches([]);
        toast({
          title: "Dane wyczyszczone",
          description: "Wszystkie mecze zostały usunięte.",
        });
      }
    } catch (error) {
      console.error("Błąd podczas czyszczenia meczy:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się wyczyścić danych meczy.",
        variant: "destructive"
      });
    }
  };

  // Clear all seasons
  const clearSeasons = async () => {
    try {
      if (isUsingSupabase) {
        // Tutaj można dodać logikę czyszczenia danych w Supabase, ale wymaga to ostrożności
        console.warn("Czyszczenie wszystkich sezonów w Supabase nie jest zaimplementowane ze względów bezpieczeństwa");
        toast({
          title: "Operacja niemożliwa",
          description: "Czyszczenie danych w Supabase jest zablokowane ze względów bezpieczeństwa.",
          variant: "destructive"
        });
      } else {
        await db.clearSeasons();
        setSeasons([]);
        toast({
          title: "Dane wyczyszczone",
          description: "Wszystkie sezony zostały usunięte.",
        });
      }
    } catch (error) {
      console.error("Błąd podczas czyszczenia sezonów:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się wyczyścić danych sezonów.",
        variant: "destructive"
      });
    }
  };
  
  // Delete specific season by ID
  const deleteSeason = async (seasonId: string) => {
    try {
      if (isUsingSupabase) {
        // Tutaj należałoby dodać usuwanie sezonu z Supabase
        console.warn("Usuwanie sezonu w Supabase nie jest jeszcze zaimplementowane");
        toast({
          title: "Operacja niemożliwa",
          description: "Usuwanie sezonów w Supabase jest obecnie niedostępne.",
          variant: "destructive"
        });
      } else {
        await db.deleteSeason(seasonId);
        setSeasons(prev => prev ? prev.filter(season => season.id !== seasonId) : []);
        toast({
          title: "Sezon usunięty",
          description: "Sezon został pomyślnie usunięty.",
        });
      }
    } catch (error) {
      console.error("Błąd podczas usuwania sezonu:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć sezonu.",
        variant: "destructive"
      });
    }
  };
  
  // End season (mark as inactive)
  const endSeason = async (seasonId: string, winnerId?: string) => {
    setSeasons(prev => {
      if (!prev) return prev;
      
      return prev.map(season => {
        if (season.id === seasonId) {
          const updatedSeason = { 
            ...season, 
            active: false,
            endDate: new Date().toISOString(),
            winner: winnerId || season.winner
          };
          
          // Save updated season to database
          try {
            if (isUsingSupabase) {
              supabaseUtils.saveSeasonToSupabase(updatedSeason).catch(error => {
                console.error("Błąd podczas zakończenia sezonu w Supabase:", error);
                toast({
                  title: "Błąd",
                  description: "Nie udało się zakończyć sezonu. Spróbuj ponownie.",
                  variant: "destructive"
                });
              });
            } else {
              db.addSeason(updatedSeason);
            }
          } catch (error) {
            console.error("Błąd podczas zakończenia sezonu:", error);
          }
          
          return updatedSeason;
        }
        return season;
      });
    });
  };

  if (isLoading) {
    return <div>Loading data...</div>;
  }

  return (
    <DataContext.Provider
      value={{
        users,
        matches,
        seasons,
        getUserById,
        getUserMatches,
        getUserSeasons,
        getSeasonMatches,
        getActiveSeasons,
        addMatch,
        addSeason,
        updateSeasonWithMatch,
        clearMatches,
        clearSeasons,
        deleteSeason,
        endSeason,
        isUsingSupabase,
        toggleDataSource,
        syncWithSupabase
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
