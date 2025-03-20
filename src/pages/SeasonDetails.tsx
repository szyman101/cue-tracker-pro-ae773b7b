
import React from "react";
import { useParams } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import BackButton from "@/components/BackButton";
import { Trophy, Zap, Clock } from "lucide-react";

const SeasonDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { seasons, getSeasonMatches, getUserById, getBreakRunsInSeason } = useData();
  const { allUsers } = useAuth();
  
  const season = seasons.find(s => s.id === id);
  
  if (!season) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Sezon nie znaleziony</h1>
        <BackButton />
      </div>
    );
  }

  const seasonMatches = getSeasonMatches(season.id);
  
  // Sort matches by date (newest first)
  const sortedMatches = [...seasonMatches].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Get player stats for this season
  const playerStats: Record<string, { wins: number, matches: number, points: number, breakRuns: number }> = {};
  
  // Initialize stats for all users that participated in this season
  const usersInSeason = new Set<string>();
  
  seasonMatches.forEach(match => {
    usersInSeason.add(match.playerA);
    usersInSeason.add(match.playerB);
  });
  
  usersInSeason.forEach(userId => {
    playerStats[userId] = { 
      wins: 0, 
      matches: 0, 
      points: 0, 
      breakRuns: getBreakRunsInSeason(userId, season.id)
    };
  });
  
  // Calculate stats
  seasonMatches.forEach(match => {
    playerStats[match.playerA].matches++;
    playerStats[match.playerB].matches++;
    
    // Add points (total score from all games)
    match.games.forEach(game => {
      if (game.winner === 'A') {
        playerStats[match.playerA].points += 1;
      } else if (game.winner === 'B') {
        playerStats[match.playerB].points += 1;
      }
    });
    
    // Add win to winner
    if (match.winner) {
      playerStats[match.winner].wins++;
    }
  });
  
  // Sort players by wins
  const sortedPlayers = Object.entries(playerStats)
    .sort(([, statsA], [, statsB]) => statsB.wins - statsA.wins);
    
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
        <h1 className="text-3xl font-bold">{season.name}</h1>
        {season.active ? (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
            Aktywny
          </span>
        ) : (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100">
            Zakończony
          </span>
        )}
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informacje o sezonie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2">
                <div className="font-medium">Data rozpoczęcia:</div>
                <div>{new Date(season.startDate).toLocaleDateString()}</div>
              </div>
              
              {!season.active && season.endDate && (
                <div className="grid grid-cols-2">
                  <div className="font-medium">Data zakończenia:</div>
                  <div>{new Date(season.endDate).toLocaleDateString()}</div>
                </div>
              )}
              
              <div className="grid grid-cols-2">
                <div className="font-medium">Liczba meczów:</div>
                <div>{season.matches.length}</div>
              </div>
              
              <div className="grid grid-cols-2">
                <div className="font-medium">Typy gier:</div>
                <div>{season.gameTypes.join(", ")}</div>
              </div>
              
              <div className="grid grid-cols-2">
                <div className="font-medium">Meczy do wygrania:</div>
                <div>{season.matchesToWin}</div>
              </div>
              
              <div className="grid grid-cols-2">
                <div className="font-medium">Nagroda:</div>
                <div>{season.prize || "Brak"}</div>
              </div>
              
              {season.winner && (
                <div className="grid grid-cols-2">
                  <div className="font-medium">Zwycięzca:</div>
                  <div className="flex items-center">
                    <Trophy className="w-4 h-4 mr-1 text-yellow-500" />
                    {getUserById(season.winner)?.nick || "Nieznany"}
                  </div>
                </div>
              )}
              
              {season.description && (
                <div className="mt-4">
                  <div className="font-medium mb-1">Opis:</div>
                  <div className="text-muted-foreground">{season.description}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Ranking graczy</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Gracz</TableHead>
                  <TableHead className="text-right">Wygrane</TableHead>
                  <TableHead className="text-right">Mecze</TableHead>
                  <TableHead className="text-right">Punkty</TableHead>
                  <TableHead className="text-right">Zejścia z kija</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPlayers.map(([playerId, stats], index) => {
                  const player = allUsers.find(u => u.id === playerId);
                  const isWinner = season.winner === playerId;
                  
                  return (
                    <TableRow key={playerId} className={isWinner ? "bg-yellow-50 dark:bg-yellow-950/20" : ""}>
                      <TableCell className="font-medium flex items-center">
                        {index === 0 && !season.winner && <Trophy className="w-4 h-4 mr-1 text-yellow-500" />}
                        {isWinner && <Trophy className="w-4 h-4 mr-1 text-yellow-500" />}
                        {player?.nick || "Nieznany gracz"}
                      </TableCell>
                      <TableCell className="text-right">{stats.wins}</TableCell>
                      <TableCell className="text-right">{stats.matches}</TableCell>
                      <TableCell className="text-right">{stats.points}</TableCell>
                      <TableCell className="text-right">
                        {stats.breakRuns > 0 ? (
                          <div className="flex items-center justify-end">
                            {stats.breakRuns}
                            <Zap className="h-4 w-4 ml-1 text-yellow-500" />
                          </div>
                        ) : "0"}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {sortedPlayers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      Brak danych
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Mecze w sezonie</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Gracz A</TableHead>
                <TableHead>Gracz B</TableHead>
                <TableHead>Wynik</TableHead>
                <TableHead>Gra</TableHead>
                <TableHead>Czas</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedMatches.map((match) => {
                // Get player names
                const playerA = allUsers.find(u => u.id === match.playerA)?.nick || match.playerAName || "Nieznany";
                const playerB = allUsers.find(u => u.id === match.playerB)?.nick || match.playerBName || "Nieznany";
                
                // Calculate game wins properly
                const winsA = match.games.filter(game => game.winner === 'A').length;
                const winsB = match.games.filter(game => game.winner === 'B').length;
                
                // Check for break runs
                const hasBreakRun = match.games.some(game => game.breakAndRun);
                
                // Get unique game types played in this match
                const gameTypes = match.gameTypes || 
                  Array.from(new Set(match.games.map(g => g.type || '8-ball'))).join(", ");
                
                return (
                  <TableRow key={match.id}>
                    <TableCell>{new Date(match.date).toLocaleDateString()}</TableCell>
                    <TableCell className={match.winner === match.playerA ? "font-bold" : ""}>
                      {playerA}
                    </TableCell>
                    <TableCell className={match.winner === match.playerB ? "font-bold" : ""}>
                      {playerB}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {winsA} - {winsB}
                        {hasBreakRun && (
                          <span className="ml-2">
                            <Zap className="h-4 w-4 text-yellow-500" aria-label="Zejście z kija" />
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                        {gameTypes}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTimeElapsed(match.timeElapsed)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {match.winner === match.playerA ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                          Wygrana {playerA}
                        </span>
                      ) : match.winner === match.playerB ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                          Wygrana {playerB}
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
                  <TableCell colSpan={7} className="text-center py-4">
                    Brak meczów w tym sezonie
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <BackButton />
    </div>
  );
};

export default SeasonDetails;
