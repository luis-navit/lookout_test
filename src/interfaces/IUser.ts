import type { ICompany } from './ICompany'
import type { IPermission } from './IGroupPermission'

interface IUser {
  id: string
  name: string
  email: string
  os: Array<any>
  group: IPermission
  company?: ICompany
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
  picturePath?: string | null
  profileImage?: string | null
  systemResources: Array<any>
  permissions: Array<Array<string>>
  roles: Record<string, Array<string>>
}

interface IGroup {
  id: string
  name: string
  admin: boolean
}

interface IUserResume {
  id: string
  name: string
  picturePath: string | null
}

interface IUpdateUser {
  name: string
  email?: string
  group?: string
  password?: string
  newPassword?: string
  picturePath?: File | 'undefined'
  logoMarkPath?: File
}

interface INewUser extends IUpdateUser {
  password: string
}

export type { IUser, IUpdateUser, INewUser, IUserResume }
