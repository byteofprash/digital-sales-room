<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ArrowTopRightOnSquareIcon, PlayCircleIcon } from '@heroicons/vue/24/outline'
import type { MediaSpotlightConfig } from '@/data/types'
import { videoSource } from '@/lib/videoSource'

const props = defineProps<{ media: MediaSpotlightConfig }>()

const source = computed(() => videoSource(props.media.videoUrl))
const failed = ref(false)

/** Where to send the viewer when the video can't play inline; null when there is no video at all. */
const fallbackUrl = computed(() => {
  const current = source.value
  if (current.kind === 'link') return current.url
  if (current.kind === 'file' && failed.value) return current.url
  return null
})

// A new URL deserves a fresh attempt.
watch(() => props.media.videoUrl, () => (failed.value = false))
</script>

<template>
  <div class="overflow-hidden rounded-t1 border border-t1-line bg-white">
    <video
      v-if="source.kind === 'file' && !failed"
      :key="source.url"
      :src="source.url"
      controls
      playsinline
      preload="metadata"
      class="block max-h-65 w-full bg-t1-black object-cover"
      @error="failed = true"
    />

    <iframe
      v-else-if="source.kind === 'embed'"
      :src="source.url"
      :title="media.title || 'Featured video'"
      class="block aspect-video max-h-65 w-full bg-t1-black"
      allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
      allowfullscreen
      loading="lazy"
      referrerpolicy="strict-origin-when-cross-origin"
    ></iframe>

    <div
      v-else
      class="flex aspect-video max-h-65 w-full flex-col items-center justify-center gap-2 bg-t1-black px-6 text-center"
    >
      <PlayCircleIcon class="h-10 w-10 text-white/40" />
      <template v-if="fallbackUrl">
        <p class="text-[13px] font-light text-white/75">
          This video can't be played here.
        </p>
        <a
          :href="fallbackUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-1.5 rounded-full bg-t1-green px-3.5 py-1.5 text-xs font-medium text-t1-black"
        >
          Watch it in a new tab <ArrowTopRightOnSquareIcon class="h-3.5 w-3.5" />
        </a>
      </template>
      <p v-else class="text-[13px] font-light text-white/75">The welcome video is coming soon.</p>
    </div>

    <div class="flex items-center justify-between px-4.5 py-3.5">
      <div>
        <div class="mb-0.5 text-sm font-normal text-t1-black">{{ media.title }}</div>
        <div v-if="media.presenterName" class="text-[11px] font-light text-t1-black/65">
          Recorded by {{ media.presenterName }} · {{ media.presenterRole }}
        </div>
      </div>
      <div class="text-[11px] font-light text-t1-black/65">{{ media.postedLabel }}</div>
    </div>
  </div>
</template>
