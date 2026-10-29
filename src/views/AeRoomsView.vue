<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowTopRightOnSquareIcon, EyeIcon, LockClosedIcon } from '@heroicons/vue/24/outline'
import { CheckIcon } from '@heroicons/vue/24/solid'
import { componentCatalog, type CatalogEntry } from '@/data/componentCatalog'
import { workspaceRepository } from '@/data/workspaceRepository'
import type { ComponentId, RoomStatus, RoomSummary, Workspace } from '@/data/types'
import { enabledIds, selectableComponentIds } from '@/lib/enabledComponents'
import { nextSteps } from '@/lib/nextSteps'
import { useSessionStore } from '@/stores/session'
import { useWorkspaceStore } from '@/stores/workspace'
import { firebaseEnabled } from '@/lib/firebase'
import EditLinksDialog from '@/components/dialogs/EditLinksDialog.vue'
import EditDocumentsDialog from '@/components/dialogs/EditDocumentsDialog.vue'
import EditMilestoneDialog from '@/components/dialogs/EditMilestoneDialog.vue'
import EditRecordingsDialog from '@/components/dialogs/EditRecordingsDialog.vue'
import EditResourceLinksDialog from '@/components/dialogs/EditResourceLinksDialog.vue'
import EditStoriesDialog from '@/components/dialogs/EditStoriesDialog.vue'
import EditTeamDialog from '@/components/dialogs/EditTeamDialog.vue'
import EditTimelineDialog from '@/components/dialogs/EditTimelineDialog.vue'
import EditHeroDialog from '@/components/dialogs/EditHeroDialog.vue'
import EditMediaDialog from '@/components/dialogs/EditMediaDialog.vue'

const route = useRoute()
const router = useRouter()
const session = useSessionStore()
const store = useWorkspaceStore()

const rooms = ref<RoomSummary[]>([])
const roomsLoading = ref(false)
const roomsError = ref('')
const openDialog = ref<ComponentId | null>(null)
const saveError = ref('')

const selectedSlug = computed(() => {
  const slug = route.query.room
  return typeof slug === 'string' ? slug : ''
})
const ws = computed(() => (store.workspace?.slug === selectedSlug.value ? store.workspace : null))

const statusLabel: Record<RoomStatus, string> = {
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',
}
const statusClass: Record<RoomStatus, string> = {
  published: 'bg-t1-green text-t1-black',
  draft: 'border border-t1-black/25 text-t1-black',
  archived: 'bg-t1-black/10 text-t1-black/60',
}

const entries = computed(() =>
  selectableComponentIds
    .map((id) => componentCatalog.find((entry) => entry.id === id))
    .filter((entry): entry is CatalogEntry => Boolean(entry)),
)
const blocks = computed(() => entries.value.filter((entry) => !entry.page))
const pages = computed(() => entries.value.filter((entry) => entry.page))

const enabled = computed(() => (ws.value ? enabledIds(ws.value) : []))
const enabledCount = computed(() => enabled.value.length)

/** What an AE can see at a glance: is there anything in it yet? Components without a count are filled from another one. */
function fillLabel(w: Workspace, id: ComponentId): { text: string; empty: boolean } {
  const count = (n: number, noun: string) => ({
    text: n ? `${n} ${noun}${n === 1 ? '' : 's'}` : 'Empty',
    empty: n === 0,
  })
  const c = w.components
  switch (id) {
    case 'hero':
      return count(c.hero.sinceLastVisit.length, 'update')
    case 'links':
      return count(c.links.length, 'link')
    case 'media':
      return c.media.videoUrl ? { text: 'Video set', empty: false } : { text: 'Empty', empty: true }
    case 'recordings':
      return count(c.recordings.length, 'recording')
    case 'team':
      return count(w.team.length, 'member')
    case 'milestone':
      return w.targetGoLive.date
        ? { text: w.targetGoLive.date, empty: false }
        : { text: 'No date', empty: true }
    case 'whatsnext':
      return { text: nextSteps(c.timeline).length ? 'From the timeline' : 'Needs timeline steps', empty: !nextSteps(c.timeline).length }
    case 'documents':
      return count(c.documents.length, 'document')
    case 'journey':
      return count(w.milestones.length, 'milestone')
    case 'requirements':
      return count(c.requirements.length, 'link')
    case 'timeline':
      return count(c.timeline.length, 'step')
    case 'architecture':
      return count(c.architecture.length, 'link')
    case 'stories':
      return count(c.stories.length, 'story')
  }
}

