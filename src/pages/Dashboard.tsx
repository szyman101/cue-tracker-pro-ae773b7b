
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
import { LogOut, UserMinus, UserX } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const { currentUser, secondUser, isAdmin, logout, isTwoPlayerMode } = useAuth();
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

  // Statystyki dla głównego gracza
  const totalMatchesPlayed = userMatches.length;
  const matchesWon = userMatches.filter(match => match.winner === currentUser?.id).length;
  const winRate = totalMatchesPlayed > 0 ? Math.round((matchesWon / totalMatchesPlayed) * 100) : 0;

  // Statystyki dla drugiego gracza (jeśli jest)
  const secondUserMatches = secondUser ? getUserMatches(secondUser.id) : [];
  const secondUserSeasons = secondUser ? getUserSeasons(secondUser.id) : [];
  const secondUserMatchesWon = secondUserMatches.filter(match => match.winner === secondUser?.id).length;
  const secondUserWinRate = secondUserMatches.length > 0 
    ? Math.round((secondUserMatchesWon / secondUserMatches.length) * 100) 
    : 0;

  return (
    <div className="container mx-auto py-6 space-y-6 relative">
      {/* Logo background with 2% visibility */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none opacity-[0.02] z-0">
        <img 
          src="/lovable-uploads/0e728591-73b1-4b77-922d-298326332f43.png" 
          alt="Background Logo" 
          className="w-full h-full object-contain"
        />
      </div>
      
      <div className="flex justify-between items-center relative z-10">
        <div className="flex items-center gap-4">
          <Logo size="small" />
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              Witaj, {currentUser?.nick} {isAdmin && <Badge className="ml-2">Administrator</Badge>}
            </h1>
            {secondUser && (
              <p className="text-muted-foreground">
                Drugi gracz: {secondUser.nick}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-4">
          {isAdmin ? (
            <AdminControls />
          ) : (
            <UserControls />
          )}
          <div className="flex gap-2">
            {secondUser && (
              <Button variant="outline" onClick={() => logout(true)}>
                <UserX className="w-4 h-4 mr-2" />
                Wyloguj {secondUser.nick}
              </Button>
            )}
            <Button variant="outline" onClick={() => logout()}>
              <LogOut className="w-4 h-4 mr-2" />
              Wyloguj {currentUser?.nick}
            </Button>
          </div>
        </div>
      </div>

      {/* Główny gracz */}
      <StatsCards 
        totalMatchesPlayed={totalMatchesPlayed}
        matchesWon={matchesWon}
        winRate={winRate}
        activeSeasons={activeSeasons}
        userSeasons={userSeasons}
        currentUser={currentUser}
        title={isTwoPlayerMode ? `Statystyki gracza ${currentUser?.nick}` : undefined}
      />

      {/* Drugi gracz - jeśli jest */}
      {secondUser && (
        <StatsCards 
          totalMatchesPlayed={secondUserMatches.length}
          matchesWon={secondUserMatchesWon}
          winRate={secondUserWinRate}
          activeSeasons={activeSeasons}
          userSeasons={secondUserSeasons}
          currentUser={secondUser}
          title={`Statystyki gracza ${secondUser.nick}`}
        />
      )}

      {isAdmin && (
        <SeasonManagement activeSeasons={activeSeasons} />
      )}

      <Tabs defaultValue="history" className="space-y-4 relative z-10">
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
          {secondUser && (
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Historia meczów: {secondUser.nick}</h2>
              <MatchHistory 
                userMatches={secondUserMatches} 
                userSeasons={secondUserSeasons} 
                currentUser={secondUser} 
                hideControls={true}
              />
            </div>
          )}
        </TabsContent>
        <TabsContent value="seasons" className="space-y-4">
          <SeasonHistory userSeasons={userSeasons} currentUser={currentUser} />
          {secondUser && (
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Sezony gracza: {secondUser.nick}</h2>
              <SeasonHistory userSeasons={secondUserSeasons} currentUser={secondUser} />
            </div>
          )}
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
