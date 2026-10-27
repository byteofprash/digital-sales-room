<script setup lang="ts">
import { cloneRaw } from '@/lib/clone'
import { ref, watch } from 'vue'
import { PlusIcon, TrashIcon } from '@heroicons/vue/24/outline'
import type { SuccessStory } from '@/data/types'
import { isHttpUrl } from '@/lib/linkKind'
import { useWorkspaceStore } from '@/stores/workspace'
import EditDialog from '@/components/ui/EditDialog.vue'
import { addButtonClass, inputClass, removeButtonClass } from '@/components/ui/formClasses'

const props = defineProps<{ open: boolean; stories: SuccessStory[] }>()
const emit = defineEmits<{ 'update:open': [boolean] }>()

const workspace = useWorkspaceStore()
const draft = ref<SuccessStory[]>([])
const error = ref('')

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      draft.value = cloneRaw(props.stories)
      error.value = ''
    }
  },
)

function add() {
  draft.value.push({
    id: `story-${crypto.randomUUID()}`,
    customerName: '',
    industry: '',
    title: '',
    description: '',
    url: '',
  })
}

function remove(id: string) {
  draft.value = draft.value.filter((story) => story.id !== id)
}

async function save() {
  const bad = draft.value.find(
    (story) => !story.customerName.trim() || !story.title.trim() || !isHttpUrl(story.url.trim()),
  )
  if (bad) {
    error.value = 'Every story needs a customer, a title and a full URL starting with https://'
    return
  }
  const cleaned = draft.value.map((story) => ({
    ...story,
    customerName: story.customerName.trim(),
    industry: story.industry.trim(),
    title: story.title.trim(),
    description: story.description.trim(),
    url: story.url.trim(),
  }))
  await workspace.updateComponent((ws) => {
    ws.components.stories = cleaned
    return ws
  })
  emit('update:open', false)
}
</script>

<template>
  <EditDialog :open="open" title="Edit customer stories" @close="emit('update:open', false)" @save="save">
    <div class="flex flex-col gap-4">
      <p class="text-xs font-light text-t1-black/65">
        Link a PDF or a page about a real customer. Pick stories that match this prospect's
        industry and use cases.
      </p>

      <div
        v-for="story in draft"
        :key="story.id"
        class="flex flex-col gap-2 rounded-t1 border border-t1-line p-3"
      >
        <div class="flex items-center gap-2">
          <input
            v-model="story.customerName"
            type="text"
            placeholder="Customer"
            :class="[inputClass, 'flex-1']"
          />
          <input v-model="story.industry" type="text" placeholder="Industry" :class="[inputClass, 'w-32']" />
          <button type="button" :class="removeButtonClass" @click="remove(story.id)">
            <TrashIcon class="h-4 w-4" />
          </button>
        </div>
        <input v-model="story.title" type="text" placeholder="Story title" :class="inputClass" />
        <input
          v-model="story.description"
          type="text"
          placeholder="One-line summary (optional)"
          :class="inputClass"
        />
        <input
          v-model="story.url"
          type="url"
          placeholder="https://www.talon.one/customers/… or https://…/story.pdf"
          :class="inputClass"
        />
      </div>

      <button type="button" :class="addButtonClass" @click="add">
        <PlusIcon class="h-3.5 w-3.5" />
        Add story
      </button>

      <p v-if="error" class="text-xs font-normal text-t1-danger">{{ error }}</p>
    </div>
  </EditDialog>
</template>
