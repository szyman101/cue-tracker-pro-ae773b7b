
import React from "react";
import { Season, User } from "@/types";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

interface SeasonHistoryProps {
  userSeasons: Season[];
  currentUser: User | null;
}

const SeasonHistory: React.FC<SeasonHistoryProps> = ({ userSeasons, currentUser }) => {
  return (
    <div className="rounded-md border">
      <div className="grid grid-cols-6 p-4 font-medium">
        <div>Nazwa sezonu</div>
        <div>Data rozpoczęcia</div>
        <div>Mecze</div>
        <div>Nagroda</div>
        <div>Status</div>
        <div className="text-right">Akcje</div>
      </div>
      <div className="divide-y">
        {userSeasons.map((season) => (
          <div key={season.id} className="grid grid-cols-6 p-4 hover:bg-muted/50">
            <div>{season.name}</div>
            <div>{new Date(season.startDate).toLocaleDateString()}</div>
            <div>{season.matches.length}</div>
            <div>{season.prize || "-"}</div>
            <div>
              {season.active ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                  Aktywny
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100">
                  Zakończony
                </span>
              )}
              {season.winner === currentUser?.id && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100">
                  Zwycięzca
                </span>
              )}
            </div>
            <div className="text-right">
              <Button size="sm" variant="ghost" asChild>
                <Link to={`/season/${season.id}`}>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        ))}
        {userSeasons.length === 0 && (
          <div className="p-4 text-center text-muted-foreground">Brak sezonów</div>
        )}
      </div>
    </div>
  );
};

export default SeasonHistory;
