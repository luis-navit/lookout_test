interface IRule {
  name: string
  query: string
  message: string
  queryType?: string
  isActive: boolean
  isImportant: boolean
}

interface IModel {
  id: string
  type: string
  name: string
  limit: number
  technique: string
  pathModel: string
  trainingId: string
  algorithmName: string
  horizon: string
  pastDays: string
  rules: Array<IRule>
  fields: Array<string>
  query: Record<string, any>
  feature?: string
}

export type { IModel, IRule }
