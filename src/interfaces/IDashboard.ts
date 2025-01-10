interface IDashboardDataType {
  id: string
  name: string
  title: string
  processor: string
}

interface IDashboard {
  id: string
  title: string
  company: string
  iframeUrl?: string
  dashboard: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  types: Array<IDashboardDataType>
}

export type { IDashboard, IDashboardDataType }
