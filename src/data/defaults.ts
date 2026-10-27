import type { Workspace } from './types'

/** The four section components every room has; rooms saved before they existed get these filled in on read. */
export function emptySectionComponents(): Pick<
  Workspace['components'],
  'requirements' | 'timeline' | 'architecture' | 'stories' | 'recordings'
> {
  return { requirements: [], timeline: [], architecture: [], stories: [], recordings: [] }
}

export function withDefaults(workspace: Workspace): Workspace {
  return {
    ...workspace,
    components: { ...emptySectionComponents(), ...workspace.components },
  }
}
