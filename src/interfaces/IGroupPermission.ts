import type { ILifecycle } from './utils'

interface IPermission extends ILifecycle {
  id: string
  name: string
  admin: boolean
  rolesCount: number
}

interface IPermissionDetail extends ILifecycle {
  id: string
  name: string
  admin: boolean
  roles: Record<string, Array<IRole>>
}

interface IRole extends ILifecycle {
  id: string
  name: string
}

export type { IPermission, IPermissionDetail, IRole }
