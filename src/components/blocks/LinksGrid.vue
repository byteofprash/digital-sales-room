<script setup lang="ts">
import { ref } from 'vue'
import { PlusIcon, ShareIcon, UserGroupIcon, ArrowRightIcon } from '@heroicons/vue/24/outline'
import type { LinkIcon, LinkTile } from '@/data/types'
import { useEditModeStore } from '@/stores/editMode'
import EditLinksDialog from '@/components/dialogs/EditLinksDialog.vue'

defineProps<{ links: LinkTile[] }>()

const editMode = useEditModeStore()
const dialogOpen = ref(false)

const iconMap: Record<LinkIcon, typeof PlusIcon> = {
  plus: PlusIcon,
  branch: ShareIcon,
  users: UserGroupIcon,
}

function isExternal(target: string) {
  return /^https?:\/\//.test(target)
}
</script>

<template>
  <div class="mb-6">
    <div v-if="editMode.isEditMode" class="mb-2 flex justify-end">
      <button
        type="button"
        class="text-[11px] font-medium text-t1-blue hover:underline"
        @click="dialogOpen = true"
      >
        Edit links
      </button>
    </div>

    <div class="grid grid-cols-3 gap-2.5">
      <component
        :is="isExternal(link.target) ? 'a' : 'RouterLink'"
        v-for="link in links"
        :key="link.id"
        v-bind="isExternal(link.target) ? { href: link.target, target: '_blank' } : { to: link.target }"
        class="group flex cursor-pointer items-center gap-3 rounded-t1 border border-t1-line bg-white p-4 transition-colors hover:border-t1-blue"
      >
        <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-t1-black">
          <component :is="iconMap[link.icon]" class="h-3.5 w-3.5 text-white" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="text-[13px] font-normal text-t1-black">{{ link.title }}</div>
          <div class="mt-0.5 text-[11px] font-light text-t1-black/65">{{ link.subtitle }}</div>
        </div>
        <ArrowRightIcon
          class="h-3.5 w-3.5 shrink-0 text-t1-black/40 transition-colors group-hover:text-t1-blue"
        />
      </component>
    </div>

    <EditLinksDialog v-model:open="dialogOpen" :links="links" />
  </div>
</template>
