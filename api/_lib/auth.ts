import type { VercelRequest } from '@vercel/node'
import { getAdminAuth } from './firebaseAdmin.js'
import { HttpError } from './http.js'

const ALLOWED_EMAIL_DOMAIN = 'talon.one'

export interface Ae {
  uid: string
  email: string
}

/**
 * Authenticates the caller from the `Authorization: Bearer <Firebase ID
 * token>` header and only lets verified @talon.one Google accounts through —
 * the same rule firestore.rules applies to client-side writes. The token is
 * checked for revocation, so revoking a leaver's refresh tokens locks them out
 * immediately instead of when their ID token expires.
 */
export async function requireAe(req: VercelRequest): Promise<Ae> {
  const match = /^Bearer (.+)$/.exec(req.headers.authorization ?? '')
  if (!match) throw new HttpError(401, 'Missing bearer token')

  let decoded
  try {
    decoded = await getAdminAuth().verifyIdToken(match[1], true)
  } catch {
    throw new HttpError(401, 'Invalid or expired token')
  }

  const email = decoded.email?.toLowerCase()
  if (
    !email ||
    !decoded.email_verified ||
    !email.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`) ||
    decoded.firebase?.sign_in_provider !== 'google.com'
  ) {
    throw new HttpError(403, `A verified @${ALLOWED_EMAIL_DOMAIN} Google account is required`)
  }
  return { uid: decoded.uid, email }
}
