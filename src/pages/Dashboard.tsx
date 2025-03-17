import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";
import StatsCards from "@/components/dashboard/StatsCards";
import MatchHistory from "@/components/dashboard/MatchHistory";
import SeasonHistory from "@/components/dashboard/SeasonHistory";
import SeasonManagement from "@/components/dashboard/SeasonManagement";
import AdminControls from "@/components/dashboard/AdminControls";
import UserControls from "@/components/dashboard/UserControls";
import { calculateWinRate, calculateAverageScore, calculateBreaks } from "@/utils/stats";
import MigrationButton from "@/components/dashboard/MigrationButton";

const Dashboard = () => {
  const { currentUser, secondUser, isAdmin, isTwoPlayerMode, logout } = useAuth();
  const { getUserMatches, getUserSeasons, matches, seasons } = useData();

  const userMatches = currentUser ? getUserMatches(currentUser.id) : [];
  const userSeasons = currentUser ? getUserSeasons(currentUser.id) : [];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="space-x-2">
          {isAdmin && <Button asChild variant="outline"><Link to="/admin">Panel administratora</Link></Button>}
          <Button asChild><Link to="/new-match">Nowa gra</Link></Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <StatsCards
            totalMatches={userMatches.length}
            winRate={calculateWinRate(userMatches, currentUser?.id)}
            averageScore={calculateAverageScore(userMatches, currentUser?.id)}
            breaks={calculateBreaks(userMatches, currentUser?.id)}
          />

          <Card>
            <CardHeader>
              <CardTitle>Ostatnie mecze</CardTitle>
            </CardHeader>
            <CardContent>
              <MatchHistory 
                userMatches={userMatches} 
                userSeasons={userSeasons}
                currentUser={currentUser} 
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <UserControls />
          
          {/* Przycisk migracji danych */}
          <Card>
            <CardHeader>
              <CardTitle>Migracja danych</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                Przenieś swoje dane z lokalnego magazynu do Supabase, aby mieć do nich dostęp na różnych urządzeniach.
              </p>
              <MigrationButton />
            </CardContent>
          </Card>

          {isTwoPlayerMode && secondUser && (
            <Card>
              <CardHeader>
                <CardTitle>Drugi gracz</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar>
                    <AvatarFallback>{secondUser.nick.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{secondUser.nick}</p>
                    <p className="text-sm text-muted-foreground">{secondUser.role}</p>
                  </div>
                </div>
                <Button onClick={() => logout(true)} variant="outline" className="w-full">
                  <LogOut className="w-4 h-4 mr-2" />
                  Wyloguj drugiego gracza
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Moje sezony</CardTitle>
            </CardHeader>
            <CardContent>
              <SeasonHistory 
                userSeasons={userSeasons}
                currentUser={currentUser}
              />
              {isAdmin && (
                <div className="mt-4">
                  <SeasonManagement />
                </div>
              )}
            </CardContent>
          </Card>

          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle>Panel administratora</CardTitle>
              </CardHeader>
              <CardContent>
                <AdminControls />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
