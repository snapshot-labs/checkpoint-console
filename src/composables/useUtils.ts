import {
  MIN_HISTORY_SAMPLES,
  MIN_HISTORY_SPAN_SECONDS,
  SPEED_HALF_LIFE_SECONDS
} from '../constants';
import { BlockSample, NetworkWithHistory } from '../types';

export function useUtils() {
  const formatSpeed = (blocksPerSecond: number): string => {
    if (blocksPerSecond <= 0 || !isFinite(blocksPerSecond)) return '';
    if (blocksPerSecond >= 10) return `${Math.round(blocksPerSecond)} bps`;
    return `${blocksPerSecond.toFixed(1)} bps`;
  };

  const formatTimeEstimate = (seconds: number): string => {
    if (seconds <= 0 || !isFinite(seconds)) return '0s';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours >= 24) {
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
    const percentage = (status.indexedBlock / status.currentBlock) * 100;
    const fixed = percentage.toFixed(2);
    return parseFloat(fixed).toString();
  };

  const calculateIndexingSpeed = (history: BlockSample[]): number => {
    const n = history.length;
    if (n < MIN_HISTORY_SAMPLES) return 0;

    const first = history[0];
    const last = history[n - 1];
    const spanSeconds = (last.timestamp - first.timestamp) / 1000;
    if (spanSeconds < MIN_HISTORY_SPAN_SECONDS) return 0;

    const nowMs = last.timestamp;
    const decay = Math.LN2 / SPEED_HALF_LIFE_SECONDS;
    const ts = new Array<number>(n);
    const ys = new Array<number>(n);
    const ws = new Array<number>(n);
    let sumW = 0;
    let sumWT = 0;
    let sumWY = 0;
    for (let i = 0; i < n; i++) {
      const ageSeconds = (nowMs - history[i].timestamp) / 1000;
      const w = Math.exp(-decay * ageSeconds);
      const t = (history[i].timestamp - first.timestamp) / 1000;
      const y = history[i].block - first.block;
      ts[i] = t;
      ys[i] = y;
      ws[i] = w;
      sumW += w;
      sumWT += w * t;
      sumWY += w * y;
    }

    const meanT = sumWT / sumW;
    const meanY = sumWY / sumW;

    let num = 0;
    let den = 0;
    for (let i = 0; i < n; i++) {
      const dt = ts[i] - meanT;
      num += ws[i] * dt * (ys[i] - meanY);
      den += ws[i] * dt * dt;
    }

    if (den === 0) return 0;
    const slope = num / den;
    return slope > 0 ? slope : 0;
  };

  return {
    formatSpeed,
    formatTimeEstimate,
    getBlockDifference,
    getSyncPercentage,
    calculateIndexingSpeed
  };
}
