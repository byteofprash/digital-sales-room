import type { ComponentId, Workspace } from '@/data/types'

/** Every component an AE can pick for a room, in the order the picker lists them. */
export const selectableComponentIds: ComponentId[] = [
  'hero',
  'links',
  'media',
  'recordings',
  'team',
  'milestone',
  'whatsnext',
  'documents',
  'journey',
  'requirements',
  'timeline',
  'architecture',
  'stories',
]

/** Rooms saved before the picker existed have no list and show everything. */
export function enabledIds(workspace: Pick<Workspace, 'enabledComponents'>): ComponentId[] {
  return workspace.enabledComponents ?? selectableComponentIds
}

export function isComponentEnabled(
  workspace: Pick<Workspace, 'enabledComponents'>,
  id: ComponentId,
): boolean {
  return enabledIds(workspace).includes(id)
}
