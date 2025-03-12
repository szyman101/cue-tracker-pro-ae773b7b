
import { User, Match, Season, GameType } from "../types";

export const initialUsers: User[] = [
  {
    id: "admin1",
    firstName: "Administrator",
    login: "admin",
    password: "1234",
    nick: "Admin",
    role: "admin"
  },
  {
    id: "user1",
    firstName: "Kamil",
    login: "Kimoz",
    password: "kimoz",
    nick: "Kimoz",
    role: "player"
  },
  {
    id: "user2",
    firstName: "Tomek",
    login: "Tomek",
    password: "tomek",
    nick: "Szyman",
    role: "player"
  }
];

export const initialSeasons: Season[] = [
  {
    id: "season1",
    name: "Sezon 19 \"It's not all about wbicie\"",
    startDate: "2019-01-01",
    endDate: "2019-12-31",
    gameTypes: ["8-ball"],
    gamesPerMatch: 5,
    breakRule: "winner",
    active: false,
    matches: ["match1"],
    winner: "user2" // Szyman
  },
  {
    id: "preseason2",
    name: "PreSezon",
    startDate: "2019-12-01",
    endDate: "2019-12-31",
    gameTypes: ["8-ball"],
    gamesPerMatch: 3,
    breakRule: "winner",
    active: false,
    matches: ["match2"]
  },
  {
    id: "season2",
    name: "Sezon 20",
    startDate: "2020-01-13",
    endDate: "2020-05-31",
    gameTypes: ["8-ball"],
    gamesPerMatch: 5,
    breakRule: "winner",
    active: false,
    matches: ["match3", "match4"],
    winner: "user1" // Kimoz
  },
  {
    id: "season3",
    name: "Sezon 3 2021",
    startDate: "2021-01-01",
    endDate: "2021-06-30",
    gameTypes: ["8-ball"],
    gamesPerMatch: 5,
    breakRule: "winner",
    active: false,
    matches: ["match5"],
    winner: "user1" // Kimoz
  },
  {
    id: "season4",
    name: "Sezon 4 2021",
    startDate: "2021-07-01",
    endDate: "2021-12-31",
    gameTypes: ["8-ball", "9-ball"],
    gamesPerMatch: 5,
    breakRule: "winner",
    active: false,
    matches: ["match6", "match7", "match8", "match9", "match10", "match11"],
    winner: "user1" // Kimoz
  },
  {
    id: "season5",
    name: "Sezon 5 2022 (BO5)",
    startDate: "2022-01-01",
    endDate: "2022-06-30",
    gameTypes: ["8-ball", "9-ball"],
    gamesPerMatch: 5,
    breakRule: "winner",
    active: false,
    matches: ["match12"],
    winner: "user2" // Szyman
  },
  {
    id: "season6",
    name: "Sezon 6 2022 (BO5)",
    startDate: "2022-07-01",
    endDate: "2022-12-31", 
    gameTypes: ["8-ball", "9-ball"],
    gamesPerMatch: 5,
    breakRule: "winner",
    active: false,
    matches: ["match13"],
    winner: "user2" // Szyman
  },
  {
    id: "season7",
    name: "Sezon 7 2023 (BO5) wygrany rozbija",
    startDate: "2023-01-01",
    endDate: "2023-06-30",
    gameTypes: ["8-ball", "9-ball"],
    gamesPerMatch: 5,
    breakRule: "winner",
    active: false,
    matches: ["match14"],
    winner: "user2" // Szyman
  },
  {
    id: "season8",
    name: "Sezon 8 2023 (kto pierwszy wygra 9 małych partii)",
    startDate: "2023-07-01",
    endDate: "2023-12-31",
    gameTypes: ["8-ball", "9-ball"],
    gamesPerMatch: 9,
    breakRule: "winner",
    active: false,
    matches: ["match15"],
    winner: "user2" // Szyman
  },
  {
    id: "season9",
    name: "Sezon 9 2024 (BO5) do 15 partii",
    startDate: "2024-01-01",
    endDate: "2024-03-31",
    gameTypes: ["8-ball", "9-ball", "10-ball"],
    gamesPerMatch: 15,
    breakRule: "winner",
    active: false,
    matches: ["match16"]
  },
  {
    id: "season10",
    name: "Sezon 10 2024 (BO6) 8 i 9 wygrany rozbija do 15 małych partii",
    startDate: "2024-04-01",
    endDate: "2024-06-30",
    gameTypes: ["8-ball", "9-ball"],
    gamesPerMatch: 15,
    breakRule: "winner",
    active: false,
    matches: ["match17"],
    winner: "user1" // Kimoz
  },
  {
    id: "season11",
    name: "Sezon 11 2024 (8BO4,9BO8) do 10 partii, WB",
    startDate: "2024-07-01",
    endDate: "2024-08-31",
    gameTypes: ["8-ball", "9-ball"],
    gamesPerMatch: 10,
    breakRule: "winner",
    active: false,
    matches: ["match18"],
    winner: "user1", // Kimoz
    stake: 150
  },
  {
    id: "season12",
    name: "Sezon 12 2024 (BO6) do 5 partii, WB",
    startDate: "2024-09-01",
    endDate: "2024-10-31",
    gameTypes: ["8-ball", "9-ball"],
    gamesPerMatch: 5,
    breakRule: "winner",
    active: false,
    matches: ["match19"],
    winner: "user1", // Kimoz
    stake: 150
  },
  {
    id: "season13",
    name: "Sezon 13 2024 (BO6) do 5 partii, WB",
    startDate: "2024-11-01",
    endDate: null,
    gameTypes: ["8-ball", "9-ball"],
    gamesPerMatch: 5,
    breakRule: "winner",
    active: true,
    matches: ["match20"],
    stake: 150
  }
];

