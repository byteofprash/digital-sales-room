<script setup lang="ts">
import { computed, ref } from 'vue'
import { CalendarDaysIcon } from '@heroicons/vue/24/outline'
import { useEditModeStore } from '@/stores/editMode'
import EditFab from '@/components/ui/EditFab.vue'
import EditMilestoneDialog from '@/components/dialogs/EditMilestoneDialog.vue'

const props = defineProps<{ targetGoLive: { date: string; label: string } }>()

const editMode = useEditModeStore()
const dialogOpen = ref(false)

const formattedDate = computed(() =>
  new Date(props.targetGoLive.date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }),
)

const daysToGo = computed(() => {
  const diffMs = new Date(props.targetGoLive.date).getTime() - Date.now()
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
})
</script>

<template>
  <div class="relative mb-6 flex items-center justify-between rounded-t1 bg-t1-black px-7 py-5">
    <EditFab v-if="editMode.isEditMode" label="Edit milestone" @click="dialogOpen = true" />

    <div class="flex items-center gap-4">
      <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-t1-pine">
        <CalendarDaysIcon class="h-4.5 w-4.5 text-white" />
      </div>
      <div>
        <div class="mb-1 text-[10px] font-medium tracking-[0.12em] text-white/60 uppercase">
          {{ targetGoLive.label }}
        </div>
        <div class="text-2xl leading-none font-light tracking-tight text-white">
          {{ formattedDate }}
        </div>
      </div>
    </div>

    <div class="text-right" :class="editMode.isEditMode ? 'mr-36' : ''">
      <div class="text-5xl leading-none font-light tracking-tight text-t1-green">
        {{ daysToGo }}
      </div>
      <div class="mt-1 text-[11px] font-light text-white/70">days to go</div>
    </div>

    <EditMilestoneDialog v-model:open="dialogOpen" :target-go-live="targetGoLive" />
  </div>
</template>
