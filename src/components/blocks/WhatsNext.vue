<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { TimelineOwnerSide, TimelineStep } from '@/data/types'

const props = defineProps<{ steps: TimelineStep[]; prospectName: string }>()

const route = useRoute()

// The first two steps that aren't done, in date order: the current one and the one after it.
const upcoming = computed(() =>
  [...props.steps]
    .filter((step) => step.status !== 'done')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 2),
)

const sideLabel = computed<Record<TimelineOwnerSide, string>>(() => ({
  talon: 'Talon.One',
  prospect: props.prospectName,
  joint: 'Joint',
}))

function tag(step: TimelineStep, index: number) {
  return index === 0 && step.status === 'active' ? 'Now' : 'Up next'
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>

<template>
  <div v-if="upcoming.length" class="mb-6">
    <div class="mb-4 flex items-end justify-between">
      <div>
        <div class="mb-1.5 text-[10px] font-medium tracking-[0.12em] text-t1-blue uppercase">
          Joint project timeline
        </div>
        <div class="text-2xl leading-none font-light tracking-tight text-t1-black">
          What's next
        </div>
      </div>
      <RouterLink
        :to="`/room/${String(route.params.slug)}/timeline`"
        class="rounded-full border border-t1-black/25 px-3.5 py-1.5 text-xs font-normal text-t1-black hover:border-t1-black"
      >
        Full timeline →
      </RouterLink>
    </div>

    <div class="grid grid-cols-2 gap-2.5">
      <div
        v-for="(step, index) in upcoming"
        :key="step.id"
        class="rounded-t1 border bg-white p-4"
        :class="tag(step, index) === 'Now' ? 'border-t1-green' : 'border-t1-line'"
      >
        <div class="mb-2 flex items-center justify-between">
          <span
            class="rounded-full px-2 py-0.5 text-[10px] font-medium tracking-[0.12em] uppercase"
            :class="
              tag(step, index) === 'Now'
                ? 'bg-t1-green text-t1-black'
                : 'border border-t1-black/25 text-t1-black'
            "
          >
            {{ tag(step, index) }}
          </span>
          <span class="text-xs font-light text-t1-black/60">Due {{ formatDate(step.dueDate) }}</span>
        </div>
        <div class="text-[15px] font-normal text-t1-black">{{ step.title }}</div>
        <p v-if="step.description" class="mt-1 text-[13px] font-light text-t1-black/70">
          {{ step.description }}
        </p>
        <div class="mt-2.5 text-[11px] font-light text-t1-black/65">
          {{ sideLabel[step.ownerSide] }}<span v-if="step.ownerName"> · {{ step.ownerName }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
