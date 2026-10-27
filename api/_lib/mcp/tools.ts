import { randomUUID } from 'node:crypto'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { ApiError, type RoomsApi } from './roomsApi.js'
import { OTHER_COMPONENTS, SECTIONS, SECTION_NAMES, type SectionName } from './sections.js'

type Json = Record<string, unknown>
type Item = Json & { id: string }

const text = (value: unknown) => ({
  content: [{ type: 'text' as const, text: typeof value === 'string' ? value : JSON.stringify(value, null, 2) }],
})

/** Turns API failures into tool errors the model can read and correct, instead of crashing the call. */
function fail(error: unknown) {
  if (error instanceof ApiError) {
    const details = error.details.length ? `\n- ${error.details.join('\n- ')}` : ''
    return { isError: true, ...text(`${error.message} (HTTP ${error.status})${details}`) }
  }
  return { isError: true, ...text(error instanceof Error ? error.message : String(error)) }
}

async function run(work: () => Promise<unknown>) {
  try {
    return text(await work())
  } catch (error) {
    return fail(error)
  }
}

const slug = z.string().describe('The room slug, e.g. "acme-corp"')
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
const section = z.enum(SECTION_NAMES).describe('Which list to edit; call describe_sections for the item shapes')

/** Reads one list out of a room, whether it lives at the top level or under `components`. */
function readList(room: Json, name: SectionName): Item[] {
  const source = SECTIONS[name].where === 'room' ? room : (room.components as Json | undefined)
  return ((source?.[name] as Item[] | undefined) ?? []).map((item) => ({ ...item }))
}

/** PATCH body that replaces one list wholesale. */
function writeList(name: SectionName, items: Item[]): Json {
  return SECTIONS[name].where === 'room' ? { [name]: items } : { components: { [name]: items } }
}

