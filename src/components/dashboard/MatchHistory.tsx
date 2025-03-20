
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Trash2, Clock, Zap } from "lucide-react";
import { Match, Season, User } from "@/types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { useData } from "@/contexts/DataContext";

interface MatchHistoryProps {
  userMatches: Match[];
  userSeasons: Season[];
  currentUser: User | null;
}

const MatchHistory: React.FC<MatchHistoryProps> = ({ userMatches, userSeasons, currentUser }) => {
  const { clearMatches, deleteMatch } = useData();

  const handleClearHistory = () => {
    clearMatches();
    toast({
      title: "Historia wyczyszczona",
      description: "Wszystkie mecze zostały usunięte",
    });
  };
  
  const handleDeleteMatch = (matchId: string) => {
    deleteMatch(matchId);
    toast({
      title: "Mecz usunięty",
      description: "Mecz został usunięty z historii",
    });
  };

  // Format time elapsed from seconds to MM:SS format
  const formatTimeElapsed = (seconds?: number) => {
    if (!seconds) return "--:--";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4 relative">
      <div className="rounded-md border">
        <div className="grid grid-cols-6 p-4 font-medium">
          <div>Data</div>
          <div>Gracz A</div>
          <div>Gracz B</div>
          <div>Wynik</div>
          <div>Info</div>
          <div>Akcje</div>
        </div>
        <div className="divide-y">
          {userMatches.slice(0, 10).map((match) => {
            const playerA = match.playerAName || (match.playerA === currentUser?.id ? currentUser.nick : "Przeciwnik");
            const playerB = match.playerBName || (match.playerB === currentUser?.id ? currentUser.nick : "Przeciwnik");
            const season = userSeasons.find(s => s.id === match.seasonId);
            
            // Calculate wins from game results - not from match.winner
            const winsA = match.games.filter(game => game.winner === 'A').length;
            const winsB = match.games.filter(game => game.winner === 'B').length;
            
            // Check for break runs
            const breakRuns = match.games.some(game => game.breakAndRun);
            
            // Get unique game types played in this match
            const gameTypes = match.gameTypes || 
              Array.from(new Set(match.games.map(g => g.type || '8-ball'))).join(", ");

            return (
              <div key={match.id} className="grid grid-cols-6 p-4 hover:bg-muted/50">
                <div>{new Date(match.date).toLocaleDateString()}</div>
                <div className={winsA > winsB ? "font-bold" : ""}>{playerA}</div>
                <div className={winsB > winsA ? "font-bold" : ""}>{playerB}</div>
                <div>
                  {winsA} - {winsB}
                </div>
                <div className="flex items-center gap-2">
                  {gameTypes && (
                    <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full inline-flex items-center gap-1">
                      {gameTypes}
                      {match.timeElapsed > 0 && (
                        <>
                          <span className="mx-1">•</span>
                          <Clock className="h-3 w-3" />
                          <span>{formatTimeElapsed(match.timeElapsed)}</span>
                        </>
                      )}
                    </span>
                  )}
                  {breakRuns && (
                    <span className="flex items-center">
                      <Zap className="h-4 w-4 text-yellow-500" aria-label="Zejście z kija" />
                    </span>
                  )}
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/match/${match.id}`}>Zobacz</Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Czy na pewno chcesz usunąć ten mecz?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Ta akcja usunie mecz z historii i nie można jej cofnąć.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Anuluj</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteMatch(match.id)}>
                          Usuń mecz
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            );
          })}
          {userMatches.length === 0 && (
            <div className="p-4 text-center text-muted-foreground">Brak historii meczów</div>
          )}
        </div>
      </div>
      <div className="flex justify-between items-center">
        {userMatches.length > 10 && (
          <Button variant="outline" asChild>
            <Link to="/history">Zobacz więcej</Link>
          </Button>
        )}
        <div className={userMatches.length <= 10 ? "ml-auto" : ""}>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Wyczyść historię meczów
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Czy na pewno chcesz wyczyścić historię?</AlertDialogTitle>
                <AlertDialogDescription>
                  Ta akcja usunie wszystkie zapisane mecze. Operacja jest nieodwracalna.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Anuluj</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearHistory}>Tak, wyczyść</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};

export default MatchHistory;
