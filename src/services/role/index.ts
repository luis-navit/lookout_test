import api from '../instance'
import type { IRole } from '@/interfaces/IGroupPermission'

export function getAllRoles() {
  return api.get<Record<string, Array<IRole>>>('/role/')
}
