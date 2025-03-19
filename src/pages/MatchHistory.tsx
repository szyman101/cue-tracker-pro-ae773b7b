
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, Eye, Link, Clock, Zap } from "lucide-react";
import BackButton from "@/components/BackButton";
import { Link as RouterLink } from "react-router-dom";

const MatchHistory = () => {
  const { currentUser } = useAuth();
  const { getUserMatches, getUserById, seasons, clearMatches, deleteMatch } = useData();

  const userMatches = currentUser ? getUserMatches(currentUser.id) : [];
  
  // Sort matches by date (newest first)
  const sortedMatches = [...userMatches].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

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
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Historia meczów</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Twoje mecze</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Przeciwnik</TableHead>
                <TableHead>Gra</TableHead>
                <TableHead>Wynik</TableHead>
                <TableHead>Czas</TableHead>
                <TableHead>Sezon</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedMatches.map((match) => {
                const isPlayerA = match.playerA === currentUser?.id;
                const opponentId = isPlayerA ? match.playerB : match.playerA;
                
                const opponentName = isPlayerA 
                  ? (match.playerBName || getUserById(match.playerB)?.nick || "Nieznany przeciwnik")
                  : (match.playerAName || getUserById(match.playerA)?.nick || "Nieznany przeciwnik");
                
                const matchSeason = seasons.find(s => s.id === match.seasonId);
                
                // Calculate total scores from all games
                let totalScoreA = 0;
                let totalScoreB = 0;
                let hasBreakRuns = false;
                
                match.games.forEach(game => {
                  totalScoreA += game.scoreA;
                  totalScoreB += game.scoreB;
                  if (game.breakAndRun) hasBreakRuns = true;
                });
                
                // Also keep track of games won for showing win/loss
                const userWins = match.games.filter(g => 
                  (isPlayerA && g.winner === "A") || (!isPlayerA && g.winner === "B")
                ).length;
                
                const opponentWins = match.games.filter(g => 
                  (isPlayerA && g.winner === "B") || (!isPlayerA && g.winner === "A")
                ).length;
                
                // Get unique game types played in this match
                const gameTypes = Array.from(new Set(match.games.map(g => g.type))).join(", ");
                
                const isWinner = match.winner === currentUser?.id;
                
                // Display user's score first, followed by opponent's score
                const userScore = isPlayerA ? totalScoreA : totalScoreB;
                const opponentScore = isPlayerA ? totalScoreB : totalScoreA;

                return (
                  <TableRow key={match.id}>
                    <TableCell>{new Date(match.date).toLocaleDateString()}</TableCell>
                    <TableCell>{opponentName}</TableCell>
                    <TableCell>{gameTypes}</TableCell>
                    <TableCell>
                      <span className={isWinner ? "font-bold" : ""}>
                        {userScore} - {opponentScore}
                      </span>
                      {hasBreakRuns && (
                        <Zap className="inline-block ml-2 h-4 w-4 text-yellow-500" title="Zejście z kija" />
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
                      {isWinner ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                          Wygrana
                        </span>
                      ) : match.winner ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">
                          Przegrana
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100">
                          Remis
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" asChild>
                          <RouterLink to={`/match/${match.id}`}>
                            <Eye className="h-4 w-4" />
                          </RouterLink>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="text-destructive">
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
                    </TableCell>
                  </TableRow>
                );
              })}
              {sortedMatches.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    Brak historii meczów
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          <div className="flex justify-end mt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Wyczyść historię
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
        </CardContent>
      </Card>
      
      <BackButton />
    </div>
  );
};

export default MatchHistory;
