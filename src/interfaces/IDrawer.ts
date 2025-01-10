import type { elementDrawerDirectionEnum } from '@/enums/elementTypesEnum'

interface IDrawer {
  title: string
  show: boolean
  showFooter?: boolean
  submitBtnState?: boolean
  isFormModified?: boolean
  submitBtnLabel?: string
  cancelBtnLabel?: string
  direction?: elementDrawerDirectionEnum
}

export type { IDrawer }
