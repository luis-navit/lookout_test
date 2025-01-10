<template>
  <div class="forget-container">
    <div class="forget__header">
      <span class="title--md">
        {{ isSuccess ? 'E-mail de redefinição de senha enviado!' : 'Redefinir sua senha' }}
      </span>
      <span class="word-wrapper subtitle--md">
        {{
          isSuccess
            ? 'Verifique seu e-mail para obter um link para redefinir sua senha. Se não aparecer em alguns minutos, verifique sua pasta de spam.'
            : 'Por favor, forneça o endereço de e-mail associado à sua conta de usuário, devidamente verificado. Após a confirmação, enviaremos um link para a redefinição de senha.'
        }}
      </span>
    </div>
    <div class="forget__body">
      <el-form
        v-if="!isSuccess"
        ref="forgetFormRef"
        class="form-container"
        label-position="top"
        :model="form"
        :rules="rules"
        v-on:submit.prevent
      >
        <el-form-item label="E-mail" prop="email">
          <el-input-text
            v-model="form.email"
            clearable
            placeholder="Informe seu melhor email!"
            @keyup.enter.prevent="handleSubmit(forgetFormRef)"
          />
        </el-form-item>
      </el-form>
    </div>
    <div class="forget__footer">
      <el-button
        v-if="!isSuccess"
        class="grow"
        type="primary"
        round
        :loading="isLoading"
        @click="handleSubmit(forgetFormRef)"
      >
        Enviar e-mail de redefinição de senha
      </el-button>
      <el-button class="grow" :type="isSuccess ? 'primary' : ''" round @click="handleBack">
        Voltar para a tela de login
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import { handleVerifyEmail } from '@/composables/formValidators'

  interface IForm {
    email: string
  }

  defineProps<{
    isSuccess: boolean
    isLoading: boolean
  }>()

  const emits = defineEmits<{
    onCancelForget: []
    onSubmitForget: [string]
  }>()

  const forgetFormRef = ref<FormInstance>()
  const form = reactive<IForm>({
    email: '',
  })
  const rules = reactive<FormRules<IForm>>({
    email: [
      {
        required: true,
        message: 'Por favor, informe um e-mail válido.',
        trigger: 'blur',
      },
      { validator: handleVerifyEmail, trigger: 'change' },
    ],
  })

  const handleSubmit = async (formEl: FormInstance | undefined) => {
    if (!formEl) return

    await formEl.validate((valid, fields) => {
      if (valid) {
        emits('onSubmitForget', form.email)
      }
    })
  }

  const handleBack = () => {
    emits('onCancelForget')
  }
</script>

<style scoped lang="scss" src="./style.scss"></style>
