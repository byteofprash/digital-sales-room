<script setup lang="ts">
import { EyeIcon, LockClosedIcon, UserIcon } from '@heroicons/vue/24/outline'
import type { EngagementEvent } from '@/data/types'

defineProps<{ events: EngagementEvent[] }>()
</script>

<template>
  <div class="mb-6 rounded-t1 bg-t1-black px-6 py-5">
    <div class="mb-3 flex items-center justify-between">
      <div class="flex items-center gap-2.5">
        <EyeIcon class="h-4 w-4 text-t1-green" />
        <div class="text-lg font-light tracking-tight text-white">Buyer Intent Signals</div>
      </div>
      <div class="flex items-center gap-1.5 rounded-full bg-t1-green px-2.5 py-1">
        <LockClosedIcon class="h-2.5 w-2.5 text-t1-black" />
        <span class="text-[10px] font-medium tracking-[0.12em] text-t1-black uppercase">
          Internal only
        </span>
      </div>
    </div>

    <div class="flex flex-col">
      <div
        v-for="(event, index) in events"
        :key="event.id"
        class="flex items-center gap-2.5 py-2.5"
        :class="index < events.length - 1 ? 'border-b border-t1-line-dark' : ''"
      >
        <div
          class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
          :class="event.isAnonymous ? 'border border-white/25' : 'bg-t1-pine'"
        >
          <UserIcon v-if="event.isAnonymous" class="h-3 w-3 text-white/70" />
          <span v-else class="text-[9px] font-normal text-white">{{ event.actorInitials }}</span>
        </div>
        <div class="min-w-0 flex-1 text-[13px] font-light text-white/75">
          <strong class="text-white">{{ event.actorName }}</strong>
          {{ event.action }}
          <strong class="text-white">{{ event.targetLabel }}</strong>
        </div>
        <div class="flex shrink-0 items-center gap-2">
          <span
            v-if="event.durationLabel"
            class="rounded-full border border-t1-green/50 px-2 py-0.5 text-[11px] font-normal text-t1-green"
          >
            {{ event.durationLabel }}
          </span>
          <span class="text-[11px] font-light text-white/60">{{ event.timeLabel }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
