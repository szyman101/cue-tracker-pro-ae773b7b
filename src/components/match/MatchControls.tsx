
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trophy, Circle } from 'lucide-react';

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
      <Button 
        variant="outline" 
        onClick={onToggleBreakRule}
        className="border-primary/30 bg-primary/5 hover:bg-primary/10"
      >
        <Circle className="h-4 w-4 mr-2 text-primary" aria-label="Break rule" />
        {breakRule === 'winner' ? 'Rozbija zwycięzca' : 'Rozbicie na zmianę'}
      </Button>
      
      <div className="text-center px-3 py-1 rounded-full bg-primary/10 flex items-center">
        <img 
          src="/lovable-uploads/42dedce4-b6f5-4c64-8f0a-ef55fb5ee4e9.png" 
          alt="Billiard ball" 
          className="w-4 h-4 mr-2" 
        />
        <span className="text-sm">Następne rozbicie:</span>
        <span className="ml-2 font-bold">{nextBreakPlayerName}</span>
      </div>
      
      <Button 
        variant="default" 
        className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white flex items-center justify-center gap-2"
        onClick={onEndMatch}
      >
        <Trophy className="w-5 h-5" />
        Zakończ mecz
      </Button>
    </>
  );
};

export default MatchControls;
