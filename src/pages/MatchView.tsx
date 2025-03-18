
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Match } from '@/types';
import { toast } from '@/hooks/use-toast';
import Scoreboard from '@/components/match/Scoreboard';
import GameHistory from '@/components/match/GameHistory';
import { useMatchState } from '@/hooks/use-match-state';
import BackButton from '@/components/BackButton';

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
    let finalGames = [...games];
    if (currentGame.scoreA > 0 || currentGame.scoreB > 0) {
      const winner = currentGame.scoreA > currentGame.scoreB ? 'A' : 'B';
      const finishedCurrentGame = {
        ...currentGame,
        winner
      };
      finalGames = [...finalGames, finishedCurrentGame];
    }
    
    console.log("Ending match with games:", finalGames);
    
    // Calculate winner based on wins
    const finalWinsA = finalGames.filter(g => g.winner === 'A').length;
    const finalWinsB = finalGames.filter(g => g.winner === 'B').length;
    console.log(`Final score - Player A: ${finalWinsA}, Player B: ${finalWinsB}`);
    
    const matchWinner = finalWinsA > finalWinsB ? playerA?.id : finalWinsB > finalWinsA ? playerB?.id : 'tie';
    
    // Calculate elapsed time in seconds
    const elapsedSeconds = Math.floor((currentTime.getTime() - startTime.getTime()) / 1000);
    
    // Make sure we have player names, defaulting to "Gracz A/B" if not available
    const playerAName = playerA?.nick || 'Gracz A';
    const playerBName = playerB?.nick || 'Gracz B';
    
    // Create a completely new match object with all required data
    const completedMatch: Match = {
      id: match.id,
      date: match.date,
      playerA: match.playerA,
      playerB: match.playerB,
      playerAName: playerAName,
      playerBName: playerBName,
      games: finalGames, // Use the finalGames array which includes all finished games
      winner: matchWinner,
      timeElapsed: elapsedSeconds,
      seasonId: typeof match.seasonId === 'string' ? match.seasonId : undefined,
      gamesToWin: match.gamesToWin
    };
    
    console.log('Saving match with player names:', completedMatch);
    
    // Save the match to the data store
    addMatch(completedMatch);
    
    // If this match is part of a season, update the season
    if (typeof match.seasonId === 'string' && match.seasonId) {
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
      
      <BackButton />
    </div>
  );
};

export default MatchView;
