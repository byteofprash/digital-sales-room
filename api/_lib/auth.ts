import type { VercelRequest } from '@vercel/node'
import { getAdminAuth } from './firebaseAdmin.js'
import { HttpError } from './http.js'

const ALLOWED_EMAIL_DOMAIN = 'talon.one'

export interface Ae {
  uid: string
  email: string
  /** True only in bypass mode: the caller may see and change every room, not just their own. */
  seeAll?: boolean
}

/**
 * Temporary "no auth" mode while the product is being built: with
 * DEV_AUTH_BYPASS=true every request is accepted, no token needed, and can
 * see and edit ALL rooms. A `Bearer dev:<name>[@<domain>]` token only picks the
 * identity that new rooms are stamped with (default dev@talon.one). This
 * applies on every environment, production included — remove the variable to
 * turn real authentication back on.
 */
function bypassAe(req: VercelRequest): Ae | null {
  if (process.env.DEV_AUTH_BYPASS !== 'true') return null
  const token = /^Bearer (.+)$/.exec(req.headers.authorization ?? '')?.[1] ?? ''
  const match = /^dev:([a-z0-9.]{1,40})(?:@([a-z0-9.-]{1,60}))?$/.exec(token)
  const [, name = 'dev', domain = ALLOWED_EMAIL_DOMAIN] = match ?? []
  return { uid: `dev-${name}@${domain}`, email: `${name}@${domain}`, seeAll: true }
}

/**
 * Authenticates the caller from the `Authorization: Bearer <Firebase ID
 * token>` header and only lets verified @talon.one accounts through — the
 * same rule firestore.rules applies to client-side writes.
 */
export async function requireAe(req: VercelRequest): Promise<Ae> {
  const bypass = bypassAe(req)
  if (bypass) return bypass

  const match = /^Bearer (.+)$/.exec(req.headers.authorization ?? '')
  if (!match) throw new HttpError(401, 'Missing bearer token')

  let decoded
  try {
    decoded = await getAdminAuth().verifyIdToken(match[1])
  } catch {
    throw new HttpError(401, 'Invalid or expired token')
  }

  const email = decoded.email
  if (!email || !decoded.email_verified || !email.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`)) {
    throw new HttpError(403, `A verified @${ALLOWED_EMAIL_DOMAIN} account is required`)
  }
  return { uid: decoded.uid, email }
}
