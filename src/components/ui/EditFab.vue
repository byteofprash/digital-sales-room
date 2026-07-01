<script setup lang="ts">
import { PencilIcon } from '@heroicons/vue/24/solid'

defineProps<{ label: string }>()
defineEmits<{ click: [] }>()
</script>

<template>
  <button
    type="button"
    class="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-md border border-t1-electric bg-white px-2.5 py-1 text-[11px] font-bold text-t1-electric shadow-t1-card transition-colors hover:bg-t1-electric hover:text-white"
    @click="$emit('click')"
  >
    <PencilIcon class="h-3 w-3" />
    {{ label }}
  </button>
</template>
