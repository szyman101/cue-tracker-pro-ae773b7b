
import React from "react";

interface MatchHistoryHeaderProps {
  title?: string;
}

const MatchHistoryHeader: React.FC<MatchHistoryHeaderProps> = ({ 
  title = "Historia meczów" 
}) => {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold">{title}</h1>
    </div>
  );
};

export default MatchHistoryHeader;
