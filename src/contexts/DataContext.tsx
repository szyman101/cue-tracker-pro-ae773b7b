
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Match, Season } from "../types";
import { initialUsers } from "../data/initialData";
import * as db from "../utils/db";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "./AuthContext";

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
  const { currentUser, isAuthenticated } = useAuth();

  // Funkcja do ładowania danych z IndexedDB
  const loadFromIndexedDB = async () => {
    try {
      // Initialize database
      await db.initDB();
      
      // Fetch data
      const loadedMatches = await db.getMatches();
      const loadedSeasons = await db.getSeasons();
      
      console.log("Loaded matches from IndexedDB:", loadedMatches);
      console.log("Loaded seasons from IndexedDB:", loadedSeasons);
      
      setMatches(Array.isArray(loadedMatches) ? loadedMatches : []);
      setSeasons(Array.isArray(loadedSeasons) ? loadedSeasons : []);
    } catch (error) {
      console.error("Error loading data from IndexedDB:", error);
      // Initialize empty arrays in case of errors
      setMatches([]);
      setSeasons([]);
    }
  };

  // Funkcja do ładowania danych z Supabase
  const loadFromSupabase = async () => {
    try {
      // Pobierz mecze
      const { data: matchesData, error: matchesError } = await supabase
        .from("matches")
        .select("*")
        .order("date", { ascending: false });

      if (matchesError) {
        throw matchesError;
      }

      // Pobierz sezony
      const { data: seasonsData, error: seasonsError } = await supabase
        .from("seasons")
        .select("*");

      if (seasonsError) {
        throw seasonsError;
      }

      console.log("Loaded matches from Supabase:", matchesData);
      console.log("Loaded seasons from Supabase:", seasonsData);

      // Mapuj dane z Supabase na formaty aplikacji
      const mappedMatches: Match[] = matchesData.map(match => ({
        id: match.id,
        date: match.date,
        playerA: match.player_a,
        playerB: match.player_b,
        playerAName: match.player_a_name,
        playerBName: match.player_b_name,
        games: match.games,
        winner: match.winner,
        seasonId: match.season_id,
        timeElapsed: match.time_elapsed,
        notes: match.notes,
        gamesToWin: match.games_to_win
      }));

      const mappedSeasons: Season[] = seasonsData.map(season => ({
        id: season.id,
        name: season.name,
        startDate: season.start_date,
        endDate: season.end_date,
        gameTypes: season.game_types,
        matchesToWin: season.matches_to_win,
        breakRule: season.break_rule,
        prize: season.prize,
        active: season.active,
        matches: [], // Pobierzemy to oddzielnie
        winner: season.winner,
        gamesPerMatch: season.games_per_match,
        stake: season.stake
      }));

      // Pobierz powiązania sezon-mecz
      const { data: seasonMatchesData, error: seasonMatchesError } = await supabase
        .from("season_matches")
        .select("*");

      if (seasonMatchesError) {
        throw seasonMatchesError;
      }

      // Uzupełnij pola matches w sezonach
      const seasonsWithMatches = mappedSeasons.map(season => {
        const matchIds = seasonMatchesData
          .filter(sm => sm.season_id === season.id)
          .map(sm => sm.match_id);
        return { ...season, matches: matchIds };
      });

      setMatches(mappedMatches);
      setSeasons(seasonsWithMatches);
    } catch (error) {
      console.error("Error loading data from Supabase:", error);
      // Próba załadowania z IndexedDB jako fallback
      await loadFromIndexedDB();
    }
  };

  // Load data on initialization
  useEffect(() => {
    const loadData = async () => {
      try {
        if (isAuthenticated && currentUser) {
          // Jeśli użytkownik jest zalogowany, ładuj dane z Supabase
          await loadFromSupabase();
        } else {
          // W przeciwnym razie ładuj z IndexedDB
          await loadFromIndexedDB();
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
  }, [isAuthenticated, currentUser]);

  // Save matches to IndexedDB when they change
  useEffect(() => {
    if (isLoading) return;
    
    const saveMatches = async () => {
      try {
        // Zapisz tylko do IndexedDB jeśli używamy lokalnego przechowywania
        if (!isAuthenticated) {
          if (Array.isArray(matches)) {
            for (const match of matches) {
              await db.addMatch(match);
            }
          }
        }
      } catch (error) {
        console.error("Error saving matches to IndexedDB:", error);
      }
    };

    saveMatches();
  }, [matches, isLoading, isAuthenticated]);

  // Save seasons to IndexedDB when they change
  useEffect(() => {
    if (isLoading) return;
    
    const saveSeasons = async () => {
      try {
        // Zapisz tylko do IndexedDB jeśli używamy lokalnego przechowywania
        if (!isAuthenticated) {
          if (Array.isArray(seasons)) {
            for (const season of seasons) {
              await db.addSeason(season);
            }
          }
        }
      } catch (error) {
        console.error("Error saving seasons to IndexedDB:", error);
      }
    };

    saveSeasons();
  }, [seasons, isLoading, isAuthenticated]);

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
    // Dodaj mecz lokalnie
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

    // Jeśli użytkownik jest zalogowany, zapisz również do Supabase
    if (isAuthenticated) {
      try {
        const { error } = await supabase
          .from("matches")
          .upsert({
            id: match.id,
            date: match.date,
            player_a: match.playerA,
            player_b: match.playerB,
            player_a_name: match.playerAName,
            player_b_name: match.playerBName,
            games: match.games,
            winner: match.winner,
            season_id: match.seasonId,
            time_elapsed: match.timeElapsed,
            notes: match.notes,
            games_to_win: match.gamesToWin
          });

        if (error) {
          console.error("Error saving match to Supabase:", error);
          toast({
            title: "Błąd zapisywania",
            description: "Nie udało się zapisać meczu w bazie danych",
            variant: "destructive",
          });
        }

        // Jeśli mecz jest przypisany do sezonu, dodaj powiązanie
        if (match.seasonId) {
          const { error: connectionError } = await supabase
            .from("season_matches")
            .upsert({
              season_id: match.seasonId,
              match_id: match.id
            });

          if (connectionError) {
            console.error("Error saving season-match connection:", connectionError);
          }
        }
      } catch (error) {
        console.error("Error in Supabase match save:", error);
      }
    }
  };

  const addSeason = async (season: Season) => {
    // Dodaj sezon lokalnie
    setSeasons(prev => prev ? [...prev, season] : [season]);

    // Jeśli użytkownik jest zalogowany, zapisz również do Supabase
    if (isAuthenticated) {
      try {
        const { error } = await supabase
          .from("seasons")
          .insert({
            id: season.id,
            name: season.name,
            start_date: season.startDate,
            end_date: season.endDate,
            game_types: season.gameTypes,
            matches_to_win: season.matchesToWin,
            break_rule: season.breakRule,
            prize: season.prize,
            active: season.active,
            winner: season.winner,
            games_per_match: season.gamesPerMatch,
            stake: season.stake
          });

        if (error) {
          console.error("Error saving season to Supabase:", error);
          toast({
            title: "Błąd zapisywania",
            description: "Nie udało się zapisać sezonu w bazie danych",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error in Supabase season save:", error);
      }
    }
  };

  const updateSeasonWithMatch = async (seasonId: string, matchId: string) => {
    // Aktualizuj sezon lokalnie
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

    // Jeśli użytkownik jest zalogowany, zaktualizuj również w Supabase
    if (isAuthenticated) {
      try {
        // Sprawdź, czy powiązanie już istnieje
        const { data, error: checkError } = await supabase
          .from("season_matches")
          .select("*")
          .eq("season_id", seasonId)
          .eq("match_id", matchId);

        if (checkError) {
          console.error("Error checking season-match connection:", checkError);
          return;
        }

        // Jeśli powiązanie nie istnieje, dodaj je
        if (!data || data.length === 0) {
          const { error } = await supabase
            .from("season_matches")
            .insert({
              season_id: seasonId,
              match_id: matchId
            });

          if (error) {
            console.error("Error updating season with match in Supabase:", error);
            toast({
              title: "Błąd aktualizacji",
              description: "Nie udało się zaktualizować sezonu w bazie danych",
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error("Error in Supabase season-match update:", error);
      }
    }
  };

  // Clear all matches
  const clearMatches = async () => {
    // Wyczyść mecze lokalnie
    await db.clearMatches();
    setMatches([]);

    // Jeśli użytkownik jest zalogowany, wyczyść również w Supabase
    if (isAuthenticated) {
      try {
        // W przypadku Supabase nie usuwamy wszystkich meczów, tylko te należące do użytkownika
        const userMatches = matches.filter(m => 
          m.playerA === currentUser?.id || m.playerB === currentUser?.id
        );

        for (const match of userMatches) {
          const { error } = await supabase
            .from("matches")
            .delete()
            .eq("id", match.id);

          if (error) {
            console.error(`Error deleting match ${match.id} from Supabase:`, error);
          }
        }
      } catch (error) {
        console.error("Error clearing matches in Supabase:", error);
        toast({
          title: "Błąd usuwania",
          description: "Nie udało się usunąć meczów w bazie danych",
          variant: "destructive",
        });
      }
    }
  };

  // Clear all seasons
  const clearSeasons = async () => {
    // Wyczyść sezony lokalnie
    await db.clearSeasons();
    setSeasons([]);

    // Jeśli użytkownik jest zalogowany i ma rolę admina, wyczyść również w Supabase
    if (isAuthenticated && currentUser?.role === "admin") {
      try {
        // W przypadku Supabase usuwamy tylko sezony, które użytkownik może usunąć (jako admin)
        for (const season of seasons) {
          const { error } = await supabase
            .from("seasons")
            .delete()
            .eq("id", season.id);

          if (error) {
            console.error(`Error deleting season ${season.id} from Supabase:`, error);
          }
        }
      } catch (error) {
        console.error("Error clearing seasons in Supabase:", error);
        toast({
          title: "Błąd usuwania",
          description: "Nie udało się usunąć sezonów w bazie danych",
          variant: "destructive",
        });
      }
    }
  };
  
  // Delete specific season by ID
  const deleteSeason = async (seasonId: string) => {
    // Usuń sezon lokalnie
    await db.deleteSeason(seasonId);
    setSeasons(prev => prev ? prev.filter(season => season.id !== seasonId) : []);

    // Jeśli użytkownik jest zalogowany i ma rolę admina, usuń również w Supabase
    if (isAuthenticated && currentUser?.role === "admin") {
      try {
        const { error } = await supabase
          .from("seasons")
          .delete()
          .eq("id", seasonId);

        if (error) {
          console.error(`Error deleting season ${seasonId} from Supabase:`, error);
          toast({
            title: "Błąd usuwania",
            description: "Nie udało się usunąć sezonu w bazie danych",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error deleting season in Supabase:", error);
      }
    }
  };
  
  // End season (mark as inactive)
  const endSeason = async (seasonId: string, winnerId?: string) => {
    // Zakończ sezon lokalnie
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
          db.addSeason(updatedSeason);
          
          return updatedSeason;
        }
        return season;
      });
    });

    // Jeśli użytkownik jest zalogowany i ma rolę admina, zakończ również w Supabase
    if (isAuthenticated && currentUser?.role === "admin") {
      try {
        const { error } = await supabase
          .from("seasons")
          .update({
            active: false,
            end_date: new Date().toISOString(),
            winner: winnerId
          })
          .eq("id", seasonId);

        if (error) {
          console.error(`Error ending season ${seasonId} in Supabase:`, error);
          toast({
            title: "Błąd aktualizacji",
            description: "Nie udało się zakończyć sezonu w bazie danych",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error ending season in Supabase:", error);
      }
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
        endSeason
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
