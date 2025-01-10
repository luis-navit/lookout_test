import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useNavStore = defineStore('navStore', () => {
  const currentNavItem = ref<string>('')
  const currentNavState = ref<boolean>(true)

  const updateNavItem = (newNavItem: string): void => {
    currentNavItem.value = newNavItem
  }

  const updateNavState = (newNavState: boolean): void => {
    currentNavState.value = newNavState
  }

  return { currentNavItem, updateNavItem, currentNavState, updateNavState }
})
