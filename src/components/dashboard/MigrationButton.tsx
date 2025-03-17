
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { DatabaseZap } from "lucide-react";
import { migrateToSupabase } from "@/utils/migration";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const MigrationButton: React.FC = () => {
  const [isMigrating, setIsMigrating] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleMigration = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Wymagane logowanie",
        description: "Musisz być zalogowany, aby wykonać migrację danych",
        variant: "destructive",
      });
      return;
    }

    setIsMigrating(true);
    toast({
      title: "Rozpoczęto migrację",
      description: "Trwa przenoszenie danych do Supabase...",
    });

    try {
      const result = await migrateToSupabase();
      
      if (result.success) {
        toast({
          title: "Migracja zakończona",
          description: `Pomyślnie przeniesiono ${result.matchesMigrated} meczów i ${result.seasonsMigrated} sezonów do Supabase`,
        });
      } else {
        toast({
          title: "Błąd migracji",
          description: "Wystąpił problem podczas migracji danych. Sprawdź konsolę, aby uzyskać więcej informacji.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Błąd migracji:", error);
      toast({
        title: "Błąd migracji",
        description: "Wystąpił nieoczekiwany błąd podczas migracji danych",
        variant: "destructive",
      });
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <Button 
      variant="default" 
      onClick={handleMigration} 
      disabled={isMigrating || !isAuthenticated}
      className="w-full"
    >
      <DatabaseZap className="w-4 h-4 mr-2" />
      {isMigrating ? "Migracja w toku..." : "Migruj dane do Supabase"}
    </Button>
  );
};

export default MigrationButton;
