import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { IAlert } from '@/interfaces/IAlert'

export const useAlertStore = defineStore('alertStore', () => {
  const alerts = ref<Array<IAlert>>([])

  const updateAlerts = (newAlerts: Array<IAlert>): void => {
    alerts.value = newAlerts
  }

  return { alerts, updateAlerts }
})
