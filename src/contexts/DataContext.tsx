
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Match, Season, GameType } from "../types";
import { initialUsers } from "../data/initialData";

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

// Load data from localStorage or use empty arrays as defaults
const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  const storedData = localStorage.getItem(key);
  return storedData ? JSON.parse(storedData) : defaultValue;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users] = useState<User[]>(initialUsers);
  const [matches, setMatches] = useState<Match[]>(loadFromStorage('matches', []));
  const [seasons, setSeasons] = useState<Season[]>(loadFromStorage('seasons', []));

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('matches', JSON.stringify(matches));
  }, [matches]);

  useEffect(() => {
    localStorage.setItem('seasons', JSON.stringify(seasons));
  }, [seasons]);

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

  const addMatch = (match: Match) => {
    // If the match already exists, update it instead of adding a new one
    setMatches(prev => {
      const matchIndex = prev.findIndex(m => m.id === match.id);
      if (matchIndex >= 0) {
        // Replace the existing match
        const updatedMatches = [...prev];
        updatedMatches[matchIndex] = match;
        return updatedMatches;
      } else {
        // Add as a new match
        return [...prev, match];
      }
    });
  };

  const addSeason = (season: Season) => {
    setSeasons(prev => [...prev, season]);
  };

  const updateSeasonWithMatch = (seasonId: string, matchId: string) => {
    setSeasons(prev => 
      prev.map(season => {
        if (season.id === seasonId) {
          // Only add the match ID if it doesn't already exist in the matches array
          if (!season.matches.includes(matchId)) {
            return { ...season, matches: [...season.matches, matchId] };
          }
        }
        return season;
      })
    );
  };

  // Clear all matches from the state and localStorage
  const clearMatches = () => {
    setMatches([]);
    localStorage.removeItem('matches');
  };

  // Clear all seasons from the state and localStorage
  const clearSeasons = () => {
    setSeasons([]);
    localStorage.removeItem('seasons');
  };
  
  // Delete a specific season by ID
  const deleteSeason = (seasonId: string) => {
    setSeasons(prev => prev.filter(season => season.id !== seasonId));
  };
  
  // End a season (mark as inactive)
  const endSeason = (seasonId: string, winnerId?: string) => {
    setSeasons(prev => 
      prev.map(season => {
        if (season.id === seasonId) {
          return { 
            ...season, 
            active: false,
            endDate: new Date().toISOString(),
            winner: winnerId || season.winner
          };
        }
        return season;
      })
    );
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
