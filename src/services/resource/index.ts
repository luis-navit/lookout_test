import api from '../instance'

export function getAllTrainingConstants() {
  return api.get<Record<string, Array<string>>>('/resource/trainingConstants')
}
