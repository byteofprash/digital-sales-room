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
  <div class="mb-4.5 grid grid-cols-2 items-center gap-6 rounded-t1 bg-t1-black p-7">
    <div>
      <div class="mb-1.5 text-[13px] font-light text-white/70">Welcome back,</div>
      <div class="text-4xl leading-none font-light tracking-tight text-white">
        {{ aeFirstName }}.
      </div>
      <div class="mt-3 text-sm font-light text-white/70">
        Talon.One <span class="text-t1-green">×</span> {{ prospectName }}
      </div>
    </div>

    <div class="rounded-t1 border border-t1-line-dark p-4.5">
      <div class="mb-3 text-[10px] font-medium tracking-[0.12em] text-white/60 uppercase">
        Since your last visit
      </div>
      <div class="flex flex-col gap-2.5">
        <div v-for="item in sinceLastVisit" :key="item.id" class="flex items-center gap-2.5">
          <div
            class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-t1-pine"
          >
            <DocumentIcon v-if="item.icon === 'document'" class="h-3 w-3 text-white" />
            <CalendarDaysIcon v-else class="h-3 w-3 text-white" />
          </div>
          <span class="text-[13px] font-light text-white/80">{{ item.text }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
