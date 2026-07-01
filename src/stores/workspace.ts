import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Workspace } from '@/data/types'
import { workspaceRepository } from '@/data/workspaceRepository'

export const useWorkspaceStore = defineStore('workspace', () => {
  const workspace = ref<Workspace | null>(null)
  const isLoading = ref(false)
  const notFound = ref(false)

  async function load(slug: string) {
    isLoading.value = true
    notFound.value = false
    const result = await workspaceRepository.getWorkspace(slug)
    workspace.value = result
    notFound.value = !result
    isLoading.value = false
  }

  async function updateComponent(updater: (ws: Workspace) => Workspace) {
    if (!workspace.value) return
    const updated = await workspaceRepository.updateWorkspace(workspace.value.slug, updater)
    workspace.value = updated
  }

  return { workspace, isLoading, notFound, load, updateComponent }
})
