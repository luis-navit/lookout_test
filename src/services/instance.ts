import axios, { type AxiosRequestConfig } from 'axios'
import pinia from '@/stores/instance'
import router from '@/router'
import { useAuthStore } from '@/stores/authStore'
import { fetchRefreshToken } from './auth'
import { jwtDecode } from 'jwt-decode'
import { isAfter } from 'date-fns'
import { handlePermissions, handleProfile } from '@/composables/utils'
import type { ICompany } from '@/interfaces/ICompany'
import { elMessage } from '@/composables/element'
import { elementTypesEnum } from '@/enums/elementTypesEnum'
import { useLocalStore } from '@/stores/localStore'

const baseURL: string = import.meta.env.VITE_APP_ROOT_API || './api'
const authStore = useAuthStore(pinia)
const localStore = useLocalStore()

const instance = axios.create({
  baseURL,
  responseType: 'json',
  headers: {
    'Content-Type': 'application/json',
  },
})

instance.interceptors.request.use(
  async function (config) {
    config.headers.Authorization = `Bearer ${authStore.token}`
    return config
  },
  function (error: any) {
    return Promise.reject(error)
  }
)

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (
      error.response.status === 401 &&
      authStore.refreshToken &&
      !window.location.pathname.includes('resetPassword')
    ) {
      try {
        const config = error.config as AxiosRequestConfig
        const { data } = await fetchRefreshToken(authStore.refreshToken)
        const permissions = handlePermissions(data.user.permissions || [])
        const profile = handleProfile(data.user.group, data.user.company as ICompany)

        const localToken = localStore.getDataFromStore('token')

        authStore.login(data, profile, permissions, !!localToken)
        return instance(config)
      } catch (error: any) {
        elMessage('Seção finalizada.', elementTypesEnum.INFO)
        authStore.logout()
        router.push({ path: '/login' })
      }
    }

    if (error.response.status === 403) {
      setTimeout(() => {
        router.push({
          name: 'HomeView',
        })
      }, 1000)
    }

    return Promise.reject(error)
  }
)

export default instance
