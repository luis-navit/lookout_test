import api from '../instance'
import type { ITimeSeriesTraining } from '@/interfaces/ITimeSeries'
import type { ITraining, ITrainingGraph } from '@/interfaces/ITraining'

export function getAllTraining() {
  return api.get<Array<ITraining>>('/training/')
}

export function getTrainingById(id: string, type: string) {
  return api.get<ITraining | ITrainingGraph | ITimeSeriesTraining>(`/training/${id}?type=${type}`)
}

export function deleteTrainingById(id: string, type: string) {
  return api.delete(`/training/${id}?type=${type}`)
}
