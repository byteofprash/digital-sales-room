<script setup lang="ts">
import type { MediaSpotlightConfig } from '@/data/types'

defineProps<{ media: MediaSpotlightConfig }>()
</script>

<template>
  <div class="overflow-hidden rounded-t1 border border-t1-line bg-white">
    <video
      v-if="media.videoUrl"
      :src="media.videoUrl"
      controls
      playsinline
      class="block max-h-65 w-full bg-t1-black object-cover"
    />
    <div
      v-else
      class="flex h-40 items-center justify-center bg-t1-black text-[13px] font-light text-white/70"
    >
      The welcome video is coming soon.
    </div>
    <div class="flex items-center justify-between px-4.5 py-3.5">
      <div>
        <div class="mb-0.5 text-sm font-normal text-t1-black">{{ media.title }}</div>
        <div class="text-[11px] font-light text-t1-black/65">
          Recorded by {{ media.presenterName }} · {{ media.presenterRole }}
        </div>
      </div>
      <div class="text-[11px] font-light text-t1-black/65">{{ media.postedLabel }}</div>
    </div>
  </div>
</template>
