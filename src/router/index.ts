import pinia from '@/stores/instance'
import { getAllAlerts } from '@/services/alerts'
import { useAlertStore } from '@/stores/alertStore'
import { useAuthStore } from '@/stores/authStore'
import { createRouter, createWebHistory } from 'vue-router'
import contextEnum from '@/enums/contextEnum'
import authRoutes from './routes/authRoutes'
import basicRoutes from './routes/basicRoutes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [basicRoutes, authRoutes],
})

const handleAlerts = async (): Promise<void> => {
  const authStore = useAuthStore(pinia)
  if (Object.keys(authStore.userData.roles).includes(contextEnum.ALERTS)) {
    const alertStore = useAlertStore(pinia)
    const { data } = await getAllAlerts()
    alertStore.updateAlerts(data)
  }
}

router.beforeEach((to, from, next) => {
  const { token } = useAuthStore(pinia)

  if (to.name === 'ResetView') {
    next()
  }

  if (!token && to.name !== 'LoginView') {
    next({ name: 'LoginView' })
    return
  }

  if (token && to.name === 'LoginView') {
    next({ path: '/' })
    return
  }

  if (token) handleAlerts()

  next()
})

export default router
