
import React from "react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Eye, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

interface MatchActionsProps {
  matchId: string;
  onDelete: (matchId: string) => void;
}

const MatchActions: React.FC<MatchActionsProps> = ({ matchId, onDelete }) => {
  return (
    <div className="flex justify-end gap-2">
      <Button size="sm" variant="ghost" asChild>
        <Link to={`/match/${matchId}`}>
          <Eye className="h-4 w-4" />
        </Link>
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="ghost" className="text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno chcesz usunąć ten mecz?</AlertDialogTitle>
            <AlertDialogDescription>
              Ta akcja usunie mecz z historii i nie można jej cofnąć.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(matchId)}>
              Usuń mecz
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MatchActions;
