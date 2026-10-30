import type { Workspace } from './types'
import { withDefaults } from './defaults'
import { toRoomSummary, type WorkspaceRepository } from './workspaceRepository'

/** Room fields PATCH /api/rooms/:slug accepts; everything else on the response is read-only metadata. */
const TOP_LEVEL_FIELDS = [
  'prospectName',
  'aeFirstName',
  'bookMeetingUrl',
  'slackChannelUrl',
  'team',
  'milestones',
  'targetGoLive',
  'enabledComponents',
] as const

async function call<T>(path: string, init?: RequestInit): Promise<T | null> {
  const response = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json' },
  })
  if (response.status === 404) return null
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    const details = Array.isArray(body.details) ? `: ${body.details.join('; ')}` : ''
    throw new Error(`${body.error ?? `Request failed (${response.status})`}${details}`)
  }
  return body as T
}

/** The API never returns the private engagement feed, so rooms read this way show it as empty. */
function toWorkspace(room: Workspace): Workspace {
  return withDefaults({
    ...room,
    status: room.status ?? 'published',
    components: { ...room.components, engagement: [] },
  })
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

/**
 * Reads and writes rooms through /api/rooms. Used only in dev-bypass mode (see devBypass.ts), where the
 * server accepts every caller and shows them every room.
 */
export const apiWorkspaceRepository: WorkspaceRepository = {
  async listOwnedRooms() {
    const result = await call<{ rooms: Workspace[] }>('/api/rooms')
    return (result?.rooms ?? []).map(toRoomSummary)
  },

  async getWorkspace(slug) {
    const result = await call<{ room: Workspace }>(`/api/rooms/${encodeURIComponent(slug)}`)
    return result ? toWorkspace(result.room) : null
  },

  async updateWorkspace(slug, updater) {
    const current = await apiWorkspaceRepository.getWorkspace(slug)
    if (!current) throw new Error(`Workspace not found: ${slug}`)
    const next = updater(structuredClone(current))

    // Send only what changed: the API validates every field it receives, and components are replaced whole.
    const patch: Record<string, unknown> = {}
    for (const key of TOP_LEVEL_FIELDS) {
      if (!same(current[key], next[key])) patch[key] = next[key]
    }
    const components: Record<string, unknown> = {}
    for (const key of Object.keys(next.components) as (keyof Workspace['components'])[]) {
      if (key === 'engagement') continue
      if (!same(current.components[key], next.components[key])) components[key] = next.components[key]
    }
    if (Object.keys(components).length) patch.components = components
    if (!Object.keys(patch).length) return next

    const result = await call<{ room: Workspace }>(`/api/rooms/${encodeURIComponent(slug)}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    })
    return result ? toWorkspace(result.room) : next
  },
}

