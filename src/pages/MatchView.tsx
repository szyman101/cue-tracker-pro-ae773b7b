
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CircleDot, Flag, Plus, Minus, Timer } from 'lucide-react';
import { GameResult, Match } from '@/types';
import { format } from 'date-fns';

const MatchView = () => {
  const location = useLocation();
  const { getUserById } = useData();
  const match = location.state?.match as Match;
  
  const [currentGame, setCurrentGame] = useState<GameResult>({
    type: '8-ball',
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

  const playerA = getUserById(match.playerA);
  const playerB = getUserById(match.playerB);

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
        // Update next break based on break rule
        if (breakRule === 'winner') {
          setNextBreak(player);
        } else {
          setNextBreak(player === 'A' ? 'B' : 'A');
        }
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

    // Update next break based on break rule
    if (breakRule === 'winner') {
      setNextBreak(player);
    } else {
      setNextBreak(player === 'A' ? 'B' : 'A');
    }
  };

  const toggleBreakRule = () => {
    setBreakRule(prev => prev === 'winner' ? 'alternate' : 'winner');
  };

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
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">{playerA?.nick} {nextBreak === 'A' && <Flag className="inline-block w-4 h-4 ml-1" />}</h2>
                <div className="text-sm">
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
            </div>
            
            {/* Player B */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">{playerB?.nick} {nextBreak === 'B' && <Flag className="inline-block w-4 h-4 ml-1" />}</h2>
                <div className="text-sm">
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
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={toggleBreakRule}>
          {breakRule === 'winner' ? 'Rozbija zwycięzca' : 'Rozbicie na zmianę'}
        </Button>
        <div className="text-center">
          <span className="text-sm">Następne rozbicie:</span>
          <span className="ml-2 font-bold">
            {nextBreak === 'A' ? playerA?.nick : playerB?.nick}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MatchView;
