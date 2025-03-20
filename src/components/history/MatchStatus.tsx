
import React from "react";

interface MatchStatusProps {
  userWon: boolean;
  userLost: boolean;
}

const MatchStatus: React.FC<MatchStatusProps> = ({ userWon, userLost }) => {
  if (userWon) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
        Wygrana
      </span>
    );
  } else if (userLost) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">
        Przegrana
      </span>
    );
  } else {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100">
        Remis
      </span>
    );
  }
};

export default MatchStatus;
