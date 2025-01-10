<template>
  <div class="container">
    <h2>Editar informações de perfil</h2>

    <div class="drawer-user-content">
      <el-form :model="form" class="user-form" ref="formRef" label-position="top" :rules="rules">
        <div class="image-upload-container">
          <div class="photo-container">
            <p>Foto</p>
            <UploadImage :default-image="userProfileImage || emptyImage" @onCrop="handleNewImage" />
          </div>
        </div>

        <el-divider class="divider" />

        <el-form-item label="Nome do usuário" prop="name">
          <el-input v-model="form.name" placeholder="Adicione um nome para o usuário" />
        </el-form-item>
        <el-form-item label="Email" prop="email">
          <el-input v-model="form.email" placeholder="Adicione um email para o usuário" />
        </el-form-item>
      </el-form>
      <el-button type="primary" :disabled="!isModified" @click="handleOpenModal()">
        Salvar informações
      </el-button>
    </div>

    <AppModal
      modal-width="410px"
      :show="showModal"
      :showFooterButtons="true"
      title="Alterar informações do usuário"
      @on-submit="handleSubmitForm(formRef)"
      @on-close="handleCloseModal"
    >
      <div class="modal-content">
        <h2>Deseja realmente alterar as informaçòes do usuário?</h2>
      </div>
    </AppModal>
  </div>
</template>

<script lang="ts" setup>
  import { reactive, ref, watch } from 'vue'
  import { onMounted } from 'vue'
  import { handleVerifyEmail } from '@/composables/formValidators'
  import { useAuthStore } from '@/stores/authStore'
  import type { FormInstance, FormRules } from 'element-plus'
  import type { IUpdateUser } from '@/interfaces/IUser'
  import _ from 'lodash'
  import UploadImage from '@/components/UploadImage/UploadImage.vue'
  import emptyImage from '@/assets/emptyUserAvatar.png'
  import AppModal from '@/components/AppModal/AppModal.vue'

  interface IForm {
    name: string
    email: string
  }

  const { userData, userProfileImage } = useAuthStore()

  const emits = defineEmits<{
    'onSubmit:info': [string, IUpdateUser]
    'onSubmit:logo': [{ color: string; radioTheme?: string; logoMarkPath?: File }]
  }>()

  const formRef = ref<FormInstance>()
  const initialFormData = ref<IForm>()
  const isModified = ref(false)
  const form = reactive<IForm>({
    name: '',
    email: '',
  })
  const rules = reactive<FormRules<IForm>>({
    name: [{ required: true, message: 'Informe um nome', trigger: 'change' }],
    email: [
      { required: true, message: 'Informe um email', trigger: 'change' },
      { validator: handleVerifyEmail, trigger: 'change' },
    ],
  })

  const showModal = ref<boolean>(false)
  const imageFile = ref<File | 'undefined' | undefined>()

  const handleNewImage = (newImage: File | 'undefined') => {
    imageFile.value = newImage
    handleSubmitForm(formRef.value)
  }

  const handleSubmitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return

    const formattedData: IUpdateUser = {
      name: form.name,
      email: form.email,
    }

    if (imageFile.value) {
      formattedData.picturePath = imageFile.value
    }

    await formEl
      .validate(() => {
        emits('onSubmit:info', userData.id, formattedData)
      })
      .then(() => {
        handleCloseModal()
      })
  }

  const handleOpenModal = (): void => {
    showModal.value = true
  }

  const handleCloseModal = (): void => {
    showModal.value = false
  }

  watch(
    form,
    (newFormData) => {
      isModified.value = !_.isEqual(newFormData, initialFormData.value)
    },
    { deep: true }
  )

  onMounted(() => {
    if (userData) {
      const initialData = {
        name: userData.name,
        email: userData.email,
      }

      initialFormData.value = _.cloneDeep(initialData)

      form.name = initialData.name
      form.email = initialData.email
    }
  })
</script>

<style scoped lang="scss" src="./style.scss"></style>
