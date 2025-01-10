import api from '../instance'

export function downloadExternalFile(path: string) {
  return api.get(`/externalFile/download?path=${path}`)
}
