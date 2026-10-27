<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useWorkspaceStore } from '@/stores/workspace'
import type { Workspace } from '@/data/types'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'

defineProps<{ activeSectionLabel: string }>()
defineSlots<{ default(props: { workspace: Workspace }): unknown }>()

const route = useRoute()
const store = useWorkspaceStore()

function loadForCurrentSlug() {
  store.load(String(route.params.slug))
}

onMounted(loadForCurrentSlug)
watch(() => route.params.slug, loadForCurrentSlug)
</script>

<template>
  <div class="flex h-screen overflow-hidden font-body">
    <AppSidebar
      v-if="store.workspace"
      :prospect-name="store.workspace.prospectName"
      :account-manager="store.workspace.team[0]"
      :milestones="store.workspace.milestones"
    />

    <main class="flex min-w-0 flex-1 flex-col overflow-hidden">
      <AppTopbar :active-section-label="activeSectionLabel" />

      <div class="main-scroll flex-1 overflow-y-auto px-8 py-7">
        <div v-if="store.isLoading" class="py-24 text-center text-sm text-t1-black/60">
          Loading workspace…
        </div>

        <div v-else-if="store.notFound" class="py-24 text-center">
          <div class="text-2xl font-light text-t1-black">Room not found</div>
          <p class="mt-2 text-sm text-t1-black/65">
            No digital sales room exists at this link. Double-check the URL with your AE.
          </p>
        </div>

        <!-- Same 60rem content width as the component library page; @container lets blocks adapt to it, not to the screen -->
        <div v-else-if="store.workspace" class="@container mx-auto w-full max-w-[60rem]">
          <slot :workspace="store.workspace" />
        </div>
      </div>
    </main>
  </div>
</template>
