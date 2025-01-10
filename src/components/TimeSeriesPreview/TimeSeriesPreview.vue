<template>
  <div class="preview-container">
    <div class="preview-header">
      <div class="titles__wrapper">
        <span class="text--md bold">Executar previsão em série temporal</span>
        <span class="text--md">
          Execute uma previsão em série temporal para a data selecionada abaixo
        </span>
      </div>
      <el-button
        type="primary"
        :disabled="!isModified"
        :loading="loading"
        @click="handleSubmitForm(previewFormRef)"
      >
        Executar
      </el-button>
    </div>
    <div class="preview-body">
      <el-form ref="previewFormRef" label-position="top" :model="form" :rules="rules">
        <el-form-item label="Data alvo" prop="targetDate">
          <div class="result__wrapper">
            <el-date-picker v-model="form.targetDate"></el-date-picker>
            <span v-if="previewResult" class="text--md">
              Resultado: <strong class="bold">{{ previewResult?.y.toFixed(2) }}</strong>
            </span>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref, watch } from 'vue'
  import _ from 'lodash'
  import type { FormInstance, FormRules } from 'element-plus'
  import type { IPreviewResult } from '@/interfaces/ITimeSeries'

  interface IForm {
    targetDate: string
  }

  const emits = defineEmits<{
    onSubmit: [string]
  }>()

  defineProps<{
    loading: boolean
    previewResult: IPreviewResult | null
  }>()

  const previewFormRef = ref<FormInstance>()
  const initialFormData = ref<IForm>()
  const isModified = ref(false)

  const form = reactive<IForm>({
    targetDate: '',
  })

  const rules = reactive<FormRules<IForm>>({
    targetDate: [{ required: true, message: 'Informe uma data alvo', trigger: 'blur' }],
  })

  const handleSubmitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate((valid, fields) => {
      if (valid) emits('onSubmit', form.targetDate)
    })
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
