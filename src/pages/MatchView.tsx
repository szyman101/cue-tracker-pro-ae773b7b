
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Match } from '@/types';
import { toast } from '@/hooks/use-toast';
import Scoreboard from '@/components/match/Scoreboard';
import GameHistory from '@/components/match/GameHistory';
import BackButton from '@/components/BackButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
        <Card>
          <CardHeader>
            <CardTitle>Mecz nie znaleziony</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Nie znaleziono meczu o podanym identyfikatorze.</p>
            <BackButton />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const playerA = getUserById(match.playerA);
  const playerB = getUserById(match.playerB);
  const playerAName = match.playerAName || playerA?.nick || 'Gracz A';
  const playerBName = match.playerBName || playerB?.nick || 'Gracz B';
  
  // Calculate additional stats
  const winsA = match.games.filter(game => game.winner === 'A').length;
  const winsB = match.games.filter(game => game.winner === 'B').length;
  const breakRunsA = match.games.filter(game => game.winner === 'A' && game.breakAndRun).length;
  const breakRunsB = match.games.filter(game => game.winner === 'B' && game.breakAndRun).length;
  
  // Get season info if match is part of a season
  const activeSeason = match.seasonId ? getActiveSeasons().find(s => s.id === match.seasonId) : null;
  
  // Get current season points for each player if in a season
  const seasonPointsA = activeSeason ? getUserPointsInSeason(match.playerA, activeSeason.id) : 0;
  const seasonPointsB = activeSeason ? getUserPointsInSeason(match.playerB, activeSeason.id) : 0;
  
  // Get game type (use the first game's type or default to "8-ball")
  const currentGameType = match.games.length > 0 
    ? match.games[0].type 
    : (match.gameTypes && match.gameTypes.length > 0 ? match.gameTypes[0] : "8-ball");

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Szczegóły meczu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p><strong>Data:</strong> {new Date(match.date).toLocaleDateString()}</p>
            <p><strong>Typ gry:</strong> {match.gameTypes?.join(', ') || currentGameType}</p>
            <p><strong>Czas trwania:</strong> {timeElapsed}</p>
            {match.winner && (
              <p>
                <strong>Zwycięzca:</strong> {match.winner === match.playerA ? playerAName : playerBName}
              </p>
            )}
            {match.notes && <p><strong>Notatki:</strong> {match.notes}</p>}
          </div>
          
          <Scoreboard
            currentGameType={currentGameType}
            timeElapsed={timeElapsed}
            playerAName={playerAName}
            playerBName={playerBName}
            scoreA={0}
            scoreB={0}
            winsA={winsA}
            winsB={winsB}
            breakRunsA={breakRunsA}
            breakRunsB={breakRunsB}
            breakRule="alternate"
            nextBreak="A"
            gamesToWin={match.gamesToWin || 3}
            isMatchFinished={true}
            seasonId={match.seasonId}
            seasonPointsA={seasonPointsA}
            seasonPointsB={seasonPointsB}
            seasonPointsToWin={activeSeason?.matchesToWin}
            onScoreChange={() => {}}
            onBreakAndRun={() => {}}
            onToggleBreakRule={() => {}}
            onFinishGame={() => {}}
            onEndMatch={() => {}}
          />
          
          <GameHistory 
            games={match.games} 
            playerAName={playerAName} 
            playerBName={playerBName} 
          />
        </CardContent>
      </Card>
      
      <BackButton />
    </div>
  );
};

export default MatchView;