/** Builds an MCP server whose tools read and write rooms through `api`. One per request: the endpoint is stateless. */
export function createRoomsMcpServer(api: RoomsApi) {
  const server = new McpServer({ name: 'digital-sales-room', version: '0.1.0' })

  server.registerTool(
    'describe_sections',
    {
      title: 'Describe room sections',
      description:
        'Describes everything a room can contain. "sections" are the editable lists (links, documents, requirements, architecture, timeline, stories, recordings, team, milestones): which page each appears on and the exact fields an item needs. "otherComponents" are the blocks configured through update_room_details or derived from a section. Call this before add_item or update_item.',
      annotations: { readOnlyHint: true },
    },
    async () =>
      text({
        sections: Object.fromEntries(
          Object.entries(SECTIONS).map(([name, s]) => [name, { appearsOn: s.page, itemShape: s.shape }]),
        ),
        otherComponents: OTHER_COMPONENTS,
      }),
  )

  server.registerTool(
    'list_rooms',
    {
      title: 'List rooms',
      description: 'Lists digital sales rooms with their slug, prospect, status and last update. Optionally filter by status.',
      inputSchema: { status: z.enum(['draft', 'published', 'archived']).optional() },
      annotations: { readOnlyHint: true },
    },
    ({ status }) =>
      run(async () =>
        (await api.listRooms(status)).map((room) => ({
          slug: room.slug,
          prospectName: room.prospectName,
          status: room.status,
          updatedAt: room.updatedAt,
        })),
      ),
  )

  server.registerTool(
    'get_room',
    {
      title: 'Get room',
      description: 'Returns one room in full: details, team, milestones and every section, whatever its status.',
      inputSchema: { slug },
      annotations: { readOnlyHint: true },
    },
    ({ slug }) => run(() => api.getRoom(slug)),
  )

  server.registerTool(
    'create_room',
    {
      title: 'Create room',
      description:
        'Creates a new room for a prospect. It starts as a draft, so nothing is visible to the prospect until set_room_status publishes it. Sections start empty; fill them with add_item.',
      inputSchema: {
        prospectName: z.string().describe('Prospect company name, e.g. "Acme Corp"'),
        aeFirstName: z.string().describe("The account executive's first name"),
        targetGoLive: z.object({ date: isoDate, label: z.string().default('Target Go-Live') }),
        slug: z.string().optional().describe('URL slug; defaults to one derived from prospectName'),
        bookMeetingUrl: z.string().optional(),
        slackChannelUrl: z.string().optional(),
      },
    },
    (input) => run(() => api.createRoom(input)),
  )

  server.registerTool(
    'update_room_details',
    {
      title: 'Update room details',
      description:
        "Changes a room's basic details: names, meeting and Slack links, go-live date, the Home welcome 'since last visit' list, and the featured video. Only the fields you pass change. Archived rooms must be moved back to draft first.",
      inputSchema: {
        slug,
        prospectName: z.string().optional(),
        aeFirstName: z.string().optional(),
        bookMeetingUrl: z.string().optional(),
        slackChannelUrl: z.string().optional(),
        targetGoLive: z.object({ date: isoDate, label: z.string() }).optional(),
        hero: z
          .object({
            sinceLastVisit: z.array(
              z.object({ id: z.string().optional(), icon: z.enum(['document', 'calendar']), text: z.string() }),
            ),
          })
          .optional()
          .describe("Replaces the whole 'since your last visit' list"),
        media: z
          .object({
            videoUrl: z.string(),
            title: z.string(),
            presenterName: z.string(),
            presenterRole: z.string(),
            postedLabel: z.string(),
          })
          .optional()
          .describe(
            'Replaces the featured video. videoUrl must be a direct video file (e.g. .mp4); set it to "" to hide the video, and the Recordings block is shown instead',
          ),
      },
    },
    ({ slug, hero, media, ...fields }) =>
      run(() => {
        const components: Json = {}
        if (hero) {
          components.hero = {
            sinceLastVisit: hero.sinceLastVisit.map((item) => ({ ...item, id: item.id ?? `slv-${randomUUID().slice(0, 8)}` })),
          }
        }
        if (media) components.media = media
        const body: Json = { ...fields, ...(Object.keys(components).length ? { components } : {}) }
        return api.updateRoom(slug, body)
      }),
  )

  server.registerTool(
    'add_item',
    {
      title: 'Add item to a section',
      description:
        'Adds one item (a link tile, document, requirements link, architecture link, timeline step, customer story, recording link (Gong or Google Drive), team member or milestone) to a room section. An id is generated for you. Call describe_sections for the fields each section needs.',
      inputSchema: { slug, section, item: z.record(z.string(), z.unknown()).describe('The item fields, without an id') },
    },
    ({ slug, section, item }) =>
      run(async () => {
        const room = await api.getRoom(slug)
        const items = readList(room, section)
        const added: Item = { ...item, id: `${SECTIONS[section].idPrefix}-${randomUUID().slice(0, 8)}` }
        items.push(added)
        await api.updateRoom(slug, writeList(section, items))
        return { added, total: items.length }
      }),
  )

  server.registerTool(
    'update_item',
    {
      title: 'Update item in a section',
      description:
        'Changes fields of one existing item, found by its id (see get_room). Only the fields you pass change; the others are kept.',
      inputSchema: {
        slug,
        section,
        itemId: z.string(),
        changes: z.record(z.string(), z.unknown()).describe('Fields to change'),
      },
    },
    ({ slug, section, itemId, changes }) =>
      run(async () => {
        const items = readList(await api.getRoom(slug), section)
        const index = items.findIndex((item) => item.id === itemId)
        if (index === -1) throw new Error(`No ${section} item with id "${itemId}" in room "${slug}"`)
        items[index] = { ...items[index], ...changes, id: itemId }
        await api.updateRoom(slug, writeList(section, items))
        return { updated: items[index] }
      }),
  )

  server.registerTool(
    'remove_item',
    {
      title: 'Remove item from a section',
      description: 'Deletes one item from a room section, found by its id (see get_room). This cannot be undone.',
      inputSchema: { slug, section, itemId: z.string() },
      annotations: { destructiveHint: true },
    },
    ({ slug, section, itemId }) =>
      run(async () => {
        const items = readList(await api.getRoom(slug), section)
        const remaining = items.filter((item) => item.id !== itemId)
        if (remaining.length === items.length) throw new Error(`No ${section} item with id "${itemId}" in room "${slug}"`)
        await api.updateRoom(slug, writeList(section, remaining))
        return { removed: itemId, remaining: remaining.length }
      }),
  )

  server.registerTool(
    'set_room_status',
    {
      title: 'Set room status',
      description:
        "Moves a room between draft, published and archived. Only published rooms are visible to prospects. Allowed moves: draft to published or archived, published to draft or archived, archived to draft. Publishing makes the room visible to anyone with the link, so confirm with the user first.",
      inputSchema: { slug, status: z.enum(['draft', 'published', 'archived']) },
    },
    ({ slug, status }) => run(() => api.setStatus(slug, status)),
  )

  return server
}
