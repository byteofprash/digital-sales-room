<script setup lang="ts">
import { ref, watch } from 'vue'
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/vue'
import { PlusIcon, TrashIcon } from '@heroicons/vue/24/outline'
import type { TeamColorway, TeamMember } from '@/data/types'
import { useWorkspaceStore } from '@/stores/workspace'
import EditDialog from '@/components/ui/EditDialog.vue'

const props = defineProps<{ open: boolean; team: TeamMember[] }>()
const emit = defineEmits<{ 'update:open': [boolean] }>()

const workspace = useWorkspaceStore()
const draft = ref<TeamMember[]>([])
const bookMeetingUrl = ref('')
const slackChannelUrl = ref('')

const colorOptions: { value: TeamColorway; label: string; swatch: string }[] = [
  { value: 'electric', label: 'Electric', swatch: 'bg-t1-electric' },
  { value: 'teal', label: 'Teal', swatch: 'bg-t1-teal' },
  { value: 'lime', label: 'Lime', swatch: 'bg-t1-lime' },
  { value: 'navy', label: 'Navy', swatch: 'bg-t1-navy' },
]

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      draft.value = structuredClone(props.team)
      bookMeetingUrl.value = workspace.workspace?.bookMeetingUrl ?? ''
      slackChannelUrl.value = workspace.workspace?.slackChannelUrl ?? ''
    }
  },
)

function addMember() {
  draft.value.push({
    id: `tm-${crypto.randomUUID()}`,
    name: 'New team member',
    role: '',
    initials: 'NA',
    colorway: 'electric',
  })
}

function removeMember(id: string) {
  draft.value = draft.value.filter((member) => member.id !== id)
}

async function save() {
  await workspace.updateComponent((ws) => {
    ws.team = draft.value
    ws.bookMeetingUrl = bookMeetingUrl.value
    ws.slackChannelUrl = slackChannelUrl.value
    return ws
  })
  emit('update:open', false)
}
</script>

<template>
  <EditDialog :open="open" title="Edit your team" @close="emit('update:open', false)" @save="save">
    <div class="flex flex-col gap-4">
      <div
        v-for="member in draft"
        :key="member.id"
        class="flex flex-col gap-2 rounded-t1-sm border border-t1-line p-3"
      >
        <div class="flex items-center gap-2">
          <Listbox v-model="member.colorway" as="div" class="relative shrink-0">
            <ListboxButton
              class="flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold text-white"
              :class="colorOptions.find((o) => o.value === member.colorway)?.swatch"
            >
              {{ member.initials.slice(0, 2).toUpperCase() || 'NA' }}
            </ListboxButton>
            <ListboxOptions
              class="absolute z-10 mt-1 w-28 rounded-md border border-t1-line bg-white py-1 shadow-t1-lifted"
            >
              <ListboxOption
                v-for="option in colorOptions"
                :key="option.value"
                :value="option.value"
                class="flex cursor-pointer items-center gap-2 px-2.5 py-1.5 text-xs text-t1-ink hover:bg-t1-electric/6"
              >
                <span class="h-3 w-3 rounded-full" :class="option.swatch"></span>
                {{ option.label }}
              </ListboxOption>
            </ListboxOptions>
          </Listbox>

          <input
            v-model="member.name"
            type="text"
            placeholder="Full name"
            class="flex-1 rounded-md border border-t1-line px-2.5 py-1.5 text-[13px] font-semibold text-t1-navy focus:border-t1-electric focus:outline-none"
          />
          <input
            v-model="member.initials"
            type="text"
            maxlength="2"
            placeholder="AE"
            class="w-14 rounded-md border border-t1-line px-2.5 py-1.5 text-center text-xs font-bold text-t1-ink-2 uppercase focus:border-t1-electric focus:outline-none"
          />
          <button
            type="button"
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-t1-danger hover:bg-t1-danger/8"
            @click="removeMember(member.id)"
          >
            <TrashIcon class="h-4 w-4" />
          </button>
        </div>
        <input
          v-model="member.role"
          type="text"
          placeholder="Role, e.g. Your Account Manager"
          class="rounded-md border border-t1-line px-2.5 py-1.5 text-xs text-t1-ink-2 focus:border-t1-electric focus:outline-none"
        />
      </div>

      <button
        type="button"
        class="flex items-center justify-center gap-1.5 rounded-md border border-dashed border-t1-line py-2 text-xs font-bold text-t1-ink-2 hover:border-t1-electric hover:text-t1-electric"
        @click="addMember"
      >
        <PlusIcon class="h-3.5 w-3.5" />
        Add team member
      </button>

      <div class="flex flex-col gap-2 border-t border-t1-line pt-4">
        <label class="text-xs font-bold text-t1-ink-2">Book a meeting link</label>
        <input
          v-model="bookMeetingUrl"
          type="text"
          placeholder="https://cal.com/..."
          class="rounded-md border border-t1-line px-2.5 py-1.5 text-xs text-t1-ink-2 focus:border-t1-electric focus:outline-none"
        />
        <label class="mt-1 text-xs font-bold text-t1-ink-2">Joint Slack channel link</label>
        <input
          v-model="slackChannelUrl"
          type="text"
          placeholder="https://....slack.com/archives/..."
          class="rounded-md border border-t1-line px-2.5 py-1.5 text-xs text-t1-ink-2 focus:border-t1-electric focus:outline-none"
        />
      </div>
    </div>
  </EditDialog>
</template>
