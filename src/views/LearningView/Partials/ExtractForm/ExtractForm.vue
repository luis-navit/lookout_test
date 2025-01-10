<template>
  <div class="extract-form__wrapper">
    <el-form
      :model="form"
      class="extract-form"
      ref="regressFormRef"
      label-position="top"
      :rules="rules"
    >
      <el-form-item label="Consulta" prop="query">
        <el-input v-model="form.query" placeholder="Informe a query" />
      </el-form-item>
      <el-form-item label="Colunas ignoradas" prop="ignoreColumns">
        <AppSelect
          v-model="form.ignoreColumns"
          multiple
          :options="getFieldsOptions"
          placeholder="Informe as colunas a serem ignoradas, separadas por vírgula"
        />
      </el-form-item>
      <el-form-item label="Profundidade máxima" prop="maxDeep">
        <el-input-number
          class="input-number"
          v-model="form.maxDeep"
          :min="1"
          controls-position="right"
          placeholder="Informe a profundidade máxima"
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
    <div class="extract-form__submit">
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
    ignoreColumns: Array<string>
    maxDeep: number
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
    ignoreColumns: [],
    maxDeep: 5,
    limit: 500,
  })
  const form = reactive<IForm>({
    query: '',
    ignoreColumns: [],
    maxDeep: 5,
    limit: 500,
  })

  const rules = reactive<FormRules<IForm>>({
    query: [{ required: false, message: 'Informe a placa', trigger: 'blur' }],
    ignoreColumns: [{ required: false, message: 'Informe o campo alvo', trigger: 'blur' }],
    maxDeep: [{ type: 'number', message: 'Informe a profundidade máxima', trigger: 'blur' }],
    limit: [{ type: 'number', message: 'Informe o limite', trigger: 'blur' }],
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

    emit('onSubmit', 'extract', formData)
  }

  const handleCancel = (): void => {
    emit('onCancel')
  }

  const handleChangeType = (): void => {
    form.ignoreColumns = []
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
