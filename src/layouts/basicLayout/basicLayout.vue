<template>
  <AppHeader
    showMenuIcon
    :alerts="alertStore.alerts"
    :userName="authStore.userData.name"
    :userImage="userImage"
    :userLogoMark="userLogoMark"
    :menuSystemOptions="menuSystemOptions"
    @onGoHome="handleGoHome"
    @onGoConfig="handleGoConfig"
    @onCommand="handleCommands"
    @onToggleMenu="handleToggleMenu"
    :key="authStore.countImage"
  />

  <RouterView class="app-container__view" v-slot="{ Component }">
    <div class="page-wrapper">
      <AppNavbar
        showShortActions
        :options="getNavOptions"
        :isCollapse="navStore.currentNavState"
        :shortActions="getShortActions"
        :systemOptions="getNavSystemOptions"
        :activeItem="getActiveNavItem"
        @onToggle="handleToggleMenu"
        @onCommand="handleCommands"
        @onShortCommand="handleShortCommands"
      />
      <transition name="slide" mode="out-in">
        <component :is="Component" :key="$route.path" />
      </transition>
    </div>
  </RouterView>
  <AppFooter :appVersion="appVersion" :footerText="appFooterText" />
</template>

<script setup lang="ts">
  import AppFooter from '@/components/AppFooter/AppFooter.vue'
  import AppHeader from '@/components/AppHeader/AppHeader.vue'
  import AppNavbar from '@/components/AppNavbar/AppNavbar.vue'
  import { elLoading, elMessage } from '@/composables/element'
  import { handleChangeGlobalTheme } from '@/composables/globalTheme'
  import { navbarByProfile } from '@/constants/navbar'
  import contextEnum from '@/enums/contextEnum'
  import { elementTypesEnum } from '@/enums/elementTypesEnum'
  import roleEnum from '@/enums/roleEnum'
  import type { IDropdownItem, IShortOption } from '@/interfaces/IDropdownItem'
  import type { INavbarItem } from '@/interfaces/INavbarItem'
  import { useAlertStore } from '@/stores/alertStore'
  import { useAuthStore } from '@/stores/authStore'
  import pinia from '@/stores/instance'
  import { useNavStore } from '@/stores/navStore'
  import { computed, ref } from 'vue'
  import { RouterView, useRoute, useRouter } from 'vue-router'

  const appVersion = ref<string>(import.meta.env.VITE_APP_VERSION)
  const appFooterText = ref<string>(import.meta.env.VITE_APP_FOOTER_TEXT)

  const navStore = useNavStore(pinia)
  const authStore = useAuthStore(pinia)
  const alertStore = useAlertStore(pinia)

  const router = useRouter()
  const route = useRoute()

  const menuSystemOptions = ref<Array<IDropdownItem>>([
    { command: 'config', text: 'Configurações', icon: 'Setting' },
    { command: 'exit', text: 'Sair do sistema', color: 'danger', icon: 'SwitchButton' },
  ])

  const navbarShortOptions = ref<Array<IShortOption>>([
    { command: 'CompaniesView', text: 'Nova empresa', permission: contextEnum.COMPANY },
    { command: 'UsersView', text: 'Novo usuário', permission: contextEnum.USERS },
    { command: 'PermissionsView', text: 'Novo grupo de permissões', permission: contextEnum.GROUP },
    { command: 'RuleGroupsView', text: 'Novo conjunto de regras', permission: contextEnum.RULES },
    { command: 'DataView', text: 'Visualizar dados', permission: contextEnum.DATA },
    { command: 'DashboardsView', text: 'Visualizar dashboards', permission: contextEnum.DASHBOARD },
    { command: 'BoardsView', text: 'Visualizar quadros de OS', permission: contextEnum.SERVICES },
  ])

  const handleGoHome = (): void => {
    router.push({ path: '/' })
  }

  const handleGoConfig = (): void => {
    router.push({
      path: '/config',
      query: { selectedTabName: authStore.isCompanyAdmin ? 'themes' : 'perfil-informations' },
    })
  }

  const handleNavigate = (viewName: string, query?: Record<string, string>): void => {
    router.push({ name: viewName, query })
  }

  const handleCommands = (command: string): void => {
    const handler: Record<string, any> = {
      exit: handleLogout,
      home: handleGoHome,
      config: () =>
        handleNavigate('ConfigView', {
          selectedTabName: authStore.isCompanyAdmin ? 'themes' : 'perfil-informations',
        }),
      data: () => handleNavigate('DataView'),
      users: () => handleNavigate('UsersView'),
      rules: () => handleNavigate('RuleGroupsView'),
      charts: () => window.open(import.meta.env.VITE_APP_CHART_URL, '_blank'),
      services: () => handleNavigate('BoardsView'),
      learning: () => handleNavigate('LearningView'),
      dashboard: () => handleNavigate('DashboardsView'),
      permissions: () => handleNavigate('PermissionsView'),
      themes: () => handleNavigate('ConfigView'),
      companies: () => handleNavigate('CompaniesView'),
      default: () => elMessage('Recurso não encontrado.', elementTypesEnum.ERROR),
    }

    if (Object.keys(handler).includes(command)) navStore.updateNavItem(command)

    const action = handler[command] || handler.default

    action()
  }

  const handleShortCommands = (command: string): void => {
    try {
      router.push({ name: command })
    } catch (error: any) {
      elMessage('Erro ao acessar ação!', elementTypesEnum.ERROR)
    }
  }

  const handleToggleMenu = (): void => {
    navStore.updateNavState(!navStore.currentNavState)
  }

  const handleLogout = async (): Promise<void> => {
    const loading = elLoading('Saindo...')
    authStore.logout()

    await router.push({
      name: 'LoginView',
    })

    loading.close()

    handleChangeGlobalTheme()
  }

  const getShortActions = computed<Array<IDropdownItem>>(() => {
    return navbarShortOptions.value.filter(
      (action) =>
        Object.keys(authStore.userData.roles).includes(action.permission) &&
        authStore.userData.roles[action.permission].includes(roleEnum.VIEW)
    )
  })

  const getNavOptions = computed<Array<INavbarItem>>(() => {
    return (navbarByProfile[authStore.userProfile]?.options || []).filter(
      (card) =>
        (Object.keys(authStore.userData.roles).includes(card.permission) &&
          authStore.userData.roles[card.permission].includes(roleEnum.VIEW)) ||
        !card.permission.length
    )
  })

  const getNavSystemOptions = computed<Array<INavbarItem>>(() => {
    return (navbarByProfile[authStore.userProfile]?.systemOptions || []).filter(
      (card) =>
        (Object.keys(authStore.userData.roles).includes(card.permission) &&
          authStore.userData.roles[card.permission].includes(roleEnum.VIEW)) ||
        !card.permission.length
    )
  })

  const getActiveNavItem = computed<string>((): string => route.meta.currentIndex || '')
  const userImage = computed<string>((): string => authStore.userProfileImage)
  const userLogoMark = computed<string>((): string => authStore.userProfileLogoMark)
</script>

<style scoped lang="scss" src="./index.scss"></style>
