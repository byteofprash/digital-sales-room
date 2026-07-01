<script setup lang="ts">
import { ref, watch } from 'vue'
import { useWorkspaceStore } from '@/stores/workspace'
import EditDialog from '@/components/ui/EditDialog.vue'

const props = defineProps<{ open: boolean; targetGoLive: { date: string; label: string } }>()
const emit = defineEmits<{ 'update:open': [boolean] }>()

const workspace = useWorkspaceStore()
const label = ref('')
const date = ref('')

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      label.value = props.targetGoLive.label
      date.value = props.targetGoLive.date
    }
  },
)

async function save() {
  await workspace.updateComponent((ws) => {
    ws.targetGoLive = { label: label.value, date: date.value }
    return ws
  })
  emit('update:open', false)
}
</script>

<template>
  <EditDialog
    :open="open"
    title="Edit target milestone"
    @close="emit('update:open', false)"
    @save="save"
  >
    <div class="flex flex-col gap-3">
      <div>
        <label class="mb-1 block text-xs font-bold text-t1-ink-2">Label</label>
        <input
          v-model="label"
          type="text"
          placeholder="Target Go-Live"
          class="w-full rounded-md border border-t1-line px-2.5 py-1.5 text-[13px] text-t1-navy focus:border-t1-electric focus:outline-none"
        />
      </div>
      <div>
        <label class="mb-1 block text-xs font-bold text-t1-ink-2">Date</label>
        <input
          v-model="date"
          type="date"
          class="w-full rounded-md border border-t1-line px-2.5 py-1.5 text-[13px] text-t1-navy focus:border-t1-electric focus:outline-none"
        />
      </div>
    </div>
  </EditDialog>
</template>
