import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useSessionStore } from './session'

export const useEditModeStore = defineStore('editMode', () => {
  const isEditMode = ref(false)

  function toggle() {
    const session = useSessionStore()
    if (!session.isAeAuthenticated) {
      isEditMode.value = false
      return
    }
    isEditMode.value = !isEditMode.value
  }

  function exit() {
    isEditMode.value = false
  }

  return { isEditMode, toggle, exit }
})
