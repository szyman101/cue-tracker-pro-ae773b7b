
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { Match, Season, User } from "@/types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { useData } from "@/contexts/DataContext";

interface MatchHistoryProps {
  userMatches: Match[];
  userSeasons: Season[];
  currentUser: User | null;
  hideControls?: boolean;
}

const MatchHistory: React.FC<MatchHistoryProps> = ({ 
  userMatches = [], 
  userSeasons = [], 
  currentUser,
  hideControls = false
}) => {
  const { clearMatches, deleteMatch } = useData();

  const handleClearHistory = async () => {
    try {
      await clearMatches();
      toast({
        title: "History cleared",
        description: "All matches have been deleted",
      });
    } catch (error) {
      console.error("Error clearing matches:", error);
      toast({
        title: "Error",
        description: "Failed to clear match history",
        variant: "destructive",
      });
    }
  };

  // Handler for deleting individual match
  const handleDeleteMatch = async (matchId: string) => {
    try {
      await deleteMatch(matchId);
    } catch (error) {
      console.error("Error deleting match:", error);
    }
  };

  // Safeguard against null/undefined
  const matches = Array.isArray(userMatches) ? userMatches : [];
  const seasons = Array.isArray(userSeasons) ? userSeasons : [];

  return (
    <div className="space-y-4 relative">
      <div className="rounded-md border">
        <div className="grid grid-cols-6 p-4 font-medium">
          <div>Date</div>
          <div>Player A</div>
          <div>Player B</div>
          <div>Score</div>
          <div>Season</div>
          <div></div> {/* Column for delete button */}
        </div>
        <div className="divide-y">
          {matches.slice(0, 10).map((match) => {
            const playerA = match.playerAName || (match.playerA === currentUser?.id ? currentUser.nick : "Opponent");
            const playerB = match.playerBName || (match.playerB === currentUser?.id ? currentUser.nick : "Opponent");
            const season = seasons.find(s => s.id === match.seasonId);
            
            // Extract the scores from each game
            let totalScoreA = 0;
            let totalScoreB = 0;
            
            // Sum up all points from all games
            if (Array.isArray(match.games)) {
              match.games.forEach(game => {
                totalScoreA += game.scoreA;
                totalScoreB += game.scoreB;
              });
            }

            return (
              <div key={match.id} className="grid grid-cols-6 p-4 hover:bg-muted/50">
                <div>{match.date ? new Date(match.date).toLocaleDateString() : "N/A"}</div>
                <div className={match.winner === match.playerA ? "font-bold" : ""}>{playerA}</div>
                <div className={match.winner === match.playerB ? "font-bold" : ""}>{playerB}</div>
                <div>
                  {totalScoreA} - {totalScoreB}
                </div>
                <div>{season?.name || "Friendly"}</div>
                <div className="flex justify-end">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Czy na pewno chcesz usunąć ten mecz?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Ta akcja jest nieodwracalna. Mecz zostanie trwale usunięty z historii.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Anuluj</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteMatch(match.id)}>Usuń</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            );
          })}
          {matches.length === 0 && (
            <div className="p-4 text-center text-muted-foreground">No match history</div>
          )}
        </div>
      </div>
      {!hideControls && (
        <div className="flex justify-between items-center">
          {matches.length > 10 && (
            <Button variant="outline" asChild>
              <Link to="/history">See more</Link>
            </Button>
          )}
          <div className={matches.length <= 10 ? "ml-auto" : ""}>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear match history
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to clear history?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will delete all saved matches. This operation is irreversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearHistory}>Yes, clear</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchHistory;
