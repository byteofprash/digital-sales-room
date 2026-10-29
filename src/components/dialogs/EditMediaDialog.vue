<script setup lang="ts">
import { ref, watch } from 'vue'
import type { MediaSpotlightConfig } from '@/data/types'
import { cloneRaw } from '@/lib/clone'
import { isHttpUrl } from '@/lib/linkKind'
import { useWorkspaceStore } from '@/stores/workspace'
import EditDialog from '@/components/ui/EditDialog.vue'
import { inputClass } from '@/components/ui/formClasses'

const props = defineProps<{ open: boolean; media: MediaSpotlightConfig }>()
const emit = defineEmits<{ 'update:open': [boolean] }>()

const workspace = useWorkspaceStore()
const draft = ref<MediaSpotlightConfig>({ ...props.media })
const error = ref('')

const fields: { key: keyof MediaSpotlightConfig; label: string; placeholder: string }[] = [
  { key: 'videoUrl', label: 'Video link', placeholder: 'https://…/welcome.mp4' },
  { key: 'title', label: 'Title', placeholder: 'A personal welcome' },
  { key: 'presenterName', label: 'Recorded by', placeholder: 'Stefan Weber' },
  { key: 'presenterRole', label: 'Their role', placeholder: 'Account Executive' },
  { key: 'postedLabel', label: 'Posted', placeholder: 'Posted 2 days ago' },
]

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      draft.value = cloneRaw(props.media)
      error.value = ''
    }
  },
)

async function save() {
  const url = draft.value.videoUrl.trim()
  if (url && !isHttpUrl(url) && !url.startsWith('/')) {
    error.value = 'The video link must start with https:// (or be a path such as /media/welcome.mp4)'
    return
  }
  await workspace.updateComponent((ws) => {
    ws.components.media = { ...draft.value, videoUrl: url }
    return ws
  })
  emit('update:open', false)
}
</script>

<template>
  <EditDialog
    :open="open"
    title="Edit featured video"
    @close="emit('update:open', false)"
    @save="save"
  >
    <div class="flex flex-col gap-3">
      <p class="text-xs font-light text-t1-black/65">
        Leave the video link empty to show the room's recordings in its place.
      </p>
      <div v-for="field in fields" :key="field.key">
        <label class="mb-1 block text-xs font-medium text-t1-black">{{ field.label }}</label>
        <input
          v-model="draft[field.key]"
          type="text"
          :placeholder="field.placeholder"
          :class="[inputClass, 'w-full']"
        />
      </div>
      <p v-if="error" class="text-xs font-normal text-t1-danger">{{ error }}</p>
    </div>
  </EditDialog>
</template>
