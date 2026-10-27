import type { VercelRequest } from '@vercel/node'
import { adminAuth } from './firebaseAdmin.js'
import { HttpError } from './http.js'

const ALLOWED_EMAIL_DOMAIN = 'talon.one'

export interface Ae {
  uid: string
  email: string
}

/**
 * Local/preview stand-in for Google SSO: with DEV_AUTH_BYPASS=true, the token
 * `dev:<name>` authenticates as `<name>@talon.one` (e.g. `dev:test.ae`), and
 * `dev:<name>@<domain>` as that exact address (e.g. `dev:test@abc.com`). Never
 * honoured on Vercel production, even if the flag is set there by mistake.
 */
function devAe(token: string): Ae | null {
  if (process.env.DEV_AUTH_BYPASS !== 'true' || process.env.VERCEL_ENV === 'production') return null
  const match = /^dev:([a-z0-9.]{1,40})(?:@([a-z0-9.-]{1,60}))?$/.exec(token)
  if (!match) return null
  const [, name, domain = ALLOWED_EMAIL_DOMAIN] = match
  return { uid: `dev-${name}@${domain}`, email: `${name}@${domain}` }
}

/**
 * Authenticates the caller from the `Authorization: Bearer <Firebase ID
 * token>` header and only lets verified @talon.one accounts through — the
 * same rule firestore.rules applies to client-side writes.
 */
export async function requireAe(req: VercelRequest): Promise<Ae> {
  const match = /^Bearer (.+)$/.exec(req.headers.authorization ?? '')
  if (!match) throw new HttpError(401, 'Missing bearer token')

  const dev = devAe(match[1])
  if (dev) return dev

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
