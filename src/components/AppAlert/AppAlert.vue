<template>
  <el-badge
    class="alert-container"
    :value="alerts.length"
    :badge-style="{ color: 'var(--el-color-on-error)' }"
  >
    <el-dropdown trigger="click" :hide-on-click="false">
      <el-icon size="25" class="bell-icon">
        <Bell />
      </el-icon>
      <template #dropdown>
        <el-dropdown-menu class="alerts-inner-container">
          <div v-if="alerts.length">
            <el-dropdown-item v-for="(alert, index) of alerts" :key="`alert-${index}-${alert._id}`">
              <div class="alert-dropdown-item">
                <span class="text--md">{{ alert.message }}</span>
                <el-icon
                  size="20"
                  color="red"
                  class="hide-icon"
                  @click="handleRemoveAlert(alert._id)"
                >
                  <Delete />
                </el-icon>
              </div>
            </el-dropdown-item>

            <div class="clear-all-notifications">
              <el-button @click="handleRemoveAllAlerts">Limpar todas as notificações</el-button>
            </div>
          </div>
          <div v-else>
            <span class="text--md">Sem notificações</span>
          </div>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </el-badge>
</template>

<script setup lang="ts">
  import pinia from '@/stores/instance'
  import { getAllAlerts, readyAlerts } from '@/services/alerts'
  import { elLoading, elMessage } from '@/composables/element'
  import { elementTypesEnum } from '@/enums/elementTypesEnum'
  import { useAlertStore } from '@/stores/alertStore'
  import type { IAlert } from '@/interfaces/IAlert'

  const props = defineProps<{
    alerts: Array<IAlert>
  }>()

  const alertStore = useAlertStore(pinia)

  const handleRemoveAlert = async (alertId: string) => {
    const loading = elLoading('Excluindo alerta...')
    await readyAlerts([alertId])

    const { data } = await getAllAlerts()
    alertStore.updateAlerts(data)

    loading.close()
    elMessage('Alerta excluído!', elementTypesEnum.SUCCESS)
  }

  const handleRemoveAllAlerts = async () => {
    const loading = elLoading('Excluindo todos os alertas...')

    const alertsIds = props.alerts.map((alert) => alert._id)

    await readyAlerts(alertsIds)

    const { data } = await getAllAlerts()
    alertStore.updateAlerts(data)

    loading.close()
    elMessage('Alertas excluídos com sucesso!', elementTypesEnum.SUCCESS)
  }
</script>

<style scoped lang="scss" src="./style.scss"></style>
