<script setup lang="ts">
import { ref, watch } from 'vue'
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/vue'
import { PlusIcon, ShareIcon, UserGroupIcon, TrashIcon } from '@heroicons/vue/24/outline'
import type { LinkIcon, LinkTile } from '@/data/types'
import { useWorkspaceStore } from '@/stores/workspace'
import EditDialog from '@/components/ui/EditDialog.vue'

const props = defineProps<{ open: boolean; links: LinkTile[] }>()
const emit = defineEmits<{ 'update:open': [boolean] }>()

const workspace = useWorkspaceStore()
const draft = ref<LinkTile[]>([])

const iconOptions: { value: LinkIcon; label: string; icon: typeof PlusIcon }[] = [
  { value: 'plus', label: 'Plus', icon: PlusIcon },
  { value: 'branch', label: 'Branch', icon: ShareIcon },
  { value: 'users', label: 'Users', icon: UserGroupIcon },
]

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) draft.value = structuredClone(props.links)
  },
)

function addLink() {
  draft.value.push({
    id: `link-${crypto.randomUUID()}`,
    icon: 'plus',
    title: 'New link',
    subtitle: '',
    target: '',
  })
}

function removeLink(id: string) {
  draft.value = draft.value.filter((link) => link.id !== id)
}

async function save() {
  await workspace.updateComponent((ws) => {
    ws.components.links = draft.value
    return ws
  })
  emit('update:open', false)
}
</script>

<template>
  <EditDialog
    :open="open"
    title="Edit links"
    @close="emit('update:open', false)"
    @save="save"
  >
    <div class="flex flex-col gap-4">
      <div
        v-for="link in draft"
        :key="link.id"
        class="flex flex-col gap-2 rounded-t1-sm border border-t1-line p-3"
      >
        <div class="flex items-center gap-2">
          <Listbox v-model="link.icon" as="div" class="relative shrink-0">
            <ListboxButton
              class="flex h-8 w-8 items-center justify-center rounded-md border border-t1-line hover:border-t1-ink-2"
            >
              <component
                :is="iconOptions.find((o) => o.value === link.icon)?.icon"
                class="h-4 w-4 text-t1-electric"
              />
            </ListboxButton>
            <ListboxOptions
              class="absolute z-10 mt-1 w-32 rounded-md border border-t1-line bg-white py-1 shadow-t1-lifted"
            >
              <ListboxOption
                v-for="option in iconOptions"
                :key="option.value"
                :value="option.value"
                class="flex cursor-pointer items-center gap-2 px-2.5 py-1.5 text-xs text-t1-ink hover:bg-t1-electric/6"
              >
                <component :is="option.icon" class="h-3.5 w-3.5" />
                {{ option.label }}
              </ListboxOption>
            </ListboxOptions>
          </Listbox>

          <input
            v-model="link.title"
            type="text"
            placeholder="Title"
            class="flex-1 rounded-md border border-t1-line px-2.5 py-1.5 text-[13px] font-semibold text-t1-navy focus:border-t1-electric focus:outline-none"
          />
          <button
            type="button"
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-t1-danger hover:bg-t1-danger/8"
            @click="removeLink(link.id)"
          >
            <TrashIcon class="h-4 w-4" />
          </button>
        </div>
        <input
          v-model="link.subtitle"
          type="text"
          placeholder="Subtitle"
          class="rounded-md border border-t1-line px-2.5 py-1.5 text-xs text-t1-ink-2 focus:border-t1-electric focus:outline-none"
        />
        <input
          v-model="link.target"
          type="text"
          placeholder="/room/acme-corp/requirements or https://..."
          class="rounded-md border border-t1-line px-2.5 py-1.5 text-xs text-t1-ink-2 focus:border-t1-electric focus:outline-none"
        />
      </div>

      <button
        type="button"
        class="flex items-center justify-center gap-1.5 rounded-md border border-dashed border-t1-line py-2 text-xs font-bold text-t1-ink-2 hover:border-t1-electric hover:text-t1-electric"
        @click="addLink"
      >
        <PlusIcon class="h-3.5 w-3.5" />
        Add link
      </button>
    </div>
  </EditDialog>
</template>
