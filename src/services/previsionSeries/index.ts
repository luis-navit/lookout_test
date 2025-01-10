import api from '../instance'

export function trainPrevisionModel(sendData: Record<string, any>) {
  return api.post('/forecast/train', { ...sendData })
}

export function runPrevisionModel(type: string, pathModel: string, inputData: any) {
  return api.post<{ graphPath: string; predictions: number[] }>('/forecast/run', {
    type,
    pathModel,
    ...inputData,
  })
}
