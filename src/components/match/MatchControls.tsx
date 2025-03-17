
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trophy } from 'lucide-react';

interface MatchControlsProps {
  breakRule: 'winner' | 'alternate';
  nextBreakPlayerName: string;
  isMatchFinished: boolean;
  onToggleBreakRule: () => void;
  onEndMatch: () => void;
}

const MatchControls: React.FC<MatchControlsProps> = ({
  breakRule,
  nextBreakPlayerName,
  isMatchFinished,
  onToggleBreakRule,
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
      
      <Button 
        variant="default" 
        className="w-full flex items-center justify-center gap-2"
        onClick={onEndMatch}
      >
        <Trophy className="w-5 h-5" />
        Zakończ mecz
      </Button>
    </>
  );
};

export default MatchControls;
