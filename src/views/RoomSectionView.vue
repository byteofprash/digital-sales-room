<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import RoomShell from '@/components/layout/RoomShell.vue'
import ResourceLinksSection from '@/components/sections/ResourceLinksSection.vue'
import TimelineSection from '@/components/sections/TimelineSection.vue'
import DocumentsList from '@/components/blocks/DocumentsList.vue'
import StoriesSection from '@/components/sections/StoriesSection.vue'
import { isComponentEnabled } from '@/lib/enabledComponents'
import type { ComponentId, Workspace } from '@/data/types'
import ComingSoonView from '@/views/ComingSoonView.vue'

const sectionLabels: Record<string, string> = {
  requirements: 'Requirements',
  timeline: 'Joint Project Timeline',
  architecture: 'Architecture',
  stories: 'Customer Success Stories',
  documents: 'Documents',
}

/** Sections the AE can switch off; a switched-off page is treated like one that doesn't exist. */
const sectionComponents: Record<string, ComponentId> = {
  requirements: 'requirements',
  timeline: 'timeline',
  architecture: 'architecture',
  stories: 'stories',
  documents: 'documents',
}

const route = useRoute()
const section = computed(() => String(route.params.section))
const label = computed(() => sectionLabels[section.value] ?? 'Coming soon')

function shown(ws: Workspace, name: string) {
  const id = sectionComponents[name]
  return section.value === name && (!id || isComponentEnabled(ws, id))
}
</script>

<template>
  <RoomShell :active-section-label="label">
    <template #default="{ workspace: ws }">
      <ResourceLinksSection
        v-if="shown(ws, 'requirements')"
        field="requirements"
        title="Requirements"
        intro="The use cases and requirements for this project, gathered in one document."
        empty-text="The requirements document hasn't been shared yet."
        :items="ws.components.requirements"
      />
      <TimelineSection
        v-else-if="shown(ws, 'timeline')"
        :steps="ws.components.timeline"
        :prospect-name="ws.prospectName"
      />
      <ResourceLinksSection
        v-else-if="shown(ws, 'architecture')"
        field="architecture"
        title="Architecture"
        intro="How Talon.One fits into your stack: diagrams and integration detail."
        empty-text="The architecture documents haven't been shared yet."
        :items="ws.components.architecture"
      />
      <StoriesSection v-else-if="shown(ws, 'stories')" :stories="ws.components.stories" />
      <DocumentsList
        v-else-if="shown(ws, 'documents')"
        :documents="ws.components.documents"
        :show-view-all="false"
      />
      <ComingSoonView v-else />
    </template>
  </RoomShell>
</template>
