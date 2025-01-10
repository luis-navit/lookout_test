import api from '../instance'

export function addAttachment(osId: string, attach: any) {
  const formData = new FormData()

  formData.append('osId', osId)
  formData.append('attach', attach)

  return api.post('/attachment/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export function deleteAttachment(id: string) {
  return api.delete(`/attachment/${id}`)
}
