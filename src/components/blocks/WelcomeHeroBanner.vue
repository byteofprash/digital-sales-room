<script setup lang="ts">
import { DocumentIcon, CalendarDaysIcon } from '@heroicons/vue/24/outline'
import type { SinceLastVisitItem } from '@/data/types'

defineProps<{
  aeFirstName: string
  prospectName: string
  sinceLastVisit: SinceLastVisitItem[]
}>()
</script>

<template>
  <div
    class="relative mb-4.5 grid grid-cols-2 items-center gap-6 overflow-hidden rounded-t1-md bg-t1-navy p-6"
  >
    <div
      class="pointer-events-none absolute inset-0 bg-cover opacity-30"
      style="background-image: url('/brand/particles-on-navy.png')"
    ></div>

    <div class="relative z-10">
      <div class="mb-1 text-xs text-white/70">Welcome back,</div>
      <div class="font-display text-4xl font-bold tracking-tight text-t1-cream">
        {{ aeFirstName }}.
      </div>
      <div class="mt-1.5 text-[13px] text-white/50">
        Talon.One <span class="text-t1-electric">×</span> {{ prospectName }}
      </div>
    </div>

    <div class="relative z-10 rounded-t1-sm border border-white/10 bg-white/6 p-4">
      <div class="mb-3 text-[10px] font-bold tracking-widest text-white/70 uppercase">
        Since your last visit
      </div>
      <div class="flex flex-col gap-2.5">
        <div v-for="item in sinceLastVisit" :key="item.id" class="flex items-center gap-2.5">
          <div
            class="flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full border"
            :class="
              item.icon === 'document'
                ? 'border-t1-electric/50 bg-t1-electric/30'
                : 'border-t1-lime/30 bg-t1-lime/15'
            "
          >
            <DocumentIcon v-if="item.icon === 'document'" class="h-2.5 w-2.5 text-t1-periwinkle" />
            <CalendarDaysIcon v-else class="h-2.5 w-2.5 text-t1-lime" />
          </div>
          <span class="text-xs text-white/70">{{ item.text }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
