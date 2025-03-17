
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatsCards from "@/components/dashboard/StatsCards";
import SeasonManagement from "@/components/dashboard/SeasonManagement";
import MatchHistory from "@/components/dashboard/MatchHistory";
import SeasonHistory from "@/components/dashboard/SeasonHistory";
import AdminControls from "@/components/dashboard/AdminControls";
import UserControls from "@/components/dashboard/UserControls";
import BackButton from "@/components/BackButton";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const Dashboard = () => {
  const { currentUser, isAdmin, logout } = useAuth();
  const { 
    getUserMatches, 
    getUserSeasons, 
    getActiveSeasons, 
    clearSeasons, 
    clearMatches
  } = useData();

  const userMatches = currentUser ? getUserMatches(currentUser.id) : [];
  const userSeasons = currentUser ? getUserSeasons(currentUser.id) : [];
  const activeSeasons = getActiveSeasons();

  const totalMatchesPlayed = userMatches.length;
  const matchesWon = userMatches.filter(match => match.winner === currentUser?.id).length;
  const winRate = totalMatchesPlayed > 0 ? Math.round((matchesWon / totalMatchesPlayed) * 100) : 0;

  const clearMatchesAndSeasons = () => {
    clearMatches();
    clearSeasons();
  };

  return (
    <div className="container mx-auto py-6 space-y-6 relative">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Logo size="small" />
          <h1 className="text-3xl font-bold">
            Witaj, {currentUser?.nick} {isAdmin && "(Administrator)"}
          </h1>
        </div>
        <div className="flex gap-4">
          {isAdmin ? (
            <AdminControls clearMatchesAndSeasons={clearMatchesAndSeasons} />
          ) : (
            <UserControls />
          )}
          <Button variant="outline" onClick={logout} className="ml-2">
            <LogOut className="w-4 h-4 mr-2" />
            Wyloguj
          </Button>
        </div>
      </div>

      <StatsCards 
        totalMatchesPlayed={totalMatchesPlayed}
        matchesWon={matchesWon}
        winRate={winRate}
        activeSeasons={activeSeasons}
        userSeasons={userSeasons}
        currentUser={currentUser}
      />

      {isAdmin && (
        <SeasonManagement activeSeasons={activeSeasons} />
      )}

      <Tabs defaultValue="history" className="space-y-4">
        <TabsList>
          <TabsTrigger value="history">Historia Meczów</TabsTrigger>
          <TabsTrigger value="seasons">Sezony</TabsTrigger>
        </TabsList>
        <TabsContent value="history" className="space-y-4">
          <MatchHistory 
            userMatches={userMatches} 
            userSeasons={userSeasons} 
            currentUser={currentUser} 
          />
        </TabsContent>
        <TabsContent value="seasons" className="space-y-4">
          <SeasonHistory userSeasons={userSeasons} currentUser={currentUser} />
          {activeSeasons.length > 0 && !isAdmin && (
            <SeasonManagement activeSeasons={activeSeasons} />
          )}
        </TabsContent>
      </Tabs>

      <BackButton />
    </div>
  );
};

export default Dashboard;
