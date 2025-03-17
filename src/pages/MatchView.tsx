
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { CircleDot, Flag, Plus, Minus, Timer, Trophy } from 'lucide-react';
import { GameResult, Match } from '@/types';
import { toast } from '@/hooks/use-toast';

const MatchView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getUserById, getActiveSeasons, addMatch, updateSeasonWithMatch } = useData();
  const match = location.state?.match as Match;
  
  const [currentGame, setCurrentGame] = useState<GameResult>({
    type: match?.games?.[0]?.type || '8-ball',
    scoreA: 0,
    scoreB: 0,
    winner: '',
  });
  
  const [breakRule, setBreakRule] = useState<'winner' | 'alternate'>('alternate');
  const [nextBreak, setNextBreak] = useState<'A' | 'B'>('A');
  const [breakRunsA, setBreakRunsA] = useState<number>(0);
  const [breakRunsB, setBreakRunsB] = useState<number>(0);
  const [startTime] = useState<Date>(new Date());
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [games, setGames] = useState<GameResult[]>(match?.games || []);
  const [winsA, setWinsA] = useState<number>(0);
  const [winsB, setWinsB] = useState<number>(0);

  const playerA = getUserById(match?.playerA);
  const playerB = getUserById(match?.playerB);
  const activeSeasons = getActiveSeasons();
  const activeSeason = match?.seasonId ? activeSeasons.find(s => s.id === match.seasonId) : null;

  // Calculate wins for each player
  useEffect(() => {
    let playerAWins = 0;
    let playerBWins = 0;
    
    games.forEach(game => {
      if (game.winner === 'A') playerAWins++;
      if (game.winner === 'B') playerBWins++;
    });
    
    setWinsA(playerAWins);
    setWinsB(playerBWins);
  }, [games]);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const calculateTimeElapsed = () => {
    const diffMs = currentTime.getTime() - startTime.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    return `${diffHrs.toString().padStart(2, '0')}:${diffMins.toString().padStart(2, '0')}:${diffSecs.toString().padStart(2, '0')}`;
  };

  const handleScore = (player: 'A' | 'B', increment: boolean) => {
    setCurrentGame(prev => {
      const scoreKey = `score${player}` as 'scoreA' | 'scoreB';
      let newScore = prev[scoreKey];
      
      if (increment) {
        newScore += 1;
      } else {
        newScore = Math.max(0, newScore - 1);
      }
      
      return {
        ...prev,
        [scoreKey]: newScore
      };
    });
  };

  const handleBreakAndRun = (player: 'A' | 'B') => {
    setCurrentGame(prev => ({
      ...prev,
      breakAndRun: true,
      [`score${player}`]: prev[`score${player}` as 'scoreA' | 'scoreB'] + 1
    }));

    // Increment break run counter
    if (player === 'A') {
      setBreakRunsA(prev => prev + 1);
    } else {
      setBreakRunsB(prev => prev + 1);
    }
  };

  const toggleBreakRule = () => {
    setBreakRule(prev => prev === 'winner' ? 'alternate' : 'winner');
  };

  const finishCurrentGame = (winner: 'A' | 'B') => {
    // Save current game
    const finishedGame = {
      ...currentGame,
      winner
    };
    
    const updatedGames = [...games, finishedGame];
    setGames(updatedGames);
    
    // Reset for next game
    setCurrentGame({
      type: currentGame.type,
      scoreA: 0,
      scoreB: 0,
      winner: ''
    });
    
    // Update break for next game based on rule
    if (breakRule === 'winner') {
      setNextBreak(winner);
    } else if (breakRule === 'alternate') {
      setNextBreak(nextBreak === 'A' ? 'B' : 'A');
    }
    
    toast({
      title: "Partia zakończona",
      description: `Wygrał ${winner === 'A' ? playerA?.nick : playerB?.nick}`,
    });
  };

  const endMatch = () => {
    // Calculate winner based on wins
    const matchWinner = winsA > winsB ? playerA?.id : winsB > winsA ? playerB?.id : 'tie';
    
    const updatedMatch: Match = {
      ...match,
      games,
      winner: matchWinner,
      timeElapsed: Math.floor((currentTime.getTime() - startTime.getTime()) / 1000)
    };
    
    // Save the match to the data store
    addMatch(updatedMatch);
    
    // If this match is part of a season, update the season
    if (match.seasonId) {
      updateSeasonWithMatch(match.seasonId, match.id);
    }
    
    toast({
      title: "Mecz zakończony",
      description: matchWinner === 'tie' 
        ? "Mecz zakończył się remisem" 
        : `Wygrał ${getUserById(matchWinner)?.nick}`,
    });
    
    navigate('/dashboard');
  };

  const gamesToWin = match?.gamesToWin || 3;
  const isMatchFinished = winsA >= gamesToWin || winsB >= gamesToWin;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">Scoreboard</CardTitle>
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              <span className="font-mono">{calculateTimeElapsed()}</span>
              <span className="ml-2 font-medium">{currentGame.type}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            {/* Player A */}
            <div className="space-y-4">
              <div className="flex flex-col items-center">
                <h2 className="text-3xl font-bold text-center mb-1">{playerA?.nick} {nextBreak === 'A' && <Flag className="inline-block w-4 h-4 ml-1" />}</h2>
                <div className="text-sm mb-3">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs p-1 h-6"
                    onClick={() => handleBreakAndRun('A')}
                  >
                    <CircleDot className="w-4 h-4 mr-1" /> 
                    <span>Zejście z kija ({breakRunsA})</span>
                  </Button>
                </div>
              </div>
              
              <div className="text-9xl font-bold text-center my-4">
                {currentGame.scoreA}
              </div>
              
              <div className="flex gap-2 justify-center">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => handleScore('A', true)}
                >
                  <Plus className="w-5 h-5" />
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => handleScore('A', false)}
                >
                  <Minus className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="text-center mt-2">
                <div className="text-lg font-semibold">Wygrane: {winsA}</div>
                <div className="text-sm text-muted-foreground">z {gamesToWin} potrzebnych</div>
              </div>
            </div>
            
            {/* Player B */}
            <div className="space-y-4">
              <div className="flex flex-col items-center">
                <h2 className="text-3xl font-bold text-center mb-1">{playerB?.nick} {nextBreak === 'B' && <Flag className="inline-block w-4 h-4 ml-1" />}</h2>
                <div className="text-sm mb-3">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs p-1 h-6"
                    onClick={() => handleBreakAndRun('B')}
                  >
                    <CircleDot className="w-4 h-4 mr-1" /> 
                    <span>Zejście z kija ({breakRunsB})</span>
                  </Button>
                </div>
              </div>
              
              <div className="text-9xl font-bold text-center my-4">
                {currentGame.scoreB}
              </div>
              
              <div className="flex gap-2 justify-center">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => handleScore('B', true)}
                >
                  <Plus className="w-5 h-5" />
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => handleScore('B', false)}
                >
                  <Minus className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="text-center mt-2">
                <div className="text-lg font-semibold">Wygrane: {winsB}</div>
                <div className="text-sm text-muted-foreground">z {gamesToWin} potrzebnych</div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center flex-wrap gap-4">
          <Button variant="outline" onClick={toggleBreakRule}>
            {breakRule === 'winner' ? 'Rozbija zwycięzca' : 'Rozbicie na zmianę'}
          </Button>
          
          <div className="text-center">
            <span className="text-sm">Następne rozbicie:</span>
            <span className="ml-2 font-bold">
              {nextBreak === 'A' ? playerA?.nick : playerB?.nick}
            </span>
          </div>
          
          <div className="flex gap-2 w-full">
            <Button 
              variant="secondary" 
              className="flex-1"
              onClick={() => finishCurrentGame('A')}
            >
              {playerA?.nick} wygrywa partię
            </Button>
            <Button 
              variant="secondary"
              className="flex-1"
              onClick={() => finishCurrentGame('B')}
            >
              {playerB?.nick} wygrywa partię
            </Button>
          </div>
          
          {isMatchFinished && (
            <Button 
              variant="default" 
              className="w-full flex items-center justify-center gap-2"
              onClick={endMatch}
            >
              <Trophy className="w-5 h-5" />
              Zakończ mecz
            </Button>
          )}
        </CardFooter>
      </Card>
      
      {games.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historia partii</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {games.map((game, index) => (
                <div key={index} className="flex justify-between p-2 border rounded">
                  <div>Partia {index + 1} ({game.type})</div>
                  <div className="font-medium">
                    {playerA?.nick} {game.scoreA} - {game.scoreB} {playerB?.nick}
                    {game.breakAndRun && " (BR)"}
                  </div>
                  <div>
                    Wygrał: {game.winner === 'A' ? playerA?.nick : game.winner === 'B' ? playerB?.nick : 'Remis'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MatchView;
