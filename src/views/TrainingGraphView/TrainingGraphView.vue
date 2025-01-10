<template>
  <div class="training-graph-view">
    <div class="training-graph-view__header">
      <HeaderBackTitle
        title="Salvar regra e modelo"
        subtitle="Visualize as informações do treinamento e selecione um modelo"
        @onBack="handleBack"
      />
      <div>
        <el-button @click="handleCancel">Cancelar ação</el-button>
        <el-tooltip
          :disabled="!!pathModel.length"
          effect="dark"
          placement="bottom"
          content="Selecione um modelo de treinamento para continuar"
        >
          <el-button :disabled="!isResultSelected" type="primary" @click="handleSubmitModel">
            Salvar
          </el-button>
        </el-tooltip>
      </div>
    </div>
    <div class="training-graph-view__body">
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
      <AppCollapse class="table-data-container">
        <template #title><span class="text--md bold">Dados do treinamento</span></template>
        <div class="table__wrapper">
          <AppAutoTable height="50vh" :tableData="tableData"></AppAutoTable>
        </div>
      </AppCollapse>
      <div class="body__title">
        <span class="title--md">Modelos de treinamento</span>
        <span class="subtitle--md">Selecione um dos modelos abaixo</span>
      </div>
      <div class="graph-card-list__wrapper" v-if="trainingData?.results.length">
        <el-radio-group class="radio-container" v-model="currentResult">
          <ul class="graph-card-list">
            <li
              class="graph-card-list__item"
              :class="{ 'anomaly-item': queryParams.technique === techniquesEnum.ANOMALY }"
              v-for="result of trainingData?.results"
              :key="result.graph"
            >
              <RuleTrainingCard
                :title="result.algorithmName"
                :radioValue="result"
                :iframeSrc="result.graphSrc ?? ''"
                :isChecked="result.pathModel === pathModel"
                :metrics="result.metrics"
                :model="result.model"
                @onExpand="handleExpand(result)"
              />
            </li>
          </ul>
        </el-radio-group>
      </div>
    </div>
    <DrawerRuleConfig
      :rule="ruleData"
      :show="showConfigDrawer"
      @onClose="handleCloseDrawerConfig"
      @onCancel="handleCloseDrawerConfig"
      @onSubmit="handleUpdateRule"
    />
    <GraphModal :show="showModal" :result="currentResult" @onClose="handleCloseModal" />
  </div>
</template>

<script setup lang="ts">
  import RuleTrainingCard from '@/components/RuleTrainingCard/RuleTrainingCard.vue'
  import HeaderBackTitle from '@/components/HeaderBackTitle/HeaderBackTitle.vue'
  import { elLoading, elMessage } from '@/composables/element'
  import { elementTypesEnum } from '@/enums/elementTypesEnum'
  import type { ITrainingGraph, IGraphRule, IGraphResult } from '@/interfaces/ITraining'
  import { downloadExternalFile } from '@/services/externalFile'
  import { getTrainingById } from '@/services/training'
  import { computed, onMounted, ref, watch } from 'vue'
  import { useRouter, type RouteLocationNormalizedLoaded, useRoute } from 'vue-router'
  import DrawerRuleConfig from './Partials/DrawerRuleConfig/DrawerRuleConfig.vue'
  import GraphModal from './Partials/GraphModal/GraphModal.vue'
  import AppCollapse from '@/components/AppCollapse/AppCollapse.vue'
  import AppAutoTable from '@/components/AppAutoTable/AppAutoTable.vue'
  import { ElMessageBox } from 'element-plus'
  import { saveModel } from '@/services/model'
  import { techniquesEnum } from '@/enums/techniquesEnum'
  import _ from 'lodash'

  interface IQueryParams {
    id: string
    type: string
    technique: string
  }

  const route = useRoute()
  const router = useRouter()
  const pathModel = ref<string>('')
  const currentResult = ref<IGraphResult | null>({} as IGraphResult)
  const trainingData = ref<ITrainingGraph>()
  const showModal = ref<boolean>(false)
  const showConfigDrawer = ref<boolean>(false)
  const queryParams = ref<IQueryParams>({ id: '', type: '', technique: '' })
  const ruleData = ref<IGraphRule>({
    id: '',
    name: '',
    query: '',
    message: '',
    queryType: '',
    isActive: false,
    isImportant: false,
  })
  const tableData = ref<Array<Record<string, any>>>([])
  const isRuleModified = ref<boolean>(false)

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

  const handleExpand = (graphResult: IGraphResult): void => {
    currentResult.value = graphResult
    showModal.value = true
  }

  const handleUpdateRule = (updatedRule: IGraphRule): void => {
    ruleData.value = updatedRule
    handleCloseDrawerConfig()
  }

  const handleTrainingData = async (): Promise<void> => {
    const { data } = await getTrainingById(queryParams.value.id, queryParams.value.type)
    trainingData.value = data as ITrainingGraph
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

    await Promise.all(
      trainingData.value?.results.forEach(async (result) => {
        result.graphSrc = await handleDownloadFile(result.graph)
      }) || []
    )
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
      const sendData: any = {
        ...trainingData.value?.payload,
        name: trainingData.value?.name || '',
        type: trainingData.value?.type,
        pathModel: currentResult.value?.pathModel,
        rules: isRuleModified.value ? [ruleData.value] : [],
        trainingId: trainingData.value?.id,
        technique: trainingData.value?.technique,
        algorithmName: currentResult.value?.algorithmName,
        feature: currentResult.value?.feature,
        graph: {
          name: currentResult.value?.graph,
          path: currentResult.value?.graph,
        },
      }

      if (
        [
          techniquesEnum.PREVISION,
          techniquesEnum.PREVISION_BAGGING,
          techniquesEnum.PREVISION_SVR,
        ].includes(queryParams.value.technique as any)
      ) {
        sendData.horizon = 6
        sendData.pastDays = 15
        sendData.technique = currentResult.value?.algorithmName
        sendData.query = {
          window_start: trainingData.value?.payload?.window_start,
          window_end: trainingData.value?.payload?.window_end,
          city: trainingData.value?.payload?.city,
        }
        delete sendData.city
        delete sendData.window_start
        delete sendData.window_end
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

  const isResultSelected = computed<boolean>(() => {
    return (currentResult.value && Object.keys(currentResult.value).length > 0) || false
  })

  watch(
    ruleData,
    (newFormData) => {
      isRuleModified.value = !_.isEqual(newFormData, ruleData.value)
    },
    { deep: true }
  )

  onMounted(() => handleGetInitialData())
</script>

<style scoped lang="scss" src="./style.scss"></style>
