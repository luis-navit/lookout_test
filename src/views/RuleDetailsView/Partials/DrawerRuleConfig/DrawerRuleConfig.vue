<template>
  <AppDrawer
    :show="show"
    :title="`${isNewRule ? 'Nova' : 'Editar'} regra`"
    :isFormModified="isModified"
    cancel-btn-label="Cancelar ação"
    submit-btn-label="Salvar configuração"
    @onSubmit="handleSubmitForm(ruleFormRef)"
  >
    <div class="config-drawer-container">
      <el-form :model="form" ref="ruleFormRef" label-position="top" :rules="rules">
        <div class="switch-control">
          <span class="text--md bold">
            {{ `Regra ${form.isActive ? 'Ativada' : 'Desativada'}` }}
          </span>
          <el-switch class="custom-switch" v-model="form.isActive"></el-switch>
        </div>
        <el-form-item label="Nome" prop="name">
          <el-input
            v-model="form.name"
            placeholder="Informe um nome para a regra..."
            maxlength="250"
          ></el-input>
        </el-form-item>
        <el-form-item label="Mensagem" prop="message">
          <el-input
            v-model="form.message"
            placeholder="Informe uma mensagem para a regra..."
            maxlength="250"
          ></el-input>
        </el-form-item>
        <el-form-item label="Regra" prop="query">
          <el-input
            :disabled="(form.queryType ?? '').toLowerCase() === 'ia'"
            v-model="form.query"
            type="textarea"
            :rows="5"
            placeholder="Informe uma regra..."
            maxlength="250"
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
  import type { FormInstance, FormRules } from 'element-plus'
  import type { IRule } from '@/interfaces/IModel'

  const props = defineProps<{
    show: boolean
    rule: IRule | null
  }>()

  const emits = defineEmits<{
    'onSubmit:edit': [rule: IRule]
    'onSubmit:create': [rule: IRule]
  }>()

  const ruleFormRef = ref<FormInstance>()
  const isNewRule = ref<boolean>(false)
  const initialFormData = ref<IRule>()
  const isModified = ref(false)
  const form = ref<IRule>({
    name: '',
    query: '',
    queryType: '',
    message: '',
    isActive: false,
    isImportant: false,
  })

  const rules = reactive<FormRules<IRule>>({
    name: [{ required: true, message: 'Informe um nome', trigger: 'change' }],
    query: [{ required: true, message: 'Informe uma regra', trigger: 'change' }],
    message: [{ required: true, message: 'Informe uma mensagem', trigger: 'change' }],
  })

  const handleSubmitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return

    await formEl.validate((valid, fields) => {
      if (valid) {
        isNewRule.value
          ? emits('onSubmit:create', { ...form.value })
          : emits('onSubmit:edit', { ...form.value })
      }
    })
  }

  watch(
    () => props.show,
    () => {
      if (ruleFormRef.value) ruleFormRef.value.resetFields()

      if (props.rule) {
        const initialData = {
          name: props.rule.name,
          query: props.rule.query,
          message: props.rule.message,
          queryType: props.rule.queryType,
          isActive: props.rule.isActive,
          isImportant: props.rule.isImportant,
        }

        initialFormData.value = _.cloneDeep(initialData)

        form.value = { ...initialData }

        isNewRule.value = false

        return
      }

      isNewRule.value = true
      form.value = {
        name: '',
        query: '',
        message: '',
        queryType: 'fixed',
        isActive: true,
        isImportant: false,
      }
    },
    { deep: true, immediate: true }
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
