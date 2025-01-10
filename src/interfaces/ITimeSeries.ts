import type { ILifecycle } from './utils'

interface ITimeSeriesTraining extends ILifecycle {
  id: string
  type: string
  name: string
  status: string
  message: string
  technique: string
  payload: IPayload
  results: Array<IResult>
}

interface IPayload {
  name: string
  type: string
  target: string
  dateField: string
  granularity: string
  limit: number
  horizon: number
  isProcessed: boolean
}

interface IResult {
  graph: string
  graphSrc: string
  pathModel: string
  algorithmName: string
  graphComparison: string
  graphComparisonSrc: string
  graphComponents: string
  graphComponentsSrc: string
  rules: Array<IRule>
  metrics: Record<string, number>
  data: Array<Record<string, any>>
}

interface IRule {
  id: string
  name: string
  query: string
  message: string
  queryType: string
  isActive: boolean
  isImportant: boolean
}

interface IPreviewResult {
  ds: string
  y: number
}

export type { ITimeSeriesTraining, IResult, IRule, IPreviewResult }
