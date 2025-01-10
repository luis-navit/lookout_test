import api from '../instance'
import type { IAlert, IReadAlerts } from '@/interfaces/IAlert'

export function getAllAlerts() {
  return api.post<Array<IAlert>>('/alerts/', {
    page: 1,
    step: 10,
    filters: [
      {
        field: 'read',
        value: false,
        operator: '$eq',
      },
    ],
    sort: {
      field: 'timestamp',
      order: 'desc',
    },
  })
}

export function readyAlerts(alertIds: string[]) {
  return api.put<IReadAlerts>(`/alerts/setRead`, { ids: alertIds, read: true })
}