/** Components with a dialog the AE can fill in from here. The rest are derived from another component's data. */
const derivedFrom: Partial<Record<ComponentId, string>> = {
  whatsnext: 'Fills itself from the joint timeline.',
  journey: 'Shows the room’s deal milestones, set when the room is created.',
}

async function loadRooms() {
  roomsLoading.value = true
  roomsError.value = ''
  try {
    const list = await workspaceRepository.listOwnedRooms(session.aeUid)
    rooms.value = list.sort((a, b) => a.prospectName.localeCompare(b.prospectName))
  } catch {
    roomsError.value = 'Could not load your rooms. Please try again.'
  } finally {
    roomsLoading.value = false
  }
}

function selectRoom(slug: string) {
  router.replace({ query: { room: slug } })
}

async function toggle(id: ComponentId) {
  if (!ws.value) return
  saveError.value = ''
  const current = enabledIds(ws.value)
  const next = selectableComponentIds.filter((c) =>
    c === id ? !current.includes(c) : current.includes(c),
  )
  try {
    await store.updateComponent((w) => {
      w.enabledComponents = next
      return w
    })
  } catch {
    saveError.value = 'Could not save that change. Please try again.'
  }
}

function setDialog(id: ComponentId, open: boolean) {
  openDialog.value = open ? id : openDialog.value === id ? null : openDialog.value
}

const populatable = new Set<ComponentId>([
  'hero',
  'links',
  'media',
  'recordings',
  'team',
  'milestone',
  'documents',
  'requirements',
  'timeline',
  'architecture',
  'stories',
])

// Rooms load once the AE is signed in (in Firebase mode that happens a moment after the page opens).
watch(
  () => session.isAeAuthenticated,
  (signedIn) => {
    if (signedIn) loadRooms()
    else rooms.value = []
  },
  { immediate: true },
)
watch(
  [selectedSlug, () => session.isAeAuthenticated],
  ([slug, signedIn]) => {
    if (slug && signedIn) store.load(slug)
  },
  { immediate: true },
)
onMounted(() => {
  document.title = 'My rooms · Talon.One Digital Sales Room'
})
</script>

