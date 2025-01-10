import { defineStore } from 'pinia'
import { getStore, storageGetItem, storageInsertItem, storageRemoveItem } from '@/composables/store'

export const useLocalStore = defineStore('localStore', () => {
  const store = getStore(localStorage, 'localStorage')

  const getDataFromStore = (key: string): any => {
    return storageGetItem(store, key)
  }

  const saveDataOnStore = (key: string, data: any): void => {
    storageInsertItem(store, key, data)
  }

  const removeDataOfStore = (key: string): void => {
    storageRemoveItem(store, key)
  }

  return { store, getDataFromStore, saveDataOnStore, removeDataOfStore }
})
