import api from '../instance'
import type { IModel } from '@/interfaces/IModel'

export function getAllModels() {
  return api.get<Array<IModel>>('/model/')
}

export function getModelById(id: string, type: string) {
  return api.get<IModel>(`/model/${id}?type=${type}`)
}

export function saveModel(sendData: Record<string, any>, type: string) {
  return api.post('/model/', { ...sendData, type })
}

export function updateModel(id: string, updateModel: Record<string, any>, type: string) {
  return api.put(`/model/${id}`, { ...updateModel, type })
}

export function deleteModel(id: string, type: string) {
  return api.delete(`/model/${id}?type=${type}`)
}
