
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Timer, Flag } from 'lucide-react';
import ScoreCounter from './ScoreCounter';
import MatchControls from './MatchControls';
import { GameResult } from '@/types';

interface ScoreboardProps {
  currentGameType: string;
  timeElapsed: string;
  playerAName: string;
  playerBName: string;
  scoreA: number;
  scoreB: number;
  winsA: number;
  winsB: number;
  breakRunsA: number;
  breakRunsB: number;
  breakRule: 'winner' | 'alternate';
  nextBreak: 'A' | 'B';
  gamesToWin: number;
  isMatchFinished: boolean;
  onScoreChange: (player: 'A' | 'B', increment: boolean) => void;
  onBreakAndRun: (player: 'A' | 'B') => void;
  onToggleBreakRule: () => void;
  onFinishGame: (winner: 'A' | 'B') => void;
  onEndMatch: () => void;
}

const Scoreboard: React.FC<ScoreboardProps> = ({
  currentGameType,
  timeElapsed,
  playerAName,
  playerBName,
  scoreA,
  scoreB,
  winsA,
  winsB,
  breakRunsA,
  breakRunsB,
  breakRule,
  nextBreak,
  gamesToWin,
  isMatchFinished,
  onScoreChange,
  onBreakAndRun,
  onToggleBreakRule,
  onFinishGame,
  onEndMatch
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold">Scoreboard</CardTitle>
          <div className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            <span className="font-mono">{timeElapsed}</span>
            <span className="ml-2 font-medium">{currentGameType}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          {/* Player A */}
          <ScoreCounter
            playerName={playerAName}
            isBreak={nextBreak === 'A'}
            score={scoreA}
            wins={winsA}
            gamesToWin={gamesToWin}
            breakRuns={breakRunsA}
            onScoreChange={(increment) => onScoreChange('A', increment)}
            onBreakAndRun={() => onBreakAndRun('A')}
          />
          
          {/* Player B */}
          <ScoreCounter
            playerName={playerBName}
            isBreak={nextBreak === 'B'}
            score={scoreB}
            wins={winsB}
            gamesToWin={gamesToWin}
            breakRuns={breakRunsB}
            onScoreChange={(increment) => onScoreChange('B', increment)}
            onBreakAndRun={() => onBreakAndRun('B')}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center flex-wrap gap-4">
        <MatchControls
          breakRule={breakRule}
          nextBreakPlayerName={nextBreak === 'A' ? playerAName : playerBName}
          playerAName={playerAName}
          playerBName={playerBName}
          isMatchFinished={isMatchFinished}
          onToggleBreakRule={onToggleBreakRule}
          onFinishGame={onFinishGame}
          onEndMatch={onEndMatch}
        />
      </CardFooter>
    </Card>
  );
};

export default Scoreboard;
