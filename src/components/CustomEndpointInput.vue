<script setup lang="ts">
import { ENDPOINTS } from '../constants';

const emit = defineEmits<{
  add: [endpoint: string];
  blur: [];
}>();

const props = defineProps<{
  isActive: boolean;
}>();

const customEndpointInput = ref('');
const showDropdown = ref(false);
const selectedIndex = ref(-1);

// Suggested endpoints from constants
const suggestedEndpoints = ENDPOINTS;

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    if (selectedIndex.value < suggestedEndpoints.length - 1) {
      selectedIndex.value++;
    }
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    if (selectedIndex.value > -1) {
      selectedIndex.value--;
    }
  } else if (event.key === 'Enter') {
    event.preventDefault();
    if (selectedIndex.value >= 0) {
      selectEndpoint(suggestedEndpoints[selectedIndex.value]);
    } else if (customEndpointInput.value.trim()) {
      emit('add', customEndpointInput.value.trim());
      customEndpointInput.value = '';
      showDropdown.value = false;
    }
  } else if (event.key === 'Escape') {
    customEndpointInput.value = '';
    showDropdown.value = false;
    emit('blur');
  }
};

const selectEndpoint = (endpoint: string) => {
  emit('add', endpoint);
  customEndpointInput.value = '';
  showDropdown.value = false;
  selectedIndex.value = -1;
};

const handleFocus = () => {
  showDropdown.value = true;
  selectedIndex.value = -1;
};

const handleBlur = () => {
  setTimeout(() => {
    showDropdown.value = false;
    emit('blur');
  }, 150);
};

const startAdding = () => {
  nextTick(() => {
    const input = document.querySelector('#custom-endpoint-input') as HTMLInputElement;
    if (input) {
      input.focus();
      showDropdown.value = true;
    }
  });
};

defineExpose({ startAdding });
</script>

<template>
  <div class="border-b border-[#282828] h-[58px] relative overflow-visible">
    <div v-if="!props.isActive" 
         class="px-4 py-3 flex items-center gap-3 flex-1 cursor-pointer hover:bg-[#1a1a1a] transition-colors h-full"
         @click="$emit('add', '')">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-md flex items-center justify-center bg-green-600">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <span class="font-medium text-base text-gray-400">Add custom endpoint...</span>
      </div>
    </div>
    <div v-else class="px-4 py-3 flex items-center gap-3 flex-1 h-full">
      <div class="flex items-center gap-3 flex-1 relative">
        <div class="w-8 h-8 rounded-md flex items-center justify-center bg-green-600">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <input
          id="custom-endpoint-input"
          v-model="customEndpointInput"
          @keydown="handleKeydown"
          @focus="handleFocus"
          @blur="handleBlur"
          type="text"
          placeholder="Enter endpoint URL (e.g., https://api.example.com)"
          class="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-400 font-medium text-base"
        />
        
        <!-- Dropdown with suggested endpoints -->
        <div v-if="showDropdown" 
             class="absolute top-full left-10 right-0 mt-1 bg-[#1a1a1a] border border-[#282828] rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
          <div v-for="(endpoint, index) in suggestedEndpoints" 
               :key="endpoint"
               :class="['px-3 py-2 cursor-pointer text-sm text-gray-300 hover:bg-[#2a2a2a] hover:text-white transition-colors', { 'bg-[#2a2a2a] text-white': index === selectedIndex }]"
               @mousedown="selectEndpoint(endpoint)"
               @mouseenter="selectedIndex = index">
            {{ endpoint }}
          </div>
        </div>
      </div>
      <div class="px-4 py-3 w-32 text-right"></div>
      <div class="px-4 py-3 text-right w-24"></div>
      <div class="px-4 py-3 text-right w-20">
        <div class="font-medium text-base text-gray-400">Press Enter</div>
      </div>
    </div>
  </div>
</template>