
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { useData } from "@/contexts/DataContext";

const UserControls: React.FC = () => {
  const { clearMatches } = useData();

  const handleClearHistory = () => {
    clearMatches();
    toast({
      title: "Historia wyczyszczona",
      description: "Wszystkie mecze zostały usunięte",
    });
  };

  return (
    <div className="flex gap-4 flex-wrap">
      <Button asChild>
        <Link to="/new-match">Nowy Mecz</Link>
      </Button>
      <Button variant="outline" asChild>
        <Link to="/new-season">Nowy Sezon</Link>
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">
            <Trash2 className="w-4 h-4 mr-2" />
            Wyczyść historię meczów
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno chcesz wyczyścić historię?</AlertDialogTitle>
            <AlertDialogDescription>
              Ta akcja usunie wszystkie zapisane mecze. Operacja jest nieodwracalna.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearHistory}>Tak, wyczyść</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserControls;
