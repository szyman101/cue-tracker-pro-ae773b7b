
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Match } from '@/types';
import { toast } from '@/hooks/use-toast';
import Scoreboard from '@/components/match/Scoreboard';
import GameHistory from '@/components/match/GameHistory';
import { useMatchState } from '@/hooks/use-match-state';

const MatchView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getUserById, getActiveSeasons, addMatch, updateSeasonWithMatch } = useData();
  const match = location.state?.match as Match;
  
  const {
    currentGame,
    breakRule,
    nextBreak,
    breakRunsA,
    breakRunsB,
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
    currentTime,
    startTime
  } = useMatchState({ match });

  const playerA = getUserById(match?.playerA);
  const playerB = getUserById(match?.playerB);
  const activeSeasons = getActiveSeasons();
  const activeSeason = match?.seasonId ? activeSeasons.find(s => s.id === match.seasonId) : null;

  const endMatch = () => {
    // First, finish the current game if there's a score
    if (currentGame.scoreA > 0 || currentGame.scoreB > 0) {
      const winner = currentGame.scoreA > currentGame.scoreB ? 'A' : 'B';
      finishCurrentGame(winner);
    }
    
    // Calculate winner based on wins
    const matchWinner = winsA > winsB ? playerA?.id : winsB > winsA ? playerB?.id : 'tie';
    
    // Calculate elapsed time in seconds
    const elapsedSeconds = Math.floor((currentTime.getTime() - startTime.getTime()) / 1000);
    
    // Create the updated match object with all required data
    const updatedMatch: Match = {
      ...match,
      playerA: match.playerA,
      playerB: match.playerB,
      games: [...games], // Make sure to use the latest games array
      winner: matchWinner,
      timeElapsed: elapsedSeconds,
      seasonId: match.seasonId
    };
    
    console.log('Saving match:', updatedMatch);
    
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

  const handleFinishGame = (winner: 'A' | 'B') => {
    finishCurrentGame(winner);
    
    toast({
      title: "Partia zakończona",
      description: `Wygrał ${winner === 'A' ? playerA?.nick : playerB?.nick}`,
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Scoreboard
        currentGameType={currentGame.type}
        timeElapsed={calculateTimeElapsed()}
        playerAName={playerA?.nick || ''}
        playerBName={playerB?.nick || ''}
        scoreA={currentGame.scoreA}
        scoreB={currentGame.scoreB}
        winsA={winsA}
        winsB={winsB}
        breakRunsA={breakRunsA}
        breakRunsB={breakRunsB}
        breakRule={breakRule}
        nextBreak={nextBreak}
        gamesToWin={gamesToWin}
        isMatchFinished={isMatchFinished}
        onScoreChange={handleScore}
        onBreakAndRun={handleBreakAndRun}
        onToggleBreakRule={toggleBreakRule}
        onFinishGame={handleFinishGame}
        onEndMatch={endMatch}
      />
      
      <GameHistory 
        games={games} 
        playerAName={playerA?.nick || ''} 
        playerBName={playerB?.nick || ''} 
      />
    </div>
  );
};

export default MatchView;
