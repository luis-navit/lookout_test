import api from '../instance'
import type { IPermission, IPermissionDetail } from '@/interfaces/IGroupPermission'

export function getAllGroups() {
  return api.get<Array<IPermission>>('/group/')
}

export function getGroupById(id: string) {
  return api.get<IPermissionDetail>(`/group/${id}`)
}

export function createGroup(sendData: Record<string, any>) {
  return api.post(`/group/`, { ...sendData })
}

export function updateGroup(id: string, sendData: Record<string, any>) {
  return api.put(`/group/${id}`, { ...sendData })
}

export function deleteGroup(id: string) {
  return api.delete(`/group/${id}`)
}
