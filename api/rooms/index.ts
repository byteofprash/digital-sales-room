import { requireAe } from '../_lib/auth.js'
import { HttpError, jsonBody, route } from '../_lib/http.js'
import {
  createDraftRoom,
  randomSuffix,
  ROOM_STATUSES,
  SLUG_PATTERN,
  slugify,
  toRoomResponse,
} from '../_lib/rooms.js'
import { getAdminDb } from '../_lib/firebaseAdmin.js'
import { validateRoomContent, type RoomContent } from '../_lib/validation.js'
import type { RoomStatus } from '../../src/data/types.js'

/**
 * GET  /api/rooms[?status=draft|published|archived]
 *   The calling AE's rooms, most recently updated first.
 *
 * POST /api/rooms
 *   Creates a new room for a prospect, always as a `draft`. Requires
 *   `prospectName`, `aeFirstName` and `targetGoLive`; everything else (team,
 *   milestones, components, links) is optional and can be filled in later via
 *   PATCH. `slug` is optional — it defaults to one derived from `prospectName`
 *   (suffixed if taken); an explicit slug that's taken is a 409.
 */
export default route({
  async GET(req) {
    const ae = await requireAe(req)

    const status = req.query.status
    if (status !== undefined && !ROOM_STATUSES.includes(status as RoomStatus)) {
      throw new HttpError(400, `status must be one of: ${ROOM_STATUSES.join(', ')}`)
    }

    // Single-field filter only (no composite index needed); AEs own few
    // enough rooms that filtering and sorting in memory is fine.
    const allRooms = getAdminDb().collection('rooms')
    const snap = await (ae.seeAll ? allRooms : allRooms.where('ownerUid', '==', ae.uid)).get()
    const rooms = snap.docs
      .map((doc) => toRoomResponse(doc.data()))
      .filter((room) => !status || room.status === status)
      .sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''))

    return { body: { rooms } }
  },

  async POST(req) {
    const ae = await requireAe(req)
    const body = jsonBody(req)

    const errors = validateRoomContent(body, { partial: false, extraKeys: ['slug'] })
    const explicitSlug = body.slug
    if (explicitSlug !== undefined) {
      if (
        typeof explicitSlug !== 'string' ||
        explicitSlug.length < 3 ||
        explicitSlug.length > 60 ||
        !SLUG_PATTERN.test(explicitSlug)
      ) {
        errors.push('slug must be 3-60 characters: lowercase letters, digits and single hyphens')
      }
    }
    if (errors.length) throw new HttpError(400, 'Invalid room', errors)

    const { slug: _slug, ...content } = body
    const room = content as unknown as RoomContent

    if (typeof explicitSlug === 'string') {
      const created = await createDraftRoom(explicitSlug, room, ae)
      if (!created) throw new HttpError(409, `Slug "${explicitSlug}" is already taken`)
      return { status: 201, body: { room: created } }
    }

    const base = slugify(room.prospectName) || 'room'
    for (let attempt = 0; attempt < 5; attempt++) {
      const slug = attempt === 0 ? base : `${base}-${randomSuffix()}`
      const created = await createDraftRoom(slug, room, ae)
      if (created) return { status: 201, body: { room: created } }
    }
    throw new HttpError(409, 'Could not generate a unique slug; pass an explicit one')
  },
})
