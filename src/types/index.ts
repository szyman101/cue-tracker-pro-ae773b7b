
export type UserRole = "admin" | "player";

export interface User {
  id: string;
  firstName: string;
  login: string;
  password: string;
  nick: string;
  role: UserRole;
}

export type GameType = "8-ball" | "9-ball" | "10-ball";

export interface GameResult {
  type: GameType;
  scoreA: number;
  scoreB: number;
  winner: string; // "A" or "B" or "tie"
  breakAndRun?: boolean;
}

export interface Match {
  id: string;
  date: string;
  playerA: string; // user id
  playerB: string; // user id
  playerAName?: string; // player A nickname
  playerBName?: string; // player B nickname
  games: GameResult[];
  winner: string; // user id or "tie"
  seasonId?: string;
  timeElapsed?: number; // in seconds
  notes?: string;
  gamesToWin?: number; // number of games needed to win the match
  gameTypes?: GameType[]; // Added field to store game types played in match
}

export interface Season {
  id: string;
  name: string;
  startDate: string;
  endDate?: string;
  gameTypes: GameType[];
  matchesToWin: number; // number of matches needed to win the season
  breakRule: "winner" | "alternate";
  prize?: string; // prize for winning the season
  active: boolean;
  matches: string[]; // match ids
  winner?: string; // user id
  gamesPerMatch?: number; // Changed from matchesPerGame to gamesPerMatch to match usage in data
  stake?: number; // Adding stake field which is used in initialData
  description?: string; // Adding description field
  pointsToWin?: number; // Field for points needed to win the season (keeping for backward compatibility)
}
