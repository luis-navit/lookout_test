interface ITheme {
  id: string
  createdAt: string
  updatedAt: string
  deletedAt?: null | string
  color: string
  name: string
}

interface ISavedTheme {
  color: string
  id: string
  logoMarkPath: any
  company: string
  createdAt: string
  updatedAt: string
}

interface IUpdatedTheme {
  color: string
  id: string
  logoMarkPath: string
}

export type { ITheme, ISavedTheme, IUpdatedTheme }
