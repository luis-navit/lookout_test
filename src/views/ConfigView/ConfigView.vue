<template>
  <div class="themes-view">
    <div class="themes-view__header">
      <HeaderBackTitle
        class="page-title"
        title="Configurações de temas"
        subtitle="Visualize e gerencie os usuários"
        @onBack="handleBack"
      />
    </div>
    <section class="themes-view__section">
      <el-tabs v-model="activeName" class="demo-tabs">
        <el-tab-pane
          v-if="!isCompanyAdmin"
          label="Informações do perfil"
          name="perfil-informations"
        >
          <PerfilInformations
            @onSubmit:info="handleSaveUserInfo"
            @onSubmit:logo="handleSaveTheme"
          />
        </el-tab-pane>
        <el-tab-pane v-if="!isCompanyAdmin" label="Senha de acesso" name="access-password">
          <PasswordAccess @onSubmit="handleSaveUserInfo" />
        </el-tab-pane>
        <el-tab-pane v-if="canViewThemeCard" label="Temas" name="themes">
          <Themes @onSubmit="handleSaveTheme" />
        </el-tab-pane>
      </el-tabs>
    </section>
  </div>
</template>

<script lang="ts" setup>
  import pinia from '@/stores/instance'
  import HeaderBackTitle from '@/components/HeaderBackTitle/HeaderBackTitle.vue'
  import PerfilInformations from './Partials/PerfilInformations/PerfilInformations.vue'
  import PasswordAccess from './Partials/PasswordAccess/PasswordAccess.vue'
  import Themes from './Partials/Themes/Themes.vue'
  import type { IUpdateUser } from '@/interfaces/IUser'
  import { ref } from 'vue'
  import { useDark, usePreferredDark } from '@vueuse/core'
  import { useRoute, useRouter } from 'vue-router'
  import { saveCompanyTheme, updateCompanyTheme } from '@/services/themes'
  import { elLoading, elMessage } from '@/composables/element'
  import { elementTypesEnum } from '@/enums/elementTypesEnum'
  import { updateUser } from '@/services/users'
  import { fetchRefreshToken } from '@/services/auth'
  import { useAuthStore } from '@/stores/authStore'
  import { downloadImage } from '@/services/files'
  import { handleFileToBase64 } from '@/composables/utils'
  import { useLocalStore } from '@/stores/localStore'
  import { handleChangeGlobalTheme } from '@/composables/globalTheme'

  const { saveDataOnStore } = useLocalStore()
  const {
    userData,
    refreshToken,
    updateUserData,
    updateUserImage,
    updateUserLogoMark,
    canViewThemeCard,
    isCompanyAdmin,
  } = useAuthStore(pinia)

  const router = useRouter()
  const route = useRoute()
  const isDark = useDark()
  const preferredDark = usePreferredDark()

  const activeName = ref(route.query?.selectedTabName || 'themes')

  const handleBack = (): void => {
    router.push({ name: 'HomeView' })
  }

  const handleDownloadImage = async (path: string): Promise<string> => {
    const { data, headers } = await downloadImage(path)
    const fileType = headers['Content-Type'] as string

    return handleFileToBase64(data, fileType)
  }

  const handleRefreshUserData = async (): Promise<void> => {
    const loading = elLoading('Atualizando informações do usuário')
    try {
      let profileImage = ''
      let profileLogoPath = ''

      const { data } = await fetchRefreshToken(refreshToken)
      updateUserData(data)

      if (data.user?.picturePath) {
        profileImage = await handleDownloadImage(data.user?.picturePath)
      }
      updateUserImage(profileImage)

      if (data.user?.company?.theme?.logoMarkPath) {
        profileLogoPath = await handleDownloadImage(data.user?.company?.theme?.logoMarkPath)
      }
      updateUserLogoMark(profileLogoPath)
    } catch (error: any) {
      elMessage(
        error?.response?.data?.message || 'Erro ao salvar informações!',
        elementTypesEnum.ERROR
      )
    } finally {
      loading.close()
    }
  }

  const handleSaveUserInfo = async (userId: string, newUserData: IUpdateUser): Promise<void> => {
    const loading = elLoading('Salvando novas informações...')
    try {
      await updateUser(userId, newUserData)

      await handleRefreshUserData()

      elMessage('Informações salvas com sucesso!', elementTypesEnum.SUCCESS)
    } catch (error: any) {
      elMessage(
        error?.response?.data?.message || 'Erro ao salvar informações!',
        elementTypesEnum.ERROR
      )
    } finally {
      loading.close()
    }
  }

  const handleSaveTheme = async (themeData: {
    color: string
    radioTheme?: string
    logoMarkPath?: File | 'undefined'
  }) => {
    const loading = elLoading('Alterando tema...')
    try {
      const company = userData?.company
      const { color, radioTheme, logoMarkPath } = themeData

      if (company?.theme) {
        const { data } = await updateCompanyTheme(company?.theme?.id, color, logoMarkPath)

        const newUserData = {
          ...userData,
          company: {
            ...userData.company,
            theme: { ...data },
          },
        }

        saveDataOnStore('userData', newUserData)
      } else {
        const { data } = await saveCompanyTheme(company?.id as string, color)

        const newUserData = {
          ...userData,
          company: {
            ...userData.company,
            theme: {
              color: data.color,
              id: data.id,
              logoMarkPath: data.logoMarkPath,
            },
          },
        }

        saveDataOnStore('userData', newUserData)
      }

      if (radioTheme === 'light') {
        isDark.value = false
      } else if (radioTheme === 'dark') {
        isDark.value = true
      } else if (radioTheme === 'auto') {
        isDark.value = preferredDark.value
      }

      handleChangeGlobalTheme(color)

      await handleRefreshUserData()

      elMessage('Tema alterado com sucesso!', elementTypesEnum.SUCCESS)
    } catch (error) {
      elMessage('Houve um erro ao trocar o tema!', elementTypesEnum.ERROR)
    } finally {
      loading.close()
    }
  }
</script>

<style scoped lang="scss" src="./style.scss"></style>
