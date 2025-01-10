<template>
  <AppDrawer
    :show="show"
    :title="`${isNewModel ? 'Nova' : 'Editar'} empresa`"
    :isFormModified="isModified"
    cancel-btn-label="Cancelar ação"
    submit-btn-label="Salvar"
    @onSubmit="handleSubmitForm(formRef)"
  >
    <div class="drawer-user-content">
      <el-form :model="form" class="user-form" ref="formRef" label-position="top" :rules="rules">
        <el-form-item label="Nome da empresa" prop="name">
          <el-input v-model="form.name" placeholder="Informe o nome da empresa" />
        </el-form-item>
        <el-form-item label="CNPJ" prop="cnpj">
          <el-input
            v-model="form.cnpj"
            v-mask="'##.###.###/####-##'"
            placeholder="Informe o CNPJ da empresa"
            :maxlength="18"
          />
        </el-form-item>
        <el-form-item label="Email" prop="email">
          <el-input v-model="form.email" placeholder="Informe um e-mail" />
        </el-form-item>
        <el-form-item v-if="isNewModel" label="Senha" prop="password">
          <el-input
            v-model="form.password"
            clearable
            show-password
            type="password"
            placeholder="Adicione uma senha para o usuário"
          />
        </el-form-item>
        <el-form-item v-if="isNewModel" label="Confirme a senha" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            clearable
            show-password
            type="password"
            placeholder="Adicione uma senha para o usuário"
          />
        </el-form-item>
      </el-form>
    </div>
  </AppDrawer>
</template>

<script setup lang="ts">
  import { reactive, ref, watch } from 'vue'
  import AppDrawer from '@/components/AppDrawer/AppDrawer.vue'
  import _ from 'lodash'
  import type { ISelectOption } from '@/interfaces/ISelect'
  import type { FormInstance, FormRules } from 'element-plus'

  import {
    handleVerifyEmail,
    handleVerifyPassword,
    handleVerifyConfirmPassword,
  } from '@/composables/formValidators'
  import type { ICompany, INewCompany, IUpdateCompany } from '@/interfaces/ICompany'

  interface IForm {
    name: string
    cnpj: string
    email: string
    password: string
    confirmPassword: string
  }

  const props = defineProps<{
    show: boolean
    currentCompany: ICompany | null
    permissionOptions: Array<ISelectOption>
  }>()

  const emits = defineEmits<{
    'onSubmit:edit': [string, IUpdateCompany]
    'onSubmit:save': [INewCompany]
  }>()

  const editId = ref<string>('')
  const isNewModel = ref<boolean>(true)
  const formRef = ref<FormInstance>()
  const initialFormData = ref<IForm>()
  const isModified = ref(false)

  const form = reactive<IForm>({
    name: '',
    cnpj: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const rules = reactive<FormRules<IForm>>({
    name: [{ required: true, message: 'Informe um nome', trigger: 'change' }],
    email: [
      { required: true, message: 'Informe um email', trigger: 'change' },
      { validator: handleVerifyEmail, trigger: 'change' },
    ],
    password: [
      { required: true, message: 'Informe uma senha', trigger: 'change' },
      { validator: handleVerifyPassword, trigger: 'change' },
    ],
    confirmPassword: [
      { required: true, message: 'Informe uma senha', trigger: 'change' },
      {
        validator: (rule: any, password: string, callback: any) =>
          handleVerifyConfirmPassword(form.password, rule, password, callback),
        trigger: 'change',
      },
    ],
    cnpj: [{ required: true, message: 'Informe um CNPJ', trigger: 'change' }],
  })

  const handleSubmitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate((valid, fields) => {
      if (valid) {
        isNewModel.value
          ? emits('onSubmit:save', {
              name: form.name,
              cnpj: form.cnpj,
              master: {
                email: form.email,
                password: form.password,
              },
            })
          : emits('onSubmit:edit', editId.value, {
              name: form.name,
              cnpj: form.cnpj,
              active: props.currentCompany?.active as boolean,
              master: {
                email: form.email,
              },
            })
      }
    })
  }

  watch(
    () => props.show,
    () => {
      isNewModel.value = !props.currentCompany

      if (formRef.value) {
        formRef.value.resetFields()
        form.name = ''
        form.email = ''
        form.password = ''
        form.confirmPassword = ''
      }

      if (props.currentCompany) {
        const initialData = {
          name: props.currentCompany.name,
          cnpj: props.currentCompany.cnpj,
          email: props.currentCompany.master.email,
          password: '',
          confirmPassword: '',
        }

        form.name = initialData.name
        form.cnpj = initialData.cnpj
        form.email = initialData.email

        initialFormData.value = _.cloneDeep(initialData)

        editId.value = props.currentCompany.id
      }
    },
    { deep: true }
  )

  watch(
    form,
    (newFormData) => {
      isModified.value = !_.isEqual(newFormData, initialFormData.value)
    },
    { deep: true }
  )
</script>

<style scoped lang="scss" src="./style.scss"></style>
