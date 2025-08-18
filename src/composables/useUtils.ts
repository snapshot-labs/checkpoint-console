import type { NetworkWithHistory, IndexingHistory } from '../types';

export function useUtils() {
  const formatTimeEstimate = (seconds: number): string => {
    if (seconds <= 0 || !isFinite(seconds)) return '0s';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days}d ${remainingHours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getBlockDifference = (status: NetworkWithHistory) => {
    return status.currentBlock - status.indexedBlock;
  };

  const getSyncPercentage = (status: NetworkWithHistory) => {
    const percentage = (status.indexedBlock / status.currentBlock * 100);
    const fixed = percentage.toFixed(2);
    return parseFloat(fixed).toString();
  };

  const calculateIndexingSpeed = (
    indexer: string,
    currentIndexedBlock: number,
    history: IndexingHistory[]
  ): { blocksPerSecond: number; estimatedTimeToSync: number } => {
    const now = Date.now();
    
    // Add current data point
    const updatedHistory = [...history, { timestamp: now, indexedBlock: currentIndexedBlock }];
    
    // Keep only last 10 minutes of data
    const tenMinutesAgo = now - (10 * 60 * 1000);
    const recentHistory = updatedHistory.filter(h => h.timestamp > tenMinutesAgo);
    
    if (recentHistory.length < 2) {
      return { blocksPerSecond: 0, estimatedTimeToSync: 0 };
    }
    
    // Calculate blocks per second based on recent history
    const oldest = recentHistory[0];
    const newest = recentHistory[recentHistory.length - 1];
    const timeDiff = (newest.timestamp - oldest.timestamp) / 1000; // seconds
    const blockDiff = newest.indexedBlock - oldest.indexedBlock;
    
    const blocksPerSecond = timeDiff > 0 ? blockDiff / timeDiff : 0;
    
    return { blocksPerSecond, estimatedTimeToSync: 0 };
  };

  return {
    formatTimeEstimate,
    getBlockDifference,
    getSyncPercentage,
    calculateIndexingSpeed
  };
}