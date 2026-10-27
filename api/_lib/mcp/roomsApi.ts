export class ApiError extends Error {
  readonly status: number
  readonly details: string[]

  constructor(status: number, message: string, details: string[] = []) {
    super(message)
    this.status = status
    this.details = details
  }
}

type Json = Record<string, unknown>

/** Thin client for the room API (api/rooms). All validation lives server-side. */
export class RoomsApi {
  private readonly baseUrl: string
  private readonly token?: string

  constructor(baseUrl: string, token?: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '')
    this.token = token
  }

  async request(method: string, path: string, body?: Json): Promise<Json> {
    let response: Response
    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      })
    } catch (error) {
      throw new ApiError(0, `Could not reach ${this.baseUrl}: ${(error as Error).message}`)
    }

    const text = await response.text()
    let data: Json = {}
    try {
      data = text ? (JSON.parse(text) as Json) : {}
    } catch {
      // Non-JSON body (e.g. a platform error page); fall through to the status check.
    }

    if (!response.ok) {
      const message =
        typeof data.error === 'string' ? data.error : `Request failed with HTTP ${response.status}`
      const details = Array.isArray(data.details) ? (data.details as string[]) : []
      throw new ApiError(response.status, message, details)
    }
    return data
  }

  async listRooms(status?: string) {
    const query = status ? `?status=${encodeURIComponent(status)}` : ''
    return ((await this.request('GET', `/api/rooms${query}`)).rooms ?? []) as Json[]
  }

  async getRoom(slug: string) {
    return (await this.request('GET', `/api/rooms/${encodeURIComponent(slug)}`)).room as Json
  }

  async createRoom(body: Json) {
    return (await this.request('POST', '/api/rooms', body)).room as Json
  }

  async updateRoom(slug: string, body: Json) {
    return (await this.request('PATCH', `/api/rooms/${encodeURIComponent(slug)}`, body)).room as Json
  }

  async setStatus(slug: string, status: string) {
    return (
      await this.request('PUT', `/api/rooms/${encodeURIComponent(slug)}/status`, { status })
    ).room as Json
  }
}
