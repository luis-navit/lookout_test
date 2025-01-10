import api from '../instance'
import type { IArchiveState } from '@/interfaces/IBoard'

export function getAllArchivedOSState(boardId: string) {
  return api.get<Array<IArchiveState>>(`/osState/closed/${boardId}`)
}

export function createOSState(name: string, board: string, stage: number) {
  return api.post('/osState/', { name, board, stage })
}

export function updateArchiveOSState(stateId: string, board: string, closed: boolean) {
  return api.put(`/osState/${stateId}`, { board, closed })
}

export function updateOSState(
  name: string,
  stateId: string,
  board: string,
  stage: number,
  closed?: boolean
) {
  return api.put(`/osState/${stateId}`, { name, board, stage, closed })
}

export function deleteOSState(stateId: string) {
  return api.delete(`/osState/${stateId}`)
}
