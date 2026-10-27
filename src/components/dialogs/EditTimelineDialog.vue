<script setup lang="ts">
import { cloneRaw } from '@/lib/clone'
import { ref, watch } from 'vue'
import { PlusIcon, TrashIcon } from '@heroicons/vue/24/outline'
import type { MilestoneStatus, TimelineOwnerSide, TimelineStep } from '@/data/types'
import { useWorkspaceStore } from '@/stores/workspace'
import EditDialog from '@/components/ui/EditDialog.vue'
import { addButtonClass, inputClass, removeButtonClass } from '@/components/ui/formClasses'

const props = defineProps<{ open: boolean; steps: TimelineStep[] }>()
const emit = defineEmits<{ 'update:open': [boolean] }>()

const workspace = useWorkspaceStore()
const draft = ref<TimelineStep[]>([])
const error = ref('')

const sides: { value: TimelineOwnerSide; label: string }[] = [
  { value: 'talon', label: 'Talon.One' },
  { value: 'prospect', label: 'Prospect' },
  { value: 'joint', label: 'Joint' },
]
const statuses: { value: MilestoneStatus; label: string }[] = [
  { value: 'done', label: 'Done' },
  { value: 'active', label: 'In progress' },
  { value: 'upcoming', label: 'Upcoming' },
]

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      draft.value = cloneRaw(props.steps)
      error.value = ''
    }
  },
)

function add() {
  draft.value.push({
    id: `tl-${crypto.randomUUID()}`,
    title: '',
    description: '',
    ownerSide: 'joint',
    ownerName: '',
    dueDate: '',
    status: 'upcoming',
  })
}

function remove(id: string) {
  draft.value = draft.value.filter((step) => step.id !== id)
}

async function save() {
  if (draft.value.some((step) => !step.title.trim() || !step.dueDate)) {
    error.value = 'Every step needs a title and a due date.'
    return
  }
  const cleaned = draft.value.map((step) => ({
    ...step,
    title: step.title.trim(),
    description: step.description.trim(),
    ownerName: step.ownerName.trim(),
  }))
  await workspace.updateComponent((ws) => {
    ws.components.timeline = cleaned
    return ws
  })
  emit('update:open', false)
}
</script>

<template>
  <EditDialog :open="open" title="Edit timeline" @close="emit('update:open', false)" @save="save">
    <div class="flex flex-col gap-4">
      <div
        v-for="step in draft"
        :key="step.id"
        class="flex flex-col gap-2 rounded-t1 border border-t1-line p-3"
      >
        <div class="flex items-center gap-2">
          <input v-model="step.title" type="text" placeholder="Step" :class="[inputClass, 'flex-1']" />
          <button type="button" :class="removeButtonClass" @click="remove(step.id)">
            <TrashIcon class="h-4 w-4" />
          </button>
        </div>
        <input
          v-model="step.description"
          type="text"
          placeholder="What happens (optional)"
          :class="inputClass"
        />
        <div class="grid grid-cols-2 gap-2">
          <input v-model="step.dueDate" type="date" :class="inputClass" />
          <select v-model="step.status" :class="inputClass">
            <option v-for="status in statuses" :key="status.value" :value="status.value">
              {{ status.label }}
            </option>
          </select>
          <select v-model="step.ownerSide" :class="inputClass">
            <option v-for="side in sides" :key="side.value" :value="side.value">
              {{ side.label }}
            </option>
          </select>
          <input v-model="step.ownerName" type="text" placeholder="Owner name" :class="inputClass" />
        </div>
      </div>

      <button type="button" :class="addButtonClass" @click="add">
        <PlusIcon class="h-3.5 w-3.5" />
        Add step
      </button>

      <p v-if="error" class="text-xs font-normal text-t1-danger">{{ error }}</p>
    </div>
  </EditDialog>
</template>
