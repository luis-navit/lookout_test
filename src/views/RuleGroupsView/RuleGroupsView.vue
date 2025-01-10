<template>
  <div class="rule-groups-view">
    <div class="rule-groups-view__header">
      <HeaderBackTitle
        class="title-container"
        title="Conjunto de regras"
        subtitle="Gerencie as regras de processamento"
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
        <el-button v-if="canManager" @click="handleOpenDrawer" type="primary" icon="Plus">
          Novo conjunto de regras
        </el-button>
      </div>
    </div>
    <section class="rule-groups-view-content">
      <ul class="model-cards-container" v-if="getRuleGroupsCards.length">
        <li
          v-for="(model, index) of getRuleGroupsCards"
          class="model-cards-item"
          :class="{ 'without-options': !canManager }"
          :key="`model-card-${index}`"
        >
          <RuleGroupCard
            :title="model.name"
            :technique="model.technique"
            :algorithmName="model.algorithmName"
            :showOptions="canManager"
            @onDelete="handleDeleteDashboard(model)"
            @onEdit="handleEdit(model)"
            @click="handleClick(model)"
          />
        </li>
      </ul>
      <div class="empty-container" v-else>
        <h2 class="title--md">Nenhuma informação encontrada no momento</h2>
      </div>
    </section>
    <DrawerRuleGroup
      :show="showDrawer"
      :currentModel="currentModel"
      :dataTypesOptions="dataTypes"
      @onClose="handleCloseDrawer"
      @onCancel="handleCloseDrawer"
      @onSubmit:save="handleSubmitSaveModel"
      @onSubmit:edit="handleSubmitEditModel"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { getAllDataTypes } from '@/services/type'
  import { getAllModels, saveModel, updateModel, deleteModel } from '@/services/model'
  import { handleCheckContext, handleFilterData } from '@/composables/utils'
  import { elLoading, elMessage } from '@/composables/element'
  import { elementTypesEnum } from '@/enums/elementTypesEnum'
  import type { IModel, IRule } from '@/interfaces/IModel'
  import type { ISelectOption } from '@/interfaces/ISelect'
  import RuleGroupCard from '@/components/RuleGroupCard/RuleGroupCard.vue'
  import HeaderBackTitle from '@/components/HeaderBackTitle/HeaderBackTitle.vue'
  import DrawerRuleGroup from './Partials/DrawerRuleGroup/DrawerRuleGroup.vue'
  import { ElMessageBox } from 'element-plus'
  import roleEnum from '@/enums/roleEnum'
  import { useRoute } from 'vue-router'

  const route = useRoute()
  const router = useRouter()

  const search = ref<string>('')
  const models = ref<Array<IModel>>([])
  const dataTypes = ref<Array<ISelectOption>>([])
  const showDrawer = ref<boolean>(false)
  const currentModel = ref<IModel | null>(null)

  const handleBack = (): void => {
    router.push({ name: 'HomeView' })
  }

  const handleEdit = (model: IModel): void => {
    currentModel.value = model
    handleOpenDrawer()
  }

  const handleClick = (model: IModel): void => {
    router.push({
      name: 'RuleDetailsView',
      query: {
        id: model.id,
        type: model.type,
        technique: model.technique,
      },
    })
  }

  const handleOpenDrawer = (): void => {
    showDrawer.value = true
  }

  const handleCloseDrawer = (): void => {
    currentModel.value = null
    showDrawer.value = false
  }

  const handleDeleteDashboard = (model: IModel): void => {
    ElMessageBox.confirm(
      'Ao excluir o conjunto de regras, você perderá informações cadastradas! Deseja continuar com a ação de excluir?',
      'Deseja excluir o conjunto de regras?',
      {
        confirmButtonText: 'Excluir',
        cancelButtonText: 'Cancelar',
        confirmButtonClass: 'danger-btn',
      }
    ).then(() => {
      handleSubmitDeleteModel(model)
    })
  }

  const handleGetDataTypes = async (): Promise<Array<ISelectOption>> => {
    const { data } = await getAllDataTypes()
    return data.map((item) => ({ label: item.name, value: item.id }))
  }

  const handleGetAllModels = async (): Promise<Array<IModel>> => {
    const { data } = await getAllModels()
    return data.map((model) => ({
      ...model,
      algorithmName: model.algorithmName || 'Não informado',
    }))
  }

  const handleSubmitSaveModel = async (newModel: Record<string, any>): Promise<void> => {
    const loading = elLoading('Salvando conjunto de regras...')
    try {
      await saveModel({ ...newModel, rules: [] }, newModel?.type || '')
      models.value = await handleGetAllModels()
      handleCloseDrawer()
    } catch (error: any) {
      elMessage(
        error?.response?.message || 'Erro ao salvar conjunto de regras!',
        elementTypesEnum.ERROR
      )
    } finally {
      loading.close()
    }
  }

  const handleSubmitDeleteModel = async (model: IModel): Promise<void> => {
    const loading = elLoading('Excluindo conjunto de regras...')
    try {
      await deleteModel(model.id, model.type)
      models.value = await handleGetAllModels()
      handleCloseDrawer()
    } catch (error: any) {
      elMessage(
        error?.response?.message || 'Erro ao excluir conjunto de regras!',
        elementTypesEnum.ERROR
      )
    } finally {
      loading.close()
    }
  }

  const handleSubmitEditModel = async (
    name: string,
    rules: Array<IRule>,
    id: string,
    horizon?: number,
    pastDays?: number
  ): Promise<void> => {
    const loading = elLoading('Editando conjunto de regras...')
    try {
      const updatedData: any = { name, rules }

      if (horizon && pastDays) {
        updatedData.horizon = horizon
        updatedData.pastDays = pastDays
      }

      await updateModel(id, updatedData, currentModel.value?.type || '')
      models.value = await handleGetAllModels()
      handleCloseDrawer()
    } catch (error: any) {
      elMessage(
        error?.response?.message || 'Erro ao editar conjunto de regras!',
        elementTypesEnum.ERROR
      )
    } finally {
      loading.close()
    }
  }

  const handleGetInitialData = async (): Promise<void> => {
    const loading = elLoading('Buscando dados...')
    try {
      models.value = await handleGetAllModels()
      dataTypes.value = await handleGetDataTypes()
    } catch (error: any) {
      elMessage(error?.response?.message || 'Erro ao buscar dados!', elementTypesEnum.ERROR)
    } finally {
      loading.close()
    }
  }

  const getRuleGroupsCards = computed<Array<IModel>>((): Array<IModel> => {
    return handleFilterData<IModel>(
      models.value,
      ['name', 'technique', 'algorithmName'],
      search.value
    )
  })

  const canManager = computed<boolean>(() => {
    return handleCheckContext(route.meta.context || '', roleEnum.MANAGER)
  })

  onMounted(() => {
    handleGetInitialData()
  })
</script>

<style scoped lang="scss" src="./style.scss"></style>
