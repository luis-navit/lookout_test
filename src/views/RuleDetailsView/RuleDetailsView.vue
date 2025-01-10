<template>
  <div class="rule-details-view">
    <div class="rule-details__header">
      <HeaderBackTitle
        class="title-container"
        :title="`Visualização da regra ${currentModel?.name || ''}`"
        subtitle="Visualize as informações das regras presentes no conjunto"
        @onBack="handleBack"
      />
    </div>
    <div class="rule-details__body">
      <div class="header__wrapper">
        <div class="model-info-container">
          <h2 class="title--md bold">Informações do conjunto de regras</h2>
          <div
            class="model-info-content"
            :class="isPrevision || isTimeSeries ? 'two-columns' : 'three-columns'"
          >
            <span class="text--md">
              Nome do conjunto:
              <strong class="bold">{{ currentModel?.type || 'Não informada' }}</strong>
            </span>
            <span class="text--md">
              Técnica utilizada:
              <strong class="bold">{{ currentModel?.technique || 'Não informada' }}</strong>
            </span>
            <span class="text--md">
              Campos utilizados:
              <strong class="bold">{{ currentModel?.fields.join(', ') || 'Nenhum' }}</strong>
            </span>
            <span class="text--md" v-if="isPrevision">
              Horizonte:
              <strong class="bold">{{ currentModel?.horizon || 'Nenhum' }}</strong>
            </span>
            <span class="text--md" v-if="isPrevision">
              Intervalo de dias:
              <strong class="bold">{{ currentModel?.pastDays || 'Nenhum' }}</strong>
            </span>
            <span class="text--md" v-if="isPrevision">
              Cidade:
              <strong class="bold">{{ currentModel?.query?.city || 'Não informado' }}</strong>
            </span>
            <span class="text--md" v-if="isPrevision">
              Métrica:
              <strong class="bold">{{ currentModel?.feature || 'Não informado' }}</strong>
            </span>
          </div>
        </div>
        <div class="time-series-preview" v-if="isTimeSeries">
          <TimeSeriesPreview
            :loading="previewLoading"
            :previewResult="previewResult"
            @onSubmit="handleRunPreview"
          />
        </div>

        <div class="time-series-preview" v-if="isPrevision">
          <PrevisionPreview
            :loading="previewLoading"
            :previewResult="foreCastPreviewResult"
            @onSubmit="handleRunForecastPreview"
          />
        </div>
      </div>

      <div class="graphs-view">
        <h2 class="title--md bold">Gráfico gerado</h2>

        <p class="subtitle--md center" v-if="!foreCastPreviewResult?.graphSrc">
          Gere um gráfico executando o formulário acima
        </p>
        <iframe
          v-if="foreCastPreviewResult?.graphSrc"
          class="modal-graph"
          frameborder="0"
          :srcdoc="foreCastPreviewResult?.graphSrc"
        />
      </div>

      <div class="rules-container__header">
        <h2 class="title--md bold">Gerenciar regras</h2>
        <el-button v-if="canManager" @click="handleNewRule" type="primary" icon="Plus">
          Nova regra
        </el-button>
      </div>
      <ul class="rules-container">
        <p class="subtitle--md center" v-if="currentModel?.rules.length < 1">
          Nenhuma regra cadastrada
        </p>
        <li
          v-for="(rule, index) of currentModel?.rules"
          class="rules-item"
          :class="{ 'without-options': !canManager }"
          :key="`rule-item-${index}-${rule.isActive}-${rule.isImportant}-${rule.message}-${rule.query}`"
        >
          <RuleModelCard
            :status="rule.isActive"
            :title="rule.name"
            :message="rule.message"
            :query="rule.query"
            :showOptions="canManager"
            @onEdit="handleEditRule(rule, index)"
            @onDelete="handleDeleteRule(index)"
            @onChangeState="(newState: boolean) => handleChangeState(newState, rule)"
          />
        </li>
      </ul>
    </div>
    <DrawerRuleConfig
      :show="showDrawer"
      :isNewRule="isNewRule"
      :rule="currentRule"
      @onClose="handleCloseDrawer"
      @onCancel="handleCloseDrawer"
      @onSubmit:create="handleSubmitNewRule"
      @onSubmit:edit="handleSubmitEditRule"
    />
  </div>
</template>

