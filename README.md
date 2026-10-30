# Talon.One Digital Sales Room

A per-prospect "digital sales room" — an AE curates a page of links, documents, timeline
milestones and team info for a deal, and shares one URL with the prospect's whole buying
committee.

The Workspace Home page is built as a component library against a `Workspace` document — either a
localStorage mock (zero setup) or, once configured, a real Firestore document — behind a swappable
repository interface. See [Backend: Firebase](#backend-firebase) below for why NoSQL and how to
turn it on, and [What's still deferred](#whats-still-deferred) for what's intentionally not built yet.

## Stack

- Vite + Vue 3 (`<script setup>`, TypeScript)
- Tailwind CSS v4, themed with Talon.One's brand tokens (`src/style.css`)
- `@headlessui/vue` for the Edit-mode dialogs (Dialog, Listbox)
- Pinia (workspace state, edit-mode toggle, AE session)
- vue-router, `history` mode, routes: `/room/:slug`
- Firebase (Firestore + Auth) once configured — see below

## Local development

```bash
npm install
npm run dev       # local dev server
npm run build     # type-check (vue-tsc) + production build to dist/
npm run preview   # serve the production build locally
```

Open `/room/acme-corp` — that's the only seeded fixture (`src/data/fixtures/acme-corp.ts`).

The top bar has a **sign-in** button that reveals the **Edit** toggle for the signed-in AE. Try
editing Links, Documents, Team, or the Go-Live milestone banner. With no Firebase project
configured (see below), everything — auth included — runs against a dev-only mock so you can try
the whole flow with zero setup; edits persist to `localStorage`.

## Backend: Firebase

**Why NoSQL:** each room is created once for a specific deal and thrown away once it closes —
there's no recurring, reusable relational structure worth normalizing into SQL tables and
migrations. Firestore stores the exact same `Workspace` shape used by the mock
(`src/data/types.ts`) as one schemaless document per room. That's also what makes new component
types cheap later: extend the type, extend the fixture, build the Vue block — the document just
gains a new key on the next save, no migration required.

**Data model:** one document per room, keyed by slug (`rooms/{slug}`), holding everything except
Buyer Intent Signals telemetry, which lives in `rooms/{slug}/private/engagement` — split out
because Firestore security rules can't redact one field from an anonymous prospect's read of the
parent document, only allow/deny the whole thing. Rules are in `firestore.rules`: anyone with the
link can `get` a room (the slug is the access control), the collection can only be `list`ed by an AE asking for their own rooms, and
only the owning `@talon.one` AE can write.

### Turning it on

1. **Firebase Console** (console.firebase.google.com) → Create a project.
2. **Build → Firestore Database** → Create database (Native mode, any region).
3. **Build → Authentication** → Sign-in method → enable **Google**.
4. **Project settings → General → Your apps** → Add app → Web (`</>`) → copy the resulting
   `firebaseConfig` values.
5. Copy `.env.example` to `.env.local` and fill in the six `VITE_FIREBASE_*` values from step 4.
   Add the same values as environment variables on the Vercel project (**Settings →
   Environment Variables**) so deployed builds pick them up too.
6. Deploy the security rules once you have the [Firebase CLI](https://firebase.google.com/docs/cli)
   installed and are logged in (`firebase login`):
   ```bash
   firebase deploy --only firestore:rules --project <your-project-id>
   ```
   (or paste the contents of `firestore.rules` into the Console's Firestore → Rules tab directly).

Until these are set, `src/lib/firebase.ts` reports `firebaseEnabled = false` and the app
transparently keeps using the localStorage mock (`src/data/workspaceRepository.ts`) — nothing
breaks in the meantime, and no code path needs to know which backend is active.

The one seeded fixture (`acme-corp`) self-creates in Firestore, owned by whichever `@talon.one`
account first visits `/room/acme-corp` while signed in — there's no separate "create room" step
yet (see deferred AE portal below).

**Skipping sign-in while developing:** set `VITE_DEV_AUTH_BYPASS=true` (in `.env.local`, or as a
Vercel environment variable followed by a redeploy, since Vite bakes it in at build time) and the app
starts signed in as the dev AE, so `/ae` and Edit mode need no click. It is the front-end twin of
the API's `DEV_AUTH_BYPASS`. With no Firebase it just uses the localStorage mock. With Firebase
configured, rooms are listed and saved through `/api/rooms` instead of straight to Firestore (whose
rules would refuse an anonymous browser), so the API's own `DEV_AUTH_BYPASS=true` must be on too.
Like the API bypass, this leaves everything open to anyone with the URL: remove both before real
prospects or data are involved. Rooms read this way show an empty Buyer intent feed, because the API
never returns it.

## Room sections

Besides the Home page, each room has four pages reached from the sidebar. All are plain data on the
room document (`components.*`), edited in Edit mode and settable through `PATCH /api/rooms/:slug`:

| Page | Route | Holds |
| --- | --- | --- |
| Requirements | `/room/:slug/requirements` | Links to a PDF, Google Doc or web page (`components.requirements`) |
| Joint project timeline | `/room/:slug/timeline` | Steps with owner, due date and status (`components.timeline`) |
| Architecture | `/room/:slug/architecture` | Links to a PDF, Google Doc or web page (`components.architecture`) |
| Customer success stories | `/room/:slug/stories` | Links to a PDF or a real customer's story page (`components.stories`) |

Links must be full `http(s)` URLs; the type label (PDF, Google Doc, …) is worked out from the URL.
There's no file upload, so a PDF has to be hosted somewhere the buying committee can open it, and
Google Docs need link sharing turned on. The `/components` page lists every component, including these.

## Room management API

Serverless endpoints (Vercel functions in `api/`, using `firebase-admin`) for the AE side of a room's
lifecycle. Every call needs `Authorization: Bearer <Firebase ID token>` from a verified `@talon.one`
account, and an AE can only see and change rooms they own (other AEs' rooms are a 404). Errors come
back as `{ "error": string, "details"?: string[] }`.

| Method & path | Purpose |
| --- | --- |
| `POST /api/rooms` | Create a room for a new prospect. Always starts as `draft`. Requires `prospectName`, `aeFirstName`, `targetGoLive: { date, label }`; optional `slug` (defaults to one derived from the prospect name, 409 if an explicit slug is taken), `team`, `milestones`, `bookMeetingUrl`, `slackChannelUrl`, `components`. → `201 { room }` |
| `GET /api/rooms[?status=draft\|published\|archived]` | List the calling AE's rooms, newest update first. → `{ rooms }` |
| `GET /api/rooms/:slug` | Fetch one room, whatever its status. → `{ room }` |
| `PATCH /api/rooms/:slug` | Edit content: any subset of the `POST` fields. `components.hero/links/media/documents` are replaced per component. Slug, status and ownership can't be changed here; archived rooms are read-only (409). → `{ room }` |
| `PUT /api/rooms/:slug/status` | Body `{ "status": "draft" \| "published" \| "archived" }`. → `{ room }` |

**Status lifecycle:** `draft → published | archived`, `published → draft | archived`,
`archived → draft`. Anything else is a 409; re-sending the current status is a no-op. Only
`published` rooms are readable by prospects — `firestore.rules` denies `get` on drafts and archived
rooms to everyone but the owner (rooms that predate `status` count as published), and the client
can no longer change `status` directly, so these endpoints are the only way to flip it.

**Auth is currently switched off.** With `DEV_AUTH_BYPASS=true` (set on Vercel for every
environment, production included) the API accepts any request with no token and every caller can see
and edit all rooms. An optional `Authorization: Bearer dev:<name>[@<domain>]` header only chooses the
owner stamped on new rooms (default `dev@talon.one`). **Anyone who can reach the URL can create,
edit and publish rooms**, so remove the variable before real prospects or data are involved; real
`@talon.one` Firebase sign-in is enforced again as soon as it's gone. To skip the service account too
locally, run the Firestore emulator (`firebase emulators:start --only firestore`) with
`FIRESTORE_EMULATOR_HOST=127.0.0.1:8080`.

**Setup:** add a Firebase service account (Project settings → Service accounts → Generate new
private key) as the non-public env vars `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL` and
`FIREBASE_PRIVATE_KEY` on the Vercel project, then redeploy the Firestore rules. `vercel.json`
excludes `/api/*` from the SPA rewrite. Locally, run `vercel dev` (plain `npm run dev` serves only
the front end).

## Editing rooms with an AI assistant

`POST /api/mcp` is a remote [MCP](https://modelcontextprotocol.io) server (streamable HTTP, stateless)
so Claude or any MCP client can create rooms and edit their contents. Connect to
`https://<your-domain>/api/mcp`:

```bash
# Claude Code
claude mcp add --transport http digital-sales-room https://<your-domain>/api/mcp
```

For Claude.ai / Claude Desktop, add it as a custom connector with the same URL. If a client only
speaks stdio, bridge it with `npx mcp-remote https://<your-domain>/api/mcp`.

| Tool | What it does |
| --- | --- |
| `describe_sections` | Describes everything a room can contain: each editable section with its page and exact item fields, plus the blocks that are configured elsewhere or derived (video, What's next, go-live countdown, …) |
| `list_rooms` / `get_room` | Browse rooms, or open one in full (including item ids) |
| `create_room` | New room for a prospect, always a draft |
| `update_room_details` | Names, meeting/Slack links, go-live date, welcome "since last visit" list, featured video (clear it and Recordings are shown instead) |
| `add_item` / `update_item` / `remove_item` | Edit one entry in `links`, `documents` (with a link to the file), `requirements`, `architecture`, `timeline`, `stories`, `recordings` (links to Gong or Google Drive recordings), `team` or `milestones` without resending the list |
| `set_room_status` | Move a room between draft, published and archived |

The tools call this app's own room API, so validation and status rules are identical to the web app,
and the caller's `Authorization` header is forwarded to it. That means **the MCP endpoint is exactly as
open as the API**: while `DEV_AUTH_BYPASS=true`, anyone who knows the URL can edit every room and
publish; once real sign-in is on, clients must send a Firebase ID token as a bearer token. The endpoint
finds its own address from Vercel's system environment variables (set `ROOMS_API_URL` to override).
Edits to a list read the room and write the whole list back, so two edits at the same instant can
overwrite each other.

## Deploying to Vercel

1. In the Vercel dashboard: **Add New → Project**, import this GitHub repo.
2. Vercel auto-detects the Vite framework preset. Settings are also pinned explicitly in
   `vercel.json` at the repo root, so they'll be correct even if the dashboard preset is set to
   "Other":
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install` (default)
3. `vercel.json` also adds the SPA rewrite (`/(.*) → /index.html`) required because the app uses
   `vue-router`'s `history` mode — without it, a hard refresh on `/room/acme-corp` would 404.
4. Add the `VITE_FIREBASE_*` environment variables (see above) once you want the deployed app
   talking to real Firestore instead of the mock.
5. Every push to the connected branch gets a preview deployment; promote to production from the
   branch configured as Production in the Vercel project settings.

## Project layout

```
api/               Vercel serverless endpoints (room create / edit / status) + shared _lib
  mcp.ts           Remote MCP server (/api/mcp); tool code in _lib/mcp/
src/
  lib/firebase.ts   Firebase app/Auth/Firestore init; firebaseEnabled flag
  data/
    types.ts                       Workspace shape — the single source of truth for the document
    workspaceRepository.ts         Picks mock vs. Firestore based on firebaseEnabled
    firestoreWorkspaceRepository.ts
    fixtures/                      Seed content (also used to auto-create a room on first AE visit)
  stores/          Pinia: workspace, editMode, session (real Firebase Auth or dev fallback)
  components/
    layout/        AppSidebar, AppTopbar
    blocks/        The 7 Home page components (Links, Documents, Team, Milestone, etc.)
    dialogs/        Edit-mode dialogs for the 4 AE-editable components
    ui/             Shared primitives (EditDialog, EditFab)
  views/           WorkspaceHome, ComingSoonView (stub for other nav destinations)
  router/          vue-router config
```

## What's still deferred

- Real Google Drive integration for the Documents component (a server-side proxy so Drive OAuth
  tokens never reach the browser).
- Real engagement/analytics pipeline feeding the internal-only Buyer Intent Signals feed (currently
  seeded fixture data in `rooms/{slug}/private/engagement`).
- AE portal UI on top of the room management API (the endpoints exist; no screens call them yet) (Requirements, Timeline,
  Architecture, etc. — currently stubbed as "coming soon"). Today only the one seeded fixture can
  self-create in Firestore.
