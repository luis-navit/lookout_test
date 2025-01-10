<template>
  <AppDrawer
    :show="show"
    :title="`${isNewOS ? 'Adicionar nova ' : 'Editar'} ordem de serviço`"
    :submit-btn-label="`Salvar${isNewOS ? '' : ' edição'}`"
    :isFormModified="isModified"
    cancel-btn-label="Cancelar ação"
    @onSubmit="handleSubmitForm(osFormRef)"
  >
    <div class="drawer-os-content">
      <el-form :model="form" ref="osFormRef" label-position="top" :rules="rules">
        <el-form-item label="Título da OS" prop="activity">
          <el-input v-model="form.activity" placeholder="Adicione um título para a OS" />
        </el-form-item>
        <el-form-item label="Mensagem da OS" prop="description">
          <el-input
            v-model="form.description"
            :rows="3"
            type="textarea"
            placeholder="Adicione uma mensagem para a OS"
          />
        </el-form-item>
        <el-form-item label="Responsáveis" prop="users">
          <AppSelect
            class="data-type-select"
            multiple
            v-model="form.users"
            :options="participantsOptions"
            placeholder="Atribua responsáveis para esta OS"
          ></AppSelect>
        </el-form-item>
        <el-form-item label="Data de entrega" prop="dueDate">
          <el-date-picker
            class="grow"
            v-model="form.dueDate"
            type="datetime"
            format="DD/MM/YYYY HH:mm:ss"
            placeholder="Informe uma data de expiração da OS"
            range-separator="Até"
            end-placeholder="Data final"
            start-placeholder="Data inicial"
          />
        </el-form-item>
      </el-form>
    </div>
  </AppDrawer>
</template>

<script setup lang="ts">
  import { reactive, ref, watch } from 'vue'
  import _ from 'lodash'
  import AppDrawer from '@/components/AppDrawer/AppDrawer.vue'
  import AppSelect from '@/components/AppSelect/AppSelect.vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import type { ISelectOption } from '@/interfaces/ISelect'
  import type { ICreateOS, IOS } from '@/interfaces/IOS'

  type IForm = ICreateOS

  const props = defineProps<{
    show: boolean
    currentOS: IOS | null
    participantsOptions: Array<ISelectOption>
  }>()

  const emits = defineEmits<{
    'onSubmit:save': [IForm]
    'onSubmit:edit': [any, string]
  }>()

  const isNewOS = ref<boolean>(false)
  const osFormRef = ref<FormInstance>()
  const initialFormData = ref<IForm>()
  const isModified = ref(false)

  const form = reactive<IForm>({
    activity: '',
    description: '',
    dueDate: '',
    users: [],
  })

  const rules = reactive<FormRules<IForm>>({
    activity: [{ required: true, message: 'Informe um título', trigger: 'change' }],
    description: [{ required: true, message: 'Informe uma mensagem', trigger: 'change' }],
    users: [{ required: false, message: 'Informe ao menos um responsável', trigger: 'change' }],
    dueDate: [{ required: false, message: 'Informe uma data de entrega', trigger: 'change' }],
  })

  const handleSubmitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate((valid) => {
      if (valid) {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        isNewOS.value
          ? emits('onSubmit:save', { ...form, dueDate: form.dueDate || undefined })
          : emits('onSubmit:edit', { ...props.currentOS, ...form }, props.currentOS?.id || '')
      }
    })
  }

  watch(
    () => props.show,
    () => {
      isNewOS.value = !props.currentOS
      form.dueDate = ''
      form.activity = ''
      form.description = ''
      form.users = []

      if (osFormRef.value) {
        osFormRef.value.resetFields()
      }

      if (props.currentOS) {
        const initialData = {
          dueDate: props.currentOS.dueDate,
          activity: props.currentOS.activity,
          description: props.currentOS.description,
          users: props.currentOS.users.map((e) => e.id),
        }

        initialFormData.value = _.cloneDeep(initialData)

        form.dueDate = initialData.dueDate
        form.activity = initialData.activity
        form.description = initialData.description
        form.users = initialData.users
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
