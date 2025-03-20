
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ClearHistoryButton from "./ClearHistoryButton";
import MatchResultRow from "./MatchResultRow";
import { Match, User, Season } from "@/types";

interface MatchHistoryTableProps {
  matches: Match[];
  currentUser: User | null;
  seasons: Season[];
  onDeleteMatch: (matchId: string) => void;
  onClearHistory: () => void;
  getUserById: (id: string) => User | undefined;
}

const MatchHistoryTable: React.FC<MatchHistoryTableProps> = ({
  matches,
  currentUser,
  seasons,
  onDeleteMatch,
  onClearHistory,
  getUserById
}) => {
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Przeciwnik</TableHead>
            <TableHead>Gra</TableHead>
            <TableHead>Wynik</TableHead>
            <TableHead>Czas</TableHead>
            <TableHead>Sezon</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Akcje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {matches.map((match) => (
            <MatchResultRow
              key={match.id}
              match={match}
              currentUser={currentUser}
              seasons={seasons}
              onDeleteMatch={onDeleteMatch}
              getUserById={getUserById}
            />
          ))}
          {matches.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-4">
                Brak historii meczów
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      <div className="flex justify-end mt-4">
        <ClearHistoryButton onClearHistory={onClearHistory} />
      </div>
    </>
  );
};

export default MatchHistoryTable;
