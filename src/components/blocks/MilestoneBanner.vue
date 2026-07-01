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
  <div
    class="relative mb-6 flex items-center justify-between overflow-hidden rounded-t1-md bg-t1-navy px-6 py-4.5 shadow-t1-card"
  >
    <EditFab v-if="editMode.isEditMode" label="Edit milestone" @click="dialogOpen = true" />

    <div
      class="pointer-events-none absolute inset-0 bg-cover opacity-20"
      style="background-image: url('/brand/particles-on-navy.png')"
    ></div>

    <div class="relative z-10 flex items-center gap-3.5">
      <div
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-t1-sm border border-t1-electric/40 bg-t1-electric/25"
      >
        <CalendarDaysIcon class="h-4.5 w-4.5 text-t1-electric" />
      </div>
      <div>
        <div class="mb-0.5 text-[10px] font-bold tracking-widest text-white/70 uppercase">
          {{ targetGoLive.label }}
        </div>
        <div class="font-display text-2xl font-bold tracking-tight text-t1-cream">
          {{ formattedDate }}
        </div>
      </div>
    </div>

    <div class="relative z-10 text-right">
      <div class="font-display text-3xl font-bold tracking-tight text-t1-lime">
        {{ daysToGo }}
      </div>
      <div class="mt-0.5 text-[11px] text-white/70">days to go</div>
    </div>

    <EditMilestoneDialog v-model:open="dialogOpen" :target-go-live="targetGoLive" />
  </div>
</template>
