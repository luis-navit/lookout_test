<template>
  <div class="previsualization-container border-color--neutral" @click="handleSetTheme">
    <el-skeleton
      style="--el-skeleton-circle-size: 100px"
      :class="props.isDarkMode ? 'dark-mode' : 'light-mode'"
    >
      <template #template>
        <div class="skeleton-container border-color--neutral">
          <el-skeleton-item
            variant="h1"
            class="border-radius-top"
            :class="props.color ? 'custom-background-primary' : 'background--primary'"
          />
          <div class="skeleton-content">
            <section class="side-bar border-color--neutral">
              <el-skeleton-item
                variant="h1"
                :class="props.color ? 'custom-background-primary' : 'background--primary'"
              />
              <el-skeleton-item
                variant="text"
                :class="props.isDarkMode ? 'skeleton-dark' : 'skeleton-light'"
              />
              <el-skeleton-item
                variant="text"
                :class="props.isDarkMode ? 'skeleton-dark' : 'skeleton-light'"
              />
              <el-skeleton-item
                variant="text"
                :class="props.isDarkMode ? 'skeleton-dark' : 'skeleton-light'"
              />
            </section>

            <div class="main-content">
              <div>
                <el-skeleton-item
                  variant="h1"
                  :class="props.isDarkMode ? 'skeleton-dark' : 'skeleton-light'"
                />
                <el-skeleton-item
                  variant="text"
                  :class="props.isDarkMode ? 'skeleton-dark' : 'skeleton-light'"
                />
                <el-skeleton-item
                  variant="text"
                  :class="props.isDarkMode ? 'skeleton-dark' : 'skeleton-light'"
                />
                <el-skeleton-item
                  variant="text"
                  :class="props.isDarkMode ? 'skeleton-dark' : 'skeleton-light'"
                />
              </div>

              <div>
                <el-skeleton-item
                  variant="h1"
                  :class="props.color ? 'custom-background-primary' : 'background--primary'"
                />
                <el-skeleton-item
                  variant="h1"
                  :class="props.color ? 'custom-background-secondary' : 'background--secondary'"
                />
              </div>
            </div>
          </div>
          <el-skeleton-item
            variant="h1"
            class="border-radius-bottom"
            :class="props.isDarkMode ? 'skeleton-dark' : 'skeleton-light'"
          />
        </div>
      </template>
    </el-skeleton>
    <h2>
      {{ props.label || 'Pré visualização do tema' }}
      <el-icon v-if="isSelectedTheme" size="25" color="green">
        <CircleCheck />
      </el-icon>
    </h2>
  </div>
</template>