<template>
  <div class="h-screen overflow-y-auto bg-t1-offwhite font-body">
    <header class="bg-t1-black px-8 py-9">
      <div class="mx-auto max-w-5xl">
        <RouterLink to="/" class="text-[11px] font-normal text-white/60 hover:text-white">
          ← Back to a sample room
        </RouterLink>
        <h1 class="mt-3 text-3xl font-light tracking-tight text-white">My rooms</h1>
        <p class="mt-2 max-w-2xl text-sm font-light text-white/70">
          Pick one of your rooms, choose which components it shows, and fill each one in.
          <template v-if="session.isAeAuthenticated && session.aeName">
            Signed in as {{ session.aeName }}.
          </template>
        </p>
      </div>
    </header>

    <main class="mx-auto max-w-5xl px-8 py-7">
      <!-- Signed out -->
      <div
        v-if="!session.isAeAuthenticated"
        class="rounded-t1 border border-t1-line bg-white p-8 text-center"
      >
        <div class="text-lg font-normal text-t1-black">Sign in to see your rooms</div>
        <p class="mx-auto mt-1 max-w-sm text-sm font-light text-t1-black/70">
          This page is for Talon.One account executives. Rooms are listed by owner.
        </p>
        <span v-if="session.authError" class="mt-3 block text-[11px] text-t1-danger">
          {{ session.authError }}
        </span>
        <button
          class="mt-4 rounded-full bg-t1-blue px-4 py-2 text-xs font-normal text-white hover:bg-t1-blue/90"
          @click="session.signInAsAe"
        >
          {{ firebaseEnabled ? 'Sign in with Google' : 'Sign in as AE (dev)' }}
        </button>
      </div>

      <div v-else class="grid items-start gap-6 md:grid-cols-[17rem_1fr]">
        <!-- Rooms -->
        <section class="rounded-t1 border border-t1-line bg-white">
          <div class="border-b border-t1-line px-4 py-3">
            <div class="text-[10px] font-medium tracking-[0.12em] text-t1-grey uppercase">
              Your rooms
            </div>
          </div>
          <div v-if="roomsLoading" class="px-4 py-6 text-sm text-t1-black/60">Loading rooms…</div>
          <div v-else-if="roomsError" class="px-4 py-6 text-sm text-t1-danger">{{ roomsError }}</div>
          <div v-else-if="!rooms.length" class="px-4 py-6 text-sm font-light text-t1-black/65">
            You don't own any rooms yet.
          </div>
          <ul v-else>
            <li v-for="room in rooms" :key="room.slug">
              <button
                type="button"
                class="relative flex w-full flex-col gap-1 border-b border-t1-line px-4 py-3 text-left last:border-b-0"
                :class="
                  selectedSlug === room.slug ? 'bg-t1-blue/6' : 'hover:bg-t1-offwhite'
                "
                :aria-current="selectedSlug === room.slug ? 'true' : undefined"
                @click="selectRoom(room.slug)"
              >
                <span
                  v-if="selectedSlug === room.slug"
                  class="absolute top-2 bottom-2 left-0 w-0.5 bg-t1-blue"
                ></span>
                <span class="flex items-center justify-between gap-2">
                  <span class="truncate text-sm font-normal text-t1-black">
                    {{ room.prospectName }}
                  </span>
                  <span
                    class="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium tracking-[0.12em] uppercase"
                    :class="statusClass[room.status]"
                  >
                    {{ statusLabel[room.status] }}
                  </span>
                </span>
                <span class="text-[11px] font-light text-t1-black/65">
                  {{ room.targetGoLive.label }}: {{ room.targetGoLive.date || 'not set' }}
                </span>
              </button>
            </li>
          </ul>
        </section>

        <!-- Components for the selected room -->
        <section>
          <div
            v-if="!selectedSlug"
            class="rounded-t1 border border-dashed border-t1-line bg-white p-8 text-center text-sm font-light text-t1-black/65"
          >
            Select a room to choose its components.
          </div>
          <div
            v-else-if="store.isLoading || !ws"
            class="rounded-t1 border border-t1-line bg-white p-8 text-center text-sm text-t1-black/60"
          >
            <template v-if="store.notFound">This room could not be found.</template>
            <template v-else>Loading room…</template>
          </div>

          <template v-else>
            <div class="mb-4 flex flex-wrap items-center gap-3 rounded-t1 border border-t1-line bg-white p-5">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2.5">
                  <h2 class="truncate text-lg font-normal tracking-tight text-t1-black">
                    {{ ws.prospectName }}
                  </h2>
                  <span
                    class="rounded-full px-2.5 py-0.5 text-[10px] font-medium tracking-[0.12em] uppercase"
                    :class="statusClass[ws.status]"
                  >
                    {{ statusLabel[ws.status] }}
                  </span>
                </div>
                <div class="mt-0.5 text-[13px] font-light text-t1-black/70">
                  {{ enabledCount }} of {{ entries.length }} components selected
                </div>
              </div>
              <RouterLink
                :to="`/room/${ws.slug}`"
                class="flex items-center gap-1.5 rounded-full border border-t1-black/25 px-3.5 py-1.5 text-[11px] font-normal text-t1-black transition-colors hover:border-t1-black"
              >
                Open room
                <ArrowTopRightOnSquareIcon class="h-3 w-3" />
              </RouterLink>
            </div>

            <p v-if="saveError" class="mb-3 text-xs font-normal text-t1-danger">{{ saveError }}</p>

            <template v-for="group in [
              { title: 'On the room’s home page', hint: 'Blocks that sit on the Workspace Home.', items: blocks },
              { title: 'Pages', hint: 'Each one is its own page, reached from the sidebar.', items: pages },
            ]" :key="group.title">
              <div class="mb-2 flex items-baseline gap-2">
                <h3 class="text-[10px] font-medium tracking-[0.12em] text-t1-grey uppercase">
                  {{ group.title }}
                </h3>
                <span class="text-[11px] font-light text-t1-black/55">{{ group.hint }}</span>
              </div>
              <ul class="mb-6 overflow-hidden rounded-t1 border border-t1-line bg-white">
                <li
                  v-for="entry in group.items"
                  :key="entry.id"
                  class="flex items-start gap-3.5 border-b border-t1-line px-4 py-3.5 last:border-b-0"
                >
                  <button
                    type="button"
                    role="checkbox"
                    :aria-checked="enabled.includes(entry.id as ComponentId)"
                    :aria-label="`Show ${entry.name} in this room`"
                    class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-t1 border transition-colors"
                    :class="
                      enabled.includes(entry.id as ComponentId)
                        ? 'border-t1-blue bg-t1-blue text-white'
                        : 'border-t1-black/30 bg-white hover:border-t1-black'
                    "
                    @click="toggle(entry.id as ComponentId)"
                  >
                    <CheckIcon v-if="enabled.includes(entry.id as ComponentId)" class="h-3 w-3" />
                  </button>

                  <div class="min-w-0 flex-1">
                    <div class="flex flex-wrap items-center gap-2">
                      <span class="text-sm font-normal text-t1-black">{{ entry.name }}</span>
                      <span
                        v-if="entry.visibility === 'internal'"
                        class="flex items-center gap-1 text-[10px] font-medium tracking-[0.12em] text-t1-black/60 uppercase"
                      >
                        <LockClosedIcon class="h-2.5 w-2.5" /> Internal
                      </span>
                      <span
                        v-else
                        class="flex items-center gap-1 text-[10px] font-medium tracking-[0.12em] text-t1-blue uppercase"
                      >
                        <EyeIcon class="h-2.5 w-2.5" /> Prospect
                      </span>
                    </div>
                    <p class="mt-0.5 text-[13px] font-light text-t1-black/70">{{ entry.summary }}</p>
                    <p
                      v-if="derivedFrom[entry.id as ComponentId]"
                      class="mt-1 text-[11px] font-light text-t1-black/55"
                    >
                      {{ derivedFrom[entry.id as ComponentId] }}
                    </p>
                  </div>

                  <div class="flex shrink-0 flex-col items-end gap-1.5">
                    <span
                      class="text-[11px] font-light"
                      :class="
                        fillLabel(ws, entry.id as ComponentId).empty
                          ? 'text-t1-black/45'
                          : 'text-t1-black/70'
                      "
                    >
                      {{ fillLabel(ws, entry.id as ComponentId).text }}
                    </span>
                    <button
                      v-if="populatable.has(entry.id as ComponentId)"
                      type="button"
                      class="rounded-full border border-t1-black/25 px-3.5 py-1.5 text-[11px] font-normal text-t1-black transition-colors hover:border-t1-black disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-t1-black/25"
                      :disabled="!enabled.includes(entry.id as ComponentId)"
                      :title="
                        enabled.includes(entry.id as ComponentId)
                          ? undefined
                          : 'Select this component to fill it in'
                      "
                      @click="openDialog = entry.id as ComponentId"
                    >
                      {{ fillLabel(ws, entry.id as ComponentId).empty ? 'Populate' : 'Edit' }}
                    </button>
                  </div>
                </li>
              </ul>
            </template>

            <div class="mb-6 flex items-start gap-2.5 rounded-t1 border border-dashed border-t1-line px-4 py-3">
              <LockClosedIcon class="mt-0.5 h-3.5 w-3.5 shrink-0 text-t1-black/55" />
              <p class="text-[13px] font-light text-t1-black/70">
                <span class="font-normal text-t1-black">Buyer intent signals</span> aren't listed:
                they fill in from visitor activity and only you ever see them.
              </p>
            </div>
          </template>
        </section>
      </div>
    </main>

    <!-- One dialog per fillable component; they read and save through the workspace store -->
    <template v-if="ws">
      <EditHeroDialog
        :open="openDialog === 'hero'"
        :since-last-visit="ws.components.hero.sinceLastVisit"
        @update:open="setDialog('hero', $event)"
      />
      <EditLinksDialog
        :open="openDialog === 'links'"
        :links="ws.components.links"
        @update:open="setDialog('links', $event)"
      />
      <EditMediaDialog
        :open="openDialog === 'media'"
        :media="ws.components.media"
        @update:open="setDialog('media', $event)"
      />
      <EditRecordingsDialog
        :open="openDialog === 'recordings'"
        :recordings="ws.components.recordings"
        @update:open="setDialog('recordings', $event)"
      />
      <EditTeamDialog
        :open="openDialog === 'team'"
        :team="ws.team"
        @update:open="setDialog('team', $event)"
      />
      <EditMilestoneDialog
        :open="openDialog === 'milestone'"
        :target-go-live="ws.targetGoLive"
        @update:open="setDialog('milestone', $event)"
      />
      <EditDocumentsDialog
        :open="openDialog === 'documents'"
        :documents="ws.components.documents"
        @update:open="setDialog('documents', $event)"
      />
      <EditResourceLinksDialog
        :open="openDialog === 'requirements'"
        field="requirements"
        title="Edit requirements"
        :items="ws.components.requirements"
        @update:open="setDialog('requirements', $event)"
      />
      <EditTimelineDialog
        :open="openDialog === 'timeline'"
        :steps="ws.components.timeline"
        @update:open="setDialog('timeline', $event)"
      />
      <EditResourceLinksDialog
        :open="openDialog === 'architecture'"
        field="architecture"
        title="Edit architecture"
        :items="ws.components.architecture"
        @update:open="setDialog('architecture', $event)"
      />
      <EditStoriesDialog
        :open="openDialog === 'stories'"
        :stories="ws.components.stories"
        @update:open="setDialog('stories', $event)"
      />
    </template>
  </div>
</template>
