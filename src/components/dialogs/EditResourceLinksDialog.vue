<script setup lang="ts">
import { cloneRaw } from '@/lib/clone'
import { ref, watch } from 'vue'
import { PlusIcon, TrashIcon } from '@heroicons/vue/24/outline'
import type { ResourceLink } from '@/data/types'
import { isHttpUrl } from '@/lib/linkKind'
import { useWorkspaceStore } from '@/stores/workspace'
import EditDialog from '@/components/ui/EditDialog.vue'
import { addButtonClass, inputClass, removeButtonClass } from '@/components/ui/formClasses'

const props = defineProps<{
  open: boolean
  title: string
  field: 'requirements' | 'architecture'
  items: ResourceLink[]
}>()
const emit = defineEmits<{ 'update:open': [boolean] }>()

const workspace = useWorkspaceStore()
const draft = ref<ResourceLink[]>([])
const error = ref('')

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      draft.value = cloneRaw(props.items)
      error.value = ''
    }
  },
)

function add() {
  draft.value.push({ id: `res-${crypto.randomUUID()}`, title: '', description: '', url: '' })
}

function remove(id: string) {
  draft.value = draft.value.filter((item) => item.id !== id)
}

async function save() {
  const bad = draft.value.find((item) => !item.title.trim() || !isHttpUrl(item.url.trim()))
  if (bad) {
    error.value = 'Every link needs a title and a full URL starting with https://'
    return
  }
  const cleaned = draft.value.map((item) => ({
    ...item,
    title: item.title.trim(),
    description: item.description.trim(),
    url: item.url.trim(),
  }))
  await workspace.updateComponent((ws) => {
    ws.components[props.field] = cleaned
    return ws
  })
  emit('update:open', false)
}
</script>

<template>
  <EditDialog :open="open" :title="title" @close="emit('update:open', false)" @save="save">
    <div class="flex flex-col gap-4">
      <p class="text-xs font-light text-t1-black/65">
        Link a PDF, a Google Doc or any web page. Make sure the sharing settings let the buying
        committee open it.
      </p>

      <div
        v-for="item in draft"
        :key="item.id"
        class="flex flex-col gap-2 rounded-t1 border border-t1-line p-3"
      >
        <div class="flex items-center gap-2">
          <input v-model="item.title" type="text" placeholder="Title" :class="[inputClass, 'flex-1']" />
          <button type="button" :class="removeButtonClass" @click="remove(item.id)">
            <TrashIcon class="h-4 w-4" />
          </button>
        </div>
        <input
          v-model="item.description"
          type="text"
          placeholder="Short description (optional)"
          :class="inputClass"
        />
        <input
          v-model="item.url"
          type="url"
          placeholder="https://docs.google.com/document/… or https://…/file.pdf"
          :class="inputClass"
        />
      </div>

      <button type="button" :class="addButtonClass" @click="add">
        <PlusIcon class="h-3.5 w-3.5" />
        Add link
      </button>

      <p v-if="error" class="text-xs font-normal text-t1-danger">{{ error }}</p>
    </div>
  </EditDialog>
</template>
