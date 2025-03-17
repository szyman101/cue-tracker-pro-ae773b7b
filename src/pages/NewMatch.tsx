
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
  const { users, getActiveSeasons } = useData();
  const [opponent, setOpponent] = useState<string>('');
  const [gameType, setGameType] = useState<GameType>('8-ball');
  const [gamesToWin, setGamesToWin] = useState<string>('3');
  
  const activeSeasons = getActiveSeasons();
  const activeSeason = activeSeasons.length > 0 ? activeSeasons[0] : null;
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
      timeElapsed: 0,
      seasonId: activeSeason?.id,
      gamesToWin: parseInt(gamesToWin)
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
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Do ilu wygranych</label>
            <Select value={gamesToWin} onValueChange={setGamesToWin}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="7">7</SelectItem>
                <SelectItem value="9">9</SelectItem>
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
