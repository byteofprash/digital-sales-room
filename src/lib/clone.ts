import { toRaw } from 'vue'

/**
 * Deep copy for the Edit-mode dialogs' working drafts. Props come from the
 * workspace store as Vue reactive proxies, which `structuredClone` refuses
 * (DataCloneError), so unwrap to the raw data first.
 */
export function cloneRaw<T>(value: T): T {
  return structuredClone(toRaw(value))
}
