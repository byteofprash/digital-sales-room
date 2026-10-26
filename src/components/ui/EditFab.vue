<script setup lang="ts">
import { PencilIcon } from '@heroicons/vue/24/solid'

defineProps<{ label: string }>()
defineEmits<{ click: [] }>()
</script>

<template>
  <button
    type="button"
    class="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11px] font-normal text-t1-blue shadow-t1-chip transition-colors hover:bg-t1-blue hover:text-white"
    @click="$emit('click')"
  >
    <PencilIcon class="h-3 w-3" />
    {{ label }}
  </button>
</template>
