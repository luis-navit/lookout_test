import { defineStore } from 'pinia'
import { getStore, storageGetItem, storageInsertItem, storageRemoveItem } from '@/composables/store'

export const useSessionStore = defineStore('sessionStore', () => {
  const store = getStore(sessionStorage, 'sessionStorage')

  const getDataFromStore = (key: string): any => {
    return storageGetItem(store, key)
  }

  const saveDataOnStore = (key: string, data: any): void => {
    return storageInsertItem(store, key, data)
  }

  const removeDataOfStore = (key: string): void => {
    storageRemoveItem(store, key)
  }

  return { getDataFromStore, saveDataOnStore, removeDataOfStore }
})
