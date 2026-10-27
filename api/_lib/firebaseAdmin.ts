import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

// Server-side credentials for a Firebase service account. Unlike the
// VITE_FIREBASE_* web config these are secrets: set them as (non-public)
// environment variables on the Vercel project.
function initAdminApp() {
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  // Against the Firestore emulator no credentials are needed (pair with DEV_AUTH_BYPASS).
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    return initializeApp({ projectId: projectId ?? 'demo-digital-sales-room' })
  }
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY must be set',
    )
  }
  return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) })
}

// Initialised on first use, not at import time, so a bad credential surfaces
// as a logged 500 from the route wrapper instead of a function crash.
const getApp = () => getApps()[0] ?? initAdminApp()

export const getAdminAuth = () => getAuth(getApp())
export const getAdminDb = () => getFirestore(getApp())
