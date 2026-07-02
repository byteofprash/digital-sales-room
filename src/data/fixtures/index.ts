import type { Workspace } from '../types'
import { acmeCorpWorkspace } from './acme-corp'

/**
 * Known demo/template rooms, keyed by slug. Used by both the localStorage
 * mock repository and the Firestore repository's first-visit auto-seed —
 * creating a brand new (non-fixture) room is intentionally out of scope
 * until the AE portal exists.
 */
export const seedFixtures: Record<string, Workspace> = {
  [acmeCorpWorkspace.slug]: acmeCorpWorkspace,
}