<script lang="ts" setup>
  import { ref, watch } from 'vue'
  import { useDark } from '@vueuse/core'
  import { handleFileToBase64, handleGenerateSecondaryColorFromPrimary } from '@/composables/utils'
  import { elLoading, elMessage } from '@/composables/element'
  import { useAuthStore } from '@/stores/authStore'
  import { saveCompanyTheme, updateCompanyTheme } from '@/services/themes'
  import { elementTypesEnum } from '@/enums/elementTypesEnum'
  import { handleChangeGlobalTheme } from '@/composables/globalTheme'
  import { fetchRefreshToken } from '@/services/auth'
  import { downloadImage } from '@/services/files'
  import type { IUser } from '@/interfaces/IUser'

  const authStore = useAuthStore()

  const props = withDefaults(
    defineProps<{
      isDarkMode: boolean
      setTheme?: boolean
      label?: string
      color?: string
      isSelectedTheme?: boolean
    }>(),
    {
      isDarkMode: false,
      setTheme: false,
      isSelectedTheme: false,
    }
  )

  const isDark = useDark()

  const handleCheckIfThemeIsSelected = (updatedData?: IUser) =>
    (updatedData || authStore.userData)?.company?.theme?.color === props.color &&
    isDark.value === props.isDarkMode

  const secondaryColor = ref(
    props.color ? handleGenerateSecondaryColorFromPrimary(props.color) : null
  )
  const isSelectedTheme = ref(handleCheckIfThemeIsSelected())

  const handleToggleDarkMode = () => {
    if (!isDark.value && props.isDarkMode) {
      isDark.value = true
    } else if (isDark.value && !props.isDarkMode) {
      isDark.value = false
    }
  }

  const handleDownloadImage = async (path: string): Promise<string> => {
    const { data, headers } = await downloadImage(path)
    const fileType = headers['Content-Type'] as string

    return handleFileToBase64(data, fileType)
  }

  const handleSetTheme = async () => {
    if (props.setTheme) {
      const loading = elLoading('Alterando tema...')
      try {
        const company = authStore.userData?.company
        let profileImage = ''
        let profileLogoPath = ''

        handleChangeGlobalTheme(props.color)

        company?.theme
          ? await updateCompanyTheme(company.theme.id, props.color as string)
          : await saveCompanyTheme(company?.id as string, props.color as string)

        handleToggleDarkMode()

        const { data } = await fetchRefreshToken(authStore.refreshToken)
        authStore.updateUserData(data)

        if (data.user?.picturePath) {
          profileImage = await handleDownloadImage(data.user?.picturePath)
        }
        authStore.updateUserImage(profileImage)

        if (data.user?.company?.theme?.logoMarkPath) {
          profileLogoPath = await handleDownloadImage(data.user?.company?.theme?.logoMarkPath)
        }

        authStore.updateUserLogoMark(profileLogoPath)

        elMessage('Tema alterado com sucesso!', elementTypesEnum.SUCCESS)
      } catch (error) {
        elMessage('Houve um erro ao trocar o tema!', elementTypesEnum.ERROR)
      } finally {
        loading.close()
      }
    }
  }

  watch(
    () => props.color,
    () => {
      secondaryColor.value = props.color
        ? handleGenerateSecondaryColorFromPrimary(props.color)
        : null
    },
    {
      deep: true,
      immediate: true,
    }
  )

  watch(
    () => authStore.userData,
    () => {
      isSelectedTheme.value =
        authStore.userData?.company?.theme?.color === props.color &&
        isDark.value === props.isDarkMode
    },
    { deep: true, immediate: true }
  )
</script>

<style scoped>
  h2 {
    width: 100%;
    margin: 0.5rem 0;

    font-size: 1.25rem;
    font-weight: 600;
    text-align: left;
    color: #606266;

    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .custom-background-primary {
    background-color: v-bind('props.color') !important;
  }
  .custom-background-secondary {
    background-color: v-bind('secondaryColor') !important;
  }

  .previsualization-container {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-direction: column;
    width: 100%;

    padding: 1.5rem 1.5rem 0.5rem 1.5rem;

    border-width: 2px;
    border-style: solid;
    border-radius: 8px;

    cursor: v-bind("props.setTheme ? 'pointer' : 'normal'") !important;
  }

  .skeleton-container {
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    border-width: 2px;
    border-style: solid;
    border-radius: 8px;
  }

  .skeleton-content {
    display: grid;
    grid-template-columns: 20% 1fr;
    height: 150px;
  }

  .side-bar {
    border-right-width: 2px;
    border-right-style: solid;
    padding: 12px;
  }

  .main-content {
    padding: 12px;

    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .border-radius-top {
    border-radius: 8px 8px 0 0;
  }

  .border-radius-bottom {
    border-radius: 0 0 8px 8px;
  }

  .light-mode {
    background-color: #ffffff !important;
    border-radius: 8px;
  }

  .skeleton-light {
    background-color: #f0f2f5 !important;
  }

  .dark-mode {
    background-color: #121212 !important;
    border-radius: 8px;
  }

  .skeleton-dark {
    background-color: #303030 !important;
  }
</style>
