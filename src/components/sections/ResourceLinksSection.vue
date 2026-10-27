<script setup lang="ts">
import { ref } from 'vue'
import {
  ArrowTopRightOnSquareIcon,
  DocumentTextIcon,
  LinkIcon,
} from '@heroicons/vue/24/outline'
import type { ResourceLink } from '@/data/types'
import { linkKind, linkKindLabel } from '@/lib/linkKind'
import { useEditModeStore } from '@/stores/editMode'
import EditFab from '@/components/ui/EditFab.vue'
import EditResourceLinksDialog from '@/components/dialogs/EditResourceLinksDialog.vue'

defineProps<{
  field: 'requirements' | 'architecture'
  title: string
  intro: string
  emptyText: string
  items: ResourceLink[]
}>()

const editMode = useEditModeStore()
const dialogOpen = ref(false)
</script>

<template>
  <div class="relative">
    <EditFab v-if="editMode.isEditMode" label="Edit links" @click="dialogOpen = true" />

    <div class="mb-6 max-w-2xl">
      <h1 class="text-3xl font-light tracking-tight text-t1-black">{{ title }}</h1>
      <p class="mt-2 text-sm font-light text-t1-black/70">{{ intro }}</p>
    </div>

    <div v-if="items.length" class="flex flex-col gap-2.5">
      <a
        v-for="item in items"
        :key="item.id"
        :href="item.url"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-4 rounded-t1 border border-t1-line bg-white p-4 transition-colors hover:border-t1-blue"
      >
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-t1-pine">
          <DocumentTextIcon v-if="linkKind(item.url) !== 'link'" class="h-4.5 w-4.5 text-white" />
          <LinkIcon v-else class="h-4.5 w-4.5 text-white" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <span class="truncate text-[15px] font-normal text-t1-black">{{ item.title }}</span>
            <span
              class="shrink-0 rounded-full border border-t1-black/25 px-2 py-0.5 text-[10px] font-medium tracking-[0.12em] text-t1-black uppercase"
            >
              {{ linkKindLabel[linkKind(item.url)] }}
            </span>
          </div>
          <div v-if="item.description" class="mt-0.5 text-[13px] font-light text-t1-black/65">
            {{ item.description }}
          </div>
        </div>
        <span class="flex shrink-0 items-center gap-1.5 text-xs font-normal text-t1-blue">
          Open <ArrowTopRightOnSquareIcon class="h-3.5 w-3.5" />
        </span>
      </a>
    </div>

    <div
      v-else
      class="rounded-t1 border border-dashed border-t1-black/25 py-14 text-center text-sm font-light text-t1-black/60"
    >
      {{ emptyText }}
    </div>

    <EditResourceLinksDialog
      v-model:open="dialogOpen"
      :field="field"
      :title="`Edit ${title.toLowerCase()}`"
      :items="items"
    />
  </div>
</template>
