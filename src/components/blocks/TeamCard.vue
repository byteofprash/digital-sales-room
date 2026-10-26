<script setup lang="ts">
import { ref } from 'vue'
import type { TeamColorway, TeamMember } from '@/data/types'
import { useEditModeStore } from '@/stores/editMode'
import EditFab from '@/components/ui/EditFab.vue'
import EditTeamDialog from '@/components/dialogs/EditTeamDialog.vue'

defineProps<{
  team: TeamMember[]
  bookMeetingUrl: string
  slackChannelUrl: string
}>()

const editMode = useEditModeStore()
const dialogOpen = ref(false)

// Rooms saved before the 2026 rebrand can carry retired colorway keys; those fall back to black.
const colorClasses: Record<TeamColorway, string> = {
  blue: 'bg-t1-blue text-white',
  pine: 'bg-t1-pine text-white',
  green: 'bg-t1-green text-t1-black',
  black: 'bg-t1-black text-white',
}
</script>

<template>
  <div class="relative rounded-t1 border border-t1-line bg-white p-5">
    <EditFab v-if="editMode.isEditMode" label="Edit team" @click="dialogOpen = true" />

    <div class="mb-3 text-[10px] font-medium tracking-[0.12em] text-t1-blue uppercase">
      Your Talon.One Team
    </div>

    <div
      v-for="(member, index) in team"
      :key="member.id"
      class="flex items-center gap-2.5 py-2.5"
      :class="index < team.length - 1 ? 'border-b border-t1-line' : ''"
    >
      <div
        class="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-full"
        :class="colorClasses[member.colorway] ?? colorClasses.black"
      >
        <span class="text-[11px] font-normal">{{ member.initials }}</span>
      </div>
      <div class="min-w-0 flex-1">
        <div class="truncate text-[13px] font-normal text-t1-black">{{ member.name }}</div>
        <div class="text-[11px] font-light text-t1-black/65">{{ member.role }}</div>
      </div>
    </div>

    <div class="mt-3.5 flex flex-col gap-2 border-t border-t1-line pt-4">
      <a
        :href="bookMeetingUrl"
        target="_blank"
        class="w-full rounded-full bg-t1-blue py-2 text-center text-xs font-normal text-white hover:bg-t1-blue/90"
      >
        Book a Meeting →
      </a>
      <a
        :href="slackChannelUrl"
        target="_blank"
        class="w-full rounded-full border border-t1-black/25 py-2 text-center text-xs font-normal text-t1-black hover:border-t1-black"
      >
        Joint Slack Channel
      </a>
    </div>

    <EditTeamDialog v-model:open="dialogOpen" :team="team" />
  </div>
</template>
