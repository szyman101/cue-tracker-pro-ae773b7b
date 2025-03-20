
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Link as RouterLink } from "react-router-dom";
import { Clock, Link, Zap } from "lucide-react";
import MatchStatus from "./MatchStatus";
import MatchActions from "./MatchActions";
import { formatTimeElapsed } from "@/utils/formatTime";
import { Match, User, Season } from "@/types";

interface MatchResultRowProps {
  match: Match;
  currentUser: User | null;
  seasons: Season[];
  onDeleteMatch: (matchId: string) => void;
  getUserById: (id: string) => User | undefined;
}

const MatchResultRow: React.FC<MatchResultRowProps> = ({
  match,
  currentUser,
  seasons,
  onDeleteMatch,
  getUserById
}) => {
  if (!currentUser) return null;
  
  const isPlayerA = match.playerA === currentUser.id;
  const opponentId = isPlayerA ? match.playerB : match.playerA;
  
  const opponentName = isPlayerA 
    ? (match.playerBName || getUserById(match.playerB)?.nick || "Nieznany przeciwnik")
    : (match.playerAName || getUserById(match.playerA)?.nick || "Nieznany przeciwnik");
  
  const matchSeason = seasons.find(s => s.id === match.seasonId);
  
  // Calculate win counts correctly from game results
  const winsA = match.games.filter(g => g.winner === 'A').length;
  const winsB = match.games.filter(g => g.winner === 'B').length;
  
  // Determine if user won
  const userWon = (isPlayerA && winsA > winsB) || (!isPlayerA && winsB > winsA);
  const userLost = (isPlayerA && winsA < winsB) || (!isPlayerA && winsB < winsA);
  
  // Check for break runs
  const hasBreakRuns = match.games.some(g => g.breakAndRun);
  
  // Get unique game types played in this match
  const gameTypes = match.gameTypes || 
    Array.from(new Set(match.games.map(g => g.type || '8-ball'))).join(", ");
  
  // Display user's wins first, followed by opponent's wins
  const userWins = isPlayerA ? winsA : winsB;
  const opponentWins = isPlayerA ? winsB : winsA;

  return (
    <TableRow>
      <TableCell>{new Date(match.date).toLocaleDateString()}</TableCell>
      <TableCell>{opponentName}</TableCell>
      <TableCell>
        <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
          {gameTypes}
        </span>
      </TableCell>
      <TableCell>
        <span className={userWon ? "font-bold" : ""}>
          {userWins} - {opponentWins}
        </span>
        {hasBreakRuns && (
          <span className="inline-flex ml-2">
            <Zap className="h-4 w-4 text-yellow-500" aria-label="Zejście z kija" />
          </span>
        )}
      </TableCell>
      <TableCell>
        <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          {formatTimeElapsed(match.timeElapsed)}
        </span>
      </TableCell>
      <TableCell>
        {matchSeason ? (
          <div className="flex items-center">
            <RouterLink to={`/season/${matchSeason.id}`} className="text-primary hover:underline flex items-center">
              {matchSeason.name}
              <Link className="h-3 w-3 ml-1" />
            </RouterLink>
          </div>
        ) : (
          "Towarzyski"
        )}
      </TableCell>
      <TableCell>
        <MatchStatus userWon={userWon} userLost={userLost} />
      </TableCell>
      <TableCell className="text-right">
        <MatchActions matchId={match.id} onDelete={onDeleteMatch} />
      </TableCell>
    </TableRow>
  );
};

export default MatchResultRow;
