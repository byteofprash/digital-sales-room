<script setup lang="ts">
import { cloneRaw } from '@/lib/clone'
import { ref, watch } from 'vue'
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/vue'
import { PlusIcon, TrashIcon } from '@heroicons/vue/24/outline'
import type { DocumentEntry, DocumentFileType } from '@/data/types'
import { useWorkspaceStore } from '@/stores/workspace'
import EditDialog from '@/components/ui/EditDialog.vue'

const props = defineProps<{ open: boolean; documents: DocumentEntry[] }>()
const emit = defineEmits<{ 'update:open': [boolean] }>()

const workspace = useWorkspaceStore()
const draft = ref<DocumentEntry[]>([])

const fileTypeOptions: { value: DocumentFileType; label: string }[] = [
  { value: 'pdf', label: 'PDF' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'sheet', label: 'Spreadsheet' },
  { value: 'recording', label: 'Recording' },
  { value: 'other', label: 'Other' },
]

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) draft.value = cloneRaw(props.documents)
  },
)

function addDocument() {
  draft.value.push({
    id: `doc-${crypto.randomUUID()}`,
    driveFileId: null,
    displayName: 'New document',
    category: '',
    fileType: 'other',
    actionLabel: 'View',
  })
}

function removeDocument(id: string) {
  draft.value = draft.value.filter((doc) => doc.id !== id)
}

async function save() {
  await workspace.updateComponent((ws) => {
    ws.components.documents = draft.value
    return ws
  })
  emit('update:open', false)
}
</script>

<template>
  <EditDialog
    :open="open"
    title="Edit key documents"
    @close="emit('update:open', false)"
    @save="save"
  >
    <p class="mb-4 text-xs text-t1-black/60">
      Curated manually for now — picking straight from Google Drive lands in a later phase.
    </p>

    <div class="flex flex-col gap-4">
      <div
        v-for="doc in draft"
        :key="doc.id"
        class="flex flex-col gap-2 rounded-t1 border border-t1-line p-3"
      >
        <div class="flex items-center gap-2">
          <input
            v-model="doc.displayName"
            type="text"
            placeholder="File name"
            class="flex-1 rounded-t1 border border-t1-line px-2.5 py-1.5 text-[13px] font-normal text-t1-black focus:border-t1-blue focus:outline-none"
          />
          <button
            type="button"
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-t1-danger hover:bg-t1-danger/8"
            @click="removeDocument(doc.id)"
          >
            <TrashIcon class="h-4 w-4" />
          </button>
        </div>
        <div class="flex items-center gap-2">
          <Listbox v-model="doc.fileType" as="div" class="relative w-36 shrink-0">
            <ListboxButton
              class="w-full rounded-t1 border border-t1-line px-2.5 py-1.5 text-left text-xs text-t1-black hover:border-t1-black"
            >
              {{ fileTypeOptions.find((o) => o.value === doc.fileType)?.label }}
            </ListboxButton>
            <ListboxOptions
              class="absolute z-10 mt-1 w-full rounded-t1 border border-t1-line bg-white py-1"
            >
              <ListboxOption
                v-for="option in fileTypeOptions"
                :key="option.value"
                :value="option.value"
                class="cursor-pointer px-2.5 py-1.5 text-xs text-t1-black hover:bg-t1-blue/6"
              >
                {{ option.label }}
              </ListboxOption>
            </ListboxOptions>
          </Listbox>
          <input
            v-model="doc.category"
            type="text"
            placeholder="Category, e.g. Security"
            class="flex-1 rounded-t1 border border-t1-line px-2.5 py-1.5 text-xs text-t1-black focus:border-t1-blue focus:outline-none"
          />
          <input
            v-model="doc.actionLabel"
            type="text"
            placeholder="View"
            class="w-20 rounded-t1 border border-t1-line px-2.5 py-1.5 text-xs text-t1-black focus:border-t1-blue focus:outline-none"
          />
        </div>
      </div>

      <button
        type="button"
        class="flex items-center justify-center gap-1.5 rounded-t1 border border-dashed border-t1-black/25 py-2 text-xs font-normal text-t1-black hover:border-t1-blue hover:text-t1-blue"
        @click="addDocument"
      >
        <PlusIcon class="h-3.5 w-3.5" />
        Add document
      </button>
    </div>
  </EditDialog>
</template>
