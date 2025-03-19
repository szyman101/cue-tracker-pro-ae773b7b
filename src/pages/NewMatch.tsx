
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GameType, Match } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/hooks/use-toast';
import BackButton from '@/components/BackButton';
import { CueBall } from 'lucide-react';

const NewMatch = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { users, getActiveSeasons, addMatch } = useData();
  const [opponent, setOpponent] = useState<string>('');
  const [gameType, setGameType] = useState<GameType>('8-ball');
  const [gamesToWin, setGamesToWin] = useState<string>('3');
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>('');
  
  const activeSeasons = getActiveSeasons();
  const availableOpponents = users.filter(user => user.id !== currentUser?.id);

  // Filter game types based on selected season
  const selectedSeason = activeSeasons.find(season => season.id === selectedSeasonId);
  const availableGameTypes = selectedSeason?.gameTypes || ['8-ball', '9-ball', '10-ball'];

  const handleStartMatch = () => {
    if (!currentUser || !opponent) {
      toast({
        title: "Błąd",
        description: "Wybierz przeciwnika aby rozpocząć mecz",
        variant: "destructive"
      });
      return;
    }

    const opponentUser = users.find(user => user.id === opponent);
    
    const newMatch: Match = {
      id: uuidv4(),
      date: new Date().toISOString(),
      playerA: currentUser.id,
      playerB: opponent,
      playerAName: currentUser.nick,
      playerBName: opponentUser?.nick,
      games: [],
      winner: '',
      timeElapsed: 0,
      seasonId: selectedSeasonId && selectedSeasonId !== 'none' ? selectedSeasonId : undefined,
      gamesToWin: parseInt(gamesToWin),
      gameTypes: [gameType]
    };

    // Add match to data context
    addMatch(newMatch);
    
    // Navigate to match page
    navigate(`/match/${newMatch.id}?view=play`);
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CueBall className="h-6 w-6 mr-2 text-primary" aria-label="New Match" />
            Nowy mecz
          </CardTitle>
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
            <label className="text-sm font-medium">Sezon</label>
            <Select value={selectedSeasonId} onValueChange={setSelectedSeasonId}>
              <SelectTrigger>
                <SelectValue placeholder="Wybierz sezon (opcjonalnie)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Mecz towarzyski</SelectItem>
                {activeSeasons.map((season) => (
                  <SelectItem key={season.id} value={season.id}>
                    {season.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Typ gry</label>
            <Select 
              value={gameType} 
              onValueChange={(value) => setGameType(value as GameType)}
              disabled={selectedSeason && selectedSeason.gameTypes.length === 1}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableGameTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
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
                {[...Array(10)].map((_, index) => (
                  <SelectItem key={index + 1} value={(index + 1).toString()}>
                    {index + 1}
                  </SelectItem>
                ))}
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
      
      <BackButton />
    </div>
  );
};

export default NewMatch;
