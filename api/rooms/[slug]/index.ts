import { FieldValue } from 'firebase-admin/firestore'
import { requireAe } from '../../_lib/auth.js'
import { HttpError, jsonBody, pathParam, route } from '../../_lib/http.js'
import { loadOwnedRoom, toRoomResponse } from '../../_lib/rooms.js'
import { validateRoomContent } from '../../_lib/validation.js'

/**
 * GET   /api/rooms/:slug  — the full room, whatever its status (owner only).
 *
 * PATCH /api/rooms/:slug  — edits a room's content. Any subset of the fields
 *   accepted by POST /api/rooms; `components` are replaced per component
 *   (hero / links / media / documents), so send a component whole or not at
 *   all. slug, status and ownership can't be changed here (status has its own
 *   endpoint), and archived rooms must be restored before they're edited.
 */
export default route({
  async GET(req) {
    const ae = await requireAe(req)
    const { data } = await loadOwnedRoom(pathParam(req, 'slug'), ae)
    return { body: { room: toRoomResponse(data) } }
  },

  async PATCH(req) {
    const ae = await requireAe(req)
    const body = jsonBody(req)

    const errors = validateRoomContent(body, { partial: true })
    if (!Object.keys(body).length) errors.push('Provide at least one field to update')
    if (errors.length) throw new HttpError(400, 'Invalid room update', errors)

    const { ref, data } = await loadOwnedRoom(pathParam(req, 'slug'), ae)
    if (data.status === 'archived') {
      throw new HttpError(409, 'Archived rooms are read-only; move it back to draft to edit it')
    }

    // Dotted paths update each component without touching its siblings.
    const { components, ...fields } = body
    const update: Record<string, unknown> = { ...fields, updatedAt: FieldValue.serverTimestamp() }
    for (const [key, value] of Object.entries((components ?? {}) as Record<string, unknown>)) {
      update[`components.${key}`] = value
    }

    await ref.update(update)
    return { body: { room: toRoomResponse((await ref.get()).data()!) } }
  },
})
