<script setup lang="ts">
import { ref } from 'vue'
import {
  DocumentTextIcon,
  CodeBracketIcon,
  TableCellsIcon,
  FilmIcon,
  PaperClipIcon,
} from '@heroicons/vue/24/outline'
import type { DocumentEntry, DocumentFileType } from '@/data/types'
import { useEditModeStore } from '@/stores/editMode'
import EditDocumentsDialog from '@/components/dialogs/EditDocumentsDialog.vue'

defineProps<{ documents: DocumentEntry[] }>()

const editMode = useEditModeStore()
const dialogOpen = ref(false)

const iconStyles: Record<DocumentFileType, { icon: typeof DocumentTextIcon; bg: string; border: string; fg: string }> = {
  pdf: { icon: DocumentTextIcon, bg: 'bg-red-50', border: 'border-red-200', fg: 'text-red-500' },
  markdown: { icon: CodeBracketIcon, bg: 'bg-blue-50', border: 'border-blue-200', fg: 'text-blue-500' },
  sheet: { icon: TableCellsIcon, bg: 'bg-green-50', border: 'border-green-200', fg: 'text-green-600' },
  recording: { icon: FilmIcon, bg: 'bg-orange-50', border: 'border-orange-200', fg: 'text-orange-600' },
  other: { icon: PaperClipIcon, bg: 'bg-t1-line/40', border: 'border-t1-line', fg: 'text-t1-ink-2' },
}
</script>

<template>
  <div>
    <div class="mb-3.5 flex items-center justify-between">
      <div>
        <div class="mb-1 text-[10px] font-bold tracking-widest text-t1-ink-3 uppercase">
          Resources
        </div>
        <div class="font-display text-xl font-bold tracking-tight text-t1-navy">
          Key Documents
        </div>
      </div>
      <button
        v-if="editMode.isEditMode"
        type="button"
        class="rounded-md border border-t1-electric px-3.5 py-1.5 text-xs font-bold text-t1-electric hover:bg-t1-electric hover:text-white"
        @click="dialogOpen = true"
      >
        Edit documents
      </button>
      <RouterLink
        v-else
        to="documents"
        class="rounded-md border border-t1-line px-3.5 py-1.5 text-xs font-bold text-t1-ink-2 hover:border-t1-ink-2"
      >
        View all →
      </RouterLink>
    </div>

    <div class="flex flex-col gap-2.5">
      <div
        v-for="doc in documents"
        :key="doc.id"
        class="flex items-center gap-3 rounded-t1-sm border border-t1-line bg-white px-4 py-3 shadow-t1-card transition-shadow hover:shadow-t1-lifted"
      >
        <div
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border"
          :class="[iconStyles[doc.fileType].bg, iconStyles[doc.fileType].border]"
        >
          <component :is="iconStyles[doc.fileType].icon" class="h-3.5 w-3.5" :class="iconStyles[doc.fileType].fg" />
        </div>
        <div class="flex-1 text-[13px] font-bold text-t1-navy">{{ doc.displayName }}</div>
        <div class="flex shrink-0 items-center gap-2">
          <span class="text-[11px] font-semibold text-t1-ink-3">{{ doc.category }}</span>
          <button
            class="rounded-md bg-t1-electric px-3 py-1.5 text-[11px] font-bold text-white hover:bg-t1-electric-hover"
          >
            {{ doc.actionLabel }} →
          </button>
        </div>
      </div>
    </div>

    <EditDocumentsDialog v-model:open="dialogOpen" :documents="documents" />
  </div>
</template>
