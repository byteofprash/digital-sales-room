import type {
  ResourceLink,
  SuccessStory,
  TimelineStep,
  DocumentEntry,
  LinkTile,
  MediaSpotlightConfig,
  Milestone,
  TeamMember,
  Workspace,
  WelcomeHeroConfig,
} from '../../src/data/types.js'

/** Fields an AE may set on a room through the API (create and edit). */
export interface RoomContent {
  prospectName: string
  aeFirstName: string
  bookMeetingUrl: string
  slackChannelUrl: string
  team: TeamMember[]
  milestones: Milestone[]
  targetGoLive: Workspace['targetGoLive']
  components: {
    hero: WelcomeHeroConfig
    links: LinkTile[]
    media: MediaSpotlightConfig
    documents: DocumentEntry[]
    requirements: ResourceLink[]
    timeline: TimelineStep[]
    architecture: ResourceLink[]
    stories: SuccessStory[]
  }
}

type Obj = Record<string, unknown>

const MILESTONE_STATUSES = ['done', 'active', 'upcoming']
const COLORWAYS = ['electric', 'teal', 'lime', 'navy']
const LINK_ICONS = ['plus', 'branch', 'users']
const FILE_TYPES = ['pdf', 'markdown', 'sheet', 'recording', 'other']
const HERO_ICONS = ['document', 'calendar']
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

