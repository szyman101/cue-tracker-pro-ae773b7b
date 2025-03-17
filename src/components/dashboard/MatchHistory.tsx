
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Match, Season, User } from "@/types";

interface MatchHistoryProps {
  userMatches: Match[];
  userSeasons: Season[];
  currentUser: User | null;
}

const MatchHistory: React.FC<MatchHistoryProps> = ({ userMatches, userSeasons, currentUser }) => {
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <div className="grid grid-cols-5 p-4 font-medium">
          <div>Data</div>
          <div>Gracz A</div>
          <div>Gracz B</div>
          <div>Wynik</div>
          <div>Sezon</div>
        </div>
        <div className="divide-y">
          {userMatches.slice(0, 10).map((match) => {
            const playerA = match.playerAName || (match.playerA === currentUser?.id ? currentUser.nick : "Przeciwnik");
            const playerB = match.playerBName || (match.playerB === currentUser?.id ? currentUser.nick : "Przeciwnik");
            const season = userSeasons.find(s => s.id === match.seasonId);

            return (
              <div key={match.id} className="grid grid-cols-5 p-4 hover:bg-muted/50">
                <div>{new Date(match.date).toLocaleDateString()}</div>
                <div className={match.winner === match.playerA ? "font-bold" : ""}>{playerA}</div>
                <div className={match.winner === match.playerB ? "font-bold" : ""}>{playerB}</div>
                <div>
                  {match.games.filter(g => g.winner === "A").length} - {match.games.filter(g => g.winner === "B").length}
                </div>
                <div>{season?.name || "Towarzyski"}</div>
              </div>
            );
          })}
          {userMatches.length === 0 && (
            <div className="p-4 text-center text-muted-foreground">Brak historii meczów</div>
          )}
        </div>
      </div>
      {userMatches.length > 10 && (
        <div className="flex justify-center">
          <Button variant="outline" asChild>
            <Link to="/history">Zobacz więcej</Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default MatchHistory;
