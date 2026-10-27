import { FieldValue } from 'firebase-admin/firestore'
import { requireAe } from '../../_lib/auth.js'
import { HttpError, jsonBody, pathParam, route } from '../../_lib/http.js'
import { getAdminDb } from '../../_lib/firebaseAdmin.js'
import { canTransition, loadOwnedRoom, ROOM_STATUSES, toRoomResponse } from '../../_lib/rooms.js'
import type { RoomStatus } from '../../../src/data/types.js'

/**
 * PUT /api/rooms/:slug/status   body: { "status": "draft" | "published" | "archived" }
 *
 * Moves a room through its lifecycle:
 *   draft     -> published | archived
 *   published -> draft | archived
 *   archived  -> draft
 * Only `published` rooms are visible to prospects. Setting the status a room
 * already has is a no-op (200); any other disallowed move is a 409.
 */
export default route({
  async PUT(req) {
    const ae = await requireAe(req)
    const { status } = jsonBody(req)
    if (typeof status !== 'string' || !ROOM_STATUSES.includes(status as RoomStatus)) {
      throw new HttpError(400, `status must be one of: ${ROOM_STATUSES.join(', ')}`)
    }
    const next = status as RoomStatus

    const slug = pathParam(req, 'slug')
    const { ref } = await loadOwnedRoom(slug, ae)

    // Re-read inside a transaction so two concurrent requests can't both
    // validate against the same stale status.
    await getAdminDb().runTransaction(async (tx) => {
      const data = (await tx.get(ref)).data()
      if (!data || (!ae.seeAll && data.ownerUid !== ae.uid)) throw new HttpError(404, 'Room not found')

      const current: RoomStatus = data.status ?? 'published'
      if (current === next) return
      if (!canTransition(current, next)) {
        throw new HttpError(409, `Cannot move a room from ${current} to ${next}`)
      }

      const update: Record<string, unknown> = { status: next, updatedAt: FieldValue.serverTimestamp() }
      if (next === 'published') update.publishedAt = FieldValue.serverTimestamp()
      if (next === 'archived') update.archivedAt = FieldValue.serverTimestamp()
      tx.update(ref, update)
    })

    return { body: { room: toRoomResponse((await ref.get()).data()!) } }
  },
})
