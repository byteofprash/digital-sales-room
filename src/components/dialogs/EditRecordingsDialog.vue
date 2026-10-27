<script setup lang="ts">
import { ref, watch } from 'vue'
import { PlusIcon, TrashIcon } from '@heroicons/vue/24/outline'
import type { Recording } from '@/data/types'
import { cloneRaw } from '@/lib/clone'
import { isHttpUrl } from '@/lib/linkKind'
import { useWorkspaceStore } from '@/stores/workspace'
import EditDialog from '@/components/ui/EditDialog.vue'
import { addButtonClass, inputClass, removeButtonClass } from '@/components/ui/formClasses'

const props = defineProps<{ open: boolean; recordings: Recording[] }>()
const emit = defineEmits<{ 'update:open': [boolean] }>()

const workspace = useWorkspaceStore()
const draft = ref<Recording[]>([])
const error = ref('')

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      draft.value = cloneRaw(props.recordings)
      error.value = ''
    }
  },
)

function add() {
  draft.value.push({
    id: `rec-${crypto.randomUUID()}`,
    title: '',
    description: '',
    url: '',
  })
}

function remove(id: string) {
  draft.value = draft.value.filter((recording) => recording.id !== id)
}

async function save() {
  const bad = draft.value.find(
    (recording) => !recording.title.trim() || !isHttpUrl(recording.url.trim()),
  )
  if (bad) {
    error.value = 'Every recording needs a title and a full link starting with https://'
    return
  }
  const cleaned = draft.value.map((recording) => ({
    ...recording,
    title: recording.title.trim(),
    description: recording.description.trim(),
    url: recording.url.trim(),
  }))
  await workspace.updateComponent((ws) => {
    ws.components.recordings = cleaned
    return ws
  })
  emit('update:open', false)
}
</script>

<template>
  <EditDialog :open="open" title="Edit recordings" @close="emit('update:open', false)" @save="save">
    <div class="flex flex-col gap-4">
      <p class="text-xs font-light text-t1-black/65">
        Add links to recordings, such as a Gong call or a video in Google Drive. Make sure the sharing
        settings let the buying committee open them. These show on the room only when it has no
        featured video.
      </p>

      <div
        v-for="recording in draft"
        :key="recording.id"
        class="flex flex-col gap-2 rounded-t1 border border-t1-line p-3"
      >
        <div class="flex items-center gap-2">
          <input
            v-model="recording.title"
            type="text"
            placeholder="Title, e.g. Technical deep-dive"
            :class="[inputClass, 'flex-1']"
          />
          <button type="button" :class="removeButtonClass" @click="remove(recording.id)">
            <TrashIcon class="h-4 w-4" />
          </button>
        </div>
        <input
          v-model="recording.description"
          type="text"
          placeholder="What was covered (optional)"
          :class="inputClass"
        />
        <input
          v-model="recording.url"
          type="url"
          placeholder="https://app.gong.io/call?id=… or https://drive.google.com/file/d/…"
          :class="inputClass"
        />
      </div>

      <button type="button" :class="addButtonClass" @click="add">
        <PlusIcon class="h-3.5 w-3.5" />
        Add recording
      </button>

      <p v-if="error" class="text-xs font-normal text-t1-danger">{{ error }}</p>
    </div>
  </EditDialog>
</template>
