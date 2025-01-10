import api from '../instance'

export function getPrevisionCities(field: string, type: string) {
  return api.post<Array<any>>('/data/distinct', { field, type })
}
