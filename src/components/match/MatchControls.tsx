
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trophy } from 'lucide-react';

interface MatchControlsProps {
  breakRule: 'winner' | 'alternate';
  nextBreakPlayerName: string;
  playerAName: string;
  playerBName: string;
  isMatchFinished: boolean;
  onToggleBreakRule: () => void;
  onFinishGame: (winner: 'A' | 'B') => void;
  onEndMatch: () => void;
}

const MatchControls: React.FC<MatchControlsProps> = ({
  breakRule,
  nextBreakPlayerName,
  playerAName,
  playerBName,
  isMatchFinished,
  onToggleBreakRule,
  onFinishGame,
  onEndMatch
}) => {
  return (
    <>
      <Button variant="outline" onClick={onToggleBreakRule}>
        {breakRule === 'winner' ? 'Rozbija zwycięzca' : 'Rozbicie na zmianę'}
      </Button>
      
      <div className="text-center">
        <span className="text-sm">Następne rozbicie:</span>
        <span className="ml-2 font-bold">{nextBreakPlayerName}</span>
      </div>
      
      <div className="flex gap-2 w-full">
        <Button 
          variant="secondary" 
          className="flex-1"
          onClick={() => onFinishGame('A')}
        >
          {playerAName} wygrywa partię
        </Button>
        <Button 
          variant="secondary"
          className="flex-1"
          onClick={() => onFinishGame('B')}
        >
          {playerBName} wygrywa partię
        </Button>
      </div>
      
      {isMatchFinished && (
        <Button 
          variant="default" 
          className="w-full flex items-center justify-center gap-2"
          onClick={onEndMatch}
        >
          <Trophy className="w-5 h-5" />
          Zakończ mecz
        </Button>
      )}
    </>
  );
};

export default MatchControls;
