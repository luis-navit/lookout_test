<template>
  <div class="view-container">
    <div class="view-header">
      <h1 class="title--lg">{{ getTitle }}</h1>
      <h2 class="subtitle--lg">{{ getSubtitle }}</h2>
    </div>
    <section class="view-content">
      <AppCard
        class="home-card"
        v-for="(card, index) of getCards"
        :key="`card-${card.title}-${index}`"
        :title="card.title"
        :subtitle="card.subtitle"
        :bodyText="card.bodyText ? card.bodyText(cardsCountData[card.permission] || 0) : ''"
        :icon="card.icon"
        @onClick="handleCardClick(card)"
      />

      <AppCard
        class="home-card"
        v-if="authStore.canViewThemeCard"
        :title="themeCardInfo.title"
        :subtitle="themeCardInfo.subtitle"
        :icon="themeCardInfo.icon"
        @onClick="handleCardClick(themeCardInfo)"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/authStore'
  import { elLoading, elMessage } from '@/composables/element'
  import { homeCards } from '@/constants/home'
  import { getAllCompanies } from '@/services/company'
  import { getAllUsers } from '@/services/users'
  import { getAllGroups } from '@/services/group'
  import { getAllDataTypes } from '@/services/type'
  import { getAllDashboards } from '@/services/dashboard'
  import { getAllTraining } from '@/services/training'
  import { getAllModels } from '@/services/model'
  import { getAllBoards } from '@/services/boards'
  import { profileEnum } from '@/enums/profileEnum'
  import { elementTypesEnum } from '@/enums/elementTypesEnum'
  import type { ICard } from '@/interfaces/ICard'
  import AppCard from '@/components/AppCard/AppCard.vue'
  import contextEnum from '@/enums/contextEnum'
  import roleEnum from '@/enums/roleEnum'

  const themeCardInfo = {
    icon: 'Brush',
    title: 'Temas',
    subtitle: 'Visualize e gerencie o tema do sistema',
    permission: contextEnum.THEMES,
    viewName: 'ConfigView',
  }

  const router = useRouter()
  const authStore = useAuthStore()
  const cardsCountData = ref<Record<string, number>>({})

  const handleCardClick = async (card: ICard): Promise<void> => {
    if (card.viewName === 'ChartsView') {
      window.open(import.meta.env.VITE_APP_CHART_URL, '_blank')
      return
    }

    router.push({ name: card.viewName })
  }

  const handleGetAllCompanies = async (): Promise<void> => {
    const { data } = await getAllCompanies()
    cardsCountData.value[contextEnum.COMPANY] = data.length
  }

  const handleGetAllUsers = async (): Promise<void> => {
    const { data } = await getAllUsers()
    cardsCountData.value[contextEnum.USERS] = data.length
  }

  const handleGetAllGroups = async (): Promise<void> => {
    const { data } = await getAllGroups()
    cardsCountData.value[contextEnum.GROUP] = data.length
  }

  const handleGetAllDataTypes = async (): Promise<void> => {
    const { data } = await getAllDataTypes()
    cardsCountData.value[contextEnum.DATA] = data.length
  }

  const handleGetAllDashboards = async (): Promise<void> => {
    const { data } = await getAllDashboards()
    cardsCountData.value[contextEnum.DASHBOARD] = data.length
  }

  const handleGetAllTraining = async (): Promise<void> => {
    const { data } = await getAllTraining()
    cardsCountData.value[contextEnum.LEARNING] = data.length
  }

  const handleGetAllModels = async (): Promise<void> => {
    const { data } = await getAllModels()
    cardsCountData.value[contextEnum.RULES] = data.length
  }

  const handleGetAllBoards = async (): Promise<void> => {
    const { data } = await getAllBoards()
    cardsCountData.value[contextEnum.SERVICES] = data.length
  }

  const requestsPattern: Record<string, any> = {
    [contextEnum.COMPANY]: handleGetAllCompanies,
    [contextEnum.USERS]: handleGetAllUsers,
    [contextEnum.GROUP]: handleGetAllGroups,
    [contextEnum.DATA]: handleGetAllDataTypes,
    [contextEnum.DASHBOARD]: handleGetAllDashboards,
    [contextEnum.LEARNING]: handleGetAllTraining,
    [contextEnum.RULES]: handleGetAllModels,
    [contextEnum.SERVICES]: handleGetAllBoards,
    default: () => null,
  }

  const handleFilterRequests = (): Array<any> => {
    return getCards.value.map((card) => requestsPattern[card.permission])
  }

  const handleGetInitialData = async (): Promise<void> => {
    const loading = elLoading('Buscando dados...')
    try {
      Promise.all(
        handleFilterRequests().map((e) => {
          if (e) {
            e()
          }
        })
      )
    } catch (error: any) {
      elMessage(error?.response?.message || 'Erro ao buscar dados!', elementTypesEnum.ERROR)
    } finally {
      loading.close()
    }
  }

  const getCards = computed<Array<ICard>>((): Array<ICard> => {
    return (homeCards[authStore.userProfile] ?? [])?.filter(
      (card) =>
        Object.keys(authStore.userData.roles).includes(card.permission) &&
        authStore.userData.roles[card.permission].includes(roleEnum.VIEW)
    )
  })

  const getTitle = computed<string>((): string => {
    return authStore.userProfile === profileEnum.ADMIN
      ? authStore.userData?.company?.name || 'Desconhecido'
      : `Olá, ${authStore.userData.name}!`
  })

  const getSubtitle = computed<string>((): string => {
    return authStore.userProfile === profileEnum.HEAD
      ? 'Acesse as funcionalidades clicando nos cards'
      : 'Visualize e gerencie ações no painel de controle do Lookout.'
  })

  onMounted(() => {
    handleGetInitialData()
  })
</script>

<style scoped lang="scss" src="./style.scss"></style>
