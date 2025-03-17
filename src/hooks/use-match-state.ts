
import { useState, useEffect } from 'react';
import { Match, GameResult } from '@/types';

interface UseMatchStateProps {
  match: Match;
}

export const useMatchState = ({ match }: UseMatchStateProps) => {
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
        
        // Update next break based on break rule only when incrementing score
        if (breakRule === 'winner') {
          // If winner breaks, the player who scored gets the next break
          setNextBreak(player);
        } else if (breakRule === 'alternate') {
          // Toggle the breaking player after each score change
          setNextBreak(currentBreak => (currentBreak === 'A' ? 'B' : 'A'));
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
    
    // Update next break based on the break rule
    if (breakRule === 'winner') {
      // Winner of the break and run gets the next break
      setNextBreak(player);
    } else if (breakRule === 'alternate') {
      // Toggle break for next player
      setNextBreak(player === 'A' ? 'B' : 'A');
    }
  };

  const toggleBreakRule = () => {
    setBreakRule(prev => {
      const newRule = prev === 'winner' ? 'alternate' : 'winner';
      return newRule;
    });
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
      // If winner breaks rule is active, the winner of the game gets the break
      setNextBreak(winner);
    } else if (breakRule === 'alternate') {
      // If alternate breaks rule is active, alternate the break
      setNextBreak(nextBreak === 'A' ? 'B' : 'A');
    }
  };

  const gamesToWin = match?.gamesToWin || 3;
  const isMatchFinished = winsA >= gamesToWin || winsB >= gamesToWin;

  return {
    currentGame,
    breakRule,
    nextBreak,
    breakRunsA,
    breakRunsB,
    startTime,
    currentTime,
    games,
    winsA,
    winsB,
    gamesToWin,
    isMatchFinished,
    calculateTimeElapsed,
    handleScore,
    handleBreakAndRun,
    toggleBreakRule,
    finishCurrentGame,
    setGames
  };
};
