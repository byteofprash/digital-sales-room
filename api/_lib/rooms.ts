import { FieldValue, type DocumentData, type Timestamp } from 'firebase-admin/firestore'
import type { RoomStatus, Workspace } from '../../src/data/types.js'
import type { Ae } from './auth.js'
import { getAdminDb } from './firebaseAdmin.js'
import { HttpError } from './http.js'
import type { RoomContent } from './validation.js'

export const ROOM_STATUSES: RoomStatus[] = ['draft', 'published', 'archived']

/**
 * Allowed status transitions. A room is born as a draft; publishing makes it
 * visible to prospects, and unpublishing (back to draft) hides it again.
 * Archived rooms are retired — the only way out is back to draft, so a
 * restored room is re-reviewed before it can go live again.
 */
const TRANSITIONS: Record<RoomStatus, RoomStatus[]> = {
  draft: ['published', 'archived'],
  published: ['draft', 'archived'],
  archived: ['draft'],
}

export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/
const SLUG_MAX_LENGTH = 60

export const roomRef = (slug: string) => getAdminDb().collection('rooms').doc(slug)
const engagementRef = (slug: string) => roomRef(slug).collection('private').doc('engagement')

export function slugify(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, SLUG_MAX_LENGTH)
    .replace(/-+$/, '')
}

export function randomSuffix() {
  return Math.random().toString(36).slice(2, 6)
}

export function canTransition(from: RoomStatus, to: RoomStatus) {
  return TRANSITIONS[from].includes(to)
}

/** What the API returns for a room: the workspace minus the private engagement feed, plus lifecycle metadata. */
export interface RoomResponse extends Omit<Workspace, 'components'> {
  components: Omit<Workspace['components'], 'engagement'>
  ownerEmail: string
  createdAt: string | null
  updatedAt: string | null
  publishedAt: string | null
  archivedAt: string | null
}

const iso = (ts: unknown) => (ts ? (ts as Timestamp).toDate().toISOString() : null)

export function toRoomResponse(data: DocumentData): RoomResponse {
  const { ownerUid: _ownerUid, ...rest } = data
  return {
    ...(rest as RoomResponse),
    // Rooms created before `status` existed are live.
    status: data.status ?? 'published',
    createdAt: iso(data.createdAt),
    updatedAt: iso(data.updatedAt),
    publishedAt: iso(data.publishedAt),
    archivedAt: iso(data.archivedAt),
  }
}

/** Loads a room and checks the caller owns it. 404 (not 403) for other AEs' rooms so slugs can't be probed. */
export async function loadOwnedRoom(slug: string, ae: Ae) {
  const snap = await roomRef(slug).get()
  if (!snap.exists || snap.data()!.ownerUid !== ae.uid) throw new HttpError(404, 'Room not found')
  return { ref: snap.ref, data: snap.data()! }
}

export function emptyContent(): Pick<RoomContent, 'team' | 'milestones' | 'components'> &
  Pick<Workspace, 'bookMeetingUrl' | 'slackChannelUrl'> {
  return {
    bookMeetingUrl: '',
    slackChannelUrl: '',
    team: [],
    milestones: [],
    components: {
      hero: { sinceLastVisit: [] },
      links: [],
      media: { videoUrl: '', title: '', presenterName: '', presenterRole: '', postedLabel: '' },
      documents: [],
    },
  }
}

/**
 * Creates `rooms/{slug}` as a draft together with its (empty) private
 * engagement document. `create()` fails if the slug is taken, which is what
 * makes slug claims race-free. Returns false when the slug already exists.
 */
export async function createDraftRoom(
  slug: string,
  content: Partial<RoomContent> & Pick<RoomContent, 'prospectName' | 'aeFirstName' | 'targetGoLive'>,
  ae: Ae,
): Promise<RoomResponse | false> {
  const defaults = emptyContent()
  const room = {
    id: `ws-${slug}`,
    slug,
    status: 'draft' as const,
    ...defaults,
    ...content,
    components: { ...defaults.components, ...content.components },
    ownerUid: ae.uid,
    ownerEmail: ae.email,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  }

  const batch = getAdminDb().batch()
  batch.create(roomRef(slug), room)
  batch.set(engagementRef(slug), { events: [] })
  try {
    await batch.commit()
  } catch (error) {
    if ((error as { code?: number }).code === 6) return false // ALREADY_EXISTS
    throw error
  }

  return toRoomResponse((await roomRef(slug).get()).data()!)
}
