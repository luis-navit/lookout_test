<template>
  <div class="reset-container">
    <div class="title-container">
      <img src="@/assets/logo.svg" alt="" />
      <span class="subtitle--md">A maneira fácil de obter insights em tempo real.</span>
    </div>
    <div class="password-form-container">
      <span class="form__title title--md">Alterar senha</span>
      <el-form
        ref="resetFormRef"
        class="form-container"
        label-position="top"
        :model="form"
        :rules="rules"
        v-on:submit.prevent
      >
        <el-form-item label="Senha" prop="password">
          <el-input
            v-model="form.password"
            clearable
            show-password
            type="password"
            placeholder="Nova senha"
          />
        </el-form-item>
        <el-form-item label="Confirme a senha" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            clearable
            show-password
            type="password"
            placeholder="Repita a senha"
          />
        </el-form-item>
      </el-form>
      <div class="password-form__footer">
        <el-button
          class="grow"
          type="primary"
          :disabled="!isModified"
          round
          @click="handleSubmit(resetFormRef)"
        >
          Alterar senha
        </el-button>
        <el-button class="grow" round @click="handleBack"> Voltar para a tela de login </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import _ from 'lodash'
  import { elLoading, elMessage } from '@/composables/element'
  import { elementTypesEnum } from '@/enums/elementTypesEnum'
  import { updatePassword } from '@/services/resetPassword'
  import { onMounted, reactive, ref, watch } from 'vue'
  import { useRoute, useRouter, type RouteLocationNormalizedLoaded } from 'vue-router'
  import type { FormInstance, FormRules } from 'element-plus'

  interface IForm {
    password: string
    confirmPassword: string
  }

  interface IQueryParams {
    token: string
  }

  const route = useRoute()
  const router = useRouter()
  const resetFormRef = ref<FormInstance>()
  const queryParams = ref<IQueryParams>({ token: '' })
  const initialFormData = ref<IForm>({
    password: '',
    confirmPassword: '',
  })
  const isModified = ref(false)
  const form = reactive<IForm>({
    password: '',
    confirmPassword: '',
  })

  const handlePasswordValidator = (rule: any, value: string, callback: any): void => {
    if (form.password !== form.confirmPassword) {
      callback(new Error('Informações da senha estão diferentes'))
    } else {
      callback()
    }
  }

  const rules = reactive<FormRules<IForm>>({
    password: [
      {
        required: true,
        message: 'Você deve preencher as informações solicitadas para alterar a senha!',
        trigger: 'blur',
      },
      {
        required: true,
        trigger: 'change',
        validator: handlePasswordValidator,
      },
    ],
    confirmPassword: [
      {
        required: true,
        message: 'Você deve preencher as informações solicitadas para alterar a senha!',
        trigger: 'blur',
      },
      {
        required: true,
        trigger: 'change',
        validator: handlePasswordValidator,
      },
    ],
  })

  const handleBack = (): void => {
    router.push({ path: '/login' })
  }

  const handleQueryData = (): void => {
    const { query } = route as RouteLocationNormalizedLoaded & { query: IQueryParams }
    queryParams.value = query
  }

  const handleUpdatePassword = async (): Promise<void> => {
    const loading = elLoading('Redefinindo senha...')
    try {
      await updatePassword(form.password, queryParams.value.token)
      router.push('HomeView')
    } catch (error: any) {
      elMessage('Ocorreu um erro ao redefinir a senha.', elementTypesEnum.ERROR)
    } finally {
      loading.close()
    }
  }

  const handleSubmit = async (formEl: FormInstance | undefined) => {
    if (!formEl) return

    await formEl.validate((valid, fields) => {
      if (valid) handleUpdatePassword()
    })
  }

  watch(
    form,
    (newFormData) => {
      isModified.value = !_.isEqual(newFormData, initialFormData.value)
    },
    { deep: true }
  )

  onMounted(() => {
    handleQueryData()
  })
</script>

<style scoped lang="scss" src="./style.scss"></style>
