<template>
  <AppDrawer
    :show="showDrawer"
    :showFooter="false"
    :isFormModified="isModified"
    title="Novo treinamento"
    @onClose="handleClose"
  >
    <div class="learning-drawer-wrapper">
      <AppLabel label="Tipo de aprendizagem" class="common-field-label">
        <AppSelect
          v-model="technique"
          :options="techniqueOptions"
          placeholder="Selecione a técnica a ser utilizada no treinamento"
        />
      </AppLabel>
      <el-form
        :model="form"
        class="common-form"
        ref="commonDataFormRef"
        label-position="top"
        :rules="rules"
      >
        <el-form-item label="Nome do treinamento" prop="name">
          <el-input v-model="form.name" placeholder="Informe um nome para o treinamento" />
        </el-form-item>
        <el-form-item label="Tipo do treinamento" prop="type">
          <AppSelect
            v-model="form.type"
            :options="typeOptions"
            placeholder="Informe o tipo"
            @change="handleChangeType"
          />
        </el-form-item>
      </el-form>
      <div class="learning-form-wrapper">
        <component
          :is="getForm"
          :typeOptions="typeOptions"
          :selectedType="form.type"
          :fieldsOptions="fieldsOptions"
          :modelOptions="modelOptions"
          :commonDataFormRef="commonDataFormRef"
          :cities="revisionCities"
          @onCancel="handleCancel"
          @onSubmit="handleSubmit"
          ref="componentRef"
        ></component>
      </div>
    </div>
  </AppDrawer>
</template>

<script setup lang="ts">
  import { computed, markRaw, ref, reactive, watch } from 'vue'
  import _ from 'lodash'
  import AppDrawer from '@/components/AppDrawer/AppDrawer.vue'
  import AppSelect from '@/components/AppSelect/AppSelect.vue'
  import AppLabel from '@/components/AppLabel/AppLabel.vue'
  import RegressForm from '../RegressForm/RegressForm.vue'
  import AnomalyForm from '../AnomalyForm/AnomalyForm.vue'
  import ExtractForm from '../ExtractForm/ExtractForm.vue'
  import TimeForm from '../TimeForm/TimeForm.vue'
  import type { ISelectOption } from '@/interfaces/ISelect'
  import type { FormInstance, FormRules } from 'element-plus'
  import type { IDataType } from '@/interfaces/IDataType'
  import PrevisionForm from '../PrevisionForm/PrevisionForm.vue'

  interface IForm {
    name: string
    type: string
  }

  type Trainings = 'regress' | 'extract' | 'anomaly' | 'time' | 'prevision'

  const props = defineProps<{
    showDrawer: boolean
    typeOptions: Array<ISelectOption>
    dataTypes: Array<IDataType>
    modelOptions: Array<ISelectOption>
    fieldsOptions: Record<string, Array<ISelectOption>>
    revisionCities: any
  }>()
  const emits = defineEmits<{
    onClose: [FormInstance]
    onSubmit: [type: string, form: Record<string, any>, FormInstance]
  }>()
  const technique = ref<string>('')
  const componentRef = ref<any>()
  const initialFormData = ref<IForm>({
    name: '',
    type: '',
  })
  const isModified = ref(false)

  const techniqueOptions = ref<Array<ISelectOption>>([
    { label: 'Detecção de anomalias', value: 'anomaly' },
    { label: 'Regressão', value: 'regress' },
    { label: 'Extração de regras', value: 'extract' },
    { label: 'Série temporal', value: 'time' },
    { label: 'Previsão', value: 'prevision' },
  ])

  const formOptions = ref<Record<string, any>>({
    anomaly: markRaw(AnomalyForm),
    regress: markRaw(RegressForm),
    extract: markRaw(ExtractForm),
    time: markRaw(TimeForm),
    prevision: markRaw(PrevisionForm),
  })

  const commonDataFormRef = ref<FormInstance>()
  const form = reactive<IForm>({
    name: '',
    type: '',
  })
  const rules = reactive<FormRules<IForm>>({
    name: [{ required: false, message: 'Informe um nome', trigger: 'blur' }],
    type: [{ required: true, message: 'Informe o tipo', trigger: 'blur' }],
  })

  const getForm = computed(() => {
    if (technique.value) return formOptions.value[technique.value]
  })

  const handleChangeType = async () => {
    componentRef.value?.resetType()
  }

  const handleSubmit = async (
    trainingType: Trainings,
    trainingForm: Record<string, any>
  ): Promise<void> => {
    const dataType = props.dataTypes.find((item) => item.id === form.type)

    const formData: any = {
      ...trainingForm,
      ...form,
      isProcessed: !!dataType?.processor,
    }

    if (trainingType === 'prevision') {
      formData.window_start = trainingForm.dateRange[0]
      formData.window_end = trainingForm.dateRange[1]

      delete formData.dateRange
      delete formData.isProcessed
    }

    emits('onSubmit', trainingType, formData, commonDataFormRef.value as any)
  }

  const handleCancel = (): void => {
    emits('onClose', commonDataFormRef.value as any)
  }

  const handleClose = (): void => {
    technique.value = ''
    emits('onClose', commonDataFormRef.value as any)
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
