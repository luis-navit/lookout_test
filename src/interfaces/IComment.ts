import type { ILifecycle } from './utils'

interface IUser {
  id: string
  name: string
  picturePath: string
  managedCompany: string
}

interface IComment extends ILifecycle {
  id: string
  os: string
  message: string
  user: IUser
}

export type { IComment }
