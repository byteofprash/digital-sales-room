# Digital Sales Room MCP server

Lets an AI assistant (Claude Code, Claude Desktop, any MCP client) create and edit rooms by talking to
the room API (`api/rooms`). It runs on your machine over stdio and holds no data itself, so every
change goes through the same validation as the web app.

## Tools

| Tool | What it does |
| --- | --- |
| `describe_sections` | Lists the editable sections and the exact fields each item needs |
| `list_rooms` | Rooms with slug, prospect, status and last update (filter by status) |
| `get_room` | One room in full, including item ids |
| `create_room` | New room for a prospect, always a draft |
| `update_room_details` | Names, meeting/Slack links, go-live date, welcome "since last visit" list, featured video |
| `add_item` / `update_item` / `remove_item` | Edit one entry in `links`, `documents`, `requirements`, `architecture`, `timeline`, `stories`, `team` or `milestones` without resending the whole list |
| `set_room_status` | Move a room between draft, published and archived |

Requirements, architecture and stories entries are links (a PDF, a Google Doc or a web page); the
API rejects anything that isn't a full `http(s)` URL.

## Set up

```bash
cd mcp
npm install
npm run build
```

Environment variables:

| Variable | |
| --- | --- |
| `ROOMS_API_URL` | Required. Base URL of the deployed app, e.g. `https://digital-sales-room-chi.vercel.app` |
| `ROOMS_API_TOKEN` | Optional. Sent as `Authorization: Bearer <token>`. Not needed while the API runs with `DEV_AUTH_BYPASS=true`; once real sign-in is on, put a Firebase ID token here. |

### Claude Code

```bash
claude mcp add digital-sales-room \
  -e ROOMS_API_URL=https://digital-sales-room-chi.vercel.app \
  -- node /absolute/path/to/digital-sales-room/mcp/dist/index.js
```

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "digital-sales-room": {
      "command": "node",
      "args": ["/absolute/path/to/digital-sales-room/mcp/dist/index.js"],
      "env": { "ROOMS_API_URL": "https://digital-sales-room-chi.vercel.app" }
    }
  }
}
```

## Things to know

- Publishing makes a room visible to anyone with its link. The `set_room_status` tool tells the
  assistant to confirm with you first.
- While the API runs with `DEV_AUTH_BYPASS=true` there is no per-user access control, so anyone who
  can run this server can edit every room.
- `add_item`, `update_item` and `remove_item` read the room and then write the whole list back, so
  two edits at the same instant can overwrite each other. Fine for one person working with an assistant.
