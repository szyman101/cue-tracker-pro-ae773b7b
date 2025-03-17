
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
  games: GameResult[];
  winner: string; // user id or "tie"
  seasonId?: string;
  timeElapsed?: number; // in seconds
  notes?: string;
  gamesToWin?: number; // number of games needed to win the match
}

export interface Season {
  id: string;
  name: string;
  startDate: string;
  endDate?: string;
  gameTypes: GameType[];
  gamesPerMatch: number;
  breakRule: "winner" | "alternate";
  stake?: number;
  active: boolean;
  matches: string[]; // match ids
  winner?: string; // user id
}
