
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CircleR } from 'lucide-react';
import { GameResult, Match } from '@/types';

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

  const playerA = getUserById(match.playerA);
  const playerB = getUserById(match.playerB);

  const handleScore = (player: 'A' | 'B') => {
    setCurrentGame(prev => ({
      ...prev,
      [`score${player}`]: prev[`score${player}` as 'scoreA' | 'scoreB'] + 1
    }));
  };

  const handleBreakAndRun = (player: 'A' | 'B') => {
    const winner = player;
    setCurrentGame(prev => ({
      ...prev,
      winner,
      breakAndRun: true,
      [`score${player}`]: prev[`score${player}` as 'scoreA' | 'scoreB'] + 1
    }));

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

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-6 text-center">
          <h2 className="text-xl font-bold mb-4">{playerA?.nick}</h2>
          <div className="text-6xl font-bold mb-4" onClick={() => handleScore('A')}>
            {currentGame.scoreA}
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="gap-2"
            onClick={() => handleBreakAndRun('A')}
          >
            <CircleR className="w-4 h-4" /> Zejście z kija
          </Button>
        </Card>

        <Card className="p-6 text-center">
          <h2 className="text-xl font-bold mb-4">{playerB?.nick}</h2>
          <div className="text-6xl font-bold mb-4" onClick={() => handleScore('B')}>
            {currentGame.scoreB}
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="gap-2"
            onClick={() => handleBreakAndRun('B')}
          >
            <CircleR className="w-4 h-4" /> Zejście z kija
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default MatchView;
