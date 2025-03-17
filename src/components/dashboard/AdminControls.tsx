
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Database } from 'lucide-react';
import MigrationButton from './MigrationButton';

const AdminControls: React.FC = () => {
  const { clearMatches, clearSeasons, isUsingSupabase, toggleDataSource, syncWithSupabase } = useData();

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Panel administratora</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Przełącznik źródła danych */}
        <div className="space-y-6 border-b pb-6">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Źródło danych</h3>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="data-source" 
              checked={isUsingSupabase}
              onCheckedChange={toggleDataSource}
              disabled={true} // Wyłączenie możliwości przełączania
            />
            <Label htmlFor="data-source">
              {isUsingSupabase ? 'Supabase (online)' : 'IndexedDB (lokalne)'}
            </Label>
          </div>
          
          <Button 
            variant="outline" 
            onClick={syncWithSupabase}
            className="w-full"
          >
            Synchronizuj dane z Supabase
          </Button>
        </div>
        
        {/* Migracja danych */}
        <div className="space-y-4 border-b pb-6">
          <MigrationButton />
        </div>
        
        {/* Czyszczenie danych */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Czyszczenie danych</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full">Wyczyść dane meczy</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Jesteś pewien?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Ta akcja usunie wszystkie dane meczy i nie będzie można jej cofnąć.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Anuluj</AlertDialogCancel>
                  <AlertDialogAction onClick={clearMatches} className="bg-red-500 hover:bg-red-600">
                    Wyczyść mecze
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full">Wyczyść dane sezonów</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Jesteś pewien?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Ta akcja usunie wszystkie dane sezonów i nie będzie można jej cofnąć.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Anuluj</AlertDialogCancel>
                  <AlertDialogAction onClick={clearSeasons} className="bg-red-500 hover:bg-red-600">
                    Wyczyść sezony
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminControls;
