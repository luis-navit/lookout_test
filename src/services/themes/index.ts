import type { ISavedTheme, ITheme, IUpdatedTheme } from '@/interfaces/IThemes'
import api from '../instance'

export function getAllPredefinedThemes() {
  return api.get<Array<ITheme>>(`/theme/presets`)
}

export function getTheme(themeId: string) {
  return api.get<ITheme>(`/theme/${themeId}`)
}

export function saveCompanyTheme(company: string, color?: string, logoMarkPath?: any) {
  const formData = new FormData()

  if (color) formData.append('color', color)

  if (logoMarkPath) formData.append('logoMarkPath', logoMarkPath)

  formData.append('company', company)

  return api.post<ISavedTheme>('/theme/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export function updateCompanyTheme(themeId: string, color?: string, logoMarkPath?: any) {
  const formData = new FormData()

  if (color) formData.append('color', color)
  if (logoMarkPath) formData.append('logoMarkPath', logoMarkPath)

  return api.put<IUpdatedTheme>(`/theme/${themeId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}
