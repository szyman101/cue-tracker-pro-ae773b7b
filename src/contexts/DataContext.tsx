
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Match, Season } from "../types";
import { initialUsers } from "../data/initialData";
import { getMatches, getSeasons, saveMatch, saveSeason, deleteMatch, deleteSeason, clearMatches, clearSeasons } from "../services/db";
import { toast } from "@/hooks/use-toast";

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
  isLoading: boolean;
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

  // Load data from IndexedDB on initial render
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const loadedMatches = await getMatches();
        const loadedSeasons = await getSeasons();
        
        setMatches(loadedMatches);
        setSeasons(loadedSeasons);
      } catch (error) {
        console.error("Error loading data from IndexedDB:", error);
        toast({
          title: "Błąd ładowania danych",
          description: "Wystąpił problem podczas ładowania danych. Niektóre dane mogą być niedostępne.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const getUserById = (id: string) => {
    return users.find(user => user.id === id);
  };

  const getUserMatches = (userId: string) => {
    return matches.filter(match => match.playerA === userId || match.playerB === userId);
  };

  const getUserSeasons = (userId: string) => {
    const userMatches = getUserMatches(userId);
    const seasonIds = Array.from(new Set(userMatches.map(match => match.seasonId).filter(Boolean)));
    return seasons.filter(season => seasonIds.includes(season.id));
  };

  const getSeasonMatches = (seasonId: string) => {
    return matches.filter(match => match.seasonId === seasonId);
  };

  const getActiveSeasons = () => {
    return seasons.filter(season => season.active);
  };

  const addMatch = async (match: Match) => {
    try {
      // If the match already exists, update it instead of adding a new one
      const matchIndex = matches.findIndex(m => m.id === match.id);
      let updatedMatches;
      
      if (matchIndex >= 0) {
        // Replace the existing match
        updatedMatches = [...matches];
        updatedMatches[matchIndex] = match;
      } else {
        // Add as a new match
        updatedMatches = [...matches, match];
      }
      
      // Update state
      setMatches(updatedMatches);
      
      // Save to IndexedDB
      await saveMatch(match);
    } catch (error) {
      console.error("Error adding match:", error);
      toast({
        title: "Błąd zapisywania meczu",
        description: "Nie udało się zapisać meczu. Spróbuj ponownie.",
        variant: "destructive"
      });
    }
  };

  const addSeason = async (season: Season) => {
    try {
      // Update state
      setSeasons(prev => [...prev, season]);
      
      // Save to IndexedDB
      await saveSeason(season);
    } catch (error) {
      console.error("Error adding season:", error);
      toast({
        title: "Błąd zapisywania sezonu",
        description: "Nie udało się zapisać sezonu. Spróbuj ponownie.",
        variant: "destructive"
      });
    }
  };

  const updateSeasonWithMatch = async (seasonId: string, matchId: string) => {
    try {
      const updatedSeasons = seasons.map(season => {
        if (season.id === seasonId) {
          // Only add the match ID if it doesn't already exist in the matches array
          if (!season.matches.includes(matchId)) {
            const updatedSeason = { ...season, matches: [...season.matches, matchId] };
            // Save to IndexedDB
            saveSeason(updatedSeason).catch(error => {
              console.error("Error saving season:", error);
            });
            return updatedSeason;
          }
        }
        return season;
      });
      
      setSeasons(updatedSeasons);
    } catch (error) {
      console.error("Error updating season with match:", error);
      toast({
        title: "Błąd aktualizacji sezonu",
        description: "Nie udało się dodać meczu do sezonu. Spróbuj ponownie.",
        variant: "destructive"
      });
    }
  };

  // Clear all matches
  const clearAllMatches = async () => {
    try {
      setMatches([]);
      await clearMatches();
    } catch (error) {
      console.error("Error clearing matches:", error);
      toast({
        title: "Błąd czyszczenia meczów",
        description: "Nie udało się wyczyścić historii meczów. Spróbuj ponownie.",
        variant: "destructive"
      });
    }
  };

  // Clear all seasons
  const clearAllSeasons = async () => {
    try {
      setSeasons([]);
      await clearSeasons();
    } catch (error) {
      console.error("Error clearing seasons:", error);
      toast({
        title: "Błąd czyszczenia sezonów",
        description: "Nie udało się wyczyścić sezonów. Spróbuj ponownie.",
        variant: "destructive"
      });
    }
  };
  
  // Delete a specific season by ID
  const deleteSpecificSeason = async (seasonId: string) => {
    try {
      setSeasons(prev => prev.filter(season => season.id !== seasonId));
      await deleteSeason(seasonId);
    } catch (error) {
      console.error("Error deleting season:", error);
      toast({
        title: "Błąd usuwania sezonu",
        description: "Nie udało się usunąć sezonu. Spróbuj ponownie.",
        variant: "destructive"
      });
    }
  };
  
  // End a season (mark as inactive)
  const endSpecificSeason = async (seasonId: string, winnerId?: string) => {
    try {
      const updatedSeasons = seasons.map(season => {
        if (season.id === seasonId) {
          const updatedSeason = { 
            ...season, 
            active: false,
            endDate: new Date().toISOString(),
            winner: winnerId || season.winner
          };
          
          // Save to IndexedDB
          saveSeason(updatedSeason).catch(error => {
            console.error("Error saving season:", error);
          });
          
          return updatedSeason;
        }
        return season;
      });
      
      setSeasons(updatedSeasons);
    } catch (error) {
      console.error("Error ending season:", error);
      toast({
        title: "Błąd kończenia sezonu",
        description: "Nie udało się zakończyć sezonu. Spróbuj ponownie.",
        variant: "destructive"
      });
    }
  };

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
        clearMatches: clearAllMatches,
        clearSeasons: clearAllSeasons,
        deleteSeason: deleteSpecificSeason,
        endSeason: endSpecificSeason,
        isLoading
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
