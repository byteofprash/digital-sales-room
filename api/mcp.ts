import type { VercelRequest, VercelResponse } from '@vercel/node'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { RoomsApi } from './_lib/mcp/roomsApi.js'
import { createRoomsMcpServer } from './_lib/mcp/tools.js'

/**
 * Remote MCP server (streamable HTTP, stateless) for creating and editing
 * rooms from an AI assistant. POST /api/mcp speaks JSON-RPC; every tool call
 * goes through this app's own room API, so validation, status rules and — once
 * it's switched on — authentication are enforced in one place. The caller's
 * `Authorization` header is forwarded to the room API unchanged.
 */

/** This deployment's own origin, from Vercel's environment rather than the request's Host header. */
function ownOrigin() {
  if (process.env.ROOMS_API_URL) return process.env.ROOMS_API_URL
  const host =
    process.env.VERCEL_ENV === 'production'
      ? process.env.VERCEL_PROJECT_PRODUCTION_URL
      : process.env.VERCEL_URL
  if (!host) throw new Error('Set ROOMS_API_URL: no Vercel deployment URL in the environment')
  return `https://${host}`
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ jsonrpc: '2.0', error: { code: -32000, message: 'Method not allowed' }, id: null })
    return
  }

  try {
    const token = /^Bearer (.+)$/.exec(req.headers.authorization ?? '')?.[1]
    const server = createRoomsMcpServer(new RoomsApi(ownOrigin(), token))
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // stateless: no session to keep between serverless invocations
      enableJsonResponse: true,
    })
    res.on('close', () => {
      void transport.close()
      void server.close()
    })
    await server.connect(transport)
    await transport.handleRequest(req, res, req.body)
  } catch (error) {
    console.error(error)
    if (!res.headersSent) {
      res.status(500).json({ jsonrpc: '2.0', error: { code: -32603, message: 'Internal server error' }, id: null })
    }
  }
}
