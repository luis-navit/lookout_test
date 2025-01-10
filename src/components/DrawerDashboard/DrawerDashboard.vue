<template>
  <AppDrawer
    :show="showDrawer"
    :title="isNewDashboard ? 'Adicionar novo dashboard' : 'Editar dashboard'"
    :submit-btn-label="`Salvar ${isNewDashboard ? 'dashboard' : 'edição'}`"
    :isFormModified="isModified"
    cancel-btn-label="Cancelar ação"
    @onSubmit="handleSubmitForm(dashboardFormRef)"
  >
    <el-form
      :model="form"
      class="regress-form"
      ref="dashboardFormRef"
      label-position="top"
      :rules="rules"
    >
      <el-form-item label="Nome do dashboard" prop="title">
        <el-input
          v-model="form.title"
          placeholder="Adicione um nome para o dashboard"
          maxlength="250"
        />
      </el-form-item>
      <el-form-item label="Tipo de dados" prop="types">
        <AppSelect
          class="data-type-select"
          multiple
          clearable
          :options="dataTypesOptions"
          v-model="form.types"
          placeholder="Selecione um ou mais tipos de dados"
        ></AppSelect>
      </el-form-item>
      <el-form-item label="Link do dashboard" prop="dashboard">
        <el-input
          :rows="5"
          type="textarea"
          v-model="form.dashboard"
          placeholder="Adicione um nome para o dashboard"
          maxlength="250"
        />
      </el-form-item>
    </el-form>
  </AppDrawer>
</template>

<script setup lang="ts">
  import { reactive, ref, watch } from 'vue'
  import _ from 'lodash'
  import AppDrawer from '@/components/AppDrawer/AppDrawer.vue'
  import AppSelect from '@/components/AppSelect/AppSelect.vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import type { ISelectOption } from '@/interfaces/ISelect'
  import type { IDashboard } from '@/interfaces/IDashboard'

  interface IForm {
    title: string
    dashboard: string
    types: Array<string>
  }

  const props = defineProps<{
    showDrawer: boolean
    dataTypesOptions: Array<ISelectOption>
    currentDashboard: IDashboard | null
  }>()

  const emits = defineEmits<{
    'onSubmit:edit': [IForm, string]
    'onSubmit:save': [IForm]
  }>()

  const editId = ref<string>('')
  const isNewDashboard = ref<boolean>(true)
  const dashboardFormRef = ref<FormInstance>()
  const initialFormData = ref<IForm>()
  const isModified = ref(false)

  const form = reactive<IForm>({
    title: '',
    dashboard: '',
    types: [],
  })

  const rules = reactive<FormRules<IForm>>({
    title: [{ required: true, message: 'Informe um nome para o dashboard', trigger: 'change' }],
    types: [{ required: true, message: 'Informe ao menos um tipo de dado', trigger: 'change' }],
    dashboard: [{ required: true, message: 'Informe o link para o dashboard', trigger: 'change' }],
  })

  const handleSubmitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate((valid) => {
      if (valid) {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        isNewDashboard.value
          ? emits('onSubmit:save', form)
          : emits('onSubmit:edit', form, editId.value)
      }
    })
  }

  watch(
    () => props.currentDashboard,
    (dashboard) => {
      isNewDashboard.value = !dashboard

      if (dashboard) {
        const initialData = {
          title: dashboard.title,
          dashboard: dashboard.dashboard,
          types: dashboard.types.map((item) => item.id),
        }

        initialFormData.value = _.cloneDeep(initialData)

        form.title = initialData.title
        form.dashboard = initialData.dashboard
        form.types = initialData.types

        editId.value = dashboard.id
      }

      if (!dashboard && dashboardFormRef.value) {
        dashboardFormRef.value.resetFields()
        form.title = ''
        form.dashboard = ''
        form.types = []
        editId.value = ''
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
