import type { Workspace } from './types'
import { seedFixtures } from './fixtures'
import { firebaseEnabled } from '@/lib/firebase'
import { firestoreWorkspaceRepository } from './firestoreWorkspaceRepository'

const STORAGE_PREFIX = 'dsr:workspace:'

export interface WorkspaceRepository {
  getWorkspace(slug: string): Promise<Workspace | null>
  updateWorkspace(
    slug: string,
    updater: (workspace: Workspace) => Workspace,
  ): Promise<Workspace>
}

function loadFromStorage(slug: string): Workspace | null {
  const raw = localStorage.getItem(STORAGE_PREFIX + slug)
  if (!raw) return null
  try {
    return JSON.parse(raw) as Workspace
  } catch {
    return null
  }
}

function saveToStorage(slug: string, workspace: Workspace) {
  localStorage.setItem(STORAGE_PREFIX + slug, JSON.stringify(workspace))
}

/**
 * Mock implementation: seeds from fixtures, persists AE edits to localStorage
 * so the Edit-mode demo survives a reload. Phase 1 swaps this for a
 * Supabase-backed implementation behind the same WorkspaceRepository
 * interface — components/views only ever depend on that interface.
 */
export const mockWorkspaceRepository: WorkspaceRepository = {
  async getWorkspace(slug) {
    return loadFromStorage(slug) ?? seedFixtures[slug] ?? null
  },
  async updateWorkspace(slug, updater) {
    const current = loadFromStorage(slug) ?? seedFixtures[slug]
    if (!current) throw new Error(`Workspace not found: ${slug}`)
    const next = updater(structuredClone(current))
    saveToStorage(slug, next)
    return next
  },
}

/**
 * Firestore takes over automatically once a real Firebase project is
 * configured (see src/lib/firebase.ts); until then every environment,
 * including a contributor's machine with no Firebase setup at all, keeps
 * working against the localStorage mock. No call site needs to know which
 * one is active.
 */
export const workspaceRepository: WorkspaceRepository = firebaseEnabled
  ? firestoreWorkspaceRepository
  : mockWorkspaceRepository
