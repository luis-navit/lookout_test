interface IRule {
  id: string
  leaf: string
  name: string
  class: string
  query: string
  queryType: string
  message: string
  accuracy: number
  accuracyCount: number
  error: number
  errorCount: number
  isActive: boolean
  isImportant: boolean
}

interface IData {
  value: number
  Anomaly: number
  Anomaly_Score: number
}

interface IResult {
  sheet: string
  graph: string
  model: string
  pathModel: string
  algorithmName: string
  data: Array<IData>
  rules: Array<IRule>
  graphAnomaly?: string
  graphDecisionTree?: string
}

interface IQuery {
  'data.boardName': string
}

interface IPayload {
  type: string
  limit: number
  algorithmName: string
  fields: Array<string>
  query: IQuery
  city?: string
  window_start: string
  window_end: string
}

interface ITraining {
  id: string
  name: string
  type: string
  title?: string
  status: string
  message: string
  technique: string
  payload: IPayload
  results: Array<IResult>
  createdAt: string
}

interface ITrainingGraph {
  id: string
  type: string
  name: string
  status: string
  message: string
  technique: string
  createdAt: string
  payload: IPayload
  results: Array<IGraphResult>
}

interface IGraphRule {
  id: string
  name: string
  query: string
  queryType: string
  message: string
  isActive: boolean
  isImportant: boolean
}

interface IGraphResult {
  model: string
  graph: string
  graphSrc: any
  pathModel: string
  algorithmName: string
  fields: Array<string>
  rules: Array<IGraphRule>
  metrics: Record<string, number>
  data: Array<Record<string, any>>
  feature?: string
}

export type { ITraining, IResult, IRule, ITrainingGraph, IGraphRule, IGraphResult }
