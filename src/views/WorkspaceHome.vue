<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useWorkspaceStore } from '@/stores/workspace'
import { useSessionStore } from '@/stores/session'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import WelcomeHeroBanner from '@/components/blocks/WelcomeHeroBanner.vue'
import LinksGrid from '@/components/blocks/LinksGrid.vue'
import MediaSpotlight from '@/components/blocks/MediaSpotlight.vue'
import TeamCard from '@/components/blocks/TeamCard.vue'
import MilestoneBanner from '@/components/blocks/MilestoneBanner.vue'
import EngagementSignalsFeed from '@/components/blocks/EngagementSignalsFeed.vue'
import DocumentsList from '@/components/blocks/DocumentsList.vue'

const route = useRoute()
const workspace = useWorkspaceStore()
const session = useSessionStore()

function loadForCurrentSlug() {
  workspace.load(String(route.params.slug))
}

onMounted(loadForCurrentSlug)
watch(() => route.params.slug, loadForCurrentSlug)
</script>

<template>
  <div class="flex h-screen overflow-hidden font-body">
    <AppSidebar
      v-if="workspace.workspace"
      :prospect-name="workspace.workspace.prospectName"
      :account-manager="workspace.workspace.team[0]"
      :milestones="workspace.workspace.milestones"
    />

    <main class="flex min-w-0 flex-1 flex-col overflow-hidden">
      <AppTopbar active-section-label="Workspace Home" />

      <div class="main-scroll flex-1 overflow-y-auto px-8 py-7">
        <div v-if="workspace.isLoading" class="py-24 text-center text-sm text-t1-ink-3">
          Loading workspace…
        </div>

        <div v-else-if="workspace.notFound" class="py-24 text-center">
          <div class="font-display text-xl font-bold text-t1-navy">Room not found</div>
          <p class="mt-2 text-sm text-t1-ink-3">
            No digital sales room exists at this link. Double-check the URL with your AE.
          </p>
        </div>

        <template v-else-if="workspace.workspace">
          <WelcomeHeroBanner
            :ae-first-name="workspace.workspace.aeFirstName"
            :prospect-name="workspace.workspace.prospectName"
            :since-last-visit="workspace.workspace.components.hero.sinceLastVisit"
          />

          <LinksGrid :links="workspace.workspace.components.links" />

          <div class="mb-6 grid grid-cols-2 gap-4.5">
            <MediaSpotlight :media="workspace.workspace.components.media" />
            <TeamCard
              :team="workspace.workspace.team"
              :book-meeting-url="workspace.workspace.bookMeetingUrl"
              :slack-channel-url="workspace.workspace.slackChannelUrl"
            />
          </div>

          <MilestoneBanner :target-go-live="workspace.workspace.targetGoLive" />

          <!-- Buyer intent telemetry is internal-only: never rendered for prospect visitors -->
          <EngagementSignalsFeed
            v-if="session.isAeAuthenticated"
            :events="workspace.workspace.components.engagement"
          />

          <DocumentsList :documents="workspace.workspace.components.documents" />
        </template>
      </div>
    </main>
  </div>
</template>
