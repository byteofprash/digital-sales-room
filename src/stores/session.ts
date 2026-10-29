import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { auth, firebaseEnabled, googleProvider } from '@/lib/firebase'

const ALLOWED_EMAIL_DOMAIN = 'talon.one'

/**
 * Front-end counterpart of the API's DEV_AUTH_BYPASS: with VITE_DEV_AUTH_BYPASS=true the app starts
 * signed in as the dev AE, so /ae and Edit mode need no click. It only takes effect against the
 * localStorage mock; once Firebase is configured, Firestore's rules require a real sign-in
 * whatever this says, so it is ignored there.
 */
const devBypass =
  import.meta.env.DEV && import.meta.env.VITE_DEV_AUTH_BYPASS === 'true' && !firebaseEnabled
const DEV_AE_NAME = 'Stefan Weber'

/**
 * AE identity for the Edit button and Firestore ownership checks. Backed by
 * real Firebase Auth (Google Sign-In, restricted to the talon.one workspace)
 * once a Firebase project is configured; otherwise falls back to a dev-only
 * toggle so the Edit-mode demo still works with zero setup (mirrors the
 * fallback in workspaceRepository.ts).
 */
export const useSessionStore = defineStore('session', () => {
  const isAeAuthenticated = ref(devBypass)
  const aeName = ref(devBypass ? DEV_AE_NAME : '')
  const aeUid = ref<string | null>(null)
  const authError = ref<string | null>(null)

  if (firebaseEnabled && auth) {
    onAuthStateChanged(auth, (user) => {
      isAeAuthenticated.value = Boolean(user)
      aeName.value = user?.displayName ?? ''
      aeUid.value = user?.uid ?? null
    })
  }

  async function signInAsAe() {
    authError.value = null

    if (!firebaseEnabled || !auth) {
      // Production builds fail closed: no fake sign-in without a Firebase project.
      if (!import.meta.env.DEV) {
        authError.value = 'Sign-in is not configured.'
        return
      }
      // Dev-only stand-in — no Firebase project configured yet.
      isAeAuthenticated.value = true
      aeName.value = DEV_AE_NAME
      return
    }

    try {
      const result = await signInWithPopup(auth, googleProvider)
      if (!result.user.email?.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`)) {
        await firebaseSignOut(auth)
        authError.value = `Sign in with a @${ALLOWED_EMAIL_DOMAIN} account.`
      }
    } catch (error) {
      // e.g. the user closed the Google popup — not worth surfacing as an error.
      if ((error as { code?: string }).code !== 'auth/popup-closed-by-user') {
        authError.value = 'Sign-in failed. Please try again.'
      }
    }
  }

  async function signOut() {
    if (firebaseEnabled && auth) {
      await firebaseSignOut(auth)
    }
    isAeAuthenticated.value = false
    aeName.value = ''
    aeUid.value = null
  }

  return { isAeAuthenticated, aeName, aeUid, authError, signInAsAe, signOut }
})
