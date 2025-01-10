import type { RouteRecordRaw } from 'vue-router'
import AuthLayout from '@/layouts/authLayout/authLayout.vue'
import LoginView from '@/views/LoginView/LoginView.vue'
import ResetPassword from '@/views/ResetPassword/ResetPassword.vue'

const AuthRoutes: RouteRecordRaw = {
  path: '/',
  component: AuthLayout,
  children: [
    {
      name: 'LoginView',
      path: '/login',
      component: LoginView,
      meta: { currentIndex: 'login' },
    },
    {
      name: 'ResetView',
      path: '/resetPassword',
      component: ResetPassword,
      meta: { currentIndex: 'reset' },
    },
  ],
}

export default AuthRoutes
