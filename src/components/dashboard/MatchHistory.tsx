
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { Match, Season, User } from "@/types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { useData } from "@/contexts/DataContext";
import { Skeleton } from "@/components/ui/skeleton";

interface MatchHistoryProps {
  userMatches: Match[];
  userSeasons: Season[];
  currentUser: User | null;
  hideControls?: boolean;
  isLoading?: boolean;
}

const MatchHistory: React.FC<MatchHistoryProps> = ({ 
  userMatches, 
  userSeasons, 
  currentUser,
  hideControls = false,
  isLoading = false
}) => {
  const { clearMatches } = useData();

  const handleClearHistory = () => {
    clearMatches();
    toast({
      title: "Historia wyczyszczona",
      description: "Wszystkie mecze zostały usunięte",
    });
  };

  return (
    <div className="space-y-4 relative">
      <div className="rounded-md border">
        <div className="grid grid-cols-5 p-4 font-medium">
          <div>Data</div>
          <div>Gracz A</div>
          <div>Gracz B</div>
          <div>Wynik</div>
          <div>Sezon</div>
        </div>
        <div className="divide-y">
          {isLoading ? (
            // Loading skeletons
            Array(3).fill(0).map((_, index) => (
              <div key={index} className="grid grid-cols-5 p-4">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-28" />
              </div>
            ))
          ) : userMatches.slice(0, 10).map((match) => {
            const playerA = match.playerAName || (match.playerA === currentUser?.id ? currentUser.nick : "Przeciwnik");
            const playerB = match.playerBName || (match.playerB === currentUser?.id ? currentUser.nick : "Przeciwnik");
            const season = userSeasons.find(s => s.id === match.seasonId);
            
            // Extract the scores from each game
            let totalScoreA = 0;
            let totalScoreB = 0;
            
            // Sum up all points from all games
            match.games.forEach(game => {
              totalScoreA += game.scoreA;
              totalScoreB += game.scoreB;
            });

            return (
              <div key={match.id} className="grid grid-cols-5 p-4 hover:bg-muted/50">
                <div>{new Date(match.date).toLocaleDateString()}</div>
                <div className={match.winner === match.playerA ? "font-bold" : ""}>{playerA}</div>
                <div className={match.winner === match.playerB ? "font-bold" : ""}>{playerB}</div>
                <div>
                  {totalScoreA} - {totalScoreB}
                </div>
                <div>{season?.name || "Towarzyski"}</div>
              </div>
            );
          })}
          {!isLoading && userMatches.length === 0 && (
            <div className="p-4 text-center text-muted-foreground">Brak historii meczów</div>
          )}
        </div>
      </div>
      {!hideControls && (
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
      )}
    </div>
  );
};

export default MatchHistory;
