<script setup lang="ts">
import { ref, watch } from 'vue'
import { PlusIcon, TrashIcon } from '@heroicons/vue/24/outline'
import type { SinceLastVisitItem } from '@/data/types'
import { cloneRaw } from '@/lib/clone'
import { useWorkspaceStore } from '@/stores/workspace'
import EditDialog from '@/components/ui/EditDialog.vue'
import { addButtonClass, inputClass, removeButtonClass } from '@/components/ui/formClasses'

const props = defineProps<{ open: boolean; sinceLastVisit: SinceLastVisitItem[] }>()
const emit = defineEmits<{ 'update:open': [boolean] }>()

const workspace = useWorkspaceStore()
const draft = ref<SinceLastVisitItem[]>([])

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) draft.value = cloneRaw(props.sinceLastVisit)
  },
)

function add() {
  draft.value.push({ id: `slv-${crypto.randomUUID()}`, icon: 'document', text: '' })
}

function remove(id: string) {
  draft.value = draft.value.filter((item) => item.id !== id)
}

async function save() {
  const cleaned = draft.value
    .map((item) => ({ ...item, text: item.text.trim() }))
    .filter((item) => item.text)
  await workspace.updateComponent((ws) => {
    ws.components.hero = { ...ws.components.hero, sinceLastVisit: cleaned }
    return ws
  })
  emit('update:open', false)
}
</script>

<template>
  <EditDialog
    :open="open"
    title="Edit welcome hero"
    @close="emit('update:open', false)"
    @save="save"
  >
    <div class="flex flex-col gap-3">
      <p class="text-xs font-light text-t1-black/65">
        The "Since your last visit" list returning visitors see under the greeting.
      </p>
      <div v-for="item in draft" :key="item.id" class="flex items-center gap-2">
        <select v-model="item.icon" :class="inputClass">
          <option value="document">Document</option>
          <option value="calendar">Calendar</option>
        </select>
        <input
          v-model="item.text"
          type="text"
          placeholder="2 new documents added"
          :class="[inputClass, 'flex-1']"
        />
        <button type="button" :class="removeButtonClass" @click="remove(item.id)">
          <TrashIcon class="h-4 w-4" />
        </button>
      </div>
      <button type="button" :class="addButtonClass" @click="add">
        <PlusIcon class="h-3.5 w-3.5" />
        Add update
      </button>
    </div>
  </EditDialog>
</template>
