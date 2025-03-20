
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import BackButton from "@/components/BackButton";
import MatchHistoryHeader from "@/components/history/MatchHistoryHeader";
import MatchHistoryTable from "@/components/history/MatchHistoryTable";

const MatchHistory = () => {
  const { currentUser } = useAuth();
  const { getUserMatches, getUserById, seasons, clearMatches, deleteMatch } = useData();

  const userMatches = currentUser ? getUserMatches(currentUser.id) : [];
  
  // Sort matches by date (newest first)
  const sortedMatches = [...userMatches].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleClearHistory = () => {
    clearMatches();
    toast({
      title: "Historia wyczyszczona",
      description: "Wszystkie mecze zostały usunięte",
    });
  };

  const handleDeleteMatch = (matchId: string) => {
    deleteMatch(matchId);
    toast({
      title: "Mecz usunięty",
      description: "Mecz został usunięty z historii",
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <MatchHistoryHeader />
      
      <Card>
        <CardHeader>
          <CardTitle>Twoje mecze</CardTitle>
        </CardHeader>
        <CardContent>
          <MatchHistoryTable 
            matches={sortedMatches}
            currentUser={currentUser}
            seasons={seasons}
            onDeleteMatch={handleDeleteMatch}
            onClearHistory={handleClearHistory}
            getUserById={getUserById}
          />
        </CardContent>
      </Card>
      
      <BackButton />
    </div>
  );
};

export default MatchHistory;
