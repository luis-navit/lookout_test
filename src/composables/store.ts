import { EncryptStorage } from 'encrypt-storage'

const getStore = (storage: any, storageType: 'localStorage' | 'sessionStorage') => {
  return import.meta.env.VITE_APP_ENV !== 'development'
    ? new EncryptStorage(import.meta.env.VITE_APP_ENCRYPT_STORAGE_KEY || 'GENERIC_ENCRYPT_KEY', {
        storageType,
      })
    : storage
}

const storageGetItem = (storage: any, key: string): any => {
  try {
    return import.meta.env.VITE_APP_ENV !== 'development'
      ? storage.getItem(key)
      : JSON.parse(storage.getItem(key))
  } catch (error: any) {
    return null
  }
}

const storageInsertItem = (storage: any, key: string, value: any): void => {
  storage.setItem(key, JSON.stringify(value))
}

const storageRemoveItem = (storage: any, key: string): void => {
  storage.removeItem(key)
}

export { getStore, storageGetItem, storageInsertItem, storageRemoveItem }
