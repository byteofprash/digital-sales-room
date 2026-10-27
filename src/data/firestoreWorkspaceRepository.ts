import { doc, getDoc, runTransaction, serverTimestamp } from 'firebase/firestore'
import type { EngagementEvent, Workspace } from './types'
import { seedFixtures } from './fixtures'
import { auth, db } from '@/lib/firebase'
import type { WorkspaceRepository } from './workspaceRepository'
import { withDefaults } from './defaults'

type PublicFields = Omit<Workspace, 'components'> & {
  components: Omit<Workspace['components'], 'engagement'>
}

function roomRef(slug: string) {
  return doc(db!, 'rooms', slug)
}

function engagementRef(slug: string) {
  return doc(db!, 'rooms', slug, 'private', 'engagement')
}

function splitWorkspace(workspace: Workspace) {
  const { engagement, ...publicComponents } = workspace.components
  const publicFields: PublicFields = { ...workspace, components: publicComponents }
  return { publicFields, engagementEvents: engagement }
}

function isOwner(ownerUid: string | undefined) {
  return Boolean(ownerUid && auth?.currentUser?.uid === ownerUid)
}

async function readWorkspace(slug: string): Promise<Workspace | null> {
  let snap
  try {
    snap = await getDoc(roomRef(slug))
  } catch (error) {
    // Draft/archived rooms are denied to everyone but their owner; to a
    // prospect that is indistinguishable from the room not existing.
    if ((error as { code?: string }).code === 'permission-denied') return null
    throw error
  }

  if (!snap.exists()) {
    const template = seedFixtures[slug]
    if (!template || !auth?.currentUser) return null
    return seedRoom(slug, template)
  }

  const data = snap.data() as PublicFields & { ownerUid: string }
  let engagementEvents: EngagementEvent[] = []

  if (isOwner(data.ownerUid)) {
    const engagementSnap = await getDoc(engagementRef(slug))
    engagementEvents = (engagementSnap.data() as { events?: EngagementEvent[] } | undefined)
      ?.events ?? []
  }

  return withDefaults({
    ...data,
    status: data.status ?? 'published',
    components: { ...data.components, engagement: engagementEvents },
  })
}

async function seedRoom(slug: string, template: Workspace): Promise<Workspace> {
  const user = auth!.currentUser!
  const { publicFields, engagementEvents } = splitWorkspace(template)

  await runTransaction(db!, async (tx) => {
    tx.set(roomRef(slug), {
      ...publicFields,
      ownerUid: user.uid,
      ownerEmail: user.email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    tx.set(engagementRef(slug), { events: engagementEvents })
  })

  return template
}

export const firestoreWorkspaceRepository: WorkspaceRepository = {
  getWorkspace: readWorkspace,

  async updateWorkspace(slug, updater) {
    const current = await readWorkspace(slug)
    if (!current) throw new Error(`Workspace not found: ${slug}`)

    const next = updater(structuredClone(current))
    const { publicFields, engagementEvents } = splitWorkspace(next)

    // A transaction here buys atomicity across the two documents (both
    // writes land or neither does) — `merge: true` leaves ownerUid/createdAt
    // untouched, and the security rule authorizes against the existing
    // (pre-write) ownerUid, so there's no need to re-read it first.
    await runTransaction(db!, async (tx) => {
      tx.set(roomRef(slug), { ...publicFields, updatedAt: serverTimestamp() }, { merge: true })
      tx.set(engagementRef(slug), { events: engagementEvents })
    })

    return next
  },
}
