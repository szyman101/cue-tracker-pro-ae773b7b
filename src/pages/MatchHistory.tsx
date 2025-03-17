
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const MatchHistory = () => {
  const { currentUser } = useAuth();
  const { getUserMatches, getUserById, seasons } = useData();

  const userMatches = currentUser ? getUserMatches(currentUser.id) : [];
  
  // Sort matches by date (newest first)
  const sortedMatches = [...userMatches].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  console.log("Match history data:", sortedMatches);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Historia meczów</h1>
      
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedMatches.map((match) => {
                const isPlayerA = match.playerA === currentUser?.id;
                const opponentId = isPlayerA ? match.playerB : match.playerA;
                
                // Use the saved player names from the match object
                const opponentName = isPlayerA 
                  ? (match.playerBName || "Nieznany przeciwnik")
                  : (match.playerAName || "Nieznany przeciwnik");
                
                const matchSeason = seasons.find(s => s.id === match.seasonId);
                
                console.log(`Match ${match.id}:`, match);
                console.log(`Player A name: ${match.playerAName}, Player B name: ${match.playerBName}`);
                console.log(`Is current user player A: ${isPlayerA}`);
                console.log(`Opponent name being displayed: ${opponentName}`);
                
                // Count game wins (not score points) for proper display
                const userWins = match.games.filter(g => 
                  (isPlayerA && g.winner === "A") || (!isPlayerA && g.winner === "B")
                ).length;
                
                const opponentWins = match.games.filter(g => 
                  (isPlayerA && g.winner === "B") || (!isPlayerA && g.winner === "A")
                ).length;
                
                console.log(`User wins: ${userWins}, Opponent wins: ${opponentWins}`);
                
                const gameTypes = Array.from(new Set(match.games.map(g => g.type))).join(", ");
                
                const isWinner = match.winner === currentUser?.id;

                return (
                  <TableRow key={match.id}>
                    <TableCell>{new Date(match.date).toLocaleDateString()}</TableCell>
                    <TableCell>{opponentName}</TableCell>
                    <TableCell>{gameTypes}</TableCell>
                    <TableCell>
                      <span className={isWinner ? "font-bold" : ""}>
                        {userWins} - {opponentWins}
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
                  </TableRow>
                );
              })}
              {sortedMatches.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    Brak historii meczów
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default MatchHistory;
