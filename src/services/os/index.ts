import api from '../instance'
import type { ICreateOS, IOS } from '@/interfaces/IOS'
import type { IArchiveOS, IStateOS } from '@/interfaces/IBoard'

export function getAllArchivedOS(boardId: string) {
  return api.get<Array<IArchiveOS>>(`/os/closed/${boardId}`)
}

export function getOSByBoard(boardId: string) {
  return api.get<Array<IStateOS>>(`/os/board/${boardId}`)
}

export function getOSById(boardId: string) {
  return api.get<IOS>(`/os/${boardId}`)
}

export function createOS(os: ICreateOS, stateId: string) {
  return api.post('/os/', { ...os, stateId })
}

export function updateOS(id: string, os: any) {
  return api.put(`/os/${id}`, { ...os })
}

export function updateArchiveOS(id: string, closed: boolean) {
  return api.put(`/os/${id}`, { closed })
}

export function deleteOS(id: string) {
  return api.delete(`/os/${id}`)
}
