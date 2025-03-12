
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Calendar, Users, History } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { currentUser, isAdmin } = useAuth();
  const { getUserMatches, getUserSeasons, getActiveSeasons } = useData();

  const userMatches = currentUser ? getUserMatches(currentUser.id) : [];
  const userSeasons = currentUser ? getUserSeasons(currentUser.id) : [];
  const activeSeasons = getActiveSeasons();

  const totalMatchesPlayed = userMatches.length;
  const matchesWon = userMatches.filter(match => match.winner === currentUser?.id).length;
  const winRate = totalMatchesPlayed > 0 ? Math.round((matchesWon / totalMatchesPlayed) * 100) : 0;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          Witaj, {currentUser?.nick} {isAdmin && "(Administrator)"}
        </h1>
        <div className="flex gap-4">
          <Button asChild>
            <Link to="/new-match">Nowy Mecz</Link>
          </Button>
          {isAdmin && (
            <Button variant="outline" asChild>
              <Link to="/admin">Panel Admina</Link>
            </Button>
          )}
        </div>
      </div>

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

      <Tabs defaultValue="history" className="space-y-4">
        <TabsList>
          <TabsTrigger value="history">Historia Meczów</TabsTrigger>
          <TabsTrigger value="seasons">Sezony</TabsTrigger>
        </TabsList>
        <TabsContent value="history" className="space-y-4">
          <div className="rounded-md border">
            <div className="grid grid-cols-5 p-4 font-medium">
              <div>Data</div>
              <div>Gracz A</div>
              <div>Gracz B</div>
              <div>Wynik</div>
              <div>Sezon</div>
            </div>
            <div className="divide-y">
              {userMatches.slice(0, 10).map((match) => {
                const playerA = match.playerA === currentUser?.id ? currentUser.nick : "Przeciwnik";
                const playerB = match.playerB === currentUser?.id ? currentUser.nick : "Przeciwnik";
                const season = userSeasons.find(s => s.id === match.seasonId);

                return (
                  <div key={match.id} className="grid grid-cols-5 p-4 hover:bg-muted/50">
                    <div>{new Date(match.date).toLocaleDateString()}</div>
                    <div className={match.winner === match.playerA ? "font-bold" : ""}>{playerA}</div>
                    <div className={match.winner === match.playerB ? "font-bold" : ""}>{playerB}</div>
                    <div>
                      {match.games.filter(g => g.winner === "A").length} - {match.games.filter(g => g.winner === "B").length}
                    </div>
                    <div>{season?.name || "Towarzyski"}</div>
                  </div>
                );
              })}
              {userMatches.length === 0 && (
                <div className="p-4 text-center text-muted-foreground">Brak historii meczów</div>
              )}
            </div>
          </div>
          {userMatches.length > 10 && (
            <div className="flex justify-center">
              <Button variant="outline" asChild>
                <Link to="/history">Zobacz więcej</Link>
              </Button>
            </div>
          )}
        </TabsContent>
        <TabsContent value="seasons" className="space-y-4">
          <div className="rounded-md border">
            <div className="grid grid-cols-4 p-4 font-medium">
              <div>Nazwa sezonu</div>
              <div>Data rozpoczęcia</div>
              <div>Mecze</div>
              <div>Status</div>
            </div>
            <div className="divide-y">
              {userSeasons.map((season) => (
                <div key={season.id} className="grid grid-cols-4 p-4 hover:bg-muted/50">
                  <div>{season.name}</div>
                  <div>{new Date(season.startDate).toLocaleDateString()}</div>
                  <div>{season.matches.length}</div>
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
                </div>
              ))}
              {userSeasons.length === 0 && (
                <div className="p-4 text-center text-muted-foreground">Brak sezonów</div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
