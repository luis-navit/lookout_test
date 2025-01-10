import api from '../instance'
import type { IDashboard } from '@/interfaces/IDashboard'

export function getAllDashboards() {
  return api.get<Array<IDashboard>>('/dashboard/')
}

export function saveDashboard(sendData: Record<string, any>) {
  return api.post('/dashboard/', { ...sendData })
}

export function editDashboard(sendData: Record<string, any>, id: string) {
  return api.put(`/dashboard/${id}`, { ...sendData })
}

export function deleteDashboard(id: string) {
  return api.delete(`/dashboard/${id}`)
}

export function getDashboardById(id: string) {
  return api.get<IDashboard>(`/dashboard/${id}`)
}
