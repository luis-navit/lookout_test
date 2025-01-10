import type { IOS } from './IOS'
import type { ILifecycle } from './utils'

interface IBoard extends ILifecycle {
  id: string
  name: string
  company: string
  states: Array<IState>
  users: Array<IUser>
}

interface IUser {
  id: string
  name: string
  picturePath: string
}

interface IStateOS extends ILifecycle {
  id: string
  name: string
  stage: number
  closed: boolean
  os: Array<IOS>
  board: {
    id: string
    name: string
  }
}

interface IBoardResume extends ILifecycle {
  id: string
  name: string
  company: string
  users: Array<any>
}

interface IState {
  id: string
  name: string
  board: string
  stage: number
  closed: boolean
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  os?: Array<IBoardOS>
}

interface IBoardOS {
  id: string
  stage: string
  closed: boolean
  dueDate: string
  activity: string
  description: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

interface IArchiveOS {
  id: string
  activity: string
}

interface IArchiveState {
  id: string
  name: string
}

interface IFormBoard {
  name: string
  users: Array<any>
}

export type {
  IBoard,
  IState,
  IFormBoard,
  IBoardOS,
  IArchiveOS,
  IArchiveState,
  IBoardResume,
  IStateOS,
}
