<template>
  <div class="dashboard-view">
    <div class="dashboard-view__header">
      <HeaderBackTitle
        class="title-container"
        :title="`Dashboard ${dashboardData?.title}`"
        subtitle=""
        @onBack="handleBack"
      />
      <AppDropdown
        v-if="canManager"
        class="dashboard-options"
        :systemOption="options"
        @onCommand="handleCommand"
      >
        <div class="dashboard-options__trigger">
          <span class="bold">Gerenciar dashboard</span>
          <el-icon icon="Setting" color="white">
            <Setting />
          </el-icon>
        </div>
      </AppDropdown>
    </div>
    <div class="dashboard-view-content">
      <div class="iframe-container__wrapper" v-if="dashboardData?.iframeUrl">
        <iframe class="iframe-container" :src="iframeUrl" frameborder="0"></iframe>
      </div>
      <div class="empty-container" v-else>
        <span class="text--lg">Sem link para o dashboard</span>
      </div>
    </div>
    <DrawerDashboard
      :showDrawer="showDrawer"
      :dataTypesOptions="dataTypes"
      :currentDashboard="dashboardData"
      @onClose="handleCloseDrawer"
      @onCancel="handleCloseDrawer"
      @onSubmit:edit="handleEditSubmitDashboard"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import { ElMessageBox } from 'element-plus'
  import { useDark } from '@vueuse/core'
  import { useRoute, useRouter, type RouteLocationNormalizedLoaded } from 'vue-router'
  import { elLoading, elMessage } from '@/composables/element'
  import { deleteDashboard, editDashboard, getDashboardById } from '@/services/dashboard'
  import { getAllDataTypes } from '@/services/type'
  import { elementTypesEnum } from '@/enums/elementTypesEnum'
  import { handleCheckContext } from '@/composables/utils'
  import HeaderBackTitle from '@/components/HeaderBackTitle/HeaderBackTitle.vue'
  import AppDropdown from '@/components/AppDropdown/AppDropdown.vue'
  import DrawerDashboard from '@/components/DrawerDashboard/DrawerDashboard.vue'
  import type { IDashboard } from '@/interfaces/IDashboard'
  import type { ISelectOption } from '@/interfaces/ISelect'
  import type { IDropdownItem } from '@/interfaces/IDropdownItem'
  import roleEnum from '@/enums/roleEnum'

  interface IQueryParams {
    id: string
  }

  const isDark = useDark()

  const router = useRouter()
  const route = useRoute()
  const queryParams = ref<IQueryParams>({ id: '' })
  const dashboardData = ref<IDashboard | null>(null)
  const showDrawer = ref<boolean>(false)
  const dataTypes = ref<Array<ISelectOption>>([])
  const options = ref<Array<IDropdownItem>>([
    { command: 'edit', text: 'Editar dashboard' },
    { command: 'delete', text: 'Excluir dashboard', color: 'danger' },
  ])

  const handleBack = (): void => {
    router.push({ name: 'DashboardsView' })
  }

  const handleOpenDrawer = (): void => {
    showDrawer.value = true
  }

  const handleCloseDrawer = (): void => {
    showDrawer.value = false
  }

  const handleQueryData = (): void => {
    const { query } = route as RouteLocationNormalizedLoaded & { query: IQueryParams }
    queryParams.value = query
  }

  const handleCommand = (command: string): void => {
    const pattern: Record<string, any> = {
      edit: () => handleEdit(),
      delete: () => handleDelete(),
      default: () => elMessage('Recurso não encontrado!', elementTypesEnum.ERROR),
    }

    const handler = pattern[command] || pattern.default
    handler()
  }

  const handleEdit = (): void => {
    handleOpenDrawer()
  }

  const handleDelete = (): void => {
    handleDeleteDashboard()
  }

  const handleGetDashboardData = async (): Promise<void> => {
    const { data } = await getDashboardById(queryParams.value.id)
    dashboardData.value = { ...data }
  }

  const handleGetDataTypes = async (): Promise<Array<ISelectOption>> => {
    const { data } = await getAllDataTypes()
    return data.map((item) => ({ label: item.name, value: item.id }))
  }

  const handleDeleteDashboard = (): void => {
    ElMessageBox.confirm(
      'Ao excluir o dashboard, você perderá informações cadastradas! Deseja continuar com a ação de excluir?',
      'Deseja excluir o dashboard?',
      {
        confirmButtonText: 'Excluir',
        cancelButtonText: 'Cancelar',
        confirmButtonClass: 'danger-btn',
      }
    ).then(() => {
      handleDeleteSubmitDashboard()
    })
  }

  const handleDeleteSubmitDashboard = async (): Promise<void> => {
    const loading = elLoading('Excluindo dashboard...')
    try {
      await deleteDashboard(dashboardData.value?.id || '')
      handleBack()
    } catch (error: any) {
      elMessage(error?.response?.message || 'Erro ao excluir dashboard!', elementTypesEnum.ERROR)
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
      await handleGetDashboardData()
      handleCloseDrawer()
    } catch (error: any) {
      elMessage(error?.response?.message || 'Erro ao editar dashboard!', elementTypesEnum.ERROR)
    } finally {
      loading.close()
    }
  }

  const handleGetInitialData = async (): Promise<void> => {
    const loading = elLoading('Buscando dados...')
    try {
      handleQueryData()
      await handleGetDashboardData()
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

  const iframeUrl = computed<string>(() => {
    console.log('url:', dashboardData?.value?.iframeUrl)

    return dashboardData?.value?.iframeUrl
      ? `${dashboardData.value.iframeUrl}#refresh=60&titled=false`
      : ''
  })

  onMounted(() => {
    handleGetInitialData()
  })
</script>

<style scoped lang="scss" src="./style.scss"></style>
