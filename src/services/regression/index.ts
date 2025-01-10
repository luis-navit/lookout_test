import api from '../instance'

export function trainRegressionModel(sendData: Record<string, any>) {
  return api.post('/regression/train', { ...sendData })
}
