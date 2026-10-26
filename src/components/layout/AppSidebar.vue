<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { CheckIcon } from '@heroicons/vue/24/solid'
import BrandLogo from '@/components/brand/BrandLogo.vue'
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
  done: 'border-white/40 bg-transparent text-white',
  active: 'border-t1-green bg-t1-green text-t1-black',
  upcoming: 'border-white/25 bg-transparent text-white/55',
}

defineOptions({ name: 'AppSidebar' })
void props
</script>

<template>
  <nav class="flex w-62 shrink-0 flex-col bg-t1-black">
    <!-- Logo lockup -->
    <div class="border-b border-t1-line-dark px-4.5 pt-6 pb-5">
      <BrandLogo variant="white" />
      <div class="mt-5 flex items-center gap-2">
        <span class="text-base font-light text-t1-green">×</span>
        <span class="truncate text-base font-light text-white">{{ prospectName }}</span>
      </div>
      <div class="mt-1 text-[10px] font-medium tracking-[0.12em] text-white/60 uppercase">
        Digital Project Room
      </div>
    </div>

    <!-- Nav -->
    <div class="flex-1 overflow-y-auto py-2">
      <RouterLink
        v-for="item in navItems"
        :key="item.label"
        :to="item.section ? `/room/${slug}/${item.section}` : `/room/${slug}`"
        class="relative flex items-center gap-2.5 px-4.5 py-2.5 text-[13px] transition-colors"
        :class="
          isActiveSection(item.section)
            ? 'font-medium text-t1-green'
            : 'font-light text-white/70 hover:bg-white/5 hover:text-white'
        "
      >
        <span
          v-if="isActiveSection(item.section)"
          class="absolute top-1.5 bottom-1.5 left-0 w-0.5 bg-t1-green"
        ></span>
        {{ item.label }}
      </RouterLink>

      <div class="mt-1 border-t border-t1-line-dark px-4.5 pt-4 pb-2">
        <span class="text-[10px] font-medium tracking-[0.12em] text-white/60 uppercase">
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
          class="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border text-[9px] font-medium"
          :class="statusStyles[milestone.status]"
        >
          <CheckIcon v-if="milestone.status === 'done'" class="h-2.5 w-2.5" />
          <span v-else>{{ milestones.indexOf(milestone) + 1 }}</span>
        </div>
        <span
          class="text-xs"
          :class="milestone.status === 'upcoming' ? 'font-light text-white/60' : 'font-normal text-white'"
        >
          {{ milestone.label }}
        </span>
      </div>
    </div>

    <!-- AE footer -->
    <div class="flex items-center gap-2.5 border-t border-t1-line-dark px-4.5 py-3.5">
      <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-t1-pine">
        <span class="text-[10px] font-normal text-white">{{ accountManager.initials }}</span>
      </div>
      <div>
        <div class="text-xs leading-tight font-normal text-white">
          {{ accountManager.name }}
        </div>
        <div class="text-[11px] font-light text-white/60">{{ accountManager.role }}</div>
      </div>
    </div>
  </nav>
</template>
