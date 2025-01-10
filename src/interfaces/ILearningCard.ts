import type { learningStatusEnum } from '@/enums/learningEnums'

interface ILearningCard {
  title: string
  createdAt: string
  status: learningStatusEnum
  percentage: number
}

export type { ILearningCard }
