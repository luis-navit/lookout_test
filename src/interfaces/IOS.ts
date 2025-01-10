import type { UploadUserFile } from 'element-plus'
import type { ILifecycle } from './utils'
import type { IComment } from './IComment'

interface IOS extends ILifecycle {
  id: string
  state: string
  stateId?: string
  closed: boolean
  dueDate: string
  activity: string
  description: string
  count: number
  ruleName?: string
  modelName?: string
  users: Array<IOSUser>
  files: Array<UploadUserFile>
  attachments: Array<IAttachment>
  comments: Array<IComment>
}

interface IOSUser {
  id: string
  name: string
  managedCompany: string
  picturePath: string
}

interface IAttachment extends ILifecycle {
  id: string
  os: string
  filePath: string
  fileType: string
}

interface ICreateOS {
  activity: string
  description: string
  dueDate?: string
  users: Array<string>
}

export type { IOS, ICreateOS, IOSUser }
