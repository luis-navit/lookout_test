<template>
  <div class="detail-view" :class="{ 'is-collapse': navStore.currentNavState }">
    <div class="detail-view__header">
      <HeaderBackTitle
        class="page-title"
        :title="queryParams.title"
        subtitle="Visualize os últimos dados coletados"
        @onBack="handleBack"
      />
      <div class="actions-container">
        <div class="data-ranger__wrapper">
          <el-date-picker
            format="DD/MM/YYYY"
            range-separator="Até"
            end-placeholder="Data final"
            start-placeholder="Data inicial"
            placeholder="Informe uma data"
            v-model="dateRange"
            type="daterange"
            :clearable="false"
            @change="handleGetData"
          />
        </div>
        <el-input
          class="actions-search"
          v-model="search"
          suffix-icon="Search"
          placeholder="Pesquise uma informação na tabela abaixo "
          clearable
        />
        <AppDropdown
          class="short-action-item-wrapper"
          :systemOption="exportOptions"
          @onCommand="handleExportCommand"
        >
          <el-button
            :disabled="formattedData.length < 1"
            class="export-button"
            type="primary"
            :loading="exportLoading"
          >
            Exportar dados
            <el-icon>
              <CaretBottom />
            </el-icon>
          </el-button>
        </AppDropdown>
      </div>
    </div>
    <div class="detail-view-content">
      <div class="empty-container" v-if="!getColumns.length">
        <h2 class="title--md">Nenhuma informação encontrada no momento</h2>
      </div>
      <div class="table-container__wrapper" v-else>
        <el-table class="table-container" :data="getTrainingData" height="100%">
          <el-table-column v-if="!!queryParams.processor" type="expand">
            <template #default="props">
              <div class="inner-table-container">
                <el-table :data="props.row.records">
                  <el-table-column
                    v-for="(prop, index) of Object.keys(props.row.records[0] || {})"
                    :key="`table-column-${prop}-${index}-inner`"
                    :prop="prop"
                    :label="prop"
                    :formatter="handleDefaultFormatter"
                    min-width="240"
                    show-overflow-tooltip
                  >
                  </el-table-column>
                </el-table>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            v-for="(column, index) of getColumns"
            :key="`table-column-${column}-${index}`"
            :prop="column"
            :label="column"
            :formatter="handleDefaultFormatter"
            min-width="240"
            show-overflow-tooltip
          ></el-table-column>
        </el-table>
        <AppPagination
          class="pagination-container"
          :total="dataCount"
          :defaultCurrentPage="1"
          @onPageChange="handlePageChange"
          @onStepChange="handleStepChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import AppDropdown from '@/components/AppDropdown/AppDropdown.vue'
  import AppPagination from '@/components/AppPagination/AppPagination.vue'
  import HeaderBackTitle from '@/components/HeaderBackTitle/HeaderBackTitle.vue'
  import { elLoading, elMessage } from '@/composables/element'
  import {
    handleDownloadFile,
    handleFilterData,
    handleFormatGenericValue,
  } from '@/composables/utils'
  import { elementTypesEnum } from '@/enums/elementTypesEnum'
  import { filterOperatorEnum } from '@/enums/filterOperatorEnum'
  import type { IDataDetail } from '@/interfaces/IDataType'
  import type { IDropdownItem } from '@/interfaces/IDropdownItem'
  import type { IFilter } from '@/interfaces/IFilter'
  import { getDataByType, getDataCountByType, getDataFile, getSampleByType } from '@/services/data'
  import { useNavStore } from '@/stores/navStore'
  import { sub } from 'date-fns'
  import { ElMessageBox, type TableColumnCtx } from 'element-plus'
  import { computed, onMounted, ref } from 'vue'
  import { useRoute, useRouter, type RouteLocationNormalizedLoaded } from 'vue-router'

  interface IQueryParams {
    id: string
    title: string
    processor?: string
  }

  const route = useRoute()
  const router = useRouter()
  const navStore = useNavStore()
  const queryParams = ref<IQueryParams>({ id: '', title: '' })

  const search = ref<string>('')
  const dataDetail = ref<IDataDetail>()
  const dataCount = ref<number>(NaN)
  const sample = ref<Record<string, string>>({})
  const formattedData = ref<Array<Record<string, any>>>([])
  const dateRange = ref<Array<any>>([])
  const currentPage = ref<number>(1)
  const currentStep = ref<number>(50)
  const exportLoading = ref<boolean>(false)
  const exportOptions = ref<Array<IDropdownItem>>([
    {
      command: 'clear',
      text: 'Selecione um formato',
      disabled: true,
    },
    {
      command: 'xlsx',
      text: 'XLSX',
    },
    {
      command: 'csv',
      text: 'CSV',
    },
    {
      command: 'json',
      text: 'JSON',
    },
  ])

  const handleBack = (): void => {
    router.push({ name: 'DataView' })
  }

  const handleQueryData = (): void => {
    const { query } = route as RouteLocationNormalizedLoaded & { query: IQueryParams }
    queryParams.value = query
  }

  const handleExportCommand = (command: string) => {
    ElMessageBox.confirm(
      'Todas as configurações de filtro aplicadas à tabela serão refletidas na exportação dos dados. Confirme a ação para exportar com os filtros atuais.',
      'Exportação de dados',
      {
        confirmButtonText: 'Exportar',
        cancelButtonText: 'Cancelar',
      }
    ).then(() => {
      handleExportFile(command)
    })
  }

  const handleExportFile = async (extension: string): Promise<void> => {
    try {
      exportLoading.value = true
      const { data } = await getDataFile({
        extension,
        type: queryParams.value.id,
        filters: handleGetFilters(),
      })
      handleDownloadFile(data, `${queryParams.value.title}.${extension}`)

      elMessage('Seu download começará em breve!', elementTypesEnum.SUCCESS)
    } catch (error: any) {
      elMessage(error?.response?.message || 'Erro ao baixar dados!', elementTypesEnum.ERROR)
    } finally {
      exportLoading.value = false
    }
  }

  const handleDefaultFormatter = (
    row: Record<string, string | number>,
    column: TableColumnCtx<Record<string, string | number>>
  ) => {
    return handleFormatGenericValue(row[column.property])
  }

  const handleFormatData = (): Array<Record<string, any>> => {
    if (dataDetail.value) return (dataDetail.value.data || []).map((element) => element.data)

    return []
  }

  const handleStepChange = (newStep: number): void => {
    currentStep.value = newStep
    handleGetData()
  }

  const handlePageChange = (newPage: number): void => {
    currentPage.value = newPage
    handleGetData()
  }

  const handleGetDetailData = async (): Promise<IDataDetail> => {
    const filters = handleGetFilters()
    const { data } = await getDataByType(
      queryParams.value.id,
      currentPage.value,
      currentStep.value,
      filters
    )
    return data
  }

  const handleGetSample = async (): Promise<void> => {
    const { data } = await getSampleByType(queryParams.value.id)
    sample.value = data
  }

  const handleGetDataCount = async (): Promise<number> => {
    const filters = handleGetFilters()
    const { data } = await getDataCountByType(queryParams.value.id, filters)
    return data.count
  }

  const handleInitDate = (): Array<any> => {
    return [sub(new Date(), { months: 3 }), new Date()]
  }

  const handleGetFilters = (): Array<IFilter> => {
    const [start, end] = dateRange.value

    return [
      {
        value: start,
        field: 'timestamp',
        operator: filterOperatorEnum.GREATER_THAN_OR_EQUAL,
      },
      {
        value: end,
        field: 'timestamp',
        operator: filterOperatorEnum.LESS_THAN_OR_EQUAL,
      },
    ]
  }

  const handleGetData = async (): Promise<void> => {
    const loading = elLoading('Buscando dados...')
    try {
      handleQueryData()
      handleGetSample()
      dataDetail.value = await handleGetDetailData()
      dataCount.value = await handleGetDataCount()
      formattedData.value = handleFormatData()
    } catch (error: any) {
      elMessage(error?.response?.message || 'Erro ao buscar dados!', elementTypesEnum.ERROR)
    } finally {
      loading.close()
    }
  }

  const getTrainingData = computed<Array<Record<string, any>>>((): Array<Record<string, any>> => {
    return handleFilterData<Record<string, any>>(
      formattedData.value,
      getColumns.value,
      search.value
    )
  })

  const getColumns = computed<Array<string>>(() => {
    return Object.keys(sample.value)
      .reduce<Array<string>>((acc, prev) => {
        if (prev.includes('data.') && prev !== 'data.records') acc.push(prev.replace('data.', ''))
        return acc
      }, [])
      .sort((a, b) => a.localeCompare(b))
  })

  onMounted(() => {
    dateRange.value = handleInitDate()
    handleGetData()
  })
</script>

<style scoped lang="scss" src="./style.scss"></style>
