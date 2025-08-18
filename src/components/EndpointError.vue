<script setup lang="ts">
defineProps<{
  endpoint: string;
}>();
</script>

<template>
  <div class="text-center h-[58px] flex items-center justify-center">
    <div class="px-4 py-8 text-red-400">
      <div class="flex flex-col items-center gap-2">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>Failed to connect to endpoint</div>
        <div class="text-sm text-gray-500">{{ endpoint }}</div>
      </div>
    </div>
  </div>
</template>