import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { auth, firebaseEnabled, googleProvider } from '@/lib/firebase'
import { devAuthBypass } from '@/lib/devBypass'

const ALLOWED_EMAIL_DOMAIN = 'talon.one'

const DEV_AE_NAME = 'Stefan Weber'

/**
 * AE identity for the Edit button and Firestore ownership checks. Backed by
 * real Firebase Auth (Google Sign-In, restricted to the talon.one workspace)
 * once a Firebase project is configured; otherwise falls back to a dev-only
 * toggle so the Edit-mode demo still works with zero setup (mirrors the
 * fallback in workspaceRepository.ts).
 */
export const useSessionStore = defineStore('session', () => {
  const isAeAuthenticated = ref(devAuthBypass)
  const aeName = ref(devAuthBypass ? DEV_AE_NAME : '')
  const aeUid = ref<string | null>(null)
  const authError = ref<string | null>(null)

  // In dev bypass the identity is fixed, so Firebase's (absent) user must not sign it out.
  if (firebaseEnabled && auth && !devAuthBypass) {
    onAuthStateChanged(auth, (user) => {
      isAeAuthenticated.value = Boolean(user)
      aeName.value = user?.displayName ?? ''
      aeUid.value = user?.uid ?? null
    })
  }

  async function signInAsAe() {
    authError.value = null

    if (devAuthBypass || !firebaseEnabled || !auth) {
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
