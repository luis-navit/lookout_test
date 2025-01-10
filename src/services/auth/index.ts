import axios from 'axios'
import type { ILogin } from '@/interfaces/ILogin'

const baseURL: string = import.meta.env.VITE_APP_ROOT_API || './api'

const api = axios.create({
  baseURL,
  responseType: 'json',
  headers: {
    'Content-Type': 'application/json',
  },
})

export function fetchLogin(email: string, password: string, rememberMe: boolean) {
  const loginData: { email: string; password: string; rememberMe?: boolean } = {
    email,
    password,
  }

  if (rememberMe) loginData.rememberMe = rememberMe

  return api.post<ILogin>('/login', loginData)
}

export function fetchRefreshToken(token: string) {
  return api.get<ILogin>('/refresh', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}
