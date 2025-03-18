
import React from 'react';
import { Button } from '@/components/ui/button';
import { CircleDot, Flag, Plus, Minus } from 'lucide-react';

interface ScoreCounterProps {
  playerName: string;
  isBreak: boolean;
  score: number;
  wins: number;
  gamesToWin: number;
  breakRuns: number;
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
  onScoreChange,
  onBreakAndRun
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center">
        <h2 className="text-3xl font-bold text-center mb-1 flex items-center justify-center">
          {playerName} 
          {isBreak && (
            <div className="ml-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full flex items-center">
              <Flag className="w-3 h-3 mr-1" /> 
              ROZBIJA
            </div>
          )}
        </h2>
        <div className="text-sm mb-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs p-1 h-6"
            onClick={onBreakAndRun}
          >
            <CircleDot className="w-4 h-4 mr-1" /> 
            <span>Zejście z kija ({breakRuns})</span>
          </Button>
        </div>
      </div>
      
      <div className="text-9xl font-bold text-center my-4">
        {score}
      </div>
      
      <div className="flex gap-2 justify-center">
        <Button
          variant="secondary"
          size="lg"
          onClick={() => onScoreChange(true)}
        >
          <Plus className="w-5 h-5" />
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={() => onScoreChange(false)}
        >
          <Minus className="w-5 h-5" />
        </Button>
      </div>
      
      <div className="text-center mt-2">
        <div className="text-lg font-semibold">Wygrane: {wins}</div>
        <div className="text-sm text-muted-foreground">
          z {gamesToWin} potrzebnych
        </div>
      </div>
    </div>
  );
};

export default ScoreCounter;
