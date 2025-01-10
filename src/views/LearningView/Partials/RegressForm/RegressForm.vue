<template>
  <div class="regress-form__wrapper">
    <el-form
      :model="form"
      class="regress-form"
      ref="regressFormRef"
      label-position="top"
      :rules="rules"
    >
      <el-form-item label="Consulta" prop="query">
        <el-input v-model="form.query" placeholder="Informe a query" />
      </el-form-item>
      <el-form-item label="Campo Alvo" prop="target">
        <AppSelect
          v-model="form.target"
          placeholder="Informe o campo alvo"
          :options="getFieldsOptions"
        />
      </el-form-item>
      <el-form-item label="Campos" prop="fields">
        <AppSelect
          v-model="form.fields"
          multiple
          placeholder="Informe os campos"
          :options="getFieldsOptions"
        />
      </el-form-item>
      <el-form-item label="Limite" prop="limit">
        <el-input-number
          class="input-number"
          v-model="form.limit"
          :min="500"
          controls-position="right"
          placeholder="Informe o limite"
        />
      </el-form-item>
    </el-form>
    <div class="regress-form__submit">
      <el-button type="" @click="handleCancel">cancelar</el-button>
      <el-button type="primary" :disabled="!isModified" @click="handleSubmitForm(regressFormRef)">
        confirmar
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, reactive, ref, watch } from 'vue'
  import _ from 'lodash'
  import AppSelect from '@/components/AppSelect/AppSelect.vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import type { ISelectOption } from '@/interfaces/ISelect'

  interface IForm {
    query: string
    target: string
    fields: Array<string>
    limit: number
  }

  const props = defineProps<{
    typeOptions: Array<ISelectOption>
    selectedType: string
    fieldsOptions: Record<string, Array<ISelectOption>>
    commonDataFormRef: FormInstance
  }>()

  const regressFormRef = ref<FormInstance>()
  const isModified = ref(false)
  const initialFormData = ref<IForm>({
    query: '',
    target: '',
    fields: [],
    limit: 500,
  })

  const form = reactive<IForm>({
    query: '',
    target: '',
    fields: [],
    limit: 500,
  })

  const rules = reactive<FormRules<IForm>>({
    query: [{ required: false, message: 'Informe a query', trigger: 'blur' }],
    target: [{ required: true, message: 'Informe o campo alvo', trigger: 'blur' }],
    fields: [{ required: true, message: 'Informe os campos', trigger: 'blur' }],
    limit: [{ required: false, message: 'Informe o limite', trigger: 'blur' }],
  })

  const emit = defineEmits<{
    onSubmit: [string, IForm]
    onCancel: []
  }>()

  defineExpose({
    resetType: () => {
      handleChangeType()
    },
  })

  const handleSubmitForm = async (formEl: FormInstance | undefined) => {
    let formData = {} as IForm

    if (!props.commonDataFormRef) return
    await props.commonDataFormRef.validate(() => {})

    if (!formEl) return
    await formEl.validate((valid) => {
      if (valid) {
        formData = {
          ...form,
          query: JSON.parse(`{${form.query}}`),
        } as IForm
      }
    })

    emit('onSubmit', 'regress', formData)
  }

  const handleCancel = (): void => {
    emit('onCancel')
  }

  const handleChangeType = (): void => {
    form.target = ''
    form.fields = []
  }

  const getFieldsOptions = computed<Array<ISelectOption>>(() => {
    const fieldOptionsByFormType = props.fieldsOptions[props.selectedType] || []

    if (form.target) {
      const optionsWithOutTarget = fieldOptionsByFormType.filter(
        (option) => option.value !== form.target
      )

      return optionsWithOutTarget
    }

    return fieldOptionsByFormType
  })

  watch(
    form,
    (newFormData) => {
      isModified.value = !_.isEqual(newFormData, initialFormData.value)
    },
    { deep: true }
  )
</script>

<style scoped lang="scss" src="./style.scss"></style>
