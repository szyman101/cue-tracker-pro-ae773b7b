
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Match, Season, GameType } from "../types";
import { initialUsers } from "../data/initialData";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface DataContextType {
  matches: Match[];
  seasons: Season[];
  users: User[]; // Add users property
  getUserById: (id: string) => User | undefined;
  getUserMatches: (userId: string) => Match[];
  getUserSeasons: (userId: string) => Season[];
  getSeasonMatches: (seasonId: string) => Match[];
  getActiveSeasons: () => Season[];
  getUserWinsInSeason: (userId: string, seasonId: string) => number;
  getUserPointsInSeason: (userId: string, seasonId: string) => number; // Added function for season points
  getBreakRunsInSeason: (userId: string, seasonId: string) => number; // Added function for break runs
  addMatch: (match: Match) => void;
  addSeason: (season: Season) => void;
  updateSeasonWithMatch: (seasonId: string, matchId: string) => void;
  clearMatches: () => void;
  clearSeasons: () => void;
  deleteSeason: (seasonId: string) => void;
  deleteMatch: (matchId: string) => void;
  endSeason: (seasonId: string, winnerId?: string) => void;
  checkSeasonCompletionStatus: (seasonId: string) => void; // Added function to check if season should be completed
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
  const { allUsers } = useAuth();
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
    return allUsers.find(user => user.id === id);
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

  const getUserWinsInSeason = (userId: string, seasonId: string) => {
    const seasonMatches = getSeasonMatches(seasonId);
    return seasonMatches.filter(match => match.winner === userId).length;
  };
  
  // New function to get user points in a season
  const getUserPointsInSeason = (userId: string, seasonId: string) => {
    const seasonMatches = getSeasonMatches(seasonId);
    let totalPoints = 0;
    
    for (const match of seasonMatches) {
      if (match.playerA === userId || match.playerB === userId) {
        // Add points based on games won in each match
        const isPlayerA = match.playerA === userId;
        
        for (const game of match.games) {
          if ((isPlayerA && game.winner === 'A') || (!isPlayerA && game.winner === 'B')) {
            totalPoints += 1;
          }
        }
      }
    }
    
    return totalPoints;
  };
  
  // New function to get break runs in a season
  const getBreakRunsInSeason = (userId: string, seasonId: string) => {
    const seasonMatches = getSeasonMatches(seasonId);
    let totalBreakRuns = 0;
    
    for (const match of seasonMatches) {
      if (match.playerA === userId || match.playerB === userId) {
        const isPlayerA = match.playerA === userId;
        
        for (const game of match.games) {
          if (game.breakAndRun && 
              ((isPlayerA && game.winner === 'A') || (!isPlayerA && game.winner === 'B'))) {
            totalBreakRuns += 1;
          }
        }
      }
    }
    
    return totalBreakRuns;
  };

  const addMatch = (match: Match) => {
    // If match doesn't have winner set but has games, determine winner based on game wins
    let updatedMatch = { ...match };
    
    if (match.games.length > 0) {
      const winsA = match.games.filter(game => game.winner === 'A').length;
      const winsB = match.games.filter(game => game.winner === 'B').length;
      
      if (winsA > winsB) {
        updatedMatch.winner = match.playerA;
      } else if (winsB > winsA) {
        updatedMatch.winner = match.playerB;
      } else if (winsA === winsB && winsA > 0) {
        // Draw if there are games but equal wins
        updatedMatch.winner = "";
      }
    }
    
    // Make sure gameTypes is set
    if (!updatedMatch.gameTypes && updatedMatch.games.length > 0) {
      updatedMatch.gameTypes = Array.from(
        new Set(updatedMatch.games.map(game => game.type || '8-ball'))
      );
    }
    
    // If the match already exists, update it instead of adding a new one
    setMatches(prev => {
      const matchIndex = prev.findIndex(m => m.id === updatedMatch.id);
      if (matchIndex >= 0) {
        // Replace the existing match
        const updatedMatches = [...prev];
        updatedMatches[matchIndex] = updatedMatch;
        return updatedMatches;
      } else {
        // Add as a new match
        return [...prev, updatedMatch];
      }
    });
    
    // If this match is part of a season, update the season and check if it's complete
    if (updatedMatch.seasonId) {
      updateSeasonWithMatch(updatedMatch.seasonId, updatedMatch.id);
      checkSeasonCompletionStatus(updatedMatch.seasonId);
    }
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
    // Also update seasons to remove match references
    setSeasons(prev => 
      prev.map(season => ({
        ...season,
        matches: []
      }))
    );
  };

  // Clear all seasons from the state and localStorage
  const clearSeasons = () => {
    setSeasons([]);
    // Also update matches to remove season references
    setMatches(prev => 
      prev.map(match => ({
        ...match,
        seasonId: ""
      }))
    );
  };
  
  // Delete a specific season by ID
  const deleteSeason = (seasonId: string) => {
    setSeasons(prev => prev.filter(season => season.id !== seasonId));
    
    // Also update matches to remove the season reference
    setMatches(prev => 
      prev.map(match => 
        match.seasonId === seasonId 
          ? { ...match, seasonId: "" } 
          : match
      )
    );
  };
  
  // Delete a specific match by ID
  const deleteMatch = (matchId: string) => {
    // Remove the match
    setMatches(prev => prev.filter(match => match.id !== matchId));
    
    // Also update seasons to remove the match reference
    setSeasons(prev => 
      prev.map(season => ({
        ...season,
        matches: season.matches.filter(id => id !== matchId)
      }))
    );
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
    
    // Notify user that season has ended
    const season = seasons.find(s => s.id === seasonId);
    const winner = winnerId ? getUserById(winnerId)?.nick : 'Nie określono';
    
    toast({
      title: "Sezon zakończony",
      description: `Sezon "${season?.name}" został zakończony. Zwycięzca: ${winner}`,
    });
  };
  
  // Check if a season should be completed based on points
  const checkSeasonCompletionStatus = (seasonId: string) => {
    const season = seasons.find(s => s.id === seasonId);
    
    if (!season || !season.active || !season.pointsToWin) return;
    
    const seasonMatches = getSeasonMatches(seasonId);
    const playerPoints: Record<string, number> = {};
    
    // Gather all players in this season
    const players = new Set<string>();
    seasonMatches.forEach(match => {
      players.add(match.playerA);
      players.add(match.playerB);
    });
    
    // Calculate points for each player
    players.forEach(playerId => {
      playerPoints[playerId] = getUserPointsInSeason(playerId, seasonId);
      
      // Check if any player has reached the required points
      if (playerPoints[playerId] >= (season.pointsToWin || 0)) {
        // End the season with this player as winner
        endSeason(seasonId, playerId);
      }
    });
  };

  return (
    <DataContext.Provider
      value={{
        matches,
        seasons,
        users: allUsers, // Expose the users from AuthContext
        getUserById,
        getUserMatches,
        getUserSeasons,
        getSeasonMatches,
        getActiveSeasons,
        getUserWinsInSeason,
        getUserPointsInSeason,
        getBreakRunsInSeason,
        addMatch,
        addSeason,
        updateSeasonWithMatch,
        clearMatches,
        clearSeasons,
        deleteSeason,
        deleteMatch,
        endSeason,
        checkSeasonCompletionStatus
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
