
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Timer, Circle } from 'lucide-react';
import ScoreCounter from './ScoreCounter';
import MatchControls from './MatchControls';

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
  seasonId?: string;
  seasonPointsA?: number;
  seasonPointsB?: number;
  seasonPointsToWin?: number;
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
  seasonId,
  seasonPointsA = 0,
  seasonPointsB = 0,
  seasonPointsToWin = 0,
  onScoreChange,
  onBreakAndRun,
  onToggleBreakRule,
  onFinishGame,
  onEndMatch
}) => {
  return (
    <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold flex items-center">
            <Circle className="h-6 w-6 mr-2 text-primary" aria-label="Scoreboard" />
            Scoreboard
          </CardTitle>
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <Timer className="h-5 w-5 mr-1 text-gray-600 dark:text-gray-400" />
              <span className="font-mono">{timeElapsed}</span>
            </div>
            <div className="px-2 py-1 rounded-full bg-primary/10 text-sm font-medium">
              {currentGameType}
            </div>
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
            seasonPoints={seasonId ? seasonPointsA : undefined}
            seasonPointsToWin={seasonId ? seasonPointsToWin : undefined}
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
            seasonPoints={seasonId ? seasonPointsB : undefined}
            seasonPointsToWin={seasonId ? seasonPointsToWin : undefined}
            onScoreChange={(increment) => onScoreChange('B', increment)}
            onBreakAndRun={() => onBreakAndRun('B')}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center flex-wrap gap-4 border-t mt-4 pt-4">
        <MatchControls
          breakRule={breakRule}
          nextBreakPlayerName={nextBreak === 'A' ? playerAName : playerBName}
          isMatchFinished={isMatchFinished}
          onToggleBreakRule={onToggleBreakRule}
          onEndMatch={onEndMatch}
        />
      </CardFooter>
    </Card>
  );
};

export default Scoreboard;
