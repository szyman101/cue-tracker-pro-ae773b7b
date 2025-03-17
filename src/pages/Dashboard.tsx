import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import StatsCards from "@/components/dashboard/StatsCards";
import MatchHistory from "@/components/dashboard/MatchHistory";
import SeasonHistory from "@/components/dashboard/SeasonHistory";
import SeasonManagement from "@/components/dashboard/SeasonManagement";

const Dashboard = () => {
  const { currentUser, secondUser } = useAuth();
  const { getUserMatches, getUserSeasons, getActiveSeasons, isLoading } = useData();

  const userMatches = currentUser ? getUserMatches(currentUser.id) : [];
  const userSeasons = currentUser ? getUserSeasons(currentUser.id) : [];
  const activeSeasons = getActiveSeasons();

  const matchesWon = userMatches.filter(match => match.winner === currentUser?.id).length;
  const winRate = userMatches.length > 0 ? Math.round((matchesWon / userMatches.length) * 100) : 0;

  // Stats for the second user (if available)
  const secondUserMatches = secondUser ? getUserMatches(secondUser.id) : [];
  const secondUserSeasons = secondUser ? getUserSeasons(secondUser.id) : [];
  const secondUserActiveSeasons = getActiveSeasons();

  const secondUserMatchesWon = secondUserMatches.filter(match => match.winner === secondUser?.id).length;
  const secondUserWinRate = secondUserMatches.length > 0 ? Math.round((secondUserMatchesWon / secondUserMatches.length) * 100) : 0;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">
        {currentUser ? `Witaj, ${currentUser.nick}!` : "Witaj!"}
      </h1>
      
      {currentUser && (
        <div className="space-y-6">
          <StatsCards
            totalMatchesPlayed={userMatches.length}
            matchesWon={matchesWon}
            winRate={winRate}
            activeSeasons={activeSeasons}
            userSeasons={userSeasons}
            currentUser={currentUser}
            title={secondUser ? `Statystyki - ${currentUser.nick}` : "Twoje statystyki"}
            isLoading={isLoading}
          />
          
          <MatchHistory
            userMatches={userMatches}
            userSeasons={userSeasons}
            currentUser={currentUser}
            isLoading={isLoading}
          />
          
          <SeasonHistory
            userSeasons={userSeasons}
            currentUser={currentUser}
            isLoading={isLoading}
          />
        </div>
      )}
      
      {secondUser && (
        <div className="space-y-6 mt-8">
          <h2 className="text-2xl font-bold">Statystyki - {secondUser.nick}</h2>
          
          <StatsCards
            totalMatchesPlayed={secondUserMatches.length}
            matchesWon={secondUserMatchesWon}
            winRate={secondUserWinRate}
            activeSeasons={secondUserActiveSeasons}
            userSeasons={secondUserSeasons}
            currentUser={secondUser}
            isLoading={isLoading}
          />
          
          <MatchHistory
            userMatches={secondUserMatches}
            userSeasons={secondUserSeasons}
            currentUser={secondUser}
            hideControls
            isLoading={isLoading}
          />
          
          <SeasonHistory
            userSeasons={secondUserSeasons}
            currentUser={secondUser}
            isLoading={isLoading}
          />
        </div>
      )}
      
      {currentUser?.role === "admin" && activeSeasons.length > 0 && (
        <SeasonManagement activeSeasons={activeSeasons} />
      )}

      {currentUser?.role === "player" && activeSeasons.length > 0 && (
        <p>Aktualnie trwa {activeSeasons.length} sezon{activeSeasons.length !== 1 ? "y" : ""}.</p>
      )}
    </div>
  );
};

export default Dashboard;
