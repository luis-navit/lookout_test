<template>
  <header class="header-container">
    <div class="header-left">
      <img
        class="header-logo"
        :src="lookoutLogo"
        :key="changeCount"
        alt="lookout"
        @click="handleGoHome"
      />
      <el-divider v-if="userLogoMark" direction="vertical" />
      <img
        v-if="userLogoMark"
        class="header-logo-mark"
        :src="userLogoMark"
        alt="Logo Mark"
        @click="handleGoConfig"
        :key="countLogoMark"
      />
    </div>
    <div class="header-left-container">
      <el-switch
        v-model="isDark"
        class="switch-theme"
        :active-action-icon="Moon"
        :inactive-action-icon="Sunny"
      />
      <AppAlert :alerts="alerts" />
      <AppDropdown
        :system-option="menuSystemOptions"
        :options="menuOptions"
        @onCommand="handleCommand"
      >
        <div class="dropdown-activator" @click="handleEasterEgg">
          <UserAvatar :name="userName" :image="userImage" />
          <el-icon color="black">
            <CaretBottom />
          </el-icon>
        </div>
      </AppDropdown>
    </div>
  </header>
</template>

<script setup lang="ts">
  import { onMounted, ref, watch } from 'vue'
  import { Sunny, Moon } from '@element-plus/icons-vue'
  import { useDark, usePreferredDark } from '@vueuse/core'
  import { useAuthStore } from '@/stores/authStore'
  import UserAvatar from '@/components/UserAvatar/UserAvatar.vue'
  import AppDropdown from '@/components/AppDropdown/AppDropdown.vue'
  import AppAlert from '../AppAlert/AppAlert.vue'
  import LookoutLogo from '@/assets/logo.svg'
  import LookoutWhiteLogo from '@/assets/whiteLogo.svg'
  import SafeMarketLogo from '@/assets/safeMarket.png'
  import SafeMarketWhiteLogo from '@/assets/safeMarketWhite.svg'
  import type { IDropdownItem } from '@/interfaces/IDropdownItem'
  import type { IAlert } from '@/interfaces/IAlert'

  defineProps<{
    userName: string
    userImage?: string
    userLogoMark?: string
    menuOptions?: Array<IDropdownItem>
    menuSystemOptions: Array<IDropdownItem>
    showMenuIcon: boolean
    alerts: Array<IAlert>
  }>()

  const { countLogoMark } = useAuthStore()

  const preferredDark = usePreferredDark()
  const isDark = useDark()

  const lookoutLogo = ref(isDark.value ? LookoutWhiteLogo : LookoutLogo)

  const isDarkMode = ref(true)
  const logoToShow = ref<'lookout' | 'safemarket'>('lookout')
  const clickCount = ref(0)
  const changeCount = ref(0)
  let clickTimer: any = null

  const emit = defineEmits<{
    onGoHome: []
    onGoConfig: []
    onCommand: [command: string]
  }>()

  const handleGoHome = (): void => {
    emit('onGoHome')
  }

  const handleGoConfig = (): void => {
    emit('onGoConfig')
  }

  const handleCommand = (command: string) => {
    emit('onCommand', command)
  }

  const handleEasterEgg = () => {
    clickCount.value += 1

    if (clickCount.value === 1) {
      clickTimer = setTimeout(resetClicks, 3000)
    } else if (clickCount.value === 10) {
      logoToShow.value = logoToShow.value === 'lookout' ? 'safemarket' : 'lookout'
      resetClicks()
    } else {
      clearTimeout(clickTimer)
      clickTimer = setTimeout(resetClicks, 3000)
    }
  }

  const resetClicks = () => {
    clickCount.value = 0
    if (clickTimer) {
      clearTimeout(clickTimer)
      clickTimer = null
    }
  }

  watch(
    () => [isDark.value, logoToShow.value],
    (newValues) => {
      const lookoutValue = newValues[0] ? LookoutWhiteLogo : LookoutLogo
      const safeMarkValue = newValues[0] ? SafeMarketWhiteLogo : SafeMarketLogo
      lookoutLogo.value = newValues[1] === 'lookout' ? lookoutValue : safeMarkValue
    }
  )

  onMounted(() => {
    const savedTheme = localStorage.getItem('vueuse-color-scheme') || 'auto'

    if (savedTheme === 'light') {
      isDark.value, (isDarkMode.value = false)
    } else if (savedTheme === 'dark') {
      isDark.value, (isDarkMode.value = true)
    } else if (savedTheme === 'auto') {
      isDark.value, (isDarkMode.value = preferredDark.value)
    }
  })
</script>

<style scoped lang="scss" src="./style.scss"></style>
