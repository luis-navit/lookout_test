import api from '../instance'

export function resetPassword(email: string) {
  return api.post('resetPassword/', { email })
}

export function updatePassword(password: string, token: string) {
  return api.post(`resetPassword/${token}`, { password })
}
