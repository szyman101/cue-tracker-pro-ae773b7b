
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { GameResult } from '@/types';

interface GameHistoryProps {
  games: GameResult[];
  playerAName: string;
  playerBName: string;
}

const GameHistory: React.FC<GameHistoryProps> = ({ games, playerAName, playerBName }) => {
  if (games.length === 0) return null;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historia partii</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {games.map((game, index) => (
            <div key={index} className="flex justify-between p-2 border rounded">
              <div>Partia {index + 1} ({game.type})</div>
              <div className="font-medium">
                {playerAName} {game.scoreA} - {game.scoreB} {playerBName}
                {game.breakAndRun && " (BR)"}
              </div>
              <div>
                Wygrał: {game.winner === 'A' ? playerAName : game.winner === 'B' ? playerBName : 'Remis'}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default GameHistory;
