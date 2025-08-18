<script setup lang="ts">
import type { EndpointStatus } from '../types';

const props = defineProps<{
  endpointStatus: EndpointStatus;
}>();

const emit = defineEmits<{
  toggle: [endpoint: string];
  remove: [endpoint: string];
}>();

const handleRemove = (event: Event) => {
  event.preventDefault();
  event.stopPropagation();
  emit('remove', props.endpointStatus.endpoint);
};

const handleToggle = (event: Event) => {
  emit('toggle', props.endpointStatus.endpoint);
};
</script>

<template>
  <div 
    class="border-b border-[#282828] h-[58px] relative overflow-hidden cursor-pointer hover:bg-[#1a1a1a] transition-colors group"
    @click="handleToggle"
  >
    <!-- Progress bar background -->
    <div 
      v-if="endpointStatus.hasStarted && !endpointStatus.error && endpointStatus.networkStatuses.length > 0"
      class="absolute top-0 left-0 h-full w-full z-0"
      :style="{
        background: `linear-gradient(to right, rgba(59, 130, 246, 0.6) 0%, rgba(59, 130, 246, 0.6) ${Math.round(endpointStatus.globalProgress)}%, transparent ${Math.round(endpointStatus.globalProgress)}%, transparent 100%)`
      }"
    ></div>
    <div class="flex items-center h-full relative z-10">
      <!-- Network name column -->
      <div class="px-4 py-3 flex items-center gap-3 flex-1">
        <!-- Remove button - shows on hover for all endpoints -->
        <button
          @click="handleRemove"
          class="flex-shrink-0 w-8 h-8 rounded-md bg-red-600/10 hover:bg-red-600/20 text-red-400 hover:text-red-300 transition-all duration-200 hover:scale-110 flex items-center justify-center opacity-0 group-hover:opacity-100"
          title="Remove endpoint"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
        <span class="font-medium text-base text-white">{{ endpointStatus.endpoint }}</span>
      </div>
      
      <!-- Blocks column -->
      
      <!-- Blocks behind column -->
      <div class="px-4 py-3 w-32 text-right flex items-center justify-end">
      </div>
      
      <!-- ETA column -->
      <div class="px-4 py-3 text-right w-24 flex items-center justify-end">
        <div v-if="endpointStatus.loading" class="text-gray-400">Loading...</div>
        <span v-else-if="endpointStatus.error" class="text-red-400">Error</span>
      </div>
      
      <!-- Sync % column -->
      <div class="px-4 py-3 text-right w-20 flex items-center justify-end">
        <div v-if="endpointStatus.loading" class="text-gray-400">...</div>
        <span v-else-if="endpointStatus.error" class="text-red-400">Error</span>
        <span v-else-if="endpointStatus.hasStarted && endpointStatus.networkStatuses.length > 0" class="font-medium text-base text-white">
          {{ Math.round(endpointStatus.globalProgress) }}%
        </span>
        <span v-else class="text-gray-400">-</span>
      </div>
    </div>
  </div>
</template>