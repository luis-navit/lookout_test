<template>
  <div class="view-wrapper">
    <div class="view-container">
      <section class="login-container">
        <div class="title-container">
          <img src="@/assets/logo.svg" alt="" />
          <span class="subtitle--md">A maneira fácil de obter insights em tempo real.</span>
        </div>
        <div v-if="!isForget" class="form-wrapper">
          <span class="title--md">Entre com o seu melhor email</span>
          <el-form class="form-container" ref="loginFormRef" :model="form" :rules="rules">
            <el-form-item prop="email">
              <el-input
                v-model="form.email"
                clearable
                placeholder="Informe seu melhor email!"
                @keyup.enter="handleSubmitLogin(loginFormRef)"
              />
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-model="form.password"
                clearable
                show-password
                type="password"
                placeholder="******"
                @keyup.enter="handleSubmitLogin(loginFormRef)"
              />
            </el-form-item>
            <div class="forget-password-container">
              <el-button class="color--secondary" type="primary" link @click="handleForgetEmail">
                Esqueceu sua senha?
              </el-button>
              <el-checkbox
                class="custom-checkbox"
                v-model="form.rememberMe"
                label="Lembre-se de mim"
              />
            </div>
            <el-form-item>
              <el-button
                class="submit-btn"
                type="primary"
                round
                @click="handleSubmitLogin(loginFormRef)"
              >
                Fazer login
              </el-button>
            </el-form-item>
          </el-form>
        </div>
        <div class="forget-wrapper" v-if="isForget">
          <ForgetForm
            :isLoading="isForgetLoading"
            :isSuccess="isForgetSuccess"
            @onCancelForget="handleCancelForget"
            @onSubmitForget="handleSubmitForget"
          />
        </div>
      </section>
      <section v-if="!isForget" class="banner-container">
        <img class="application-img" src="@/assets/application.svg" alt="application" />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import type { ILogin } from '@/interfaces/ILogin'
  import type { ICompany } from '@/interfaces/ICompany'
  import type { FormInstance, FormRules } from 'element-plus'
  import { elementTypesEnum } from '@/enums/elementTypesEnum'
  import { useAuthStore } from '@/stores/authStore'
  import { fetchLogin } from '@/services/auth'
  import { elLoading, elMessage } from '@/composables/element'
  import { downloadImage } from '@/services/files'
  import { handleFileToBase64, handlePermissions, handleProfile } from '@/composables/utils'
  import ForgetForm from './Partials/ForgetForm/ForgetForm.vue'
  import { resetPassword } from '@/services/resetPassword'
  import { handleChangeGlobalTheme } from '@/composables/globalTheme'

  const authStore = useAuthStore()
  const router = useRouter()

  interface IForm {
    email: string
    password: string
    rememberMe: boolean
  }

  const loginFormRef = ref<FormInstance>()
  const isForget = ref<boolean>(false)
  const isForgetLoading = ref<boolean>(false)
  const isForgetSuccess = ref<boolean>(false)
  const form = reactive<IForm>({
    email: '',
    password: '',
    rememberMe: false,
  })

  const rules = reactive<FormRules<IForm>>({
    email: [{ required: true, message: 'Por favor, informe um e-mail válido.', trigger: 'blur' }],
    password: [
      {
        required: true,
        message: 'Por favor, informe uma senha.',
        trigger: 'blur',
      },
    ],
  })

  const handleForgetEmail = (): void => {
    isForget.value = true
    isForgetSuccess.value = false
  }

  const handleCancelForget = (): void => {
    isForget.value = false
  }

  const handleSubmitForget = async (email: string): Promise<void> => {
    isForgetLoading.value = true
    try {
      await resetPassword(email)
      isForgetSuccess.value = true
    } catch (error: any) {
      elMessage('Ocorreu um erro ao enviar o e-mail.', elementTypesEnum.ERROR)
      isForgetSuccess.value = false
    } finally {
      isForgetLoading.value = false
    }
  }

  const handleSubmitLogin = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate((valid, fields) => {
      if (valid) handlerLogin()
    })
  }

  const handleDownloadImage = async (path: string): Promise<string> => {
    const { data, headers } = await downloadImage(path)
    const fileType = headers['Content-Type'] as string

    return handleFileToBase64(data, fileType)
  }

  const handleLogin = async (
    email: string,
    password: string,
    rememberMe: boolean
  ): Promise<ILogin> => {
    const { data } = await fetchLogin(email, password, rememberMe)

    const userThemeColor = data.user.company?.theme?.color

    handleChangeGlobalTheme(userThemeColor)

    return data
  }

  const handlerLogin = async (): Promise<void> => {
    const loading = elLoading('Fazendo login...')
    try {
      const loginData = await handleLogin(form.email, form.password, form.rememberMe)
      const permissions = handlePermissions(loginData.user.permissions || [])
      const profile = handleProfile(loginData.user.group, loginData.user.company as ICompany)
      let profileImage = ''
      let profileLogoPath = ''

      authStore.login(loginData, profile, permissions, form.rememberMe)

      if (loginData.user?.picturePath) {
        profileImage = await handleDownloadImage(loginData.user?.picturePath)
      }
      authStore.updateUserImage(profileImage)

      if (loginData.user?.company?.theme?.logoMarkPath) {
        profileLogoPath = await handleDownloadImage(loginData.user?.company?.theme?.logoMarkPath)
      }
      authStore.updateUserLogoMark(profileLogoPath)

      router.push({ path: '/' })
    } catch (error: any) {
      elMessage(
        'Credenciais incorretas. Por favor, verifique seu e-mail e senha.',
        elementTypesEnum.ERROR
      )
    } finally {
      loading.close()
    }
  }
</script>

<style scoped lang="scss" src="./style.scss"></style>
