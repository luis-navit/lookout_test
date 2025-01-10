import axios from 'axios'
import pinia from '@/stores/instance'
import { useAuthStore } from '@/stores/authStore'

const baseURL: string = import.meta.env.VITE_APP_ROOT_API || './api'
const authStore = useAuthStore(pinia)

const updatePasswordInstance = axios.create({
  baseURL,
  responseType: 'json',
  headers: {
    'Content-Type': 'application/json',
  },
})

updatePasswordInstance.interceptors.request.use(
  async function (config) {
    config.headers.Authorization = `Bearer ${authStore.token}`
    return config
  },
  function (error: any) {
    return Promise.reject(error)
  }
)

export default updatePasswordInstance
