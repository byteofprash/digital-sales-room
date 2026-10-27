<script setup lang="ts">
import { computed, ref, type Component } from 'vue'
import { LockClosedIcon, PencilSquareIcon, EyeIcon } from '@heroicons/vue/24/outline'
import { acmeCorpWorkspace as sample } from '@/data/fixtures/acme-corp'
import { componentCatalog, type CatalogEntry } from '@/data/componentCatalog'
import WelcomeHeroBanner from '@/components/blocks/WelcomeHeroBanner.vue'
import LinksGrid from '@/components/blocks/LinksGrid.vue'
import MediaSpotlight from '@/components/blocks/MediaSpotlight.vue'
import TeamCard from '@/components/blocks/TeamCard.vue'
import MilestoneBanner from '@/components/blocks/MilestoneBanner.vue'
import WhatsNext from '@/components/blocks/WhatsNext.vue'
import DocumentsList from '@/components/blocks/DocumentsList.vue'
import EngagementSignalsFeed from '@/components/blocks/EngagementSignalsFeed.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import ResourceLinksSection from '@/components/sections/ResourceLinksSection.vue'
import TimelineSection from '@/components/sections/TimelineSection.vue'
import StoriesSection from '@/components/sections/StoriesSection.vue'

type Filter = 'all' | 'prospect' | 'internal' | 'editable'

const filters: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'prospect', label: 'Prospect-facing' },
  { id: 'internal', label: 'Internal only' },
  { id: 'editable', label: 'Editable in the room' },
]

const active = ref<Filter>('all')

const visible = computed(() =>
  componentCatalog.filter((entry) => {
    if (active.value === 'prospect') return entry.visibility === 'prospect'
    if (active.value === 'internal') return entry.visibility === 'internal'
    if (active.value === 'editable') return entry.editableInRoom
    return true
  }),
)

/** Every preview is the real block rendered from the sample room, so this page can't drift from what prospects see. */
const previews: Record<string, { component: Component; props: Record<string, unknown> }> = {
  hero: {
    component: WelcomeHeroBanner,
    props: {
      aeFirstName: sample.aeFirstName,
      prospectName: sample.prospectName,
      sinceLastVisit: sample.components.hero.sinceLastVisit,
    },
  },
  links: { component: LinksGrid, props: { links: sample.components.links } },
  media: { component: MediaSpotlight, props: { media: sample.components.media } },
  team: {
    component: TeamCard,
    props: {
      team: sample.team,
      bookMeetingUrl: sample.bookMeetingUrl,
      slackChannelUrl: sample.slackChannelUrl,
    },
  },
  milestone: { component: MilestoneBanner, props: { targetGoLive: sample.targetGoLive } },
  whatsnext: {
    component: WhatsNext,
    props: { steps: sample.components.timeline, prospectName: sample.prospectName },
  },
  documents: { component: DocumentsList, props: { documents: sample.components.documents } },
  journey: {
    component: AppSidebar,
    props: {
      prospectName: sample.prospectName,
      accountManager: sample.team[0],
      milestones: sample.milestones,
    },
  },
  requirements: {
    component: ResourceLinksSection,
    props: {
      field: 'requirements',
      title: 'Requirements',
      intro: 'The use cases and requirements for this project, gathered in one document.',
      emptyText: '',
      items: sample.components.requirements,
    },
  },
  timeline: {
    component: TimelineSection,
    props: { steps: sample.components.timeline, prospectName: sample.prospectName },
  },
  architecture: {
    component: ResourceLinksSection,
    props: {
      field: 'architecture',
      title: 'Architecture',
      intro: 'How Talon.One fits into your stack: diagrams and integration detail.',
      emptyText: '',
      items: sample.components.architecture,
    },
  },
  stories: { component: StoriesSection, props: { stories: sample.components.stories } },
  engagement: {
    component: EngagementSignalsFeed,
    props: { events: sample.components.engagement },
  },
}

function frameClass(entry: CatalogEntry) {
  return entry.previewWidth === 'half' ? 'max-w-md' : ''
}
</script>

