import api from '../instance'
import type { IDataType } from '@/interfaces/IDataType'

export function getAllDataTypes() {
  return api.get<Array<IDataType>>('/type/')
}
