import api from '../instance'
import type { IDataDetail } from '@/interfaces/IDataType'

export function getDataByType(type: string, page: number, step: number, filters: Array<any>) {
  return api.post<IDataDetail>('/data/get', { type, page, step, filters })
}

export function getDataCountByType(type: string, filters: Array<any>) {
  return api.post<{ count: number }>('/data/count', { type, filters })
}

export function getSampleByType(type: string) {
  return api.get<Record<string, string>>(`/data/sample?type=${type}`)
}

export function getDataFile(sendData: Record<string, any>) {
  return api.post('/data/download', sendData, {
    responseType: 'blob',
  })
}
