<script setup lang="ts">
import {
  HISTORY_WINDOW_MS,
  MIN_BLOCKS_BEHIND_FOR_ETA,
  MIN_HISTORY_SAMPLES,
  MIN_HISTORY_SPAN_SECONDS,
  NETWORKS,
  UPDATE_INTERVAL_MS
} from '../constants';
import { BlockSample, EndpointStatus } from '../types';

const isPageVisible = ref(true);
const isAddingCustomEndpoint = ref(false);
const isCustomEndpointFocused = ref(false);
const endpointStatuses = ref<EndpointStatus[]>([]);
const globalCurrentBlocks = ref<Map<string, number>>(new Map());
const indexingHistory = ref<Map<string, BlockSample[]>>(new Map());
const chainBlockHistory = ref<Map<string, BlockSample[]>>(new Map());
const customEndpointRef = ref();

let interval: number;

const { fetchBlockForNetwork, fetchMetadata } = useBlockchainData();
const { calculateIndexingSpeed } = useUtils();

const saveEndpointStates = () => {
  try {
    const statesToSave = endpointStatuses.value.map(endpoint => ({
      endpoint: endpoint.endpoint,
      isExpanded: endpoint.isExpanded,
      hasStarted: endpoint.hasStarted
    }));
    localStorage.setItem(
      'checkpoint-console-endpoints',
      JSON.stringify(statesToSave)
    );
  } catch (error) {
    console.error('Error saving endpoint states:', error);
  }
};

const loadEndpointStates = (): Array<{
  endpoint: string;
  isExpanded: boolean;
  hasStarted: boolean;
}> => {
  try {
    const saved = localStorage.getItem('checkpoint-console-endpoints');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error loading endpoint states:', error);
    return [];
  }
};

const sortedEndpoints = computed(() => {
  const filteredEndpoints = endpointStatuses.value.filter(endpoint => {
    return endpoint.hasStarted || isCustomEndpointFocused.value;
  });

  return [...filteredEndpoints].sort((a, b) => {
    if (a.hasStarted === b.hasStarted) {
      if (a.isExpanded === b.isExpanded) return 0;
      return a.isExpanded ? -1 : 1;
    }
    return a.hasStarted ? -1 : 1;
  });
});

const addCustomEndpoint = async (endpoint: string) => {
  if (!endpoint) {
    isAddingCustomEndpoint.value = true;
    isCustomEndpointFocused.value = true;
    nextTick(() => {
      customEndpointRef.value?.startAdding();
    });
    return;
  }

  if (endpointStatuses.value.some(e => e.endpoint === endpoint)) {
    return;
  }

  const newEndpointStatus = createEndpointStatus(endpoint);
  endpointStatuses.value.unshift(newEndpointStatus);

  isAddingCustomEndpoint.value = false;
  isCustomEndpointFocused.value = false;

  newEndpointStatus.isExpanded = true;
  newEndpointStatus.hasStarted = true;

  saveEndpointStates();
  await fetchEndpointData(endpoint);
};

const handleCustomEndpointBlur = () => {
  isAddingCustomEndpoint.value = false;
  isCustomEndpointFocused.value = false;
};

const toggleEndpoint = async (endpoint: string) => {
  const endpointStatus = endpointStatuses.value.find(
    e => e.endpoint === endpoint
  );
  if (!endpointStatus) return;

  if (!endpointStatus.hasStarted) {
    endpointStatus.hasStarted = true;
    endpointStatus.isExpanded = true;
    isAddingCustomEndpoint.value = false;
    isCustomEndpointFocused.value = false;

    saveEndpointStates();
    await fetchEndpointData(endpoint);
  } else {
    endpointStatus.isExpanded = !endpointStatus.isExpanded;
    saveEndpointStates();
  }
};

const historyKeyFor = (endpoint: string, indexer: string) =>
  `${endpoint}::${indexer}`;

const removeEndpoint = (endpoint: string) => {
  const index = endpointStatuses.value.findIndex(e => e.endpoint === endpoint);
  if (index !== -1) {
    endpointStatuses.value.splice(index, 1);
  }

  const prefix = `${endpoint}::`;
  for (const key of [...indexingHistory.value.keys()]) {
    if (key.startsWith(prefix)) {
      indexingHistory.value.delete(key);
    }
  }

  saveEndpointStates();
};

