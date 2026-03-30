<script setup lang="ts">
import { useUtils } from '../composables/useUtils';
import { NetworkWithHistory } from '../types';

const props = defineProps<{
  status: NetworkWithHistory;
  endpointUrl: string;
}>();

const { formatTimeEstimate, getBlockDifference, getSyncPercentage } =
  useUtils();

const getProgressColor = () => {
  const diff = getBlockDifference(props.status);
  if (diff > 100) {
    return 'rgba(239, 68, 68, 0.6)'; // red
  } else if (props.status.indexedBlock < props.status.currentBlock) {
    return 'rgba(234, 179, 8, 0.6)'; // yellow
  } else {
    return 'rgba(34, 197, 94, 0.6)'; // green
  }
};
</script>

<template>
  <div
    class="group hover:bg-[#282828] relative overflow-hidden h-[58px] border-b border-[#282828] flex items-center"
  >
    <!-- Progress bar background -->
    <div
      class="absolute bottom-0 left-0 h-[4px] w-full"
      :style="{
        background: `linear-gradient(to right, ${getProgressColor()} 0%, ${getProgressColor()} ${getSyncPercentage(status)}%, transparent ${getSyncPercentage(status)}%, transparent 100%)`
      }"
    ></div>
    <!-- Network info -->
    <div class="px-2 py-2 flex-1">
      <div class="flex items-center gap-3 pl-6">
        <img
          :src="status.network.image"
          :alt="status.network.name"
          class="w-8 h-8 rounded-md"
        />
        <span class="font-normal text-base group-hover:text-white">{{
          status.network.name
        }}</span>
        <span class="text-sm text-gray-500"
          >({{ status.network.chainId }}, {{ status.network.indexer }})</span
        >
      </div>
    </div>

    <!-- Blocks (Current / Indexed) -->
    <div class="px-2 py-2 text-right w-80">
      <div class="font-normal text-base text-white">
        <template v-if="status.indexedBlock >= status.currentBlock">
          {{ status.indexedBlock.toLocaleString() }}
        </template>
        <template v-else>
          {{ status.indexedBlock.toLocaleString() }} /
          {{ status.currentBlock.toLocaleString() }}
        </template>
      </div>
    </div>

    <!-- Blocks behind -->
    <div class="px-2 py-2 text-right w-32">
      <div class="font-normal text-base text-white">
        {{ getBlockDifference(status).toLocaleString() }}
      </div>
    </div>

    <!-- Speed and ETA -->
    <div class="px-2 py-2 text-right w-24">
      <div
        v-if="status.estimatedTimeToSync > 3"
        class="font-normal text-sm text-white"
      >
        {{ formatTimeEstimate(status.estimatedTimeToSync) }}
      </div>
    </div>

    <!-- Sync percentage -->
    <div class="px-2 py-2 text-right w-20">
      <div
        v-if="isFinite(parseFloat(getSyncPercentage(status)))"
        class="font-normal text-base text-white"
      >
        {{ getSyncPercentage(status) }}%
      </div>
    </div>
  </div>
</template>
