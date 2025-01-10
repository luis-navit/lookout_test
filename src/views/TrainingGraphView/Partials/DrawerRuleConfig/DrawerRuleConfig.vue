<template>
  <AppDrawer
    :show="show"
    :title="`Configurar ${rule?.name}`"
    :isFormModified="isModified"
    cancel-btn-label="Cancelar ação"
    submit-btn-label="Salvar configuração"
    @onSubmit="handleSubmitForm(ruleFormRef)"
  >
    <div class="config-drawer-container">
      <el-form :model="form" ref="ruleFormRef" label-position="top" :rules="rules">
        <div class="switch-control">
          <span class="text--md bold">
            {{ `${form.isActive ? 'Desativar' : 'Ativar'} regra` }}
          </span>
          <el-switch class="custom-switch" v-model="form.isActive"></el-switch>
        </div>
        <el-form-item label="Nome da regra" prop="name">
          <el-input v-model="form.name" placeholder="Informe um nome para a regra..."></el-input>
        </el-form-item>
        <el-form-item label="Mensagem" prop="message">
          <el-input
            v-model="form.message"
            placeholder="Informe uma mensagem para a regra..."
          ></el-input>
        </el-form-item>
        <el-form-item
          label="Regra"
          prop="query
        "
        >
          <el-input
            :disabled="rule.queryType === 'IA'"
            v-model="form.query"
            type="textarea"
            :rows="5"
            placeholder="Informe uma regra..."
          ></el-input>
        </el-form-item>
        <el-checkbox
          class="custom-checkbox"
          v-model="form.isImportant"
          label="Ativar ordem de serviço a partir desta regra?"
          border
        />
      </el-form>
    </div>
  </AppDrawer>
</template>

<script setup lang="ts">
  import { reactive, ref, watch } from 'vue'
  import _ from 'lodash'
  import AppDrawer from '@/components/AppDrawer/AppDrawer.vue'
  import type { IGraphRule } from '@/interfaces/ITraining'
  import type { FormInstance, FormRules } from 'element-plus'

  interface IForm {
    name: string
    query: string
    message: string
    isActive: boolean
    isImportant: boolean
  }

  const emits = defineEmits<{
    onSubmit: [rule: IGraphRule]
  }>()

  const props = defineProps<{
    show: boolean
    rule: IGraphRule
  }>()

  const initialFormData = ref<IForm>()
  const isModified = ref(false)
  const form = ref<IForm>({
    name: '',
    query: '',
    message: '',
    isActive: false,
    isImportant: false,
  })
  const ruleFormRef = ref<FormInstance>()

  const rules = reactive<FormRules<IForm>>({
    name: [{ required: true, message: 'Informe um nome', trigger: 'change' }],
    query: [{ required: true, message: 'Informe uma regra', trigger: 'change' }],
    message: [{ required: true, message: 'Informe uma mensagem', trigger: 'change' }],
  })

  const handleSubmitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate((valid, fields) => {
      if (valid) {
        emits('onSubmit', { ...props.rule, ...form.value })
      }
    })
  }

  watch(
    () => props.rule,
    (newRule) => {
      const initialData = {
        name: newRule.name,
        query: newRule.query,
        message: newRule.message,
        isActive: newRule.isActive,
        isImportant: newRule.isImportant,
      }

      initialFormData.value = _.cloneDeep(initialData)

      form.value.name = initialData.name
      form.value.query = initialData.query
      form.value.message = initialData.message
      form.value.isActive = initialData.isActive
      form.value.isImportant = initialData.isImportant
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
