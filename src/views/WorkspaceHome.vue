<script setup lang="ts">
import { useSessionStore } from '@/stores/session'
import { nextSteps } from '@/lib/nextSteps'
import { isComponentEnabled } from '@/lib/enabledComponents'
import type { Workspace } from '@/data/types'
import RoomShell from '@/components/layout/RoomShell.vue'
import WelcomeHeroBanner from '@/components/blocks/WelcomeHeroBanner.vue'
import LinksGrid from '@/components/blocks/LinksGrid.vue'
import RecordingsList from '@/components/blocks/RecordingsList.vue'
import MediaSpotlight from '@/components/blocks/MediaSpotlight.vue'
import TeamCard from '@/components/blocks/TeamCard.vue'
import MilestoneBanner from '@/components/blocks/MilestoneBanner.vue'
import EngagementSignalsFeed from '@/components/blocks/EngagementSignalsFeed.vue'
import WhatsNext from '@/components/blocks/WhatsNext.vue'
import DocumentsList from '@/components/blocks/DocumentsList.vue'

const session = useSessionStore()

function showWhatsNext(ws: Workspace) {
  return isComponentEnabled(ws, 'whatsnext') && nextSteps(ws.components.timeline).length > 0
}
</script>

<template>
  <RoomShell active-section-label="Workspace Home">
    <template #default="{ workspace: ws }">
      <WelcomeHeroBanner
        v-if="isComponentEnabled(ws, 'hero')"
        :ae-first-name="ws.aeFirstName"
        :prospect-name="ws.prospectName"
        :since-last-visit="ws.components.hero.sinceLastVisit"
      />

      <LinksGrid v-if="isComponentEnabled(ws, 'links')" :links="ws.components.links" />

      <!-- Video | Team, with What's next as a third column when the page is wide enough (stacked below otherwise) -->
      <div
        class="mb-6 grid grid-cols-2 gap-4.5"
        :class="showWhatsNext(ws) ? '@3xl:grid-cols-[1.15fr_1fr_1fr]' : ''"
      >
        <!-- No featured video? Show the Gong call recordings in its place. -->
        <MediaSpotlight
          v-if="isComponentEnabled(ws, 'media') && ws.components.media.videoUrl"
          :media="ws.components.media"
        />
        <RecordingsList
          v-else-if="isComponentEnabled(ws, 'recordings')"
          :recordings="ws.components.recordings"
        />
        <TeamCard
          v-if="isComponentEnabled(ws, 'team')"
          :team="ws.team"
          :book-meeting-url="ws.bookMeetingUrl"
          :slack-channel-url="ws.slackChannelUrl"
        />
        <div v-if="showWhatsNext(ws)" class="col-span-2 @3xl:col-span-1">
          <WhatsNext :steps="ws.components.timeline" :prospect-name="ws.prospectName" />
        </div>
      </div>

      <MilestoneBanner v-if="isComponentEnabled(ws, 'milestone')" :target-go-live="ws.targetGoLive" />

      <!-- Buyer intent telemetry is internal-only: never rendered for prospect visitors -->
      <EngagementSignalsFeed v-if="session.isAeAuthenticated" :events="ws.components.engagement" />

      <DocumentsList v-if="isComponentEnabled(ws, 'documents')" :documents="ws.components.documents" />
    </template>
  </RoomShell>
</template>
