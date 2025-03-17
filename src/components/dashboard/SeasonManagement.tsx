
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CheckCircle, Trash2 } from "lucide-react";
import { Season } from "@/types";
import { toast } from "@/hooks/use-toast";
import { useData } from "@/contexts/DataContext";

interface SeasonManagementProps {
  activeSeasons: Season[];
}

const SeasonManagement: React.FC<SeasonManagementProps> = ({ activeSeasons }) => {
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>("");
  const { deleteSeason, endSeason } = useData();
  
  const handleDeleteSeason = () => {
    if (selectedSeasonId) {
      deleteSeason(selectedSeasonId);
      setSelectedSeasonId("");
      toast({
        title: "Sezon usunięty",
        description: "Wybrany sezon został usunięty z systemu",
      });
    } else {
      toast({
        title: "Błąd",
        description: "Nie wybrano żadnego sezonu",
        variant: "destructive",
      });
    }
  };

  const handleEndSeason = () => {
    if (selectedSeasonId) {
      endSeason(selectedSeasonId);
      setSelectedSeasonId("");
      toast({
        title: "Sezon zakończony",
        description: "Wybrany sezon został oznaczony jako zakończony",
      });
    } else {
      toast({
        title: "Błąd",
        description: "Nie wybrano żadnego sezonu",
        variant: "destructive",
      });
    }
  };

  if (activeSeasons.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Zarządzanie Sezonami</CardTitle>
        <CardDescription>Zakończ lub usuń aktywne sezony</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="season-select">Wybierz aktywny sezon</Label>
            <Select
              value={selectedSeasonId}
              onValueChange={setSelectedSeasonId}
            >
              <SelectTrigger id="season-select">
                <SelectValue placeholder="Wybierz sezon" />
              </SelectTrigger>
              <SelectContent>
                {activeSeasons.map((season) => (
                  <SelectItem key={season.id} value={season.id}>
                    {season.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end space-x-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  disabled={!selectedSeasonId}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Zakończ sezon
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Zakończ sezon</AlertDialogTitle>
                  <AlertDialogDescription>
                    Czy na pewno chcesz zakończyć ten sezon? Sezon zostanie oznaczony jako nieaktywny.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Anuluj</AlertDialogCancel>
                  <AlertDialogAction onClick={handleEndSeason}>Tak, zakończ sezon</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={!selectedSeasonId}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Usuń sezon
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Usuń sezon</AlertDialogTitle>
                  <AlertDialogDescription>
                    Czy na pewno chcesz usunąć ten sezon? Ta operacja jest nieodwracalna.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Anuluj</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteSeason}>Tak, usuń sezon</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SeasonManagement;
