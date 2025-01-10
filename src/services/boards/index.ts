import api from '../instance'
import type { IBoard, IBoardResume, IFormBoard } from '@/interfaces/IBoard'

export function getAllBoards() {
  return api.get<Array<IBoard>>('/boards/')
}

export function getBoardById(id: string) {
  return api.get<IBoardResume>(`/boards/${id}`)
}

export function createBoard(sendData: IFormBoard) {
  return api.post('/boards/', { ...sendData })
}

export function updateBoard(sendData: IFormBoard, id: string) {
  return api.put(`/boards/${id}`, { ...sendData })
}

export function deleteBoard(id: string) {
  return api.delete(`/boards/${id}`)
}
