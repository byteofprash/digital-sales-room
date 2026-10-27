<script setup lang="ts">
import { ref } from 'vue'
import { ArrowTopRightOnSquareIcon } from '@heroicons/vue/24/outline'
import type { SuccessStory } from '@/data/types'
import { linkKind, linkKindLabel } from '@/lib/linkKind'
import { useEditModeStore } from '@/stores/editMode'
import EditFab from '@/components/ui/EditFab.vue'
import EditStoriesDialog from '@/components/dialogs/EditStoriesDialog.vue'

defineProps<{ stories: SuccessStory[] }>()

const editMode = useEditModeStore()
const dialogOpen = ref(false)
</script>

<template>
  <div class="relative">
    <EditFab v-if="editMode.isEditMode" label="Edit stories" @click="dialogOpen = true" />

    <div class="mb-6 max-w-2xl">
      <h1 class="text-3xl font-light tracking-tight text-t1-black">Customer success stories</h1>
      <p class="mt-2 text-sm font-light text-t1-black/70">
        Real customers who solved similar problems, picked for this project.
      </p>
    </div>

    <div v-if="stories.length" class="grid gap-3 sm:grid-cols-2">
      <a
        v-for="story in stories"
        :key="story.id"
        :href="story.url"
        target="_blank"
        rel="noopener noreferrer"
        class="flex flex-col rounded-t1 border border-t1-line bg-white p-5 transition-colors hover:border-t1-blue"
      >
        <div class="mb-3 flex items-center gap-2">
          <span class="text-[10px] font-medium tracking-[0.12em] text-t1-blue uppercase">
            {{ story.customerName }}
          </span>
          <span v-if="story.industry" class="text-[11px] font-light text-t1-black/55">
            · {{ story.industry }}
          </span>
        </div>
        <div class="text-lg leading-snug font-light text-t1-black">{{ story.title }}</div>
        <p v-if="story.description" class="mt-2 flex-1 text-[13px] font-light text-t1-black/70">
          {{ story.description }}
        </p>
        <div class="mt-4 flex items-center justify-between text-xs">
          <span
            class="rounded-full border border-t1-black/25 px-2 py-0.5 text-[10px] font-medium tracking-[0.12em] text-t1-black uppercase"
          >
            {{ linkKindLabel[linkKind(story.url)] }}
          </span>
          <span class="flex items-center gap-1.5 font-normal text-t1-blue">
            Read the story <ArrowTopRightOnSquareIcon class="h-3.5 w-3.5" />
          </span>
        </div>
      </a>
    </div>

    <div
      v-else
      class="rounded-t1 border border-dashed border-t1-black/25 py-14 text-center text-sm font-light text-t1-black/60"
    >
      No customer stories have been shared yet.
    </div>

    <EditStoriesDialog v-model:open="dialogOpen" :stories="stories" />
  </div>
</template>
