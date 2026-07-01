# Talon.One Digital Sales Room

A per-prospect "digital sales room" — an AE curates a page of links, documents, timeline
milestones and team info for a deal, and shares one URL with the prospect's whole buying
committee.

This is **Phase 0**: the Workspace Home page, built as a component library against local
mock/fixture data behind a swappable repository interface. There is no backend yet — see
[Phase 1](#phase-1-not-yet-built) below for what's deliberately deferred.

## Stack

- Vite + Vue 3 (`<script setup>`, TypeScript)
- Tailwind CSS v4, themed with Talon.One's brand tokens (`src/style.css`)
- `@headlessui/vue` for the Edit-mode dialogs (Dialog, Listbox)
- Pinia (workspace state, edit-mode toggle, dev session stand-in)
- vue-router, `history` mode, routes: `/room/:slug`

## Local development

```bash
npm install
npm run dev       # local dev server
npm run build     # type-check (vue-tsc) + production build to dist/
npm run preview   # serve the production build locally
```

Open `/room/acme-corp` — that's the only seeded fixture (`src/data/fixtures/acme-corp.ts`).

The top bar has a **"Sign in as AE"** button — this is a temporary stand-in for real auth
(Phase 1 wires up Google Workspace SSO). Click it to reveal the **Edit** toggle and try editing
Links, Documents, Team, or the Go-Live milestone banner. Edits persist to `localStorage` via
`src/data/workspaceRepository.ts` so they survive a reload.

## Deploying to Vercel

This repo is ready to connect directly to Vercel:

1. In the Vercel dashboard: **Add New → Project**, import this GitHub repo.
2. Vercel auto-detects the Vite framework preset. Settings are also pinned explicitly in
   `vercel.json` at the repo root, so they'll be correct even if the dashboard preset is set to
   "Other":
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install` (default)
3. `vercel.json` also adds the SPA rewrite (`/(.*) → /index.html`) required because the app uses
   `vue-router`'s `history` mode — without it, a hard refresh on `/room/acme-corp` would 404.
4. No environment variables are required yet (Phase 0 has no backend). Once Supabase/Drive
   integration lands (Phase 1), their keys will need to be added as Vercel project env vars and
   referenced via `import.meta.env.VITE_*`.
5. Every push to the connected branch gets a preview deployment; promote to production from the
   branch configured as Production in the Vercel project settings.

## Project layout

```
src/
  data/            Workspace types, fixture(s), repository (mock now, Supabase later)
  stores/          Pinia: workspace, editMode, session (dev stand-in for AE auth)
  components/
    layout/        AppSidebar, AppTopbar
    blocks/        The 7 Home page components (Links, Documents, Team, Milestone, etc.)
    dialogs/        Edit-mode dialogs for the 4 AE-editable components
    ui/             Shared primitives (EditDialog, EditFab)
  views/           WorkspaceHome, ComingSoonView (stub for other nav destinations)
  router/          vue-router config
```

## Phase 1 (not yet built)

- Supabase project: schema, Google Workspace SSO (replaces the dev "Sign in as AE" button),
  RLS scoping AEs to their own workspaces.
- Real Google Drive integration for the Documents component (an Edge Function proxy so Drive
  OAuth tokens never reach the browser).
- Real engagement/analytics pipeline feeding the internal-only Buyer Intent Signals feed.
- AE portal to create new workspace instances and manage the rest of the nav (Requirements,
  Timeline, Architecture, etc. — currently stubbed as "coming soon").
