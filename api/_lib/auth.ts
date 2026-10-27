import type { VercelRequest } from '@vercel/node'
import { adminAuth } from './firebaseAdmin.js'
import { HttpError } from './http.js'

const ALLOWED_EMAIL_DOMAIN = 'talon.one'

export interface Ae {
  uid: string
  email: string
}

/**
 * Authenticates the caller from the `Authorization: Bearer <Firebase ID
 * token>` header and only lets verified @talon.one accounts through — the
 * same rule firestore.rules applies to client-side writes.
 */
export async function requireAe(req: VercelRequest): Promise<Ae> {
  const match = /^Bearer (.+)$/.exec(req.headers.authorization ?? '')
  if (!match) throw new HttpError(401, 'Missing bearer token')

  let decoded
  try {
    decoded = await adminAuth.verifyIdToken(match[1])
  } catch {
    throw new HttpError(401, 'Invalid or expired token')
  }

  const email = decoded.email
  if (!email || !decoded.email_verified || !email.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`)) {
    throw new HttpError(403, `A verified @${ALLOWED_EMAIL_DOMAIN} account is required`)
  }
  return { uid: decoded.uid, email }
}
