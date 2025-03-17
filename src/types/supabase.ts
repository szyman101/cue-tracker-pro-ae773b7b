
export type Database = {
  public: {
    functions: {
      enable_realtime: {
        Args: {
          table_name: string;
        };
        Returns: boolean;
      };
    };
    Tables: {
      profiles: {
        Row: ProfilesTable;
        Insert: ProfilesTable;
        Update: Partial<ProfilesTable>;
      };
      matches: {
        Row: MatchesTable;
        Insert: Omit<MatchesTable, 'id'> & { id?: string };
        Update: Partial<MatchesTable>;
      };
      seasons: {
        Row: SeasonsTable;
        Insert: Omit<SeasonsTable, 'id'> & { id?: string };
        Update: Partial<SeasonsTable>;
      };
      season_matches: {
        Row: SeasonMatchesTable;
        Insert: SeasonMatchesTable;
        Update: Partial<SeasonMatchesTable>;
      };
    };
  };
};

// Table type definitions for Supabase
export type ProfilesTable = {
  id: string;
  nick: string;
  role: string;
  first_name: string | null;
};

export type MatchesTable = {
  id: string;
  date: string;
  player_a: string;
  player_b: string;
  games: any;
  winner: string | null;
  season_id: string | null;
  time_elapsed: number | null;
  games_to_win: number | null;
  player_a_name: string | null;
  player_b_name: string | null;
  notes: string | null;
};

export type SeasonsTable = {
  id: string;
  name: string;
  start_date: string;
  end_date: string | null;
  game_types: string[];
  matches_to_win: number;
  break_rule: string;
  prize: string | null;
  active: boolean;
  winner: string | null;
  games_per_match: number | null;
  stake: number | null;
};

export type SeasonMatchesTable = {
  season_id: string;
  match_id: string;
};
