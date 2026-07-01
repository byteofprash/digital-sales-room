<script setup lang="ts">
import { BellIcon } from '@heroicons/vue/24/outline'
import { PencilIcon, CheckIcon } from '@heroicons/vue/24/solid'
import { useSessionStore } from '@/stores/session'
import { useEditModeStore } from '@/stores/editMode'

defineProps<{ activeSectionLabel: string }>()

const session = useSessionStore()
const editMode = useEditModeStore()
</script>

<template>
  <div class="flex h-13 shrink-0 items-center gap-2 border-b border-t1-line bg-t1-cream px-7">
    <span class="text-xs text-t1-ink-3">Workspace</span>
    <span class="text-[11px] text-t1-ink-3">›</span>
    <span class="text-xs font-semibold text-t1-navy">{{ activeSectionLabel }}</span>

    <div class="flex-1"></div>

    <div
      class="flex items-center gap-1.5 rounded-full border border-t1-electric/15 bg-t1-electric/6 px-2.5 py-1"
    >
      <div class="h-1.5 w-1.5 rounded-full bg-t1-success"></div>
      <span class="text-[11px] font-semibold text-t1-electric">Last activity 2h ago</span>
    </div>

    <div class="mx-1 h-4.5 w-px bg-t1-line"></div>

    <!-- Dev-only stand-in for real AE auth (Phase 1: Google Workspace SSO) -->
    <button
      v-if="!session.isAeAuthenticated"
      class="rounded-md border border-t1-line px-3 py-1.5 text-[11px] font-semibold text-t1-ink-2 transition-colors hover:border-t1-ink-2"
      @click="session.signInAsAe"
    >
      Sign in as AE
    </button>

    <template v-else>
      <button
        class="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-bold transition-colors"
        :class="
          editMode.isEditMode
            ? 'bg-t1-navy text-white'
            : 'border border-t1-line text-t1-ink-2 hover:border-t1-ink-2'
        "
        @click="editMode.toggle"
      >
        <CheckIcon v-if="editMode.isEditMode" class="h-3 w-3" />
        <PencilIcon v-else class="h-3 w-3" />
        {{ editMode.isEditMode ? 'Done editing' : 'Edit' }}
      </button>
      <button
        class="text-[11px] text-t1-ink-3 hover:text-t1-navy"
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
      class="relative flex h-8 w-8 items-center justify-center rounded-md hover:bg-t1-navy/5"
    >
      <BellIcon class="h-4 w-4 text-t1-ink-3" />
      <span
        class="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full border border-t1-cream bg-t1-electric"
      ></span>
    </button>

    <div class="ml-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-t1-electric">
      <span class="text-[11px] font-bold text-white">{{
        session.isAeAuthenticated ? 'AE' : '?'
      }}</span>
    </div>
  </div>
</template>
