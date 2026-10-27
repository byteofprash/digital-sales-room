import type { VercelRequest, VercelResponse } from '@vercel/node'

export class HttpError extends Error {
  readonly status: number
  readonly details?: string[]

  constructor(status: number, message: string, details?: string[]) {
    super(message)
    this.status = status
    this.details = details
  }
}

type Method = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
type Handler = (req: VercelRequest) => Promise<{ status?: number; body: unknown }>

/**
 * Wraps an endpoint: enforces the allowed methods, serializes the result as
 * JSON and maps HttpError to a `{ error, details? }` response. Anything else
 * is logged and surfaced as an opaque 500.
 */
export function route(handlers: Partial<Record<Method, Handler>>) {
  return async (req: VercelRequest, res: VercelResponse) => {
    res.setHeader('Cache-Control', 'no-store')
    try {
      const handler = handlers[req.method as Method]
      if (!handler) {
        res.setHeader('Allow', Object.keys(handlers).join(', '))
        throw new HttpError(405, `Method ${req.method} not allowed`)
      }
      const { status = 200, body } = await handler(req)
      res.status(status).json(body)
    } catch (error) {
      if (error instanceof HttpError) {
        res.status(error.status).json({ error: error.message, details: error.details })
        return
      }
      console.error(error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}

export function jsonBody(req: VercelRequest): Record<string, unknown> {
  const body: unknown = req.body
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw new HttpError(400, 'Request body must be a JSON object')
  }
  return body as Record<string, unknown>
}

export function pathParam(req: VercelRequest, name: string): string {
  const value = req.query[name]
  if (typeof value !== 'string' || !value) throw new HttpError(400, `Missing path parameter: ${name}`)
  return value
}
