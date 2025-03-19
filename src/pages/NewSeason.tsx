
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { GameType, Season } from '@/types';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import BackButton from '@/components/BackButton';

const NewSeason = () => {
  const navigate = useNavigate();
  const { addSeason } = useData();
  const [name, setName] = useState('');
  const [prize, setPrize] = useState('');
  const [matchesToWin, setMatchesToWin] = useState('3');
  const [selectedGameTypes, setSelectedGameTypes] = useState<GameType[]>(['8-ball']);
  const [description, setDescription] = useState('');

  const handleGameTypeToggle = (gameType: GameType) => {
    if (selectedGameTypes.includes(gameType)) {
      // Remove if at least one game type remains selected
      if (selectedGameTypes.length > 1) {
        setSelectedGameTypes(selectedGameTypes.filter(type => type !== gameType));
      }
    } else {
      setSelectedGameTypes([...selectedGameTypes, gameType]);
    }
  };

  const handleCreateSeason = () => {
    if (!name) {
      toast({
        title: "Błąd",
        description: "Nazwa sezonu jest wymagana",
        variant: "destructive",
      });
      return;
    }

    const newSeason: Season = {
      id: uuidv4(),
      name,
      startDate: new Date().toISOString(),
      gameTypes: selectedGameTypes,
      matchesToWin: parseInt(matchesToWin),
      breakRule: 'alternate',
      prize: prize || undefined,
      active: true,
      matches: [],
      description: description || undefined
    };

    addSeason(newSeason);

    toast({
      title: "Sezon utworzony",
      description: `Sezon "${name}" został pomyślnie utworzony!`,
    });

    navigate('/dashboard');
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Nowy sezon</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nazwa sezonu</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Podaj nazwę sezonu"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prize">Nagroda</Label>
            <Input 
              id="prize" 
              value={prize} 
              onChange={(e) => setPrize(e.target.value)} 
              placeholder="Podaj nagrodę za wygranie sezonu"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="matchesToWin">Liczba meczy do wygrania sezonu</Label>
            <Select value={matchesToWin} onValueChange={setMatchesToWin}>
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
          
          <div className="space-y-2">
            <Label htmlFor="description">Opis sezonu</Label>
            <Input 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Dodaj opis sezonu (opcjonalnie)"
            />
          </div>

          <div className="space-y-2">
            <Label>Typy gier w sezonie</Label>
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="8-ball" 
                  checked={selectedGameTypes.includes('8-ball')}
                  onCheckedChange={() => handleGameTypeToggle('8-ball')}
                  disabled={selectedGameTypes.length === 1 && selectedGameTypes.includes('8-ball')}
                />
                <Label htmlFor="8-ball" className="cursor-pointer">8-ball</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="9-ball" 
                  checked={selectedGameTypes.includes('9-ball')}
                  onCheckedChange={() => handleGameTypeToggle('9-ball')}
                  disabled={selectedGameTypes.length === 1 && selectedGameTypes.includes('9-ball')}
                />
                <Label htmlFor="9-ball" className="cursor-pointer">9-ball</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="10-ball" 
                  checked={selectedGameTypes.includes('10-ball')}
                  onCheckedChange={() => handleGameTypeToggle('10-ball')}
                  disabled={selectedGameTypes.length === 1 && selectedGameTypes.includes('10-ball')}
                />
                <Label htmlFor="10-ball" className="cursor-pointer">10-ball</Label>
              </div>
            </div>
          </div>

          <Button 
            className="w-full" 
            onClick={handleCreateSeason}
            disabled={!name}
          >
            Utwórz sezon
          </Button>
        </CardContent>
      </Card>
      
      <BackButton />
    </div>
  );
};

export default NewSeason;
