<script setup lang="ts">
import type { MediaSpotlightConfig } from '@/data/types'

defineProps<{ media: MediaSpotlightConfig }>()
</script>

<template>
  <div class="overflow-hidden rounded-t1-md border border-t1-line bg-white shadow-t1-card">
    <video :src="media.videoUrl" controls class="block max-h-65 w-full bg-black object-cover" />
    <div class="flex items-center justify-between px-4.5 py-3.5">
      <div>
        <div class="mb-0.5 text-[13px] font-bold text-t1-navy">{{ media.title }}</div>
        <div class="text-[11px] text-t1-ink-3">
          Recorded by {{ media.presenterName }} · {{ media.presenterRole }}
        </div>
      </div>
      <div class="text-[11px] text-t1-ink-3">{{ media.postedLabel }}</div>
    </div>
  </div>
</template>
