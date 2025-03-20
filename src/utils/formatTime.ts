
/**
 * Formats time elapsed from seconds to MM:SS format
 */
export const formatTimeElapsed = (seconds?: number): string => {
  if (!seconds) return "--:--";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};
