import type { filterOperatorEnum } from '@/enums/filterOperatorEnum'

interface IFilter {
  value: string
  field: string
  operator: filterOperatorEnum
}

export type { IFilter }
