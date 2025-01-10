<template>
  <div class="themes-view">
    <div class="themes-view__header">
      <HeaderBackTitle
        class="page-title"
        title="Temas"
        subtitle="Personalize a aparência do seu espaço de trabalho"
        :showBackIcon="false"
      />

      <el-button @click="handleSubmit" type="primary" size="large" class="button-radius"
        >Salvar Tema
      </el-button>
    </div>

    <el-collapse class="collapse" style="margin-bottom: 2rem">
      <el-collapse-item name="visual-identity">
        <template #title style="display: flex; flex-direction: column">
          <h2>Identidade visual</h2>
          <br />
          <p class="collapse-subtitle">
            Personalize a identidade visual do seu espaço de trabalho, deixando ainda mais com a sua
            cara
          </p>
        </template>
        <div class="themes-view__section">
          <div class="select-color-container">
            <div>
              <h2>Escolha a identidade visual</h2>
              <p>Escolha a imagem que dará a cara da sua empresa no cabeçalho da aplicação</p>
            </div>

            <div>
              <UploadIdentityImage
                :default-image="authStore.userProfileLogoMark || emptyImage"
                @onCrop="handleNewLogoMark"
              />
            </div>
          </div>

          <div class="theme-previsualization"></div>
        </div>
      </el-collapse-item>
    </el-collapse>

    <el-collapse v-model="activeNames" class="collapse">
      <el-collapse-item name="theme">
        <template #title style="display: flex; flex-direction: column">
          <h2>Personalizar tema</h2>
          <br />
          <p class="collapse-subtitle">
            Personalize a aparência do seu espaço de trabalho de acordo com sua preferência. Quer se
            aventurar?
          </p>
        </template>
        <div class="themes-view__section">
          <div class="select-color-container">
            <div>
              <h2>Escolha o modo</h2>
              <p>
                Escolha o modo claro ou o modo escuro ou siga as configurações do sistema do seu
                computador
              </p>

              <el-radio-group v-model="radioTheme" class="margin-top">
                <el-radio value="light" size="large" border>Claro</el-radio>
                <el-radio value="dark" size="large" border>Escuro</el-radio>
                <el-radio value="auto" size="large" border>Sistema</el-radio>
              </el-radio-group>
            </div>

            <div>
              <h2>Personalize a cor primária</h2>
              <p>Escolha a cor que reflita seu estilo</p>
              <div class="color-picker-container margin-top" @click="handleOpenColorPicker">
                <el-color-picker
                  v-model="color"
                  size="medium"
                  class="color-picker"
                  ref="colorPickerRef"
                  @change="handleSaveColor"
                />
                <p>{{ colorText }}</p>
              </div>
            </div>
          </div>

          <div class="theme-previsualization">
            <div class="theme-previsualization__container">
              <ThemePrevisualization :color="color" :isDarkMode="isDarkMode" />
            </div>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>

    <div class="predefined-themes-list">
      <div class="themes-container" v-for="theme in predefinedThemes" :key="theme.id">
        <ThemePrevisualization
          :key="theme.id"
          :color="theme.color"
          :isDarkMode="false"
          :label="`Tema ${theme.name} light`"
          :setTheme="true"
        />
        <ThemePrevisualization
          :key="theme.id"
          :color="theme.color"
          :isDarkMode="true"
          :label="`Tema ${theme.name} dark`"
          :setTheme="true"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted, ref, watch } from 'vue'
  import { usePreferredDark } from '@vueuse/core'
  import { useAuthStore } from '@/stores/authStore'
  import type { ElColorPicker } from 'element-plus'
  import type { ITheme } from '@/interfaces/IThemes'
  import HeaderBackTitle from '@/components/HeaderBackTitle/HeaderBackTitle.vue'
  import ThemePrevisualization from '@/components/ThemePrevisualization/ThemePrevisualization.vue'
  import UploadIdentityImage from '@/components/UploadIdentityImage/UploadIdentityImage.vue'
  import emptyImage from '@/assets/emptyUserAvatar.png'
  import { getAllPredefinedThemes } from '@/services/themes'

  type SubmitData = {
    color: string
    radioTheme?: string
    logoMarkPath?: File | 'undefined'
  }

  const emits = defineEmits<{
    onSubmit: [SubmitData]
  }>()

  const authStore = useAuthStore()

  const activeNames = ref(['theme'])
  const color = ref<string | undefined>('')
  const radioTheme = ref('light')
  const colorText = ref('Nenhum selecionado')
  const colorPickerRef = ref<InstanceType<typeof ElColorPicker> | null>(null)
  const predefinedThemesIds = ref<string[]>([])
  const logoMarkImage = ref<File | 'undefined' | undefined>()
  const predefinedThemes = ref<ITheme[]>([])

  const isDarkMode = ref(false)
  const preferredDark = usePreferredDark()

  const handleOpenColorPicker = () => {
    if (colorPickerRef.value) {
      colorPickerRef.value.show()
    }
  }

  const handleSaveColor = (newColor: string) => {
    if (newColor === null) {
      colorText.value = 'Nenhum selecionado'
      color.value = undefined
      return
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    color.value, (colorText.value = newColor)
  }
  const handleSubmit = (): void => {
    const data: SubmitData = {
      color: authStore.userData.company?.theme?.color || '#153C78',
      radioTheme: radioTheme.value,
    }

    if (color.value) {
      data.color = color.value as string
    }

    if (logoMarkImage.value) {
      data.logoMarkPath = logoMarkImage.value
    }

    emits('onSubmit', data)
  }

  const handleNewLogoMark = (newImage: File | 'undefined') => {
    logoMarkImage.value = newImage
    handleSubmit()
  }

  const handleGetPredefinedThemes = async (): Promise<void> => {
    const { data } = await getAllPredefinedThemes()

    predefinedThemes.value = data
  }

  watch(
    radioTheme,
    (newTheme) => {
      if (newTheme === 'light') {
        isDarkMode.value = false
      } else if (newTheme === 'dark') {
        isDarkMode.value = true
      } else if (newTheme === 'auto') {
        isDarkMode.value = preferredDark.value
      }
    },
    { immediate: true }
  )

  watch(
    () => predefinedThemes.value,
    (updatedThemes) => {
      predefinedThemesIds.value = updatedThemes.map((theme) => theme.color)
    }
  )

  watch(
    () => [authStore.userData, predefinedThemes.value],
    () => {
      const { userData } = authStore
      const themeColor = userData?.company?.theme?.color

      if (themeColor && predefinedThemes.value.length > 0) {
        const predefinedThemesColors = predefinedThemes.value.map((theme) => theme.color)

        if (predefinedThemesColors.includes(themeColor)) {
          activeNames.value = []
          color.value = ''
          colorText.value = 'Nenhum selecionado'
        } else {
          activeNames.value = ['theme']
          color.value = themeColor
          colorText.value = themeColor
        }
      }
    },
    { immediate: true }
  )

  onMounted(() => {
    handleGetPredefinedThemes()
  })
</script>

<style lang="scss" src="./style.scss"></style>
