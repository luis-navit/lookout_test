<template>
  <div class="training-time-series-view">
    <div class="training-time-series-view__header">
      <HeaderBackTitle
        title="Salvar regra e modelo"
        subtitle="Visualize as informações do treinamento e selecione um modelo"
        @onBack="handleBack"
      />
      <div>
        <el-button @click="handleCancel">Cancelar ação</el-button>
        <el-button type="primary" @click="handleSubmitModel"> Salvar </el-button>
      </div>
    </div>
    <div class="training-time-series-view__body">
      <div class="actions__wrapper">
        <div class="rule__wrapper">
          <div class="rule-container">
            <span class="title--md">Regra</span>
            <div class="rule-content">
              <span class="text--md">
                Nome da regra: <strong class="bold">{{ ruleData?.name }}</strong>
              </span>
              <span class="text--md">
                Regra: <strong class="bold">{{ ruleData?.query }}</strong>
              </span>
              <span class="text--md">
                Mensagem: <strong class="bold">{{ ruleData?.message }}</strong>
              </span>
            </div>
          </div>
          <el-button type="primary" @click="handleOpenDrawerConfig">Configurar regra</el-button>
        </div>
        <div class="time-series-preview">
          <TimeSeriesPreview
            :loading="previewLoading"
            :previewResult="previewResult"
            @onSubmit="handleRunPreview"
          />
        </div>
      </div>
      <AppCollapse class="table-data-container">
        <template #title><span class="text--md bold">Dados do treinamento</span></template>
        <div class="table__wrapper">
          <AppAutoTable height="50vh" :tableData="tableData"></AppAutoTable>
        </div>
      </AppCollapse>
      <div class="body__title">
        <span class="title--md">Métricas do treinamento</span>
        <span class="subtitle--md">Visualize as métricas do treinamento abaixo</span>
      </div>
      <div class="graph-card-list__wrappers" v-if="trainingData?.results.length">
        <ul class="result-metrics-list" v-if="resultData">
          <li
            class="result-metrics-item"
            v-for="(metric, key) of resultData?.metrics"
            :key="metric"
          >
            <span class="text--md bold">{{ key }}: </span>
            <span class="text--md">{{ metric.toFixed(3) }}</span>
          </li>
        </ul>
      </div>
      <div class="graphs-container">
        <IframeCard
          v-if="resultData?.graphSrc"
          class="graph--main"
          title="Gráfico de predição"
          :iframe-src="resultData.graphSrc"
          @onExpand="handleExpand(resultData.graphSrc, 'Gráfico de predição')"
        />
        <IframeCard
          v-if="resultData?.graphComparisonSrc"
          class="graph--minor"
          title="Gráfico de comparação"
          :iframe-src="resultData.graphComparisonSrc"
          @onExpand="handleExpand(resultData.graphComparisonSrc, 'Gráfico de comparação')"
        />
        <IframeCard
          v-if="resultData?.graphComponentsSrc"
          class="graph--minor"
          title="Gráfico de componentes"
          :iframe-src="resultData.graphComponentsSrc"
          @onExpand="handleExpand(resultData.graphComponentsSrc, 'Gráfico de componentes')"
        />
      </div>
    </div>
    <DrawerRuleConfig
      :rule="ruleData"
      :show="showConfigDrawer"
      @onClose="handleCloseDrawerConfig"
      @onCancel="handleCloseDrawerConfig"
      @onSubmit="handleUpdateRule"
    />
    <GraphModal
      :show="showModal"
      :title="currentGraph.title"
      :graph="currentGraph.graph"
      @onClose="handleCloseModal"
    />
  </div>
</template>

