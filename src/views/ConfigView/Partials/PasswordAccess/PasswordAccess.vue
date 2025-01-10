<template>
  <div class="container">
    <h2>Editar senha de acesso</h2>

    <div class="drawer-user-content">
      <el-form :model="form" class="user-form" ref="formRef" label-position="top" :rules="rules">
        <el-form-item label="Senha atual" prop="oldPassword">
          <el-input
            v-model="form.oldPassword"
            clearable
            show-password
            type="password"
            placeholder="*************************"
          />
        </el-form-item>
        <el-form-item label="Nova senha" prop="password">
          <el-input
            v-model="form.password"
            clearable
            show-password
            type="password"
            placeholder="*************************"
          />
        </el-form-item>
        <el-form-item label="Confirme a nova senha" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            clearable
            show-password
            type="password"
            placeholder="*************************"
          />
        </el-form-item>
      </el-form>
      <el-button type="primary" :disabled="!isModified" @click="handleSubmitForm(formRef)"
        >Salvar senha
      </el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { reactive, ref, watch } from 'vue'
  import { handleVerifyConfirmPassword, handleVerifyPassword } from '@/composables/formValidators'
  import { useAuthStore } from '@/stores/authStore'
  import _ from 'lodash'
  import type { FormInstance, FormRules } from 'element-plus'
  import type { IUpdateUser } from '@/interfaces/IUser'

  interface IForm {
    oldPassword: string
    password: string
    confirmPassword: string
  }

  const { userData } = useAuthStore()

  const emits = defineEmits<{
    onSubmit: [string, IUpdateUser]
  }>()

  const formRef = ref<FormInstance>()
  const initialFormData = ref<IForm>({
    oldPassword: '',
    password: '',
    confirmPassword: '',
  })
  const isModified = ref(false)
  const form = reactive<IForm>({
    oldPassword: '',
    password: '',
    confirmPassword: '',
  })
  const rules = reactive<FormRules<IForm>>({
    oldPassword: [
      { required: true, message: 'Informe a senha atual', trigger: 'change' },
      { validator: handleVerifyPassword, trigger: 'change' },
    ],
    password: [
      { required: true, message: 'Informe a nova senha', trigger: 'change' },
      { validator: handleVerifyPassword, trigger: 'change' },
    ],
    confirmPassword: [
      { required: true, message: 'Repita a nova senha', trigger: 'change' },
      {
        validator: (rule: any, password: string, callback: any) =>
          handleVerifyConfirmPassword(form.password, rule, password, callback),
        trigger: 'change',
      },
    ],
  })

  const handleSubmitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return

    await formEl.validate((valid) => {
      if (valid) {
        emits('onSubmit', userData.id, {
          name: userData.name,
          password: form.oldPassword,
          newPassword: form.password,
        })
      }
    })
  }

  watch(
    form,
    (newFormData) => {
      isModified.value = !_.isEqual(newFormData, initialFormData.value)
    },
    { deep: true }
  )
</script>

<style scoped lang="scss" src="./style.scss"></style>
