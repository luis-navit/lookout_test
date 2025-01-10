interface IAlert {
  _id: string
  type: string
  message: string
  timestamp: string
  status: boolean
  isImportant: boolean
}

interface IReadAlerts {
  acknowledged: boolean
  modifiedCount: number
  upsertedId: null | string
  upsertedCount: number
  matchedCount: number
}

export type { IAlert, IReadAlerts }
