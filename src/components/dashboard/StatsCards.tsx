
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History, Calendar, Trophy } from "lucide-react";
import { Season, User } from "@/types";

interface StatsCardsProps {
  totalMatchesPlayed: number;
  matchesWon: number;
  winRate: number;
  activeSeasons: Season[];
  userSeasons: Season[];
  currentUser: User | null;
  title?: string;
}

const StatsCards: React.FC<StatsCardsProps> = ({
  totalMatchesPlayed,
  matchesWon,
  winRate,
  activeSeasons,
  userSeasons,
  currentUser,
  title
}) => {
  return (
    <div className="space-y-2">
      {title && (
        <h2 className="text-xl font-semibold">{title}</h2>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rozegrane Mecze</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMatchesPlayed}</div>
            <p className="text-xs text-muted-foreground">
              Wygranych: {matchesWon} ({winRate}%)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktywne Sezony</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSeasons.length}</div>
            <p className="text-xs text-muted-foreground">
              Wszystkich sezonów: {userSeasons.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wygrane Sezony</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userSeasons.filter(season => season.winner === currentUser?.id).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Procent wygranych: {userSeasons.length > 0 
                ? Math.round((userSeasons.filter(season => season.winner === currentUser?.id).length / userSeasons.length) * 100) 
                : 0}%
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StatsCards;
