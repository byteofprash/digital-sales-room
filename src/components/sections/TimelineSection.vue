<script setup lang="ts">
import { computed, ref } from 'vue'
import { CheckIcon } from '@heroicons/vue/24/solid'
import type { TimelineOwnerSide, TimelineStep } from '@/data/types'
import { useEditModeStore } from '@/stores/editMode'
import EditFab from '@/components/ui/EditFab.vue'
import EditTimelineDialog from '@/components/dialogs/EditTimelineDialog.vue'

const props = defineProps<{ steps: TimelineStep[]; prospectName: string }>()

const editMode = useEditModeStore()
const dialogOpen = ref(false)

const sorted = computed(() => [...props.steps].sort((a, b) => a.dueDate.localeCompare(b.dueDate)))

const sideLabel = computed<Record<TimelineOwnerSide, string>>(() => ({
  talon: 'Talon.One',
  prospect: props.prospectName,
  joint: 'Joint',
}))

const dotClass: Record<TimelineStep['status'], string> = {
  done: 'border-t1-black bg-t1-black text-white',
  active: 'border-t1-green bg-t1-green text-t1-black',
  upcoming: 'border-t1-black/30 bg-white text-t1-black/50',
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <div class="relative">
    <EditFab v-if="editMode.isEditMode" label="Edit timeline" @click="dialogOpen = true" />

    <div class="mb-6 max-w-2xl">
      <h1 class="text-3xl font-light tracking-tight text-t1-black">Joint project timeline</h1>
      <p class="mt-2 text-sm font-light text-t1-black/70">
        A shared plan: what happens next, who owns it and when it's due.
      </p>
    </div>

    <ol v-if="sorted.length" class="relative">
      <li v-for="(step, index) in sorted" :key="step.id" class="relative flex gap-4 pb-6 last:pb-0">
        <span
          v-if="index < sorted.length - 1"
          class="absolute top-7 bottom-0 left-3 w-px bg-t1-line"
          aria-hidden="true"
        ></span>
        <div
          class="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-medium"
          :class="dotClass[step.status]"
        >
          <CheckIcon v-if="step.status === 'done'" class="h-3 w-3" />
          <span v-else>{{ index + 1 }}</span>
        </div>

        <div class="min-w-0 flex-1 rounded-t1 border border-t1-line bg-white p-4">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-[15px] font-normal text-t1-black">{{ step.title }}</span>
            <span
              v-if="step.status === 'active'"
              class="rounded-full bg-t1-green px-2 py-0.5 text-[10px] font-medium tracking-[0.12em] text-t1-black uppercase"
            >
              In progress
            </span>
            <span class="ml-auto text-xs font-light text-t1-black/60">
              Due {{ formatDate(step.dueDate) }}
            </span>
          </div>
          <p v-if="step.description" class="mt-1 text-[13px] font-light text-t1-black/70">
            {{ step.description }}
          </p>
          <div class="mt-2.5 flex items-center gap-2 text-[11px] font-light text-t1-black/65">
            <span
              class="rounded-full border border-t1-black/25 px-2 py-0.5 text-[10px] font-medium tracking-[0.12em] text-t1-black uppercase"
            >
              {{ sideLabel[step.ownerSide] }}
            </span>
            <span v-if="step.ownerName">{{ step.ownerName }}</span>
          </div>
        </div>
      </li>
    </ol>

    <div
      v-else
      class="rounded-t1 border border-dashed border-t1-black/25 py-14 text-center text-sm font-light text-t1-black/60"
    >
      The timeline hasn't been shared yet.
    </div>

    <EditTimelineDialog v-model:open="dialogOpen" :steps="steps" />
  </div>
</template>
