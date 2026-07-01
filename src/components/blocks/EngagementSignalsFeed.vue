<script setup lang="ts">
import { EyeIcon, LockClosedIcon, UserIcon } from '@heroicons/vue/24/outline'
import type { EngagementEvent } from '@/data/types'

defineProps<{ events: EngagementEvent[] }>()
</script>

<template>
  <div
    class="relative mb-6 overflow-hidden rounded-t1-md border border-t1-warning bg-white px-5.5 py-4.5 shadow-t1-card"
  >
    <div
      class="absolute inset-x-0 top-0 h-[3px]"
      style="
        background: repeating-linear-gradient(
          90deg,
          #f59e0b 0px,
          #f59e0b 12px,
          transparent 12px,
          transparent 20px
        );
      "
    ></div>

    <div class="mb-3.5 flex items-center justify-between">
      <div class="flex items-center gap-2.5">
        <EyeIcon class="h-4 w-4 text-t1-warning" />
        <div class="font-display text-base font-bold tracking-tight text-t1-navy">
          Buyer Intent Signals
        </div>
      </div>
      <div class="flex items-center gap-1.5 rounded-full border border-t1-warning bg-amber-50 px-2.5 py-1">
        <LockClosedIcon class="h-2.5 w-2.5 text-amber-700" />
        <span class="text-[10px] font-bold tracking-wider text-amber-700 uppercase">
          Internal only
        </span>
      </div>
    </div>

    <div class="flex flex-col">
      <div
        v-for="(event, index) in events"
        :key="event.id"
        class="flex items-center gap-2.5 py-2.5"
        :class="index < events.length - 1 ? 'border-b border-t1-line' : ''"
      >
        <div
          class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
          :class="event.isAnonymous ? 'bg-t1-ink-3' : 'bg-t1-electric'"
        >
          <UserIcon v-if="event.isAnonymous" class="h-3 w-3 text-white" />
          <span v-else class="text-[9px] font-bold text-white">{{ event.actorInitials }}</span>
        </div>
        <div class="min-w-0 flex-1 text-[12.5px] text-t1-ink">
          <strong class="text-t1-navy">{{ event.actorName }}</strong>
          {{ event.action }}
          <strong class="text-t1-navy">{{ event.targetLabel }}</strong>
        </div>
        <div class="flex shrink-0 items-center gap-1.5">
          <span
            v-if="event.durationLabel"
            class="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700"
          >
            {{ event.durationLabel }}
          </span>
          <span class="text-[11px] text-t1-ink-3">{{ event.timeLabel }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
