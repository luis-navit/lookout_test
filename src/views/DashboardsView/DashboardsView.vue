<template>
  <div class="dashboard-view">
    <div class="dashboard-view__header">
      <HeaderBackTitle
        class="title-container"
        title="Dashboards"
        subtitle="Visualize os últimos dados coletados"
        @onBack="handleBack"
      />
      <div class="actions-wrapper">
        <el-input
          class="actions-search"
          v-model="search"
          suffix-icon="Search"
          placeholder="Pesquise uma informação na lista abaixo "
          maxlength="250"
          clearable
        />
        <el-button v-if="canManager" type="primary" icon="Plus" @click="handleOpenDrawer">
          Adicionar novo Dashboard
        </el-button>
      </div>
    </div>
    <div class="dashboard-view__body">
      <ul class="dashboard-cards-container" v-if="getDashboards.length">
        <li
          class="dashboard-card-container"
          :class="{ 'without-options': !canManager }"
          v-for="(dashboard, index) of getDashboards"
          :key="`dashboard-card-${index}`"
        >
          <DashboardCard
            :title="dashboard.title"
            :types="dashboard.types"
            :showOptions="canManager"
            @onEdit="handleEditDashboard(dashboard)"
            @onDelete="handleDeleteDashboard(dashboard)"
            @click="handleCardClick(dashboard)"
          />
        </li>
      </ul>
      <div class="empty-container" v-else>
        <h2 class="title--md">Nenhuma informação encontrada no momento</h2>
      </div>
    </div>
    <DrawerDashboard
      :showDrawer="showDrawer"
      :dataTypesOptions="dataTypes"
      :currentDashboard="currentDashboard"
      @onClose="handleCloseDrawer"
      @onCancel="handleCloseDrawer"
      @onSubmit:save="handleSaveSubmitDashboard"
      @onSubmit:edit="handleEditSubmitDashboard"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessageBox } from 'element-plus'
  import { elLoading, elMessage } from '@/composables/element'
  import { getAllDataTypes } from '@/services/type'
  import {
    getAllDashboards,
    saveDashboard,
    editDashboard,
    deleteDashboard,
  } from '@/services/dashboard'
  import type { IDashboard } from '@/interfaces/IDashboard'
  import type { ISelectOption } from '@/interfaces/ISelect'
  import { elementTypesEnum } from '@/enums/elementTypesEnum'
  import HeaderBackTitle from '@/components/HeaderBackTitle/HeaderBackTitle.vue'
  import DashboardCard from '@/components/DashboardCard/DashboardCard.vue'
  import DrawerDashboard from '@/components/DrawerDashboard/DrawerDashboard.vue'
  import { handleCheckContext, handleFilterData } from '@/composables/utils'
  import { useRoute } from 'vue-router'
  import roleEnum from '@/enums/roleEnum'

  const route = useRoute()
  const router = useRouter()
  const search = ref<string>('')
  const dataTypes = ref<Array<ISelectOption>>([])
  const showDrawer = ref<boolean>(false)
  const dashboards = ref<Array<IDashboard>>([])
  const currentDashboard = ref<IDashboard | null>(null)

  const handleBack = (): void => {
    router.push('/')
  }

  const handleEditDashboard = (dashboard: IDashboard): void => {
    currentDashboard.value = dashboard
    handleOpenDrawer()
  }

  const handleDeleteDashboard = (dashboard: IDashboard): void => {
    ElMessageBox.confirm(
      'Ao excluir o dashboard, você perderá informações cadastradas! Deseja continuar com a ação de excluir?',
      'Deseja excluir o dashboard?',
      {
        confirmButtonText: 'Excluir',
        cancelButtonText: 'Cancelar',
        confirmButtonClass: 'danger-btn',
      }
    ).then(() => {
      handleDeleteSubmitDashboard(dashboard)
    })
  }

  const handleOpenDrawer = (): void => {
    showDrawer.value = true
  }

  const handleCloseDrawer = (): void => {
    currentDashboard.value = null
    showDrawer.value = false
  }

  const handleCardClick = (dashboard: IDashboard): void => {
    router.push({ name: 'DashboardView', query: { id: dashboard.id } })
  }

  const handleDeleteSubmitDashboard = async (dashboardData: IDashboard): Promise<void> => {
    const loading = elLoading('Excluindo dashboard...')
    try {
      await deleteDashboard(dashboardData.id)
      dashboards.value = await handleGetDashboards()
      handleCloseDrawer()
    } catch (error: any) {
      elMessage(error?.response?.message || 'Erro ao excluir dashboard!', elementTypesEnum.ERROR)
    } finally {
      loading.close()
    }
  }

  const handleSaveSubmitDashboard = async (dashboardData: Record<string, any>): Promise<void> => {
    const loading = elLoading('Salvando dashboard...')
    try {
      await saveDashboard(dashboardData)
      dashboards.value = await handleGetDashboards()
      handleCloseDrawer()
    } catch (error: any) {
      elMessage(error?.response?.message || 'Erro ao salvar dashboard!', elementTypesEnum.ERROR)
    } finally {
      loading.close()
    }
  }

  const handleEditSubmitDashboard = async (
    dashboardData: Record<string, any>,
    id: string
  ): Promise<void> => {
    const loading = elLoading('Editando dashboard...')
    try {
      await editDashboard(dashboardData, id)
      dashboards.value = await handleGetDashboards()
      handleCloseDrawer()
    } catch (error: any) {
      elMessage(error?.response?.message || 'Erro ao editar dashboard!', elementTypesEnum.ERROR)
    } finally {
      loading.close()
    }
  }

  const handleGetDashboards = async (): Promise<Array<IDashboard>> => {
    const { data } = await getAllDashboards()
    return data
  }

  const handleGetDataTypes = async (): Promise<Array<ISelectOption>> => {
    const { data } = await getAllDataTypes()
    return data.map((item) => ({ label: item.name, value: item.id }))
  }

  const getInitialData = async (): Promise<void> => {
    const loading = elLoading('Buscando dados...')
    try {
      dashboards.value = await handleGetDashboards()
      dataTypes.value = await handleGetDataTypes()
    } catch (error: any) {
      elMessage(error?.response?.message || 'Erro ao buscar dados!', elementTypesEnum.ERROR)
    } finally {
      loading.close()
    }
  }

  const canManager = computed<boolean>(() => {
    return handleCheckContext(route.meta.context || '', roleEnum.MANAGER)
  })

  const getDashboards = computed<Array<IDashboard>>((): Array<IDashboard> => {
    return handleFilterData<IDashboard>(dashboards.value, ['title'], search.value)
  })

  onMounted(() => {
    getInitialData()
  })
</script>

<style scoped lang="scss" src="./style.scss"></style>
