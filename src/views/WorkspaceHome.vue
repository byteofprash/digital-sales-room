<script setup lang="ts">
import { useSessionStore } from '@/stores/session'
import RoomShell from '@/components/layout/RoomShell.vue'
import WelcomeHeroBanner from '@/components/blocks/WelcomeHeroBanner.vue'
import LinksGrid from '@/components/blocks/LinksGrid.vue'
import MediaSpotlight from '@/components/blocks/MediaSpotlight.vue'
import TeamCard from '@/components/blocks/TeamCard.vue'
import MilestoneBanner from '@/components/blocks/MilestoneBanner.vue'
import EngagementSignalsFeed from '@/components/blocks/EngagementSignalsFeed.vue'
import DocumentsList from '@/components/blocks/DocumentsList.vue'

const session = useSessionStore()
</script>

<template>
  <RoomShell active-section-label="Workspace Home">
    <template #default="{ workspace: ws }">
      <WelcomeHeroBanner
        :ae-first-name="ws.aeFirstName"
        :prospect-name="ws.prospectName"
        :since-last-visit="ws.components.hero.sinceLastVisit"
      />

      <LinksGrid :links="ws.components.links" />

      <div class="mb-6 grid grid-cols-2 gap-4.5">
        <MediaSpotlight :media="ws.components.media" />
        <TeamCard
          :team="ws.team"
          :book-meeting-url="ws.bookMeetingUrl"
          :slack-channel-url="ws.slackChannelUrl"
        />
      </div>

      <MilestoneBanner :target-go-live="ws.targetGoLive" />

      <!-- Buyer intent telemetry is internal-only: never rendered for prospect visitors -->
      <EngagementSignalsFeed v-if="session.isAeAuthenticated" :events="ws.components.engagement" />

      <DocumentsList :documents="ws.components.documents" />
    </template>
  </RoomShell>
</template>
