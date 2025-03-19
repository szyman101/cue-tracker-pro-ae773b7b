
import React from 'react';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Zap } from 'lucide-react';

interface ScoreCounterProps {
  playerName: string;
  isBreak: boolean;
  score: number;
  wins: number;
  gamesToWin: number;
  breakRuns: number;
  seasonPoints?: number;
  seasonPointsToWin?: number;
  onScoreChange: (increment: boolean) => void;
  onBreakAndRun: () => void;
}

const ScoreCounter: React.FC<ScoreCounterProps> = ({
  playerName,
  isBreak,
  score,
  wins,
  gamesToWin,
  breakRuns,
  seasonPoints,
  seasonPointsToWin,
  onScoreChange,
  onBreakAndRun
}) => {
  return (
    <div className={`p-4 rounded-lg border-2 ${isBreak ? 'border-primary' : 'border-gray-200 dark:border-gray-800'}`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold flex items-center">
          {playerName}
          {isBreak && <span className="ml-2 text-primary font-bold">(Break)</span>}
        </h3>
        <div className="text-sm">
          {seasonPoints !== undefined && seasonPointsToWin ? (
            <span>Wygrane mecze w sezonie: {seasonPoints} z {seasonPointsToWin}</span>
          ) : (
            <span>Wygrane: {wins} z {gamesToWin}</span>
          )}
        </div>
      </div>

      <div className="text-6xl font-bold text-center py-4">{score}</div>

      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => onScoreChange(false)}
          disabled={score === 0}
        >
          <Minus className="h-4 w-4" />
        </Button>
        
        <div className="text-sm">
          <span>Zejścia z kija: {breakRuns}</span>
        </div>
        
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => onScoreChange(true)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <Button 
        variant="outline" 
        className="w-full mt-4 text-yellow-600 border-yellow-600 hover:bg-yellow-100 hover:text-yellow-700"
        onClick={onBreakAndRun}
      >
        <Zap className="h-4 w-4 mr-2" />
        Zejście z kija (+1)
      </Button>
    </div>
  );
};

export default ScoreCounter;
