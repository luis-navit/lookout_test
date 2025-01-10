<template>
  <div class="training-view__wrapper" :class="{ 'is-collapse': navStore.currentNavState }">
    <div class="training-view__header">
      <HeaderBackTitle
        class="title-container"
        title="Salvar conjunto de regras"
        subtitle="Informe as regras abaixo e salve seu modelo"
        @onBack="handleBack"
      />
      <div class="actions__wrapper">
        <el-button @click="handleCancel">Cancelar ação</el-button>
        <el-button @click="handleSubmitModel" type="primary">Salvar conjunto de regras</el-button>
      </div>
    </div>
    <section class="training-view__content">
      <AppCollapse>
        <template #title><span class="text--md bold">Dados do treinamento</span></template>
        <div class="collapse-content">
          <div class="graph-container graph--tree">
            <h2 class="title--md">Gráfico de dispersão</h2>
            <iframe class="iframe" frameborder="0" :srcdoc="graphAnomaly"></iframe>
          </div>
          <div class="graph-container graph--tree">
            <div class="graph__header">
              <h2 class="title--md">Árvore de decisão</h2>
              <el-button icon="FullScreen" circle text @click="handleTreeZoom"></el-button>
            </div>
            <div class="custom-svg" v-html="graphTree"></div>
          </div>
          <div class="table-container">
            <div class="table-wrapper">
              <AppAutoTable height="50vh" :tableData="resultData?.data || []"></AppAutoTable>
            </div>
          </div>
        </div>
      </AppCollapse>
      <div class="rules-container">
        <ul class="rules-content">
          <li
            class="rule"
            v-for="(rule, index) of getRules"
            :key="`rule-card-${index}-${rule.isActive}-${rule.message}-${rule.query}-${rule.isImportant}`"
          >
            <RuleCard
              :title="rule.name"
              :query="rule.query"
              :ruleClass="rule.class"
              :accuracy="rule.accuracy"
              :accuracy-count="rule.accuracyCount"
              :error="rule.error"
              :error-count="rule.errorCount"
              :status="rule.isActive"
              @onChangeState="(newState: boolean) => handleChangeState(newState, rule)"
              @onConfig="() => handleConfig(rule)"
            />
          </li>
        </ul>
      </div>
    </section>
    <DrawerRuleConfig
      :show="showConfigDrawer"
      :rule="activeRule"
      @onClose="handleCloseDrawerConfig"
      @onCancel="handleCloseDrawerConfig"
      @onSubmit="handleSubmit"
    />
    <AppModal
      :show="showModal"
      :showFooterButtons="false"
      title="Árvore de decisão"
      @close="handleCloseModal"
    >
      <template #modal-header>
        <el-button
          class="modal-download"
          icon="Download"
          circle
          text
          @click="handleDownloadTree"
        ></el-button>
      </template>
      <div class="custom-svg" v-html="graphTree"></div>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import { useRoute, useRouter, type RouteLocationNormalizedLoaded } from 'vue-router'
  import { useNavStore } from '@/stores/navStore'
  import { elLoading, elMessage } from '@/composables/element'
  import { saveModel } from '@/services/model'
  import { getTrainingById } from '@/services/training'
  import { downloadExternalFile } from '@/services/externalFile'
  import { elementTypesEnum } from '@/enums/elementTypesEnum'
  import AppModal from '@/components/AppModal/AppModal.vue'
  import RuleCard from '@/components/RuleCard/RuleCard.vue'
  import AppCollapse from '@/components/AppCollapse/AppCollapse.vue'
  import AppAutoTable from '@/components/AppAutoTable/AppAutoTable.vue'
  import HeaderBackTitle from '@/components/HeaderBackTitle/HeaderBackTitle.vue'
  import DrawerRuleConfig from './Partials/DrawerRuleConfig/DrawerRuleConfig.vue'
  import type { ITraining, IResult, IRule } from '@/interfaces/ITraining'
  import { ElMessageBox } from 'element-plus'
  import { handleDownloadFile } from '@/composables/utils'

  interface IQueryParams {
    id: string
    type: string
  }

  const route = useRoute()
  const router = useRouter()
  const navStore = useNavStore()
  const trainingData = ref<ITraining>()
  const resultData = ref<IResult>()
  const rules = ref<Array<IRule>>([])
  const queryParams = ref<IQueryParams>({ id: '', type: '' })
  const graphAnomaly = ref()
  const graphTree = ref()
  const activeRule = ref<IRule>({
    id: '',
    name: '',
    leaf: '',
    class: '',
    query: '',
    queryType: '',
    message: '',
    isActive: false,
    isImportant: false,
    accuracy: 0,
    accuracyCount: 0,
    error: 0,
    errorCount: 0,
  })
  const showModal = ref<boolean>(false)
  const showConfigDrawer = ref<boolean>(false)

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

  const handleTreeZoom = (): void => {
    showModal.value = true
  }

  const handleCloseModal = (): void => {
    showModal.value = false
  }

  const handleDownloadTree = (): void => {
    handleDownloadFile(
      graphTree.value,
      `${trainingData.value?.name?.replaceAll(' ', '') || ''}Tree.svg`
    )
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

  const handleChangeState = (newState: boolean, rule: IRule): void => {
    elMessage(newState ? 'Regra habilitada.' : 'Regra desabilitada.', elementTypesEnum.INFO)
    rule.isActive = newState
  }

  const handleConfig = (rule: IRule): void => {
    activeRule.value = { ...rule }
    handleOpenDrawerConfig()
  }

  const handleSubmit = (rule: IRule): void => {
    const ruleIdx = rules.value.findIndex((findRule: IRule) => findRule.id === rule.id)
    if (ruleIdx !== undefined) rules.value[ruleIdx] = rule

    handleCloseDrawerConfig()
  }

  const handleOpenDrawerConfig = (): void => {
    showConfigDrawer.value = true
  }

  const handleCloseDrawerConfig = (): void => {
    showConfigDrawer.value = false
  }

  const handleFormatResult = (results: Array<IResult>): void => {
    const [result] = results || [{}]
    resultData.value = result
    rules.value = (result?.rules || []).map((rule) => ({
      ...rule,
      isImportant: rule.isImportant ?? false,
      isActive: rule.isActive ?? false,
      message: rule.message ?? `Notificação gerada pela regra: ${rule.name}`,
      queryType: rule.queryType ?? 'fixed',
    }))
  }

  const handleQueryData = (): void => {
    const { query } = route as RouteLocationNormalizedLoaded & { query: IQueryParams }
    queryParams.value = query
  }

  const handleTrainingData = async (): Promise<ITraining> => {
    const { data } = await getTrainingById(queryParams.value.id, queryParams.value.type)
    return data as ITraining
  }

  const handleDownloadExternalFile = async (path: string) => {
    const { data } = await downloadExternalFile(path)
    return data
  }

  const handleSubmitModel = async () => {
    const loading = elLoading('Salvando modelo...')
    try {
      const sendData = {
        ...trainingData.value?.payload,
        trainingId: trainingData.value?.id,
        type: trainingData.value?.type,
        rules: rules.value.map((rule) => ({
          id: rule.id,
          name: rule.name,
          query: rule.query,
          message: rule.message,
          queryType: rule?.queryType,
          isActive: rule.isActive,
          isImportant: rule.isImportant,
        })),
        pathModel: resultData.value?.pathModel,
        algorithmName: resultData.value?.algorithmName || 'IFlorest + Decision tree',
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

  const handleSaveModel = async (sendData: Record<string, any>): Promise<void> => {
    await saveModel(sendData, queryParams.value.type)
  }

  const handleGetInitialData = async (): Promise<void> => {
    const loading = elLoading('Buscando dados...')
    try {
      handleQueryData()
      trainingData.value = await handleTrainingData()
      handleFormatResult(trainingData.value.results)
      graphAnomaly.value = await handleDownloadExternalFile(resultData.value?.graphAnomaly || '')
      graphTree.value = await handleDownloadExternalFile(resultData.value?.graphDecisionTree || '')
    } catch (error: any) {
      elMessage(error?.response?.message || 'Erro ao buscar dados!', elementTypesEnum.ERROR)
    } finally {
      loading.close()
    }
  }

  const getRules = computed<Array<IRule>>((): Array<IRule> => rules.value)

  onMounted(() => {
    handleGetInitialData()
  })
</script>

<style scoped lang="scss" src="./style.scss"></style>
