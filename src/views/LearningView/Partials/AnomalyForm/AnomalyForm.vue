<template>
  <div class="anomaly-form__wrapper">
    <el-form
      :model="form"
      class="anomaly-form"
      ref="anomalyFormRef"
      label-position="top"
      :rules="rules"
    >
      <el-form-item label="Consulta" prop="query">
        <el-input-text v-model="form.query" placeholder="Informe a query" />
      </el-form-item>
      <el-form-item label="Campos" prop="fields">
        <AppSelect
          v-model="form.fields"
          multiple
          :options="getFieldsOptions"
          placeholder="Informe os campos"
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
      <el-form-item label="Modelo" prop="algorithmName">
        <AppSelect
          v-model="form.algorithmName"
          :options="modelOptions"
          placeholder="Informe os campos"
        />
      </el-form-item>
    </el-form>
    <div class="anomaly-form__submit">
      <el-button type="" @click="handleCancel">cancelar</el-button>
      <el-button type="primary" :disabled="!isModified" @click="handleSubmitForm(anomalyFormRef)">
        confirmar
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, reactive, ref, watch } from 'vue'
  import _ from 'lodash'
  import type { FormInstance, FormRules } from 'element-plus'
  import type { ISelectOption } from '@/interfaces/ISelect'
  import AppSelect from '@/components/AppSelect/AppSelect.vue'

  interface IForm {
    query: string
    fields: Array<string>
    limit: number
    algorithmName: string
  }

  const props = defineProps<{
    typeOptions: Array<ISelectOption>
    selectedType: string
    modelOptions: Array<ISelectOption>
    fieldsOptions: Record<string, Array<ISelectOption>>
    commonDataFormRef: FormInstance
  }>()

  const anomalyFormRef = ref<FormInstance>()
  const isModified = ref(false)
  const initialFormData = ref<IForm>({
    query: '',
    fields: [],
    limit: 500,
    algorithmName: '',
  })
  const form = reactive<IForm>({
    query: '',
    fields: [],
    limit: 500,
    algorithmName: '',
  })

  const rules = reactive<FormRules<IForm>>({
    query: [{ required: false, message: 'Informe a query', trigger: 'blur' }],
    fields: [{ required: true, message: 'Informe os campos', trigger: 'blur' }],
    limit: [{ required: false, message: 'Informe o limite', trigger: 'blur' }],
    algorithmName: [{ required: true, message: 'Informe o modelo', trigger: 'blur' }],
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

    emit('onSubmit', 'anomaly', formData)
  }

  const handleChangeType = (): void => {
    form.fields = []
  }

  const handleCancel = (): void => {
    emit('onCancel')
  }

  const getFieldsOptions = computed<Array<ISelectOption>>(() => {
    return props.fieldsOptions[props.selectedType] || []
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