<script setup lang="ts">
  import { getModelById, updateModel } from '@/services/model'
  import { ElMessageBox } from 'element-plus'
  import { useRoute, type RouteLocationNormalizedLoaded, useRouter } from 'vue-router'
  import { computed, onMounted, ref } from 'vue'
  import { elLoading, elMessage } from '@/composables/element'
  import { elementTypesEnum } from '@/enums/elementTypesEnum'
  import { runTimeSeriesModel } from '@/services/timeSeries'
  import { handleCheckContext, handleFormatDate } from '@/composables/utils'
  import { techniquesEnum } from '@/enums/techniquesEnum'
  import { runPrevisionModel } from '@/services/previsionSeries'
  import type { IModel, IRule } from '@/interfaces/IModel'
  import type { IPreviewResult } from '@/interfaces/ITimeSeries'
  import HeaderBackTitle from '@/components/HeaderBackTitle/HeaderBackTitle.vue'
  import RuleModelCard from '@/components/RuleModelCard/RuleModelCard.vue'
  import DrawerRuleConfig from './Partials/DrawerRuleConfig/DrawerRuleConfig.vue'
  import TimeSeriesPreview from '@/components/TimeSeriesPreview/TimeSeriesPreview.vue'
  import roleEnum from '@/enums/roleEnum'
  import PrevisionPreview from '@/components/PrevisionPreview/PrevisionPreview.vue'
  import { downloadExternalFile } from '@/services/externalFile'

  interface IQueryParams {
    id: string
    type: string
    technique: string
  }

  const previewLoading = ref<boolean>(false)
  const previewResult = ref<IPreviewResult | null>(null)
  const foreCastPreviewResult = ref<any>({})
  const route = useRoute()
  const router = useRouter()
  const queryParams = ref<IQueryParams>({ id: '', type: '', technique: '' })
  const currentModel = ref<IModel>({
    id: '',
    type: '',
    name: '',
    pathModel: '',
    technique: '',
    trainingId: '',
    algorithmName: '',
    horizon: '',
    pastDays: '',
    limit: NaN,
    fields: [],
    rules: [],
    query: {},
  })
  const currentRule = ref<IRule | null>(null)
  const currentRuleIdx = ref<number>(NaN)
  const isNewRule = ref<boolean>(false)
  const showDrawer = ref<boolean>(false)

  const handleBack = (): void => {
    router.push({ name: 'RuleGroupsView' })
  }

  const handleDeleteRule = (ruleIndex: number): void => {
    ElMessageBox.confirm(
      'Ao excluir a regras, você perderá informações cadastradas! Deseja continuar com a ação de excluir?',
      'Deseja excluir a regra?',
      {
        confirmButtonText: 'Excluir',
        cancelButtonText: 'Cancelar',
        confirmButtonClass: 'danger-btn',
      }
    ).then(() => {
      handleSubmitDeleteRule(ruleIndex)
    })
  }

  const handleNewRule = (): void => {
    currentRule.value = null
    handleOpenDrawer()
  }

  const handleOpenDrawer = (): void => {
    showDrawer.value = true
  }

  const handleCloseDrawer = (): void => {
    currentRule.value = null
    showDrawer.value = false
  }

  const handleEditRule = (rule: IRule, ruleIndex: number): void => {
    currentRule.value = rule
    currentRuleIdx.value = ruleIndex
    handleOpenDrawer()
  }

  const handleQueryData = (): void => {
    const { query } = route as RouteLocationNormalizedLoaded & { query: IQueryParams }
    queryParams.value = query
  }

  const handleRunPreview = async (dateTime: string): Promise<void> => {
    try {
      previewLoading.value = true
      const { data } = await runTimeSeriesModel(
        queryParams.value.type,
        currentModel.value.pathModel,
        { ds: [handleFormatDate(dateTime)] }
      )
      previewResult.value = data.results.shift() ?? null
    } catch (error: any) {
      elMessage(error?.response?.message || 'Erro ao executar previsão!', elementTypesEnum.ERROR)
    } finally {
      previewLoading.value = false
    }
  }

  const handleRunForecastPreview = async (dateRange: string[], horizon: number): Promise<void> => {
    try {
      previewLoading.value = true
      const { pathModel, query } = currentModel.value

      const sendData: any = {
        horizon,
        city: query.city,
        findMode: 'window',
        windowStart: dateRange[0],
        windowEnd: dateRange[1],
      }

      if (currentModel.value?.feature) {
        sendData.feature = currentModel.value.feature
      }

      const { data } = await runPrevisionModel(queryParams.value.type, pathModel, sendData)

      data.graphPath = (await downloadExternalFile(data.graphPath)) as any

      foreCastPreviewResult.value = { ...data, graphSrc: (data.graphPath as any)?.data }
    } catch (error: any) {
      console.log('error:', error)

      elMessage(error?.response?.message || 'Erro ao executar previsão!', elementTypesEnum.ERROR)
    } finally {
      previewLoading.value = false
    }
  }

  const handleChangeState = async (newState: boolean, rule: IRule): Promise<void> => {
    const loading = elLoading('Atualizando regra...')
    try {
      rule.isActive = newState
      await handleUpdateModel()
    } catch (error: any) {
      elMessage(error?.response?.message || 'Erro ao atualizar regra!', elementTypesEnum.ERROR)
    } finally {
      currentModel.value = await handleGetModel()
      loading.close()
    }
  }

  const handleSubmitNewRule = async (newRule: IRule): Promise<void> => {
    const loading = elLoading('Adicionando nova regra...')
    try {
      await updateModel(
        queryParams.value.id,
        { ...currentModel.value, rules: [...currentModel.value.rules, newRule] },
        queryParams.value.type
      )
      handleCloseDrawer()
      elMessage('Nova regra criada com sucesso!', elementTypesEnum.SUCCESS)
    } catch (error: any) {
      if (error?.response?.data?.message) {
        elMessage(
          JSON.parse(error?.response?.data?.message)
            .error.toString()
            .split(': ')[1]
            .replace(/[^a-zA-Z0-9\s]/g, ''),
          elementTypesEnum.ERROR
        )
      } else {
        elMessage('Erro ao adicionar nova regra!', elementTypesEnum.ERROR)
      }
    } finally {
      currentModel.value = await handleGetModel()
      loading.close()
    }
  }

  const handleSubmitEditRule = async (editRule: IRule): Promise<void> => {
    const loading = elLoading('Editando regra...')
    try {
      currentModel.value.rules[currentRuleIdx.value] = editRule
      handleCloseDrawer()
      await handleUpdateModel()
      elMessage('Regra editada com sucesso!', elementTypesEnum.SUCCESS)
    } catch (error: any) {
      elMessage(error?.response?.message || 'Erro ao editar regra!', elementTypesEnum.ERROR)
    } finally {
      currentModel.value = await handleGetModel()
      loading.close()
    }
  }

  const handleSubmitDeleteRule = async (ruleIndex: number): Promise<void> => {
    const loading = elLoading('Excluindo regra...')
    try {
      currentModel.value.rules.splice(ruleIndex, 1)
      await handleUpdateModel()
      elMessage('Regra excluída com sucesso!', elementTypesEnum.SUCCESS)
    } catch (error: any) {
      elMessage(error?.response?.message || 'Erro ao excluir regra!', elementTypesEnum.ERROR)
    } finally {
      currentModel.value = await handleGetModel()
      loading.close()
    }
  }

  const handleGetModel = async (): Promise<IModel> => {
    const { data } = await getModelById(queryParams.value.id, queryParams.value.type)
    return data
  }

  const handleUpdateModel = async (): Promise<IModel> => {
    const { data } = await updateModel(
      queryParams.value.id,
      currentModel.value,
      queryParams.value.type
    )
    return data
  }

  const handleGetInitialData = async (): Promise<void> => {
    const loading = elLoading('Buscando dados...')
    try {
      handleQueryData()
      currentModel.value = await handleGetModel()
    } catch (error: any) {
      elMessage(error?.response?.message || 'Erro ao buscar dados!', elementTypesEnum.ERROR)
    } finally {
      loading.close()
    }
  }

  const canManager = computed<boolean>(() => {
    return handleCheckContext(route.meta.context || '', roleEnum.MANAGER_MODEL)
  })

  const isTimeSeries = computed(() => {
    return techniquesEnum.SERIES === queryParams.value.technique
  })

  const isPrevision = computed(() => {
    return [
      techniquesEnum.PREVISION,
      techniquesEnum.PREVISION_SVR,
      techniquesEnum.PREVISION_BAGGING,
    ].includes(queryParams.value.technique as any)
  })

  onMounted(() => {
    handleGetInitialData()
  })
</script>

<style scoped lang="scss" src="./style.scss"></style>