// Tylko kilka reprezentatywnych meczów, całkowite dane są zbyt obszerne
export const initialMatches: Match[] = [
  {
    id: "match1",
    date: "2019-12-20",
    playerA: "user2", // Szyman
    playerB: "user1", // Kimoz
    games: [
      { type: "8-ball", scoreA: 3, scoreB: 5, winner: "B" },
      { type: "8-ball", scoreA: 2, scoreB: 5, winner: "B" },
      { type: "8-ball", scoreA: 5, scoreB: 2, winner: "A" },
      { type: "8-ball", scoreA: 4, scoreB: 2, winner: "A" },
      { type: "8-ball", scoreA: 5, scoreB: 4, winner: "A" },
      { type: "8-ball", scoreA: 4, scoreB: 4, winner: "tie", breakAndRun: true },
      { type: "8-ball", scoreA: 4, scoreB: 3, winner: "A" },
      { type: "8-ball", scoreA: 2, scoreB: 5, winner: "B" },
      { type: "8-ball", scoreA: 7, scoreB: 2, winner: "A" }
    ],
    winner: "user2", // Szyman
    seasonId: "season1",
    notes: "SZYMAN WIN\nKoniec 2019 - Szyman 5 - 3 Kimoz"
  },
  {
    id: "match2",
    date: "2019-12-25",
    playerA: "user2", // Szyman
    playerB: "user1", // Kimoz
    games: [
      { type: "8-ball", scoreA: 3, scoreB: 5, winner: "B" }
    ],
    winner: "user1", // Kimoz
    seasonId: "preseason2",
    notes: "PreSezon"
  },
  {
    id: "match3",
    date: "2020-01-13",
    playerA: "user2", // Szyman
    playerB: "user1", // Kimoz
    games: [
      { type: "8-ball", scoreA: 4, scoreB: 4, winner: "tie", breakAndRun: true },
      { type: "8-ball", scoreA: 3, scoreB: 5, winner: "B" },
      { type: "8-ball", scoreA: 5, scoreB: 4, winner: "A" },
      { type: "8-ball", scoreA: 6, scoreB: 3, winner: "A" },
      { type: "8-ball", scoreA: 3, scoreB: 6, winner: "B" },
      { type: "8-ball", scoreA: 5, scoreB: 5, winner: "tie", breakAndRun: true },
      { type: "8-ball", scoreA: 3, scoreB: 4, winner: "B" },
      { type: "8-ball", scoreA: 3, scoreB: 4, winner: "B" },
      { type: "8-ball", scoreA: 7, scoreB: 2, winner: "A" }
    ],
    winner: "user1", // Kimoz
    seasonId: "season2",
    notes: "Sezon 20\n13.01 - 31.05\nSzyman - Kimoz"
  },
  {
    id: "match4",
    date: "2020-06-15",
    playerA: "user2", // Szyman
    playerB: "user1", // Kimoz
    games: [
      { type: "8-ball", scoreA: 4, scoreB: 4, winner: "tie" },
      { type: "8-ball", scoreA: 4, scoreB: 5, winner: "A" },
      { type: "8-ball", scoreA: 6, scoreB: 2, winner: "B" },
      { type: "8-ball", scoreA: 5, scoreB: 6, winner: "B" },
      { type: "8-ball", scoreA: 2, scoreB: 5, winner: "B" },
      { type: "8-ball", scoreA: 3, scoreB: 6, winner: "B" },
      { type: "8-ball", scoreA: 4, scoreB: 8, winner: "B" }
    ],
    winner: "user1", // Kimoz
    seasonId: "season2",
    notes: "AFTER COV19 2020\nKIMOZ WIN"
  },
  {
    id: "match5",
    date: "2021-04-15",
    playerA: "user2", // Szyman
    playerB: "user1", // Kimoz
    games: [
      { type: "8-ball", scoreA: 5, scoreB: 5, winner: "tie", breakAndRun: true },
      { type: "8-ball", scoreA: 3, scoreB: 4, winner: "A" },
      { type: "8-ball", scoreA: 3, scoreB: 4, winner: "A" },
      { type: "8-ball", scoreA: 1, scoreB: 7, winner: "B" },
      { type: "8-ball", scoreA: 3, scoreB: 6, winner: "B" },
      { type: "8-ball", scoreA: 3, scoreB: 5, winner: "B" },
      { type: "8-ball", scoreA: 3, scoreB: 5, winner: "B" }
    ],
    winner: "user1", // Kimoz
    seasonId: "season3",
    notes: "Sezon 3 2021\nKimoz win"
  },
  {
    id: "match18",
    date: "2024-07-15",
    playerA: "user2", // Szyman
    playerB: "user1", // Kimoz
    games: [
      { type: "8-ball", scoreA: 4, scoreB: 0, winner: "A" },
      { type: "9-ball", scoreA: 0, scoreB: 4, winner: "B" },
      { type: "8-ball", scoreA: 4, scoreB: 3, winner: "A" },
      { type: "9-ball", scoreA: 3, scoreB: 4, winner: "B" },
      { type: "8-ball", scoreA: 3, scoreB: 4, winner: "B" },
      { type: "9-ball", scoreA: 4, scoreB: 3, winner: "A" },
      { type: "8-ball", scoreA: 3, scoreB: 4, winner: "B" },
      { type: "9-ball", scoreA: 4, scoreB: 3, winner: "A" },
      { type: "8-ball", scoreA: 0, scoreB: 4, winner: "B" },
      { type: "9-ball", scoreA: 3, scoreB: 4, winner: "B" }
    ],
    winner: "user1", // Kimoz
    seasonId: "season11",
    notes: "T-K (8BO4,9BO8) do 10 partii, WB\nKIMOZ WINNER\nSZYMAN 150"
  },
  {
    id: "match20",
    date: "2024-11-05",
    playerA: "user2", // Szyman
    playerB: "user1", // Kimoz
    games: [
      { type: "8-ball", scoreA: 6, scoreB: 3, winner: "B" },
      { type: "9-ball", scoreA: 6, scoreB: 6, winner: "tie" },
      { type: "8-ball", scoreA: 6, scoreB: 5, winner: "B" },
      { type: "9-ball", scoreA: 6, scoreB: 8, winner: "A" }
    ],
    winner: "user1", // Kimoz - bieżący sezon
    seasonId: "season13"
  }
];
