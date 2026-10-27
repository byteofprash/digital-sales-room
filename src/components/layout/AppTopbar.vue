<script setup lang="ts">
import { computed } from 'vue'
import { BellIcon } from '@heroicons/vue/24/outline'
import { PencilIcon, CheckIcon } from '@heroicons/vue/24/solid'
import { useSessionStore } from '@/stores/session'
import { useEditModeStore } from '@/stores/editMode'
import { firebaseEnabled } from '@/lib/firebase'

defineProps<{ activeSectionLabel: string }>()

const session = useSessionStore()
const editMode = useEditModeStore()

const avatarInitials = computed(() => {
  if (!session.isAeAuthenticated) return '?'
  if (!session.aeName) return 'AE'
  return session.aeName
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
})
</script>

<template>
  <div class="flex h-13 shrink-0 items-center gap-2 border-b border-t1-line bg-t1-offwhite px-7">
    <span class="text-xs text-t1-black/60">Workspace</span>
    <span class="text-[11px] text-t1-black/40">›</span>
    <span class="text-xs font-normal text-t1-black">{{ activeSectionLabel }}</span>

    <div class="flex-1"></div>

    <div class="flex items-center gap-1.5 rounded-full border border-t1-line bg-white px-2.5 py-1">
      <div class="h-1.5 w-1.5 rounded-full bg-t1-green"></div>
      <span class="text-[11px] font-normal text-t1-black">Last activity 2h ago</span>
    </div>

    <div class="mx-1 h-4.5 w-px bg-t1-line"></div>

    <template v-if="!session.isAeAuthenticated">
      <span v-if="session.authError" class="text-[11px] font-normal text-t1-danger">
        {{ session.authError }}
      </span>
      <button
        class="rounded-full border border-t1-black/25 px-3.5 py-1.5 text-[11px] font-normal text-t1-black transition-colors hover:border-t1-black"
        @click="session.signInAsAe"
      >
        {{ firebaseEnabled ? 'Sign in with Google' : 'Sign in as AE (dev)' }}
      </button>
    </template>

    <template v-else>
      <button
        class="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-normal transition-colors"
        :class="
          editMode.isEditMode
            ? 'border border-t1-black bg-t1-black text-white'
            : 'border border-t1-black/25 text-t1-black hover:border-t1-black'
        "
        @click="editMode.toggle"
      >
        <CheckIcon v-if="editMode.isEditMode" class="h-3 w-3" />
        <PencilIcon v-else class="h-3 w-3" />
        {{ editMode.isEditMode ? 'Done editing' : 'Edit' }}
      </button>
      <button
        class="text-[11px] text-t1-black/60 hover:text-t1-black"
        @click="
          () => {
            editMode.exit()
            session.signOut()
          }
        "
      >
        Sign out
      </button>
    </template>

    <button
      class="relative flex h-8 w-8 items-center justify-center rounded-full hover:bg-t1-black/5"
    >
      <BellIcon class="h-4 w-4 text-t1-black/70" />
      <span
        class="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full border border-t1-offwhite bg-t1-blue"
      ></span>
    </button>

    <div class="ml-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-t1-black">
      <span class="text-[11px] font-normal text-white">{{ avatarInitials }}</span>
    </div>
  </div>
</template>
