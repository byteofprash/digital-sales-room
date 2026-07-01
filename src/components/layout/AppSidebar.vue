<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { CheckIcon } from '@heroicons/vue/24/solid'
import type { Milestone, TeamMember } from '@/data/types'

const props = defineProps<{
  prospectName: string
  accountManager: TeamMember
  milestones: Milestone[]
}>()

const route = useRoute()
const slug = computed(() => String(route.params.slug))

const navItems = [
  { label: 'Workspace Home', section: null },
  { label: 'Bauhaus Requirements', section: 'requirements' },
  { label: 'Joint Project Timeline', section: 'timeline' },
]

function isActiveSection(section: string | null) {
  return (route.params.section ?? null) === section
}

const statusStyles: Record<Milestone['status'], string> = {
  done: 'border-t1-lime bg-t1-lime/15 text-t1-lime',
  active: 'border-t1-electric bg-t1-electric text-white',
  upcoming: 'border-white/35 bg-transparent text-white/55',
}

defineOptions({ name: 'AppSidebar' })
void props
</script>

<template>
  <nav class="relative flex w-62 shrink-0 flex-col overflow-hidden bg-t1-navy">
    <div
      class="pointer-events-none absolute inset-0 bg-cover opacity-25"
      style="background-image: url('/brand/particles-on-navy.png')"
    ></div>

    <!-- Logo lockup -->
    <div class="relative z-10 border-b border-white/10 px-4.5 pt-5 pb-4">
      <div class="mb-2 flex items-center gap-2">
        <div class="inline-flex items-center gap-px rounded-md bg-t1-electric px-2.5 py-1">
          <span class="font-display text-sm font-extrabold tracking-tight text-white">talon</span>
          <span class="mx-px inline-block h-1.5 w-1.5 rounded-full bg-t1-lime"></span>
          <span class="font-display text-sm font-extrabold tracking-tight text-white">one</span>
        </div>
        <span class="text-lg font-light text-white/25">×</span>
        <div class="inline-flex items-center rounded-md border border-white/20 bg-white/5 px-2.5 py-1">
          <span class="text-xs font-bold tracking-tight text-white/65">{{ prospectName }}</span>
        </div>
      </div>
      <div class="flex items-center gap-1.5">
        <div class="h-1.5 w-1.5 rounded-full bg-t1-lime"></div>
        <span class="text-[10px] font-bold tracking-widest text-white/65 uppercase">
          Digital Project Room
        </span>
      </div>
    </div>

    <!-- Nav -->
    <div class="relative z-10 flex-1 overflow-y-auto py-2">
      <RouterLink
        v-for="item in navItems"
        :key="item.label"
        :to="item.section ? `/room/${slug}/${item.section}` : `/room/${slug}`"
        class="relative flex items-center gap-2.5 px-4.5 py-2.5 text-[12.5px] transition-colors"
        :class="
          isActiveSection(item.section)
            ? 'font-bold text-t1-lime'
            : 'font-normal text-white/65 hover:bg-t1-lime/10'
        "
      >
        <span
          v-if="isActiveSection(item.section)"
          class="absolute top-1.5 bottom-1.5 left-0 w-[3px] rounded-r-sm bg-t1-lime"
        ></span>
        {{ item.label }}
      </RouterLink>

      <div class="mt-1 flex items-center gap-1.5 border-t border-white/10 px-4.5 pt-3 pb-2">
        <span class="text-[9.5px] font-bold tracking-widest text-white/65 uppercase">
          Your Journey
        </span>
      </div>

      <div
        v-for="milestone in milestones"
        :key="milestone.id"
        class="flex items-center gap-2.5 px-4.5 py-1.5"
        :class="milestone.status === 'active' ? 'bg-white/5' : ''"
      >
        <div
          class="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border text-[9px] font-bold"
          :class="statusStyles[milestone.status]"
        >
          <CheckIcon v-if="milestone.status === 'done'" class="h-2 w-2 text-t1-lime" />
          <span v-else>{{ milestones.indexOf(milestone) + 1 }}</span>
        </div>
        <span
          class="text-[11px] font-bold"
          :class="milestone.status === 'upcoming' ? 'text-white/65' : 'text-cream/90'"
        >
          {{ milestone.label }}
        </span>
      </div>
    </div>

    <!-- AE footer -->
    <div class="relative z-10 flex items-center gap-2 border-t border-white/10 px-4 py-3.5">
      <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-t1-electric">
        <span class="text-[10px] font-bold text-white">{{ accountManager.initials }}</span>
      </div>
      <div>
        <div class="text-[11px] leading-tight font-semibold text-white/65">
          {{ accountManager.name }}
        </div>
        <div class="text-[10px] text-white/70">{{ accountManager.role }}</div>
      </div>
    </div>
  </nav>
</template>
