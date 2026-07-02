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
link can `get` a room (the slug is the access control), the collection can never be `list`ed, and
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
- AE portal to create brand-new rooms and manage the rest of the nav (Requirements, Timeline,
  Architecture, etc. — currently stubbed as "coming soon"). Today only the one seeded fixture can
  self-create in Firestore.