<template>
  <div class="h-screen overflow-y-auto bg-t1-offwhite font-body">
    <header class="bg-t1-black px-8 py-9">
      <div class="mx-auto max-w-5xl">
        <RouterLink
          :to="`/room/${sample.slug}`"
          class="text-[11px] font-normal text-white/60 hover:text-white"
        >
          ← Back to a sample room
        </RouterLink>
        <h1 class="mt-3 text-3xl font-light tracking-tight text-white">Component library</h1>
        <p class="mt-2 max-w-2xl text-sm font-light text-white/70">
          Everything you can put in a prospect's digital sales room. Each preview is the real
          component, shown with the {{ sample.prospectName }} sample room.
          {{ componentCatalog.length }} components are available today.
        </p>
      </div>
    </header>

    <main class="mx-auto max-w-5xl px-8 py-7">
      <div class="mb-6 flex flex-wrap gap-2">
        <button
          v-for="filter in filters"
          :key="filter.id"
          type="button"
          class="rounded-full border px-3.5 py-1.5 text-xs font-normal transition-colors"
          :class="
            active === filter.id
              ? 'border-t1-black bg-t1-black text-white'
              : 'border-t1-black/25 text-t1-black hover:border-t1-black'
          "
          @click="active = filter.id"
        >
          {{ filter.label }}
        </button>
      </div>

      <section
        v-for="entry in visible"
        :id="entry.id"
        :key="entry.id"
        class="mb-8 rounded-t1 border border-t1-line bg-white p-6"
      >
        <div class="mb-1 flex flex-wrap items-center gap-2.5">
          <h2 class="text-lg font-normal tracking-tight text-t1-black">{{ entry.name }}</h2>
          <span
            v-if="entry.visibility === 'internal'"
            class="flex items-center gap-1 rounded-full bg-t1-green px-2.5 py-0.5 text-[10px] font-medium tracking-[0.12em] text-t1-black uppercase"
          >
            <LockClosedIcon class="h-2.5 w-2.5" /> Internal only
          </span>
          <span
            v-else
            class="flex items-center gap-1 rounded-full border border-t1-blue px-2.5 py-0.5 text-[10px] font-medium tracking-[0.12em] text-t1-blue uppercase"
          >
            <EyeIcon class="h-2.5 w-2.5" /> Prospect-facing
          </span>
          <span
            v-if="entry.page"
            class="flex items-center gap-1 rounded-full border border-t1-black/25 px-2.5 py-0.5 text-[10px] font-medium tracking-[0.12em] text-t1-black uppercase"
          >
            Full page
          </span>
          <span
            v-if="entry.editableInRoom"
            class="flex items-center gap-1 rounded-full border border-t1-black/25 px-2.5 py-0.5 text-[10px] font-medium tracking-[0.12em] text-t1-black uppercase"
          >
            <PencilSquareIcon class="h-2.5 w-2.5" /> Editable in the room
          </span>
        </div>
        <p class="mb-4 text-sm font-light text-t1-black/70">{{ entry.summary }}</p>

        <div class="mb-4 overflow-hidden rounded-t1 border border-dashed border-t1-line bg-t1-offwhite p-4">
          <!-- Previews are for looking only: no clicks, and nothing inside can enter edit mode -->
          <div class="pointer-events-none select-none" :class="frameClass(entry)">
            <div v-if="entry.id === 'journey'" class="flex h-[34rem] overflow-hidden">
              <component
                :is="previews[entry.id].component"
                v-bind="previews[entry.id].props"
              />
            </div>
            <component
              :is="previews[entry.id].component"
              v-else
              v-bind="previews[entry.id].props"
            />
          </div>
        </div>

        <div class="grid gap-5 sm:grid-cols-2">
          <div>
            <div class="mb-1.5 text-[10px] font-medium tracking-[0.12em] text-t1-grey uppercase">
              What it shows
            </div>
            <ul class="list-disc space-y-1 pl-4 text-[13px] font-light text-t1-black">
              <li v-for="line in entry.whatItShows" :key="line">{{ line }}</li>
            </ul>
          </div>
          <div>
            <div class="mb-1.5 text-[10px] font-medium tracking-[0.12em] text-t1-grey uppercase">
              Set up through
            </div>
            <div v-if="entry.apiFields.length" class="flex flex-wrap gap-1.5">
              <code
                v-for="field in entry.apiFields"
                :key="field"
                class="rounded-t1 bg-t1-offwhite px-1.5 py-0.5 text-[11px] text-t1-black"
              >
                {{ field }}
              </code>
            </div>
            <p v-else class="text-[13px] font-light text-t1-black/65">
              Filled in automatically from visitor activity; there is nothing to configure.
            </p>
          </div>
        </div>
      </section>

      <div v-if="!visible.length" class="py-16 text-center text-sm text-t1-black/60">
        No components match this filter.
      </div>
    </main>
  </div>
</template>
