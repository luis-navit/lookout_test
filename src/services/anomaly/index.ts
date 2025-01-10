import api from '../instance'

export function trainAnomalyModel(sendData: Record<string, any>) {
  return api.post('/anomaly/train', { ...sendData })
}
