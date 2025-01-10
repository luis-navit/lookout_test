import api from '../instance'

export function createComment(osId: string, message: string) {
  return api.post('/comment/', { osId, message })
}
