
import { Match } from "@/types";

/**
 * Oblicza procent wygranych dla użytkownika na podstawie jego meczów
 */
export const calculateWinRate = (matches: Match[], userId?: string): number => {
  if (!matches.length || !userId) return 0;
  
  const wins = matches.filter(match => match.winner === userId).length;
  return Math.round((wins / matches.length) * 100);
};

/**
 * Oblicza średni wynik dla użytkownika na podstawie jego meczów
 */
export const calculateAverageScore = (matches: Match[], userId?: string): number => {
  if (!matches.length || !userId) return 0;
  
  let totalScore = 0;
  let gamesCount = 0;
  
  matches.forEach(match => {
    const isPlayerA = match.playerA === userId;
    
    match.games.forEach(game => {
      totalScore += isPlayerA ? game.scoreA : game.scoreB;
      gamesCount++;
    });
  });
  
  return gamesCount > 0 ? Math.round((totalScore / gamesCount) * 10) / 10 : 0;
};

/**
 * Oblicza liczbę breaków dla użytkownika na podstawie jego meczów
 */
export const calculateBreaks = (matches: Match[], userId?: string): number => {
  if (!matches.length || !userId) return 0;
  
  let breaks = 0;
  
  matches.forEach(match => {
    match.games.forEach(game => {
      if (game.breakAndRun && 
          ((match.playerA === userId && game.winner === "A") || 
           (match.playerB === userId && game.winner === "B"))) {
        breaks++;
      }
    });
  });
  
  return breaks;
};

/**
 * Oblicza liczbę wygranych meczów
 */
export const calculateMatchesWon = (matches: Match[], userId?: string): number => {
  if (!matches.length || !userId) return 0;
  return matches.filter(match => match.winner === userId).length;
};
