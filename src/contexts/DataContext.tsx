
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Match, Season, User } from '@/types';
import * as db from '@/utils/db';
import { toast } from '@/hooks/use-toast';

type DataContextType = {
  matches: Match[];
  seasons: Season[];
  users: User[];
  addMatch: (match: Match) => Promise<void>;
  deleteMatch: (matchId: string) => Promise<void>;
  clearMatches: () => Promise<void>;
  addSeason: (season: Season) => Promise<void>;
  deleteSeason: (seasonId: string) => Promise<void>;
  endSeason: (seasonId: string) => Promise<void>;
  clearSeasons: () => Promise<void>;
  updateSeasonWithMatch: (seasonId: string, matchId: string) => Promise<void>;
  getUserMatches: (userId: string) => Match[];
  getUserById: (userId?: string) => User | undefined;
  getActiveSeasons: () => Season[];
};

const DataContext = createContext<DataContextType | undefined>(undefined);

// Sample users for the demo
const initialUsers: User[] = [
  { id: '1', nick: 'Gracz 1', role: 'admin' },
  { id: '2', nick: 'Gracz 2', role: 'player' },
  { id: '3', nick: 'Gracz 3', role: 'player' },
];

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [users] = useState<User[]>(initialUsers);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize database and load data
  useEffect(() => {
    const initializeData = async () => {
      try {
        await db.initDB();
        await loadAllData();
        setIsInitialized(true);
      } catch (error) {
        console.error("Error initializing database:", error);
        toast({
          title: "Błąd inicjalizacji",
          description: "Nie udało się załadować danych. Spróbuj odświeżyć stronę.",
          variant: "destructive"
        });
      }
    };

    initializeData();
  }, []);

  // Load all matches and seasons from IndexedDB
  const loadAllData = async () => {
    try {
      const loadedMatches = await db.getMatches();
      const loadedSeasons = await db.getSeasons();
      setMatches(loadedMatches);
      setSeasons(loadedSeasons);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Błąd ładowania danych",
        description: "Wystąpił problem podczas ładowania danych.",
        variant: "destructive"
      });
    }
  };

  // Add or update a match
  const addMatch = async (match: Match): Promise<void> => {
    try {
      await db.addMatch(match);
      setMatches(prev => {
        const filteredMatches = prev.filter(m => m.id !== match.id);
        return [...filteredMatches, match];
      });
      toast({
        title: "Mecz zapisany",
        description: "Mecz został pomyślnie zapisany.",
      });
    } catch (error) {
      console.error("Error saving match:", error);
      toast({
        title: "Błąd zapisu",
        description: "Nie udało się zapisać meczu.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Delete a match
  const deleteMatch = async (matchId: string): Promise<void> => {
    try {
      // Remove match from seasons if it's part of any
      const updatedSeasons = seasons.map(season => {
        if (season.matches.includes(matchId)) {
          return {
            ...season,
            matches: season.matches.filter(id => id !== matchId)
          };
        }
        return season;
      });

      // Update seasons in DB and state
      for (const season of updatedSeasons) {
        if (seasons.find(s => s.id === season.id)?.matches.includes(matchId)) {
          await db.addSeason(season);
        }
      }
      setSeasons(updatedSeasons);

      // Delete the match
      await db.deleteSeason(matchId);
      setMatches(prev => prev.filter(match => match.id !== matchId));
      
      toast({
        title: "Mecz usunięty",
        description: "Mecz został pomyślnie usunięty.",
      });
    } catch (error) {
      console.error("Error deleting match:", error);
      toast({
        title: "Błąd usuwania",
        description: "Nie udało się usunąć meczu.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Clear all matches
  const clearMatches = async (): Promise<void> => {
    try {
      await db.clearMatches();
      
      // Update seasons to remove match references
      const updatedSeasons = seasons.map(season => ({
        ...season,
        matches: []
      }));
      
      // Update seasons in DB and state
      for (const season of updatedSeasons) {
        await db.addSeason(season);
      }
      
      setSeasons(updatedSeasons);
      setMatches([]);
      
      toast({
        title: "Mecze wyczyszczone",
        description: "Wszystkie mecze zostały usunięte.",
      });
    } catch (error) {
      console.error("Error clearing matches:", error);
      toast({
        title: "Błąd czyszczenia",
        description: "Nie udało się wyczyścić meczy.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Add or update a season
  const addSeason = async (season: Season): Promise<void> => {
    try {
      await db.addSeason(season);
      setSeasons(prev => {
        const filteredSeasons = prev.filter(s => s.id !== season.id);
        return [...filteredSeasons, season];
      });
      toast({
        title: "Sezon zapisany",
        description: "Sezon został pomyślnie zapisany.",
      });
    } catch (error) {
      console.error("Error saving season:", error);
      toast({
        title: "Błąd zapisu",
        description: "Nie udało się zapisać sezonu.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Delete a season
  const deleteSeason = async (seasonId: string): Promise<void> => {
    try {
      await db.deleteSeason(seasonId);
      setSeasons(prev => prev.filter(season => season.id !== seasonId));
      
      // Update matches to remove season reference
      const updatedMatches = matches.map(match => {
        if (match.seasonId === seasonId) {
          return {
            ...match,
            seasonId: undefined
          };
        }
        return match;
      });
      
      // Update matches in DB and state
      for (const match of updatedMatches) {
        if (matches.find(m => m.id === match.id)?.seasonId === seasonId) {
          await db.addMatch(match);
        }
      }
      setMatches(updatedMatches);
      
      toast({
        title: "Sezon usunięty",
        description: "Sezon został pomyślnie usunięty.",
      });
    } catch (error) {
      console.error("Error deleting season:", error);
      toast({
        title: "Błąd usuwania",
        description: "Nie udało się usunąć sezonu.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // End a season (mark as inactive)
  const endSeason = async (seasonId: string): Promise<void> => {
    try {
      const season = seasons.find(s => s.id === seasonId);
      if (!season) {
        throw new Error("Sezon nie istnieje");
      }
      
      const updatedSeason = {
        ...season,
        active: false,
        endDate: new Date().toISOString()
      };
      
      await db.addSeason(updatedSeason);
      setSeasons(prev => prev.map(s => 
        s.id === seasonId ? updatedSeason : s
      ));
      
      toast({
        title: "Sezon zakończony",
        description: "Sezon został pomyślnie zakończony.",
      });
    } catch (error) {
      console.error("Error ending season:", error);
      toast({
        title: "Błąd kończenia sezonu",
        description: "Nie udało się zakończyć sezonu.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Clear all seasons
  const clearSeasons = async (): Promise<void> => {
    try {
      await db.clearSeasons();
      
      // Update matches to remove season references
      const updatedMatches = matches.map(match => ({
        ...match,
        seasonId: undefined
      }));
      
      // Update matches in DB and state
      for (const match of updatedMatches) {
        if (matches.find(m => m.id === match.id)?.seasonId) {
          await db.addMatch(match);
        }
      }
      
      setMatches(updatedMatches);
      setSeasons([]);
      
      toast({
        title: "Sezony wyczyszczone",
        description: "Wszystkie sezony zostały usunięte.",
      });
    } catch (error) {
      console.error("Error clearing seasons:", error);
      toast({
        title: "Błąd czyszczenia",
        description: "Nie udało się wyczyścić sezonów.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Add a match to a season
  const updateSeasonWithMatch = async (seasonId: string, matchId: string): Promise<void> => {
    try {
      const season = seasons.find(s => s.id === seasonId);
      if (!season) {
        throw new Error("Sezon nie istnieje");
      }
      
      if (season.matches.includes(matchId)) {
        return; // Match already in season
      }
      
      const updatedSeason = {
        ...season,
        matches: [...season.matches, matchId]
      };
      
      await db.addSeason(updatedSeason);
      setSeasons(prev => prev.map(s => 
        s.id === seasonId ? updatedSeason : s
      ));
    } catch (error) {
      console.error("Error updating season with match:", error);
      toast({
        title: "Błąd aktualizacji",
        description: "Nie udało się zaktualizować sezonu o mecz.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Get all matches for a user
  const getUserMatches = (userId: string): Match[] => {
    return matches.filter(match => 
      match.playerA === userId || match.playerB === userId
    ).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };

  // Get user by ID
  const getUserById = (userId?: string): User | undefined => {
    if (!userId) return undefined;
    return users.find(user => user.id === userId);
  };

  // Get active seasons
  const getActiveSeasons = (): Season[] => {
    return seasons.filter(season => season.active);
  };

  return (
    <DataContext.Provider
      value={{
        matches,
        seasons,
        users,
        addMatch,
        deleteMatch,
        clearMatches,
        addSeason,
        deleteSeason,
        endSeason,
        clearSeasons,
        updateSeasonWithMatch,
        getUserMatches,
        getUserById,
        getActiveSeasons,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
