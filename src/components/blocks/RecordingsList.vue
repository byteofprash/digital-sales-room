<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowTopRightOnSquareIcon, VideoCameraIcon } from '@heroicons/vue/24/outline'
import type { Recording } from '@/data/types'
import { useEditModeStore } from '@/stores/editMode'
import EditFab from '@/components/ui/EditFab.vue'
import EditRecordingsDialog from '@/components/dialogs/EditRecordingsDialog.vue'

const props = defineProps<{ recordings: Recording[] }>()

const editMode = useEditModeStore()
const dialogOpen = ref(false)

const newestFirst = computed(() => [...props.recordings].sort((a, b) => b.date.localeCompare(a.date)))

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <div class="relative rounded-t1 border border-t1-line bg-white p-4.5">
    <EditFab v-if="editMode.isEditMode" label="Edit recordings" @click="dialogOpen = true" />

    <div class="mb-3.5 text-[10px] font-medium tracking-[0.12em] text-t1-blue uppercase">
      Call recordings
    </div>

    <div v-if="newestFirst.length" class="flex flex-col gap-2.5">
      <a
        v-for="recording in newestFirst"
        :key="recording.id"
        :href="recording.url"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-start gap-3 rounded-t1 border border-t1-line p-3 transition-colors hover:border-t1-blue"
      >
        <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-t1-black">
          <VideoCameraIcon class="h-3.5 w-3.5 text-white" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="text-[13px] font-normal text-t1-black">{{ recording.title }}</div>
          <div class="text-[11px] font-light text-t1-black/60">{{ formatDate(recording.date) }}</div>
          <p v-if="recording.description" class="mt-1 text-xs font-light text-t1-black/70">
            {{ recording.description }}
          </p>
        </div>
        <span class="flex shrink-0 items-center gap-1 text-[11px] font-normal text-t1-blue">
          Watch <ArrowTopRightOnSquareIcon class="h-3 w-3" />
        </span>
      </a>
    </div>
    <p v-else class="py-8 text-center text-[13px] font-light text-t1-black/60">
      Recordings of your calls with us will appear here.
    </p>

    <EditRecordingsDialog v-model:open="dialogOpen" :recordings="recordings" />
  </div>
</template>
