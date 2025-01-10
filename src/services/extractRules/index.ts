import api from '../instance'

export function trainExtractRulesModel(sendData: Record<string, any>) {
  return api.post('/extractRules/train', { ...sendData })
}
