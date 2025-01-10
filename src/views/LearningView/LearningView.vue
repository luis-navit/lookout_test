<template>
  <div class="view-container">
    <div class="view-header">
      <HeaderBackTitle
        class="title-container"
        title="Aprendizagem de máquina"
        subtitle="Utilize aprendizagem de máquina para gerar conjuntos de regras"
        @onBack="handleBack"
      />
      <div class="actions-wrapper">
        <el-tooltip placement="bottom" content="Recarregar página">
          <el-button icon="Refresh" plain @click="handleReload"></el-button>
        </el-tooltip>
        <AppSelect
          class="actions-filter"
          v-model="filter"
          suffix-icon="Filter"
          placeholder="Filtro"
          :options="filterOptions"
          clearable
        />
        <el-input
          class="actions-search"
          v-model="search"
          suffix-icon="Search"
          placeholder="Pesquise uma informação na lista abaixo "
          clearable
        />
        <el-button v-if="canCreate" @click="handleOpenDrawer" type="primary">
          Iniciar treinamento
        </el-button>
      </div>
    </div>
    <section class="view-content">
      <ul class="learning-cards-container" v-if="getTrainingData.length">
        <li
          class="learning-card-container"
          v-for="(training, index) of getTrainingData"
          :key="`learning-card-${training.type}-${index}`"
        >
          <LearningCard
            :class="{ 'without-hover': handleControlHover(training.status) }"
            :title="training.name"
            :percentage="training.status === 'In Progress' ? 50 : 100"
            :status="handleFormatStatus(training.status)"
            :createdAt="handleFormatDate(training.createdAt)"
            @onClick="handleTraining(training)"
          />
        </li>
      </ul>
      <div class="empty-container" v-else>
        <span class="text--md">Nenhuma informação encontrada no momento.</span>
      </div>
    </section>
    <LearningDrawer
      :showDrawer="showDrawer"
      :typeOptions="typeOptions"
      :dataTypes="dataTypes"
      :fieldsOptions="fieldsOptions"
      :modelOptions="modelOptions"
      :revisionCities="cities"
      @onClose="handleCloseDrawer"
      @onSubmit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, h, onMounted, ref } from 'vue'
  import { ElMessageBox, type FormInstance } from 'element-plus'
  import { useRouter } from 'vue-router'
  import LearningDrawer from './Partials/LearningDrawer/LearningDrawer.vue'
  import HeaderBackTitle from '@/components/HeaderBackTitle/HeaderBackTitle.vue'
  import LearningCard from '@/components/LearningCard/LearningCard.vue'
  import { handleCheckContext, handleFilterData, handleFormatDate } from '@/composables/utils'
  import { elLoading, elMessage } from '@/composables/element'
  import { getAllTraining, deleteTrainingById } from '@/services/training'
  import { trainAnomalyModel } from '@/services/anomaly'
  import { getSampleByType } from '@/services/data'
  import { trainRegressionModel } from '@/services/regression'
  import { trainExtractRulesModel } from '@/services/extractRules'
  import { trainTimeSeriesModel } from '@/services/timeSeries'
  import { getAllDataTypes } from '@/services/type'
  import { learningStatusEnum } from '@/enums/learningEnums'
  import { elementTypesEnum } from '@/enums/elementTypesEnum'
  import type { ITraining } from '@/interfaces/ITraining'
  import type { IDataType } from '@/interfaces/IDataType'
  import type { ISelectOption } from '@/interfaces/ISelect'
  import AppSelect from '@/components/AppSelect/AppSelect.vue'
  import roleEnum from '@/enums/roleEnum'
  import { useRoute } from 'vue-router'
  import { getAllTrainingConstants } from '@/services/resource'
  import { trainPrevisionModel } from '@/services/previsionSeries'
  import { getPrevisionCities } from '@/services/cities'

  const search = ref<string>('')
  const route = useRoute()
  const router = useRouter()

  const cities = ref()
  const filter = ref<string>('')
  const showDrawer = ref<boolean>(false)
  const trainingData = ref<Array<ITraining>>([])
  const modelOptions = ref<Array<ISelectOption>>([])
  const dataTypes = ref<Array<IDataType>>([])
  const typeOptions = ref<Array<ISelectOption>>([])
  const fieldsOptions = ref<Record<string, Array<ISelectOption>>>({ default: [] })
  const filterOptions = ref<Array<ISelectOption>>([
    { label: 'Todos os itens', value: '' },
    { label: 'Em treinamento', value: 'In Progress' },
    { label: 'Concluídos', value: 'Completed' },
    { label: 'Erro', value: 'Error' },
  ])

  const handleFilteredData = (): Array<ITraining> => {
    return filter.value.length
      ? trainingData.value.filter((card) => card.status === filter.value)
      : trainingData.value
  }

  const getTrainingData = computed<Array<ITraining>>((): Array<ITraining> => {
    const filteredData = handleFilteredData()
    return handleFilterData<ITraining>(filteredData, ['title'], search.value)
  })

  const handleBack = (): void => {
    router.push({ name: 'HomeView' })
  }

  const handleTraining = (training: ITraining): void => {
    const status = handleFormatStatus(training.status)
    const pattern: Record<string, () => any> = {
      success: () => handleTrainingRouter(training),
      '': () => elMessage('Em treinamento!', elementTypesEnum.INFO),
      exception: () => handleErrorDetail(training),
      default: () => elMessage('Recurso não encontrado!', elementTypesEnum.ERROR),
    }
    const handler = pattern[status] ?? pattern.default
    handler()
  }

  const handleControlHover = (status: string): boolean => {
    return (
      (handleFormatStatus(status) === learningStatusEnum.EXCEPTION && !canFinish.value) ||
      (handleFormatStatus(status) === learningStatusEnum.SUCCESS && !canCreate.value)
    )
  }

  const handleErrorDetail = (training: ITraining): void => {
    if (!canFinish) return

    ElMessageBox({
      title: 'Erro no treinamento',
      message: h('div', { style: 'display: flex; flex-direction: column; text-align: justify;' }, [
        h('span', null, [
          'Ocorreu o erro ',
          h('strong', { class: 'bold' }, training.message),
          ` no treinamento ${training.name}.`,
        ]),
        h('span', null, 'Você pode encerar o treinamento.'),
      ]),
      confirmButtonText: 'Encerrar treinamento',
    }).then(() => {
      handleDeleteTraining(training.id, training.type)
    })
  }

  const handleTrainingRouter = (training: ITraining) => {
    if (!canCreate.value) return

    const routerPattern: Record<string, string> = {
      'Extract Rules': 'TrainingView',
      Regression: 'TrainingGraphView',
      'Anomaly Detection': 'TrainingGraphView',
      'Time Series': 'TrainingTimeSeriesView',
      'Prediction Forecast': 'TrainingGraphView',
      default: 'LearningView',
    }

    router.push({
      name: routerPattern[training.technique] || routerPattern.default,
      query: { id: training.id, technique: training.technique, type: training.type },
    })
  }

  const handleOpenDrawer = (): void => {
    showDrawer.value = true
  }

  const handleCloseDrawer = (commonFormRef: FormInstance): void => {
    commonFormRef?.resetFields()
    showDrawer.value = false
  }

  const handleSubmit = async (
    type: string,
    form: Record<string, any>,
    commonFormRef: FormInstance
  ): Promise<void> => {
    const pattern: Record<string, any> = {
      anomaly: async (sendForm: Record<string, any>) => await trainAnomalyModel(sendForm),
      extract: async (sendForm: Record<string, any>) => await trainExtractRulesModel(sendForm),
      regress: async (sendForm: Record<string, any>) => await trainRegressionModel(sendForm),
      time: async (sendForm: Record<string, any>) => await trainTimeSeriesModel(sendForm),
      prevision: async (sendForm: Record<string, any>) => await trainPrevisionModel(sendForm),
      default: () => elMessage('Recurso não encontrado!', elementTypesEnum.ERROR),
    }
    const handler = pattern[type] ?? pattern.default
    const loading = elLoading('Iniciando treinamento...')

    try {
      await handler(form)
      trainingData.value = await handleGetAllTraining()
      handleCloseDrawer(commonFormRef)
    } catch (error: any) {
      elMessage(error?.response?.message || 'Erro ao iniciar treinamento!', elementTypesEnum.ERROR)
    } finally {
      loading.close()
    }
  }

  const handleFormatStatus = (status: string) => {
    const pattern: Record<string, learningStatusEnum> = {
      Completed: learningStatusEnum.SUCCESS,
      Error: learningStatusEnum.EXCEPTION,
      'In Progress': learningStatusEnum.TRAINING,
      default: learningStatusEnum.WARNING,
    }

    return pattern[status] ?? pattern.default
  }

  const handleFormatTrainingTitle = (trainingData: Array<ITraining>): Array<ITraining> => {
    return trainingData.reduce((acc: Array<ITraining>, curr: ITraining) => {
      if (curr.status !== 'Finished') acc.push({ ...curr, title: `${curr.type} ${curr.technique}` })
      return acc
    }, [])
  }

  const handleGetSample = async (type: string): Promise<void> => {
    const { data } = await getSampleByType(type)
    fieldsOptions.value[type] = Object.keys(data)
      .reduce<Array<ISelectOption>>((acc, curr) => {
        if (curr.includes('data.')) {
          const value = curr.replace('data.', '')
          acc.push({
            label: value,
            value,
          })
        }
        return acc
      }, [])
      .sort((a, b) => a.label.localeCompare(b.label))
  }

  const handleReload = async (): Promise<void> => {
    const loading = elLoading('Recarregando página...')
    try {
      trainingData.value = await handleGetAllTraining()
      dataTypes.value = await handleGetAllDataTypes()
    } catch (error: any) {
      elMessage(error?.response?.message || 'Erro ao Recarregar página!', elementTypesEnum.ERROR)
    } finally {
      loading.close()
    }
  }

  const handleDeleteTraining = async (id: string, type: string): Promise<void> => {
    const loading = elLoading('Encerrando treinamento...')
    try {
      await deleteTrainingById(id, type)
      trainingData.value = await handleGetAllTraining()
      dataTypes.value = await handleGetAllDataTypes()
    } catch (error: any) {
      elMessage(error?.response?.message || 'Erro ao encerrar treinamento!', elementTypesEnum.ERROR)
    } finally {
      loading.close()
    }
  }

  const handleGetModelOptions = async (): Promise<any> => {
    const { data } = await getAllTrainingConstants()
    modelOptions.value = (data['algorithmNameEnum'] ?? []).map((e) => ({ label: e, value: e }))
  }

  const handleGetAllTraining = async (): Promise<Array<ITraining>> => {
    const { data } = await getAllTraining()
    return handleFormatTrainingTitle(data)
  }

  const handleGetAllDataTypes = async (): Promise<Array<IDataType>> => {
    const { data } = await getAllDataTypes()
    typeOptions.value = data.map((type) => ({
      label: type.title,
      subLabel: `Dado${type.processor ? '' : ' não'} processado`,
      value: type.id,
    }))
    return data
  }

  const handleGetCities = async (): Promise<unknown> => {
    const televisionId = typeOptions.value.find((type) => type.label === 'television')?.value
    const dataKeyName = 'data.container_city'
    const { data } = await getPrevisionCities(dataKeyName, televisionId)

    const formattedData = data[dataKeyName as keyof typeof data].map((city: string) => ({
      value: city,
      label: city,
    }))

    return formattedData
  }

  const handleGetInitialData = async (): Promise<void> => {
    const loading = elLoading('Buscando dados...')
    try {
      trainingData.value = await handleGetAllTraining()
      dataTypes.value = await handleGetAllDataTypes()
      cities.value = await handleGetCities()
      await handleGetModelOptions()
      await Promise.all(dataTypes.value.map(async (type) => await handleGetSample(type.id)))
    } catch (error: any) {
      elMessage(error?.response?.data?.message || 'Erro ao buscar dados!', elementTypesEnum.WARNING)
    } finally {
      loading.close()
    }
  }

  const canCreate = computed<boolean>(() => {
    return handleCheckContext(route.meta.context || '', roleEnum.CREATE_MODEL)
  })

  const canFinish = computed<boolean>(() => {
    return handleCheckContext(route.meta.context || '', roleEnum.FINISH_MODEL)
  })

  onMounted(() => {
    handleGetInitialData()
  })
</script>

<style scoped lang="scss" src="./style.scss"></style>