function isObj(value: unknown): value is Obj {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Collects every problem instead of stopping at the first, so a client can fix them in one go. */
class Checker {
  readonly errors: string[] = []

  str(o: Obj, key: string, path: string, opts: { optional?: boolean; allowEmpty?: boolean } = {}) {
    const v = o[key]
    if (v === undefined && opts.optional) return
    if (typeof v !== 'string' || (!opts.allowEmpty && !v.trim())) {
      this.errors.push(`${path}${key} must be ${opts.allowEmpty ? 'a string' : 'a non-empty string'}`)
    }
  }

  url(o: Obj, key: string, path: string) {
    const v = o[key]
    let ok = false
    if (typeof v === 'string') {
      try {
        ok = ['http:', 'https:'].includes(new URL(v).protocol)
      } catch {
        ok = false
      }
    }
    if (!ok) this.errors.push(`${path}${key} must be a full http(s) URL`)
  }

  oneOf(o: Obj, key: string, allowed: string[], path: string) {
    if (typeof o[key] !== 'string' || !allowed.includes(o[key])) {
      this.errors.push(`${path}${key} must be one of: ${allowed.join(', ')}`)
    }
  }

  date(o: Obj, key: string, path: string) {
    const v = o[key]
    if (typeof v !== 'string' || !ISO_DATE.test(v) || Number.isNaN(Date.parse(v))) {
      this.errors.push(`${path}${key} must be an ISO date (YYYY-MM-DD)`)
    }
  }

  /** Validates `value` as an array of objects, checking each one with `each`. */
  list(value: unknown, path: string, each: (item: Obj, at: string) => void) {
    if (!Array.isArray(value)) {
      this.errors.push(`${path} must be an array`)
      return
    }
    const ids = new Set<unknown>()
    value.forEach((item, i) => {
      const at = `${path}[${i}].`
      if (!isObj(item)) {
        this.errors.push(`${path}[${i}] must be an object`)
        return
      }
      this.str(item, 'id', at)
      if (ids.has(item.id)) this.errors.push(`${at}id "${String(item.id)}" is duplicated`)
      ids.add(item.id)
      each(item, at)
    })
  }

  obj(value: unknown, path: string, each: (item: Obj, at: string) => void) {
    if (!isObj(value)) {
      this.errors.push(`${path} must be an object`)
      return
    }
    each(value, `${path}.`)
  }
}

const ROOM_KEYS = [
  'prospectName',
  'aeFirstName',
  'bookMeetingUrl',
  'slackChannelUrl',
  'team',
  'milestones',
  'targetGoLive',
  'components',
]
const COMPONENT_KEYS = ['hero', 'links', 'media', 'documents', 'requirements', 'timeline', 'architecture', 'stories']
const OWNER_SIDES = ['talon', 'prospect', 'joint']

/**
 * Validates the editable part of a room. With `partial` (PATCH) every field is
 * optional but, if present, must be fully valid; unknown keys are always
 * rejected so slug, status, ownership and the private engagement feed can
 * never be written through this path. Returns the error list (empty = ok).
 */
export function validateRoomContent(body: Obj, opts: { partial: boolean; extraKeys?: string[] }) {
  const c = new Checker()
  const allowed = [...ROOM_KEYS, ...(opts.extraKeys ?? [])]
  for (const key of Object.keys(body)) {
    if (!allowed.includes(key)) c.errors.push(`Unknown field: ${key}`)
  }

  const has = (key: string) => body[key] !== undefined
  const required = (key: string) => {
    if (!opts.partial && !has(key)) c.errors.push(`${key} is required`)
    return has(key)
  }

  if (required('prospectName')) c.str(body, 'prospectName', '')
  if (required('aeFirstName')) c.str(body, 'aeFirstName', '')
  if (has('bookMeetingUrl')) c.str(body, 'bookMeetingUrl', '', { allowEmpty: true })
  if (has('slackChannelUrl')) c.str(body, 'slackChannelUrl', '', { allowEmpty: true })

  if (has('team')) {
    c.list(body.team, 'team', (m, at) => {
      c.str(m, 'name', at)
      c.str(m, 'role', at)
      c.str(m, 'initials', at)
      c.oneOf(m, 'colorway', COLORWAYS, at)
    })
  }
  if (has('milestones')) {
    c.list(body.milestones, 'milestones', (m, at) => {
      c.str(m, 'label', at)
      c.date(m, 'date', at)
      c.oneOf(m, 'status', MILESTONE_STATUSES, at)
    })
  }
  if (required('targetGoLive')) {
    c.obj(body.targetGoLive, 'targetGoLive', (t, at) => {
      c.date(t, 'date', at)
      c.str(t, 'label', at)
    })
  }

  if (has('components')) {
    c.obj(body.components, 'components', (comp) => {
      for (const key of Object.keys(comp)) {
        if (!COMPONENT_KEYS.includes(key)) c.errors.push(`Unknown field: components.${key}`)
      }
      if (comp.hero !== undefined) {
        c.obj(comp.hero, 'components.hero', (h, hat) => {
          c.list(h.sinceLastVisit, `${hat}sinceLastVisit`, (item, iat) => {
            c.oneOf(item, 'icon', HERO_ICONS, iat)
            c.str(item, 'text', iat)
          })
        })
      }
      if (comp.links !== undefined) {
        c.list(comp.links, 'components.links', (l, lat) => {
          c.oneOf(l, 'icon', LINK_ICONS, lat)
          c.str(l, 'title', lat)
          c.str(l, 'subtitle', lat, { allowEmpty: true })
          c.str(l, 'target', lat)
        })
      }
      if (comp.media !== undefined) {
        c.obj(comp.media, 'components.media', (m, mat) => {
          for (const key of ['videoUrl', 'title', 'presenterName', 'presenterRole', 'postedLabel']) {
            c.str(m, key, mat, { allowEmpty: true })
          }
          // Empty (no video yet), a site-relative path, or a full http(s) URL; the player does the rest.
          const video = m.videoUrl
          if (typeof video === 'string' && video.trim()) {
            const v = video.trim()
            if (!(v.startsWith('/') && !v.startsWith('//'))) c.url(m, 'videoUrl', mat)
          }
        })
      }
      for (const field of ['requirements', 'architecture'] as const) {
        if (comp[field] !== undefined) {
          c.list(comp[field], `components.${field}`, (r, rat) => {
            c.str(r, 'title', rat)
            c.str(r, 'description', rat, { allowEmpty: true })
            c.url(r, 'url', rat)
          })
        }
      }
      if (comp.timeline !== undefined) {
        c.list(comp.timeline, 'components.timeline', (t, tat) => {
          c.str(t, 'title', tat)
          c.str(t, 'description', tat, { allowEmpty: true })
          c.oneOf(t, 'ownerSide', OWNER_SIDES, tat)
          c.str(t, 'ownerName', tat, { allowEmpty: true })
          c.date(t, 'dueDate', tat)
          c.oneOf(t, 'status', MILESTONE_STATUSES, tat)
        })
      }
      if (comp.stories !== undefined) {
        c.list(comp.stories, 'components.stories', (st, sat) => {
          c.str(st, 'customerName', sat)
          c.str(st, 'industry', sat, { allowEmpty: true })
          c.str(st, 'title', sat)
          c.str(st, 'description', sat, { allowEmpty: true })
          c.url(st, 'url', sat)
        })
      }
      if (comp.documents !== undefined) {
        c.list(comp.documents, 'components.documents', (d, dat) => {
          if (d.driveFileId !== null && typeof d.driveFileId !== 'string') {
            c.errors.push(`${dat}driveFileId must be a string or null`)
          }
          c.str(d, 'displayName', dat)
          c.str(d, 'category', dat, { allowEmpty: true })
          c.oneOf(d, 'fileType', FILE_TYPES, dat)
          c.str(d, 'actionLabel', dat, { allowEmpty: true })
          c.str(d, 'href', dat, { optional: true })
        })
      }
    })
  }

  return c.errors
}
