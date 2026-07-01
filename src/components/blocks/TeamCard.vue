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

const colorClasses: Record<TeamColorway, string> = {
  electric: 'bg-t1-electric',
  teal: 'bg-t1-teal',
  lime: 'bg-t1-lime text-t1-navy',
  navy: 'bg-t1-navy',
}
</script>

<template>
  <div class="relative rounded-t1-md border border-t1-line bg-white p-4.5 shadow-t1-card">
    <EditFab v-if="editMode.isEditMode" label="Edit team" @click="dialogOpen = true" />

    <div class="mb-3.5 text-[10px] font-bold tracking-widest text-t1-ink-3 uppercase">
      Your Talon.One Team
    </div>

    <div
      v-for="(member, index) in team"
      :key="member.id"
      class="flex items-center gap-2.5 py-2.5"
      :class="index < team.length - 1 ? 'border-b border-t1-line' : ''"
    >
      <div
        class="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-full text-white"
        :class="colorClasses[member.colorway]"
      >
        <span class="text-[11px] font-bold">{{ member.initials }}</span>
      </div>
      <div class="min-w-0 flex-1">
        <div class="truncate text-[12.5px] font-bold text-t1-navy">{{ member.name }}</div>
        <div class="text-[11px] text-t1-ink-3">{{ member.role }}</div>
      </div>
    </div>

    <div class="mt-3.5 flex flex-col gap-2 border-t border-t1-line pt-3.5">
      <a
        :href="bookMeetingUrl"
        target="_blank"
        class="w-full rounded-md bg-t1-electric py-2 text-center text-xs font-bold text-white hover:bg-t1-electric-hover"
      >
        Book a Meeting →
      </a>
      <a
        :href="slackChannelUrl"
        target="_blank"
        class="w-full rounded-md border border-t1-line py-2 text-center text-xs font-bold text-t1-ink-2 hover:border-t1-ink-2"
      >
        Joint Slack Channel
      </a>
    </div>

    <EditTeamDialog v-model:open="dialogOpen" :team="team" />
  </div>
</template>