<script setup lang="ts">
  import IframeCard from '@/components/IframeCard/IframeCard.vue'
  import HeaderBackTitle from '@/components/HeaderBackTitle/HeaderBackTitle.vue'
  import { elLoading, elMessage } from '@/composables/element'
  import { elementTypesEnum } from '@/enums/elementTypesEnum'
  import { downloadExternalFile } from '@/services/externalFile'
  import { getTrainingById } from '@/services/training'
  import { onMounted, ref } from 'vue'
  import { useRouter, type RouteLocationNormalizedLoaded, useRoute } from 'vue-router'
  import DrawerRuleConfig from './Partials/DrawerRuleConfig/DrawerRuleConfig.vue'
  import GraphModal from './Partials/GraphModal/GraphModal.vue'
  import AppCollapse from '@/components/AppCollapse/AppCollapse.vue'
  import AppAutoTable from '@/components/AppAutoTable/AppAutoTable.vue'
  import { ElMessageBox } from 'element-plus'
  import { saveModel } from '@/services/model'
  import { runTimeSeriesModel } from '@/services/timeSeries'
  import type { ITimeSeriesTraining, IResult, IRule } from '@/interfaces/ITimeSeries'
  import TimeSeriesPreview from '@/components/TimeSeriesPreview/TimeSeriesPreview.vue'
  import { handleFormatDate } from '@/composables/utils'
  import type { IPreviewResult } from '@/interfaces/ITimeSeries'

  interface IQueryParams {
    id: string
    type: string
    technique: string
  }

  interface ICurrentGraph {
    title: string
    graph: string
  }

  const route = useRoute()
  const router = useRouter()
  const resultData = ref<IResult>()
  const previewResult = ref<IPreviewResult | null>(null)
  const currentGraph = ref<ICurrentGraph>({
    title: '',
    graph: '',
  })
  const trainingData = ref<ITimeSeriesTraining>()
  const previewLoading = ref<boolean>(false)
  const showModal = ref<boolean>(false)
  const showConfigDrawer = ref<boolean>(false)
  const queryParams = ref<IQueryParams>({ id: '', type: '', technique: '' })
  const ruleData = ref<IRule>({
    id: '',
    name: '',
    query: '',
    message: '',
    queryType: '',
    isActive: false,
    isImportant: false,
  })
  const tableData = ref<Array<Record<string, any>>>([])

  const handleBack = (): void => {
    ElMessageBox.confirm(
      'Ao sair, você perderá informações geradas durante o treinamento! Deseja sair mesmo assim?',
      'Sair da página?',
      {
        confirmButtonText: 'Sim',
        cancelButtonText: 'Não',
      }
    ).then(() => {
      router.push({ name: 'LearningView' })
    })
  }

  const handleCancel = (): void => {
    ElMessageBox.confirm(
      'Ao cancelar, você perderá informações geradas durante o treinamento! Deseja continuar com a ação de cancelar treinamento?',
      'Cancelar treinamento?',
      {
        confirmButtonText: 'Sim',
        cancelButtonText: 'Não',
      }
    ).then(() => {
      router.push({ name: 'LearningView' })
    })
  }

  const handleOpenDrawerConfig = (): void => {
    showConfigDrawer.value = true
  }

  const handleCloseDrawerConfig = (): void => {
    showConfigDrawer.value = false
  }

  const handleCloseModal = (): void => {
    showModal.value = false
  }

  const handleExpand = (graph: string, title: string): void => {
    currentGraph.value = { title, graph }
    showModal.value = true
  }

  const handleUpdateRule = (updatedRule: IRule): void => {
    ruleData.value = updatedRule
    handleCloseDrawerConfig()
  }

  const handleRunPreview = async (dateTime: string): Promise<void> => {
    try {
      previewLoading.value = true
      const { data } = await runTimeSeriesModel(
        queryParams.value.type,
        resultData.value?.pathModel || '',
        { ds: [handleFormatDate(dateTime)] }
      )

      previewResult.value = data.results.shift() ?? null
    } catch (error: any) {
      elMessage(error?.response?.message || 'Erro ao executar previsão!', elementTypesEnum.ERROR)
    } finally {
      previewLoading.value = false
    }
  }

  const handleTrainingData = async (): Promise<void> => {
    const { data } = await getTrainingById(queryParams.value.id, queryParams.value.type)
    trainingData.value = data as ITimeSeriesTraining
    handleDownloadGraphs()
  }

  const handleDownloadGraphs = async (): Promise<void> => {
    const [result] = trainingData.value?.results || []
    const [rule] = result.rules || []

    tableData.value = result?.data || []

    if (rule) {
      ruleData.value = {
        ...rule,
        isImportant: rule.isImportant ?? false,
        isActive: rule.isActive ?? false,
        message: rule.message ?? `Notificação gerada pela regra: ${rule.name}`,
      }
    }

    if (result) {
      resultData.value = result
      await Promise.all([
        (result.graphSrc = await handleDownloadFile(result.graph)),
        (result.graphComparisonSrc = await handleDownloadFile(result.graphComparison)),
        (result.graphComponentsSrc = await handleDownloadFile(result.graphComponents)),
      ])
    }
  }

  const handleQueryData = (): void => {
    const { query } = route as RouteLocationNormalizedLoaded & { query: IQueryParams }
    queryParams.value = query
  }

  const handleDownloadFile = async (path: string) => {
    const { data } = await downloadExternalFile(path)
    return data
  }

  const handleSaveModel = async (sendData: Record<string, any>): Promise<void> => {
    await saveModel(sendData, queryParams.value.type)
  }

  const handleSubmitModel = async () => {
    const loading = elLoading('Salvando modelo...')
    try {
      const sendData = {
        ...trainingData.value?.payload,
        name: trainingData.value?.name || '',
        type: queryParams.value.type,
        pathModel: resultData.value?.pathModel || '',
        rules: [ruleData.value],
        trainingId: trainingData.value?.id,
        technique: trainingData.value?.technique,
      }
      await handleSaveModel(sendData)
      router.push({ name: 'LearningView' })
    } catch (error: any) {
      elMessage(error?.response?.message || 'Erro ao salvar modelo!', elementTypesEnum.ERROR)
    } finally {
      loading.close()
    }
  }

  const handleGetInitialData = async (): Promise<void> => {
    const loading = elLoading('Buscando dados...')
    try {
      handleQueryData()
      await handleTrainingData()
    } catch (error: any) {
      elMessage(error?.response?.message || 'Erro ao buscar dados!', elementTypesEnum.ERROR)
    } finally {
      loading.close()
    }
  }

  onMounted(() => handleGetInitialData())
</script>

<style scoped lang="scss" src="./style.scss"></style>
