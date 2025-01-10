<template>
  <div class="preview-container">
    <div class="preview-header">
      <div class="titles__wrapper">
        <span class="text--md bold">Visualizar previsões</span>
        <span class="text--md"> Visualize o gráfico de previsão para uma janela de tempo </span>
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
      <el-form
        ref="previewFormRef"
        label-position="top"
        :model="form"
        :rules="rules"
        class="result__form"
      >
        <el-form-item label="Data alvo" prop="targetDate" class="result__wrapper">
          <el-date-picker
            format="DD/MM/YYYY"
            range-separator="Até"
            end-placeholder="Data final"
            start-placeholder="Data inicial"
            placeholder="Informe uma data"
            v-model="form.dateRange"
            type="daterange"
            :clearable="false"
            class="input-number"
          />
        </el-form-item>

        <el-form-item label="Passos à frente" prop="targetDate" class="result__wrapper">
          <el-input-number class="input-number" :min="0" v-model="form.horizon" />
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref, watch } from 'vue'
  import _ from 'lodash'
  import type { FormInstance, FormRules } from 'element-plus'
  import type { IPrevisionPrevisionResult } from '@/interfaces/IPrevision'

  interface IForm {
    dateRange: string[]
    horizon: number
  }

  const emits = defineEmits<{
    onSubmit: [string[], number]
  }>()

  defineProps<{
    loading: boolean
    previewResult: IPrevisionPrevisionResult | null
  }>()

  const previewFormRef = ref<FormInstance>()
  const initialFormData = ref<IForm>()
  const isModified = ref(false)

  const form = reactive<IForm>({
    dateRange: [],
    horizon: 0,
  })

  const rules = reactive<FormRules<IForm>>({
    dateRange: [{ required: true, message: 'Informe o intervalo de datas', trigger: 'blur' }],
    horizon: [
      {
        required: true,
        message: 'Informe a quantidade de passos a frente',
        trigger: 'blur',
        min: 1,
      },
    ],
  })

  const handleSubmitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate((valid) => {
      if (valid) emits('onSubmit', form.dateRange, form.horizon)
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
