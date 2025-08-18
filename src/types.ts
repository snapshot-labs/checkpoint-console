export interface Network {
  id: string;
  name: string;
  chainId: number;
  indexer: string;
  image: string;
  testnet: boolean;
}

export interface Metadata {
  id: string;
  value: string;
  indexer: string;
}

export interface NetworkStatus {
  network: Network;
  currentBlock: number;
  indexedBlock: number;
}

export interface IndexingHistory {
  timestamp: number;
  indexedBlock: number;
}

export interface NetworkWithHistory extends NetworkStatus {
  history: IndexingHistory[];
  blocksPerSecond: number;
  estimatedTimeToSync: number;
}

export interface EndpointStatus {
  endpoint: string;
  networkStatuses: NetworkWithHistory[];
  loading: boolean;
  error: boolean;
  responseTime: number;
  globalProgress: number;
  isExpanded: boolean;
  hasStarted: boolean;
}