const createEndpointStatus = (endpoint: string): EndpointStatus => {
  return {
    endpoint,
    networkStatuses: [],
    loading: false,
    error: false,
    responseTime: 0,
    globalProgress: 0,
    isExpanded: false,
    hasStarted: false
  };
};

const fetchCurrentBlocksForAvailableNetworks = async (
  availableIndexers: Set<string>
) => {
  try {
    const networksToFetch = NETWORKS.filter(network =>
      availableIndexers.has(network.indexer)
    );
    const mainnetNetworks = networksToFetch.filter(n => !n.testnet);
    const testnetNetworks = networksToFetch.filter(n => n.testnet);

    const [mainnetBlocks, testnetBlocks] = await Promise.all([
      Promise.all(
        mainnetNetworks.map(network => fetchBlockForNetwork(network, false))
      ),
      Promise.all(
        testnetNetworks.map(network => fetchBlockForNetwork(network, true))
      )
    ]);

    const allBlocks = [...mainnetBlocks, ...testnetBlocks];
    const newGlobalBlocks = new Map(globalCurrentBlocks.value);
    const now = Date.now();
    const cutoff = now - HISTORY_WINDOW_MS;
    allBlocks.forEach(({ networkId, block }) => {
      newGlobalBlocks.set(networkId, block);
      const prior = chainBlockHistory.value.get(networkId) || [];
      const recent: BlockSample[] = [
        ...prior.filter(h => h.timestamp >= cutoff),
        { timestamp: now, block }
      ];
      chainBlockHistory.value.set(networkId, recent);
    });
    globalCurrentBlocks.value = newGlobalBlocks;
  } catch (error) {
    console.error('Error fetching current blocks:', error);
  }
};

const fetchEndpointData = async (endpoint: string) => {
  const endpointStatus = endpointStatuses.value.find(
    e => e.endpoint === endpoint
  );
  if (!endpointStatus) return;

  if (!endpointStatus.hasStarted) {
    endpointStatus.hasStarted = true;
  }

  endpointStatus.loading = true;
  endpointStatus.error = false;

  try {
    const startTime = performance.now();
    const isTestnet = endpoint.includes('testnet');

    const metadatas = await fetchMetadata(endpoint);
    endpointStatus.responseTime = Math.round(performance.now() - startTime);

    const networks = isTestnet
      ? NETWORKS.filter(n => n.testnet)
      : NETWORKS.filter(n => !n.testnet);
    const availableNetworks = networks.filter(network =>
      metadatas.some(m => m.indexer === network.indexer)
    );

    const statuses = availableNetworks.map(network => {
      const currentBlock = globalCurrentBlocks.value.get(network.id) || 0;
      const indexedBlock = parseInt(
        metadatas.find(m => m.indexer === network.indexer)?.value || '0'
      );

      const historyKey = historyKeyFor(endpoint, network.indexer);
      const now = Date.now();
      const cutoff = now - HISTORY_WINDOW_MS;
      const priorHistory = indexingHistory.value.get(historyKey) || [];
      const recentHistory: BlockSample[] = [
        ...priorHistory.filter(h => h.timestamp >= cutoff),
        { timestamp: now, block: indexedBlock }
      ];
      indexingHistory.value.set(historyKey, recentHistory);

      const indexerSpeed = calculateIndexingSpeed(recentHistory);
      const chainSpeed = calculateIndexingSpeed(
        chainBlockHistory.value.get(network.id) || []
      );
      const effectiveSpeed = indexerSpeed - chainSpeed;
      const blocksBehind = currentBlock - indexedBlock;
      const estimatedTimeToSync =
        blocksBehind >= MIN_BLOCKS_BEHIND_FOR_ETA && effectiveSpeed > 0
          ? blocksBehind / effectiveSpeed
          : 0;

      const hasEnoughHistory =
        recentHistory.length >= MIN_HISTORY_SAMPLES &&
        (recentHistory[recentHistory.length - 1].timestamp -
          recentHistory[0].timestamp) /
          1000 >=
          MIN_HISTORY_SPAN_SECONDS;
      const firstBlock = recentHistory[0].block;
      const madeProgress = recentHistory.some(h => h.block !== firstBlock);
      const isStalled =
        hasEnoughHistory &&
        !madeProgress &&
        blocksBehind >= MIN_BLOCKS_BEHIND_FOR_ETA;

      return {
        network,
        currentBlock,
        indexedBlock,
        blocksPerSecond: indexerSpeed,
        estimatedTimeToSync,
        isStalled
      };
    });

    endpointStatus.networkStatuses = statuses;
    endpointStatus.loading = false;

    const totalProgress = statuses.reduce((sum, status) => {
      return (
        sum +
        (status.currentBlock > 0
          ? (status.indexedBlock / status.currentBlock) * 100
          : 0)
      );
    }, 0);
    endpointStatus.globalProgress =
      statuses.length > 0 ? totalProgress / statuses.length : 0;
  } catch (error) {
    console.error('Error fetching endpoint data:', error);
    endpointStatus.error = true;
    endpointStatus.loading = false;
  }
};

