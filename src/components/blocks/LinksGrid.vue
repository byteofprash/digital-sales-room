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
  <div class="relative mb-6">
    <button
      v-if="editMode.isEditMode"
      type="button"
      class="absolute -top-8 right-0 text-[11px] font-bold text-t1-electric hover:underline"
      @click="dialogOpen = true"
    >
      Edit links
    </button>

    <div class="grid grid-cols-3 gap-2.5">
      <component
        :is="isExternal(link.target) ? 'a' : 'RouterLink'"
        v-for="link in links"
        :key="link.id"
        v-bind="isExternal(link.target) ? { href: link.target, target: '_blank' } : { to: link.target }"
        class="flex cursor-pointer items-center gap-3 rounded-t1-sm border border-t1-line bg-white p-3.5 transition-all hover:border-t1-electric hover:shadow-[0_0_0_3px_rgba(0,97,255,0.07)]"
      >
        <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-t1-electric/7">
          <component :is="iconMap[link.icon]" class="h-3.5 w-3.5 text-t1-electric" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="text-[12.5px] font-bold text-t1-navy">{{ link.title }}</div>
          <div class="mt-0.5 text-[11px] text-t1-ink-3">{{ link.subtitle }}</div>
        </div>
        <ArrowRightIcon class="h-3.5 w-3.5 shrink-0 text-t1-ink-3" />
      </component>
    </div>

    <EditLinksDialog v-model:open="dialogOpen" :links="links" />
  </div>
</template>
