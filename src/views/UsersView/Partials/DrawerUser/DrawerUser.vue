<template>
  <AppDrawer
    :show="show"
    :title="`${isNewModel ? 'Novo' : 'Editar'} usuário`"
    :isFormModified="isModified"
    cancel-btn-label="Cancelar ação"
    submit-btn-label="Salvar"
    @onSubmit="handleSubmitForm(ruleUserFormRef)"
  >
    <div class="drawer-user-content">
      <el-form
        :model="form"
        class="user-form"
        ref="ruleUserFormRef"
        label-position="top"
        :rules="rules"
      >
        <el-form-item label="Nome do usuário" prop="name">
          <el-input v-model="form.name" placeholder="Adicione um nome para o usuário" />
        </el-form-item>
        <el-form-item label="Email" prop="email">
          <el-input v-model="form.email" placeholder="Adicione um email para o usuário" />
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
        <el-form-item label="Permissão" prop="permission">
          <AppSelect
            class="data-type-select"
            clearable
            :options="permissionOptions"
            v-model="form.permission"
            placeholder="Selecione a permissão do usuário"
          ></AppSelect>
        </el-form-item>
        <UploadImage
          :default-image="currentUser?.profileImage || emptyImage"
          @onCrop="handleNewImage"
        />
      </el-form>
    </div>
  </AppDrawer>
</template>

<script setup lang="ts">
  import { reactive, ref, watch } from 'vue'
  import _ from 'lodash'
  import AppDrawer from '@/components/AppDrawer/AppDrawer.vue'
  import AppSelect from '@/components/AppSelect/AppSelect.vue'
  import UploadImage from '@/components/UploadImage/UploadImage.vue'
  import emptyImage from '@/assets/emptyUserAvatar.png'
  import type { INewUser, IUpdateUser, IUser } from '@/interfaces/IUser'
  import type { ISelectOption } from '@/interfaces/ISelect'
  import type { FormInstance, FormRules } from 'element-plus'

  import {
    handleVerifyEmail,
    handleVerifyPassword,
    handleVerifyConfirmPassword,
  } from '@/composables/formValidators'

  interface IForm {
    name: string
    email: string
    password: string
    permission: string
    confirmPassword: string
  }

  const props = defineProps<{
    show: boolean
    currentUser: IUser | null
    permissionOptions: Array<ISelectOption>
  }>()

  const emits = defineEmits<{
    'onSubmit:edit': [string, IUpdateUser]
    'onSubmit:save': [INewUser]
  }>()

  const initialFormData = ref<IForm>()
  const isModified = ref(false)
  const editId = ref<string>('')
  const isNewModel = ref<boolean>(true)
  const ruleUserFormRef = ref<FormInstance>()
  const imageFile = ref<File | undefined>()

  const form = reactive<IForm>({
    name: '',
    email: '',
    password: '',
    permission: '',
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
    permission: [{ required: true, message: 'Informe uma permissão', trigger: 'change' }],
  })

  const handleNewImage = (newImage: File) => {
    imageFile.value = newImage
  }

  const handleSubmitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate((valid, fields) => {
      if (valid) {
        isNewModel.value
          ? emits('onSubmit:save', {
              name: form.name,
              email: form.email,
              group: form.permission,
              password: form.password,
              picturePath: imageFile.value,
            })
          : emits('onSubmit:edit', editId.value, {
              name: form.name,
              email: form.email,
              group: form.permission,
              picturePath: imageFile.value,
            })
      }
    })
  }

  watch(
    () => props.show,
    () => {
      isNewModel.value = !props.currentUser
      imageFile.value = undefined

      if (ruleUserFormRef.value) {
        ruleUserFormRef.value.resetFields()
        form.name = ''
        form.email = ''
        form.password = ''
        form.permission = ''
        form.confirmPassword = ''
      }

      if (props.currentUser) {
        const initialData = {
          name: props.currentUser.name,
          email: props.currentUser.email,
          permission: props.currentUser.group.id,
          password: '',
          confirmPassword: '',
        }

        initialFormData.value = _.cloneDeep(initialData)

        form.name = initialData.name
        form.email = initialData.email
        form.permission = initialData.permission

        editId.value = props.currentUser.id
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
