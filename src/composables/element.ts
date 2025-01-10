import { ElLoading, ElMessage } from 'element-plus'
import type { elementTypesEnum } from '@/enums/elementTypesEnum'

const elLoading = (text = 'Carregando...') => {
  return ElLoading.service({
    text,
    lock: true,
    background: 'rgba(0, 0, 0, 0.7)',
  })
}

const elMessage = (message: string, type?: elementTypesEnum, duration: number = 3000) => {
  ElMessage({
    type,
    message,
    duration,
    grouping: true,
    showClose: true,
  })
}

export { elLoading, elMessage }
