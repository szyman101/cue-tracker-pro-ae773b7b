
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import BackButton from "@/components/BackButton";

const MatchHistory = () => {
  const { currentUser } = useAuth();
  const { getUserMatches, getUserById, seasons, clearMatches, deleteMatch } = useData();

  const userMatches = currentUser ? getUserMatches(currentUser.id) : [];
  
  // Sort matches by date (newest first)
  const sortedMatches = [...userMatches].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleClearHistory = async () => {
    await clearMatches();
    toast({
      title: "Historia wyczyszczona",
      description: "Wszystkie mecze zostały usunięte",
    });
  };

  // Handler for deleting individual match
  const handleDeleteMatch = async (matchId: string) => {
    try {
      await deleteMatch(matchId);
    } catch (error) {
      console.error("Error deleting match:", error);
    }
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
                <TableHead>Sezon</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead> {/* Column for delete button */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedMatches.map((match) => {
                const isPlayerA = match.playerA === currentUser?.id;
                const opponentId = isPlayerA ? match.playerB : match.playerA;
                
                const opponentName = isPlayerA 
                  ? (match.playerBName || "Nieznany przeciwnik")
                  : (match.playerAName || "Nieznany przeciwnik");
                
                const matchSeason = seasons.find(s => s.id === match.seasonId);
                
                // Calculate total scores from all games
                let totalScoreA = 0;
                let totalScoreB = 0;
                
                match.games.forEach(game => {
                  totalScoreA += game.scoreA;
                  totalScoreB += game.scoreB;
                });
                
                // Also keep track of games won for showing win/loss
                const userWins = match.games.filter(g => 
                  (isPlayerA && g.winner === "A") || (!isPlayerA && g.winner === "B")
                ).length;
                
                const opponentWins = match.games.filter(g => 
                  (isPlayerA && g.winner === "B") || (!isPlayerA && g.winner === "A")
                ).length;
                
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
                        {isPlayerA ? `${totalScoreA} - ${totalScoreB}` : `${totalScoreB} - ${totalScoreA}`}
                      </span>
                      {match.games.some(g => g.breakAndRun) && (
                        <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs">
                          R
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{matchSeason?.name || "Towarzyski"}</TableCell>
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
                    <TableCell>
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
                    </TableCell>
                  </TableRow>
                );
              })}
              {sortedMatches.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
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
