
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Match, Season } from "../types";
import { initialUsers } from "../data/initialData";
import * as db from "../utils/db";

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

  // Load data from IndexedDB on initialization
  useEffect(() => {
    const loadData = async () => {
      try {
        // Initialize database
        await db.initDB();
        
        // Fetch data
        const loadedMatches = await db.getMatches();
        const loadedSeasons = await db.getSeasons();
        
        console.log("Loaded matches:", loadedMatches);
        console.log("Loaded seasons:", loadedSeasons);
        
        setMatches(Array.isArray(loadedMatches) ? loadedMatches : []);
        setSeasons(Array.isArray(loadedSeasons) ? loadedSeasons : []);
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
  }, []);

  // Save matches to IndexedDB when they change
  useEffect(() => {
    if (isLoading) return;
    
    const saveMatches = async () => {
      try {
        if (Array.isArray(matches)) {
          for (const match of matches) {
            await db.addMatch(match);
          }
        }
      } catch (error) {
        console.error("Error saving matches:", error);
      }
    };

    saveMatches();
  }, [matches, isLoading]);

  // Save seasons to IndexedDB when they change
  useEffect(() => {
    if (isLoading) return;
    
    const saveSeasons = async () => {
      try {
        if (Array.isArray(seasons)) {
          for (const season of seasons) {
            await db.addSeason(season);
          }
        }
      } catch (error) {
        console.error("Error saving seasons:", error);
      }
    };

    saveSeasons();
  }, [seasons, isLoading]);

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

  const addMatch = (match: Match) => {
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
  };

  const addSeason = (season: Season) => {
    setSeasons(prev => prev ? [...prev, season] : [season]);
  };

  const updateSeasonWithMatch = (seasonId: string, matchId: string) => {
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
  };

  // Clear all matches
  const clearMatches = async () => {
    await db.clearMatches();
    setMatches([]);
  };

  // Clear all seasons
  const clearSeasons = async () => {
    await db.clearSeasons();
    setSeasons([]);
  };
  
  // Delete specific season by ID
  const deleteSeason = async (seasonId: string) => {
    await db.deleteSeason(seasonId);
    setSeasons(prev => prev ? prev.filter(season => season.id !== seasonId) : []);
  };
  
  // End season (mark as inactive)
  const endSeason = (seasonId: string, winnerId?: string) => {
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
