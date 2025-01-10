import type { IUser } from './IUser'

interface ILogin {
  user: IUser
  token: string
  refreshToken: string
}

export type { ILogin }
