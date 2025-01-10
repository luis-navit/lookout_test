<template>
  <div class="time-form__wrapper">
    <el-form :model="form" class="time-form" ref="timeFormRef" label-position="top" :rules="rules">
      <el-form-item label="Cidade">
        <AppSelect
          class="data-type-select"
          clearable
          :options="cities"
          v-model="form.city"
          placeholder="Selecione uma cidade"
        />
      </el-form-item>
      <el-form-item label="Data de início">
        <el-date-picker
          format="DD/MM/YYYY"
          range-separator="Até"
          end-placeholder="Data final"
          start-placeholder="Data inicial"
          placeholder="Informe uma data"
          v-model="form.dateRange"
          type="daterange"
          :clearable="false"
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
  import { reactive, ref, watch } from 'vue'
  import _ from 'lodash'
  import type { FormInstance, FormRules } from 'element-plus'
  import type { ISelectOption } from '@/interfaces/ISelect'
  import AppSelect from '@/components/AppSelect/AppSelect.vue'

  interface IForm {
    dateRange: Array<string>
    city: string
  }

  const props = defineProps<{
    typeOptions: Array<ISelectOption>
    selectedType: string
    fieldsOptions: Record<string, Array<ISelectOption>>
    commonDataFormRef: FormInstance
    cities: any
  }>()

  const timeFormRef = ref<FormInstance>()
  const isModified = ref(false)
  const initialFormData = ref<IForm>({
    dateRange: [],
    city: '',
  })
  const form = reactive<IForm>({
    dateRange: [],
    city: '',
  })

  const rules = reactive<FormRules<IForm>>({
    dateRange: [{ required: true, message: 'Informe o período de buscas', trigger: 'blur' }],
  })

  const emit = defineEmits<{
    onSubmit: [string, IForm]
    onCancel: []
  }>()

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

    emit('onSubmit', 'prevision', formData)
  }

  const handleCancel = (): void => {
    emit('onCancel')
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
