<template>
  <AppDrawer
    :show="show"
    :title="`${isNewState ? 'Nova' : 'Editar'} lista`"
    :submit-btn-label="`Salvar ${isNewState ? '' : 'edição'}`"
    :isFormModified="isModified"
    cancel-btn-label="Cancelar ação"
    @onSubmit="handleSubmitForm(stateFormRef)"
  >
    <div class="drawer-state-content">
      <el-form :model="form" ref="stateFormRef" label-position="top" :rules="rules" @submit.prevent>
        <el-form-item label="Nome da lista" prop="name">
          <el-input v-model="form.name" placeholder="Adicione um nome para a lista" />
        </el-form-item>
      </el-form>
    </div>
  </AppDrawer>
</template>

<script setup lang="ts">
  import { reactive, ref, watch } from 'vue'
  import _ from 'lodash'
  import AppDrawer from '@/components/AppDrawer/AppDrawer.vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import type { IStateOS } from '@/interfaces/IBoard'

  interface IForm {
    name: string
  }

  const props = defineProps<{
    show: boolean
    currentState: IStateOS | null
  }>()

  const emits = defineEmits<{
    'onSubmit:edit': [IStateOS]
    'onSubmit:save': [string]
  }>()

  const editId = ref<string>('')
  const isNewState = ref<boolean>(true)
  const stateFormRef = ref<FormInstance>()
  const initialFormData = ref<IForm>()
  const isModified = ref(false)

  const form = reactive<IForm>({
    name: '',
  })

  const rules = reactive<FormRules<IForm>>({
    name: [{ required: true, message: 'Informe um nome', trigger: 'change' }],
  })

  const handleSubmitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate((valid) => {
      if (valid) {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        isNewState.value
          ? emits('onSubmit:save', form.name)
          : emits('onSubmit:edit', {
              ...props.currentState,
              name: form.name,
            } as IStateOS)
      }
    })
  }

  watch(
    () => props.show,
    () => {
      isNewState.value = !props.currentState

      if (stateFormRef.value) {
        stateFormRef.value.resetFields()
        form.name = ''
        return
      }

      if (props.currentState) {
        const initialData = {
          name: props.currentState.name || '',
        }

        initialFormData.value = _.cloneDeep(initialData)

        form.name = initialData.name

        return
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
