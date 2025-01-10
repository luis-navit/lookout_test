import type contextEnum from '@/enums/contextEnum'
import type { RouteLocationNormalizedLoaded } from 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    currentIndex: string
    context?: contextEnum
    // Adicione outros campos conforme necessário
  }

  interface RouteMeta extends RouteLocationNormalizedLoaded['meta'] {}
}
