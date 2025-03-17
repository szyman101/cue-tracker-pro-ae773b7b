
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Database, Download, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { migrateDataToSupabase } from '@/utils/supabase';
import { toast } from '@/hooks/use-toast';

const MigrationButton: React.FC = () => {
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'migrating' | 'success' | 'error'>('idle');
  const [migrationStats, setMigrationStats] = useState<{
    matchesMigrated: number;
    seasonsMigrated: number;
    errors: string[];
  } | null>(null);

  const handleMigration = async () => {
    try {
      setIsMigrating(true);
      setMigrationStatus('migrating');
      
      // Uruchom migrację
      const result = await migrateDataToSupabase();
      
      setMigrationStats(result);
      
      if (result.errors.length > 0) {
        setMigrationStatus('error');
        toast({
          title: "Migracja częściowo ukończona",
          description: `Zmigrowano ${result.matchesMigrated} meczy i ${result.seasonsMigrated} sezonów z błędami.`,
          variant: "destructive"
        });
      } else {
        setMigrationStatus('success');
        toast({
          title: "Migracja ukończona",
          description: `Pomyślnie zmigrowano ${result.matchesMigrated} meczy i ${result.seasonsMigrated} sezonów.`,
        });
      }
    } catch (error) {
      console.error("Błąd podczas migracji:", error);
      setMigrationStatus('error');
      toast({
        title: "Błąd migracji",
        description: `Wystąpił błąd podczas migracji: ${(error as Error).message}`,
        variant: "destructive"
      });
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Database className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Migracja danych do Supabase</h3>
      </div>
      
      {migrationStatus === 'idle' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Migracja danych</AlertTitle>
          <AlertDescription>
            Kliknij przycisk poniżej, aby zmigrować wszystkie lokalne dane (mecze i sezony) do bazy danych Supabase.
            Ta operacja nie usunie lokalnych danych.
          </AlertDescription>
        </Alert>
      )}
      
      {migrationStatus === 'migrating' && (
        <div className="space-y-2">
          <p>Migracja w toku. Proszę czekać...</p>
          <Progress value={33} />
        </div>
      )}
      
      {migrationStatus === 'success' && migrationStats && (
        <Alert className="bg-green-50 text-green-900 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle>Migracja zakończona</AlertTitle>
          <AlertDescription>
            Pomyślnie zmigrowano {migrationStats.matchesMigrated} meczy i {migrationStats.seasonsMigrated} sezonów do Supabase.
          </AlertDescription>
        </Alert>
      )}
      
      {migrationStatus === 'error' && migrationStats && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Błąd migracji</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>Migracja zakończona z błędami. Zmigrowano {migrationStats.matchesMigrated} meczy i {migrationStats.seasonsMigrated} sezonów.</p>
            {migrationStats.errors.length > 0 && (
              <div className="mt-2">
                <p className="font-semibold">Błędy ({migrationStats.errors.length}):</p>
                <ul className="list-disc pl-5 text-sm">
                  {migrationStats.errors.slice(0, 5).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                  {migrationStats.errors.length > 5 && (
                    <li>...i {migrationStats.errors.length - 5} więcej błędów</li>
                  )}
                </ul>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      <Button 
        onClick={handleMigration} 
        disabled={isMigrating}
        className="w-full"
      >
        <Download className="mr-2 h-4 w-4" />
        {isMigrating ? 'Migrowanie danych...' : 'Migruj dane do Supabase'}
      </Button>
    </div>
  );
};

export default MigrationButton;
