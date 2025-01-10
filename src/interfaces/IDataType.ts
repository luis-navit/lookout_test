interface IDataType {
  id: string
  name: string
  title: string
  company: string
  processor: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  state: string | null
}

interface IDataInfo {
  _id: string
  type: string
  timestamp: string
  processor?: string
  data: Record<string, any>
}

interface IDataDetail {
  page: number
  step: number
  data: Array<IDataInfo>
}

export type { IDataType, IDataDetail }
