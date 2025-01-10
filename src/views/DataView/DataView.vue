<template>
  <div class="view-container">
    <div class="view-header">
      <HeaderBackTitle
        class="title-wrapper"
        title="Dados"
        subtitle="Visualize os últimos dados coletados"
        @onBack="handleBack"
      />
      <div class="actions-wrapper">
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
      </div>
    </div>
    <section class="view-content">
      <ul class="data-cards-container" v-if="getDataCards.length">
        <li
          class="data-card-container"
          v-for="(card, index) of getDataCards"
          :key="`data-card-${card.title}-${index}`"
        >
          <DataCard :title="card.title" :state="card.state" @onClick="handleCardClick(card)" />
        </li>
      </ul>
      <div class="empty-container" v-else>
        <h2 class="title--md bold">Nenhuma informação encontrada no momento</h2>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
  import AppSelect from '@/components/AppSelect/AppSelect.vue'
  import DataCard from '@/components/DataCard/DataCard.vue'
  import HeaderBackTitle from '@/components/HeaderBackTitle/HeaderBackTitle.vue'
  import { elLoading, elMessage } from '@/composables/element'
  import { handleFilterData } from '@/composables/utils'
  import { elementTypesEnum } from '@/enums/elementTypesEnum'
  import type { IDataType } from '@/interfaces/IDataType'
  import type { ISelectOption } from '@/interfaces/ISelect'
  import { getAllDataTypes } from '@/services/type'
  import { computed, onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'

  const router = useRouter()
  const search = ref<string>('')
  const filter = ref<string>('')
  const dataTypes = ref<Array<IDataType>>([])

  const filterOptions = ref<Array<ISelectOption>>([
    { label: 'Todos os dados', value: '' },
    { label: 'Processado', value: 'processed' },
    { label: 'Não processado', value: 'unprocessed' },
  ])

  const handleBack = (): void => {
    router.push({ name: 'HomeView' })
  }

  const handleFilteredData = (): Array<IDataType> => {
    return filter.value.length
      ? dataTypes.value.filter((card) => card.state === filter.value)
      : dataTypes.value
  }

  const getDataCards = computed<Array<IDataType>>((): Array<IDataType> => {
    const filteredData = handleFilteredData()
    return handleFilterData<IDataType>(filteredData, ['title'], search.value)
  })

  const handleCardClick = (card: IDataType): void => {
    router.push({
      name: 'DataDetailsView',
      query: { id: card.id, title: card.title, processor: card.processor },
    })
  }

  const handleGetDataTypes = async (): Promise<Array<IDataType>> => {
    const { data } = await getAllDataTypes()
    return data.map((e) => ({ ...e, state: e.processor ? 'processed' : 'unprocessed' }))
  }

  const handleGetInitialData = async (): Promise<void> => {
    const loading = elLoading('Buscando dados...')
    try {
      dataTypes.value = await handleGetDataTypes()
    } catch (error: any) {
      elMessage(error?.response?.message || 'Erro ao buscar dados!', elementTypesEnum.ERROR)
    } finally {
      loading.close()
    }
  }

  onMounted(() => {
    handleGetInitialData()
  })
</script>

<style scoped lang="scss" src="./style.scss"></style>
