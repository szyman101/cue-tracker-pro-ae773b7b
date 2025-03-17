
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

interface AdminControlsProps {
  clearMatchesAndSeasons: () => void;
}

const AdminControls: React.FC<AdminControlsProps> = ({ clearMatchesAndSeasons }) => {
  const handleClearAll = () => {
    clearMatchesAndSeasons();
    toast({
      title: "Dane wyczyszczone",
      description: "Wszystkie mecze i sezony zostały usunięte",
    });
  };

  return (
    <div className="flex gap-4">
      <Button asChild>
        <Link to="/new-match">Nowy Mecz</Link>
      </Button>
      <Button variant="outline" asChild>
        <Link to="/new-season">Nowy Sezon</Link>
      </Button>
      <Button variant="outline" asChild>
        <Link to="/admin">Panel Admina</Link>
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">
            <Trash2 className="w-4 h-4 mr-2" />
            Wyczyść dane
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno chcesz wyczyścić wszystkie dane?</AlertDialogTitle>
            <AlertDialogDescription>
              Ta akcja usunie wszystkie zapisane mecze i sezony. Operacja jest nieodwracalna.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearAll}>Tak, wyczyść wszystko</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminControls;
