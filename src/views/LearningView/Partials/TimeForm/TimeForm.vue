<template>
  <div class="time-form__wrapper">
    <el-form :model="form" class="time-form" ref="timeFormRef" label-position="top" :rules="rules">
      <el-form-item label="Campo data" prop="dateField">
        <AppSelect
          v-model="form.dateField"
          :options="getFieldsOptions"
          placeholder="Informe o campo de data"
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
      <el-form-item label="Granularidade" prop="granularity">
        <AppSelect
          v-model="form.granularity"
          :options="granularityOptions"
          placeholder="Informe a granularidade"
        />
      </el-form-item>
      <el-form-item label="Horizonte" prop="horizon">
        <el-input-number
          class="input-number"
          v-model="form.horizon"
          :min="10"
          :max="80"
          controls-position="right"
          placeholder="Informe o horizonte entre 10 á 80"
        />
      </el-form-item>
      <el-form-item label="Alvo" prop="target">
        <AppSelect
          v-model="form.target"
          :options="getFieldsOptions"
          placeholder="Selecione o alvo"
        />
      </el-form-item>
    </el-form>
    <div class="time-form__submit">
      <el-button type="" @click="handleCancel">cancelar</el-button>
      <el-button type="primary" :disabled="!isModified" @click="handleSubmitForm(timeFormRef)">
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
    dateField: string
    limit: number
    granularity: string
    horizon: number
    target: string
  }

  const props = defineProps<{
    typeOptions: Array<ISelectOption>
    selectedType: string
    fieldsOptions: Record<string, Array<ISelectOption>>
    commonDataFormRef: FormInstance
  }>()

  const timeFormRef = ref<FormInstance>()
  const isModified = ref(false)
  const initialFormData = ref<IForm>({
    dateField: '',
    limit: 500,
    horizon: 30,
    granularity: 'D',
    target: '',
  })
  const form = reactive<IForm>({
    dateField: '',
    limit: 500,
    horizon: 30,
    granularity: 'D',
    target: '',
  })

  const granularityOptions = ref<Array<ISelectOption>>([
    {
      label: 'Dias',
      value: 'D',
    },
  ])

  const rules = reactive<FormRules<IForm>>({
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
        } as IForm
      }
    })

    emit('onSubmit', 'time', formData)
  }

  const handleChangeType = (): void => {
    form.dateField = ''
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
