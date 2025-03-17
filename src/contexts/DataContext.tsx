import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User, Match, Season } from "../types";
import { initialUsers } from "../data/initialData";
import * as db from "../utils/db";
import * as supabaseUtils from "../utils/supabase";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { deleteMatchFromSupabase } from "@/utils/supabase/matches";

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
  deleteMatch: (matchId: string) => Promise<void>;
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
  const [isUsingSupabase, setIsUsingSupabase] = useState(true);

  const syncWithSupabase = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const supabaseMatches = await supabaseUtils.fetchMatchesFromSupabase();
      const supabaseSeasons = await supabaseUtils.fetchSeasonsFromSupabase();
      const seasonMatches = await supabaseUtils.fetchSeasonMatches();
      
      const enhancedSeasons = supabaseSeasons.map(season => {
        const matches = seasonMatches
          .filter(rel => rel.seasonId === season.id)
          .map(rel => rel.matchId);
        
        return {
          ...season,
          matches
        };
      });
      
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

  useEffect(() => {
    if (!isUsingSupabase) return;
    
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

  const toggleDataSource = () => {
    setIsUsingSupabase(!isUsingSupabase);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        if (isUsingSupabase) {
          await syncWithSupabase();
        } else {
          await db.initDB();
          
          const loadedMatches = await db.getMatches();
          const loadedSeasons = await db.getSeasons();
          
          console.log("Loaded matches from IndexedDB:", loadedMatches);
          console.log("Loaded seasons from IndexedDB:", loadedSeasons);
          
          setMatches(Array.isArray(loadedMatches) ? loadedMatches : []);
          setSeasons(Array.isArray(loadedSeasons) ? loadedSeasons : []);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        setMatches([]);
        setSeasons([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isUsingSupabase, syncWithSupabase]);

  useEffect(() => {
    if (isLoading) return;
    
    const saveMatches = async () => {
      try {
        if (Array.isArray(matches)) {
          if (isUsingSupabase) {
            console.log("Używanie Supabase jako źródła danych - mecze zapisywane przy dodawaniu");
          } else {
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

  useEffect(() => {
    if (isLoading) return;
    
    const saveSeasons = async () => {
      try {
        if (Array.isArray(seasons)) {
          if (isUsingSupabase) {
            console.log("Używanie Supabase jako źródła danych - sezony zapisywane przy dodawaniu");
          } else {
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
        const updatedMatches = [...prev];
        updatedMatches[matchIndex] = match;
        return updatedMatches;
      } else {
        return [...prev, match];
      }
    });
    
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
          if (!season.matches.includes(matchId)) {
            return { ...season, matches: [...season.matches, matchId] };
          }
        }
        return season;
      });
    });
    
    try {
      if (isUsingSupabase) {
        await supabaseUtils.saveSeasonMatchRelation(seasonId, matchId);
        console.log("Relacja sezon-mecz zapisana do Supabase:", { seasonId, matchId });
      } else {
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

  const clearMatches = async () => {
    try {
      if (isUsingSupabase) {
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

  const clearSeasons = async () => {
    try {
      if (isUsingSupabase) {
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

  const deleteSeason = async (seasonId: string) => {
    try {
      if (isUsingSupabase) {
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
          
          try {
            if (isUsingSupabase) {
              supabaseUtils.saveSeasonToSupabase(updatedSeason).catch(error => {
                console.error("Błąd podczas zakończenia sezonu w Supabase:", error);
                toast({
                  title: "Błąd",
                  description: "Nie uda��o się zakończyć sezonu. Spróbuj ponownie.",
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

  const deleteMatch = async (matchId: string) => {
    try {
      if (isUsingSupabase) {
        await deleteMatchFromSupabase(matchId);
        setMatches(prev => prev ? prev.filter(match => match.id !== matchId) : []);
        toast({
          title: "Mecz usunięty",
          description: "Mecz został pomyślnie usunięty z historii.",
        });
      } else {
        setMatches(prev => prev ? prev.filter(match => match.id !== matchId) : []);
        setSeasons(prev => {
          if (!prev) return prev;
          return prev.map(season => ({
            ...season,
            matches: season.matches.filter(id => id !== matchId)
          }));
        });
        toast({
          title: "Mecz usunięty",
          description: "Mecz został pomyślnie usunięty z historii.",
        });
      }
    } catch (error) {
      console.error("Błąd podczas usuwania meczu:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć meczu. Spróbuj ponownie.",
        variant: "destructive"
      });
    }
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
        syncWithSupabase,
        deleteMatch
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
