import api from '../instance'

export function downloadImage(path: string) {
  return api.get(`/files/download/${path}`, {
    responseType: 'arraybuffer',
  })
}

export function downloadFile(path: string) {
  return api.get(`/files/download/${path}`)
}
