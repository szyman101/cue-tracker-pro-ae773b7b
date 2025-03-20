
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { GameResult } from '@/types';
import { Circle, Zap } from 'lucide-react';

interface GameHistoryProps {
  games: GameResult[];
  playerAName: string;
  playerBName: string;
}

const GameHistory: React.FC<GameHistoryProps> = ({ games, playerAName, playerBName }) => {
  if (games.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Circle className="h-5 w-5 mr-2 text-primary" aria-label="Game history" />
            Historia partii
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-3">Brak rozegranych partii</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Circle className="h-5 w-5 mr-2 text-primary" aria-label="Game history" />
          Historia partii
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {games.map((game, index) => (
            <div key={index} className="p-3 border rounded-lg bg-white dark:bg-gray-800 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <div className="font-medium flex items-center">
                  <Circle className="h-4 w-4 mr-2 text-primary" aria-label="Game number" />
                  Partia {index + 1} ({game.type})
                </div>
                {game.breakAndRun && (
                  <div className="text-amber-600 dark:text-amber-500 flex items-center">
                    <Zap className="h-4 w-4 mr-1" aria-label="Break and run" />
                    Zejście z kija
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex flex-col items-center">
                  <span className="font-medium">{playerAName}</span>
                  <span className="text-2xl font-bold">{game.scoreA}</span>
                </div>
                
                <div className="text-center">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    game.winner === 'A' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                      : game.winner === 'B' 
                        ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
                  }`}>
                    {game.winner === 'A' 
                      ? `Wygrywa ${playerAName}` 
                      : game.winner === 'B' 
                        ? `Wygrywa ${playerBName}` 
                        : 'Remis'}
                  </div>
                </div>
                
                <div className="flex flex-col items-center">
                  <span className="font-medium">{playerBName}</span>
                  <span className="text-2xl font-bold">{game.scoreB}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default GameHistory;
