<template>
  <AppDrawer
    :show="show"
    :title="`${isNewModel ? 'Novo' : 'Editar informações do'} conjunto de regras`"
    :isFormModified="isModified"
    cancel-btn-label="Cancelar ação"
    submit-btn-label="Salvar"
    @onSubmit="handleSubmitForm(ruleGroupFormRef)"
  >
    <div class="drawer-rule-group-content">
      <el-form
        class="rule-group-form"
        ref="ruleGroupFormRef"
        label-position="top"
        :model="form"
        :rules="rules"
        v-on:submit.prevent
      >
        <el-form-item label="Nome do conjunto de regras" prop="name">
          <el-input
            v-model="form.name"
            placeholder="Adicione um nome para o conjunto de regras"
            maxlength="250"
          />
        </el-form-item>
        <el-form-item prop="horizon" label="Hozironte" v-if="isPrevision">
          <el-input-number
            v-model="form.horizon"
            placeholder="Defina o horizonte para previsões"
            :min="0"
            class="input-number"
          />
        </el-form-item>
        <el-form-item prop="pastDays" label="Intervalo de dias" v-if="isPrevision">
          <el-input-number
            v-model="form.pastDays"
            placeholder="Defina o intervalo de dias para a execução automática"
            :min="0"
            class="input-number"
          />
        </el-form-item>
        <el-form-item v-if="isNewModel" label="Tipo de dados" prop="type">
          <AppSelect
            class="data-type-select"
            clearable
            :options="dataTypesOptions"
            v-model="form.type"
            placeholder="Selecione o tipo de dados"
          ></AppSelect>
        </el-form-item>
      </el-form>
    </div>
  </AppDrawer>
</template>

<script setup lang="ts">
  import { computed, reactive, ref, watch } from 'vue'
  import _ from 'lodash'
  import AppDrawer from '@/components/AppDrawer/AppDrawer.vue'
  import AppSelect from '@/components/AppSelect/AppSelect.vue'
  import type { IModel, IRule } from '@/interfaces/IModel'
  import type { ISelectOption } from '@/interfaces/ISelect'
  import type { FormInstance, FormRules } from 'element-plus'
  import { techniquesEnum } from '@/enums/techniquesEnum'

  interface IForm {
    name: string
    type: string
    horizon: number
    pastDays: number
  }

  const props = defineProps<{
    show: boolean
    dataTypesOptions: Array<ISelectOption>
    currentModel: IModel | null
  }>()

  const emits = defineEmits<{
    'onSubmit:edit': [string, Array<IRule>, string, number, number]
    'onSubmit:save': [IForm]
  }>()

  const editId = ref<string>('')
  const isNewModel = ref<boolean>(true)
  const ruleGroupFormRef = ref<FormInstance>()
  const initialFormData = ref<IForm>()
  const isModified = ref(false)

  const form = reactive<IForm>({
    name: '',
    type: '',
    horizon: 0,
    pastDays: 0,
  })

  const rules = reactive<FormRules<IForm>>({
    name: [{ required: true, message: 'Informe um nome', trigger: 'change' }],
    type: [{ required: true, message: 'Informe um tipo de dado', trigger: 'change' }],
  })

  const handleSubmitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate((valid) => {
      if (valid) {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        isNewModel.value
          ? emits('onSubmit:save', form)
          : emits(
              'onSubmit:edit',
              form.name,
              props.currentModel?.rules || [],
              editId.value,
              form.horizon ?? undefined,
              form.pastDays ?? undefined
            )
      }
    })
  }

  watch(
    () => props.show,
    () => {
      isNewModel.value = !props.currentModel

      if (ruleGroupFormRef.value) {
        ruleGroupFormRef.value.resetFields()
        form.type = ''
        form.name = ''
      }

      if (props.currentModel) {
        const initialData = {
          name: props.currentModel.name,
          type: props.currentModel.type,
          horizon: Number(props.currentModel.horizon),
          pastDays: Number(props.currentModel.pastDays),
        }

        initialFormData.value = _.cloneDeep(initialData)

        form.name = initialData.name
        form.type = initialData.type
        form.horizon = Number(initialData.horizon)
        form.pastDays = Number(initialData.pastDays)
        editId.value = props.currentModel.id
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

  const isPrevision = computed<boolean>(() => {
    return [
      techniquesEnum.PREVISION,
      techniquesEnum.PREVISION_BAGGING,
      techniquesEnum.PREVISION_SVR,
    ].includes(props.currentModel?.technique as any)
  })
</script>

<style scoped lang="scss" src="./style.scss"></style>
