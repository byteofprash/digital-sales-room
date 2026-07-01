import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * Stand-in for Phase 1's real Google Workspace SSO (Supabase Auth).
 * Every visitor to a room link is a prospect by default — the Edit button
 * (and everything it unlocks) only appears once an AE has "signed in".
 * This dev-only toggle lets us demo both views before real auth exists.
 */
export const useSessionStore = defineStore('session', () => {
  const isAeAuthenticated = ref(false)
  const aeName = ref('Stefan Weber')

  function signInAsAe() {
    isAeAuthenticated.value = true
  }

  function signOut() {
    isAeAuthenticated.value = false
  }

  return { isAeAuthenticated, aeName, signInAsAe, signOut }
})
