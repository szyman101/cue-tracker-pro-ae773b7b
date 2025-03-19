
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Match } from '@/types';
import GameHistory from '@/components/match/GameHistory';
import BackButton from '@/components/BackButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Trophy, Zap, Circle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const MatchView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { matches, getUserById, getActiveSeasons, getUserPointsInSeason } = useData();
  
  // Find the match by ID
  const match = matches.find(m => m.id === id);
  
  const [timeElapsed, setTimeElapsed] = useState('--:--');
  
  useEffect(() => {
    if (match?.timeElapsed) {
      // Format time from seconds to MM:SS
      const minutes = Math.floor(match.timeElapsed / 60);
      const seconds = match.timeElapsed % 60;
      setTimeElapsed(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }
  }, [match]);
  
  if (!match) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertTitle>Mecz nie znaleziony</AlertTitle>
          <AlertDescription>Nie znaleziono meczu o podanym identyfikatorze.</AlertDescription>
        </Alert>
        <div className="mt-4">
          <BackButton />
        </div>
      </div>
    );
  }
  
  const playerA = getUserById(match.playerA);
  const playerB = getUserById(match.playerB);
  const playerAName = match.playerAName || playerA?.nick || 'Gracz A';
  const playerBName = match.playerBName || playerB?.nick || 'Gracz B';
  
  // Calculate additional stats
  const breakRunsA = match.games.filter(game => game.winner === 'A' && game.breakAndRun).length;
  const breakRunsB = match.games.filter(game => game.winner === 'B' && game.breakAndRun).length;
  const winsA = match.games.filter(game => game.winner === 'A').length;
  const winsB = match.games.filter(game => game.winner === 'B').length;
  
  // Get season info if match is part of a season
  const activeSeason = match.seasonId ? getActiveSeasons().find(s => s.id === match.seasonId) : null;
  
  // Get game type (use the first game's type or default to "8-ball")
  const gameTypes = match.gameTypes || 
    (match.games.length > 0 ? match.games.map(game => game.type) : ["8-ball"]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Circle className="h-6 w-6 text-primary" aria-label="Match details" />
            Szczegóły meczu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Circle className="h-4 w-4 text-primary" aria-label="Player" />
                <span className="font-medium">Gracz 1:</span> {playerAName}
              </div>
              <div className="flex items-center gap-2">
                <Circle className="h-4 w-4 text-primary" aria-label="Player" />
                <span className="font-medium">Gracz 2:</span> {playerBName}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" aria-label="Date" />
                <span className="font-medium">Data:</span> {new Date(match.date).toLocaleDateString()}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Circle className="h-4 w-4" aria-label="Game type" />
                <span className="font-medium">Typ gry:</span> {gameTypes.join(', ')}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" aria-label="Duration" />
                <span className="font-medium">Czas trwania:</span> {timeElapsed}
              </div>
              {match.winner && (
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-600" aria-label="Winner" />
                  <span className="font-medium">Zwycięzca:</span> {match.winner === match.playerA ? playerAName : playerBName}
                  <span className="text-sm">({winsA} - {winsB})</span>
                </div>
              )}
            </div>
          </div>
          
          {(breakRunsA > 0 || breakRunsB > 0) && (
            <div className="mb-6 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <h3 className="text-lg font-medium flex items-center mb-2">
                <Zap className="h-4 w-4 mr-2 text-amber-600" aria-label="Break runs" />
                Zejścia z kija
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">{playerAName}:</span> {breakRunsA}
                </div>
                <div>
                  <span className="font-medium">{playerBName}:</span> {breakRunsB}
                </div>
              </div>
            </div>
          )}
          
          <GameHistory 
            games={match.games} 
            playerAName={playerAName} 
            playerBName={playerBName} 
          />
          
          {match.notes && (
            <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <h3 className="font-medium mb-1">Notatki:</h3>
              <p>{match.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <BackButton />
    </div>
  );
};

export default MatchView;
