import api from '../instance'
import type { IPreviewResult } from '@/interfaces/ITimeSeries'

export function trainTimeSeriesModel(sendData: Record<string, any>) {
  return api.post('/timeSeries/train', { ...sendData })
}

export function runTimeSeriesModel(type: string, pathModel: string, inputData: any) {
  return api.post<{ results: Array<IPreviewResult> }>('/timeSeries/run', {
    type,
    pathModel,
    inputData,
  })
}
