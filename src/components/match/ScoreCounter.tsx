
import React from 'react';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Zap, Circle } from 'lucide-react';

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
    <div className={`p-4 rounded-lg border-2 bg-white dark:bg-gray-800 ${isBreak ? 'border-primary shadow-md' : 'border-gray-200 dark:border-gray-700'}`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold flex items-center">
          <Circle className="h-5 w-5 mr-2 text-primary" aria-label="Player" />
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

      <div className="relative mb-4">
        <div className="text-6xl font-bold text-center py-4">{score}</div>
        <div className="absolute -inset-1 rounded-md bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 z-[-1] opacity-70"></div>
      </div>

      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => onScoreChange(false)}
          disabled={score === 0}
          className="hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <Minus className="h-4 w-4" />
        </Button>
        
        <div className="text-sm">
          <span className="flex items-center">
            <Zap className="h-3 w-3 mr-1 text-amber-600" aria-label="Break runs" />
            Zejścia z kija: {breakRuns}
          </span>
        </div>
        
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => onScoreChange(true)}
          className="hover:bg-green-50 dark:hover:bg-green-900/20"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <Button 
        variant="outline" 
        className="w-full mt-4 text-amber-600 border-amber-200 bg-amber-50 hover:bg-amber-100 hover:text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:hover:bg-amber-900/40"
        onClick={onBreakAndRun}
      >
        <Zap className="h-4 w-4 mr-2" />
        Zejście z kija (+1)
      </Button>
    </div>
  );
};

export default ScoreCounter;