const fetchAllData = async () => {
  if (!isPageVisible.value) return;

  console.log('Fetching data at:', new Date().toISOString());

  try {
    const availableIndexers = new Set<string>();
    const allEndpoints = endpointStatuses.value;

    // Fetch metadata for all endpoints to show basic sync info
    await Promise.all(
      allEndpoints.map(async endpointStatus => {
        try {
          const metadatas = await fetchMetadata(endpointStatus.endpoint);
          metadatas.forEach(metadata => {
            availableIndexers.add(metadata.indexer);
          });
        } catch (error) {
          console.error(
            `Error fetching metadata for ${endpointStatus.endpoint}:`,
            error
          );
        }
      })
    );

    if (availableIndexers.size > 0) {
      await fetchCurrentBlocksForAvailableNetworks(availableIndexers);
    }

    // Fetch detailed data for all endpoints to show sync percentages
    await Promise.all(
      allEndpoints.map(endpointStatus =>
        fetchEndpointData(endpointStatus.endpoint)
      )
    );
  } catch (error) {
    console.error('Error in fetchAllData:', error);
  }
};

const handleVisibilityChange = () => {
  isPageVisible.value = !document.hidden;
};

const initializeApp = async () => {
  const savedStates = loadEndpointStates();

  // If no saved endpoints (first time user), show a few default endpoints
  if (savedStates.length === 0) {
    const defaultEndpointsToShow = [
      'https://api.snapshot.box',
      'https://testnet-api.snapshot.box'
    ];

    endpointStatuses.value = defaultEndpointsToShow.map(endpoint => {
      const endpointStatus = createEndpointStatus(endpoint);
      endpointStatus.hasStarted = true; // Mark as started so they show up
      return endpointStatus;
    });

    // Save these as the initial set
    saveEndpointStates();
  } else {
    // Only show endpoints that have been saved (actually used)
    endpointStatuses.value = savedStates.map(savedState => {
      const endpointStatus = createEndpointStatus(savedState.endpoint);
      endpointStatus.isExpanded = savedState.isExpanded;
      endpointStatus.hasStarted = savedState.hasStarted;

      return endpointStatus;
    });
  }
};

onMounted(async () => {
  document.addEventListener('visibilitychange', handleVisibilityChange);
  isPageVisible.value = !document.hidden;

  await initializeApp();
  // Start fetching data immediately
  await fetchAllData();
  // Then set up polling
  interval = setInterval(fetchAllData, UPDATE_INTERVAL_MS);
});

onUnmounted(() => {
  clearInterval(interval);
  document.removeEventListener('visibilitychange', handleVisibilityChange);
});
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <div class="flex-1">
      <div class="w-full">
        <TableHeader />

        <div>
          <CustomEndpointInput
            ref="customEndpointRef"
            :is-active="isAddingCustomEndpoint"
            @add="addCustomEndpoint"
            @blur="handleCustomEndpointBlur"
          />

          <template
            v-for="endpointStatus in sortedEndpoints"
            :key="endpointStatus.endpoint"
          >
            <EndpointRow
              :endpoint-status="endpointStatus"
              @toggle="toggleEndpoint"
              @remove="removeEndpoint"
            />

            <EndpointError
              v-if="endpointStatus.isExpanded && endpointStatus.error"
              :endpoint="endpointStatus.endpoint"
            />

            <NetworkStatusRow
              v-for="status in endpointStatus.networkStatuses"
              v-show="endpointStatus.isExpanded"
              :key="`${endpointStatus.endpoint}-${status.network.id}`"
              :status="status"
              :endpoint-url="endpointStatus.endpoint"
            />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
