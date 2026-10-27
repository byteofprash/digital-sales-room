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
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY must be set',
    )
  }
  return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) })
}

const app = getApps()[0] ?? initAdminApp()

export const adminAuth = getAuth(app)
export const adminDb = getFirestore(app)
