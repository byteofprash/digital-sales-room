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

const fileTypeIcons: Record<DocumentFileType, typeof DocumentTextIcon> = {
  pdf: DocumentTextIcon,
  markdown: CodeBracketIcon,
  sheet: TableCellsIcon,
  recording: FilmIcon,
  other: PaperClipIcon,
}
</script>

<template>
  <div>
    <div class="mb-4 flex items-end justify-between">
      <div>
        <div class="mb-1.5 text-[10px] font-medium tracking-[0.12em] text-t1-blue uppercase">
          Resources
        </div>
        <div class="text-2xl leading-none font-light tracking-tight text-t1-black">
          Key Documents
        </div>
      </div>
      <button
        v-if="editMode.isEditMode"
        type="button"
        class="rounded-full border border-t1-blue px-3.5 py-1.5 text-xs font-normal text-t1-blue hover:bg-t1-blue hover:text-white"
        @click="dialogOpen = true"
      >
        Edit documents
      </button>
      <RouterLink
        v-else
        to="documents"
        class="rounded-full border border-t1-black/25 px-3.5 py-1.5 text-xs font-normal text-t1-black hover:border-t1-black"
      >
        View all →
      </RouterLink>
    </div>

    <div class="flex flex-col border-t border-t1-line">
      <div
        v-for="doc in documents"
        :key="doc.id"
        class="flex items-center gap-3 border-b border-t1-line py-3"
      >
        <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-t1-black">
          <component :is="fileTypeIcons[doc.fileType]" class="h-3.5 w-3.5 text-white" />
        </div>
        <div class="flex-1 text-sm font-normal text-t1-black">{{ doc.displayName }}</div>
        <div class="flex shrink-0 items-center gap-3">
          <span class="text-[11px] font-light text-t1-black/65">{{ doc.category }}</span>
          <button
            class="rounded-full border border-t1-black/25 px-3 py-1.5 text-[11px] font-normal text-t1-black hover:border-t1-black hover:bg-t1-black hover:text-white"
          >
            {{ doc.actionLabel }} →
          </button>
        </div>
      </div>
    </div>

    <EditDocumentsDialog v-model:open="dialogOpen" :documents="documents" />
  </div>
</template>
