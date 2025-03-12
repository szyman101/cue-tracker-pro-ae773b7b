
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GameType, Match } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const NewMatch = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { users } = useData();
  const [opponent, setOpponent] = useState<string>('');
  const [gameType, setGameType] = useState<GameType>('8-ball');
  
  const availableOpponents = users.filter(user => user.id !== currentUser?.id);

  const handleStartMatch = () => {
    if (!currentUser || !opponent) return;

    const newMatch: Match = {
      id: uuidv4(),
      date: new Date().toISOString(),
      playerA: currentUser.id,
      playerB: opponent,
      games: [],
      winner: '',
      timeElapsed: 0
    };

    navigate(`/match/${newMatch.id}`, { state: { match: newMatch } });
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Nowy mecz</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Przeciwnik</label>
            <Select value={opponent} onValueChange={setOpponent}>
              <SelectTrigger>
                <SelectValue placeholder="Wybierz przeciwnika" />
              </SelectTrigger>
              <SelectContent>
                {availableOpponents.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.nick}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Typ gry</label>
            <Select value={gameType} onValueChange={(value) => setGameType(value as GameType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="8-ball">8-ball</SelectItem>
                <SelectItem value="9-ball">9-ball</SelectItem>
                <SelectItem value="10-ball">10-ball</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            className="w-full" 
            onClick={handleStartMatch}
            disabled={!opponent}
          >
            Rozpocznij mecz
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewMatch;
