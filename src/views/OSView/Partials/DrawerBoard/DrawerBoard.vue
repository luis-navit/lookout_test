<template>
  <AppDrawer
    :show="show"
    :isFormModified="isModified"
    title="Editar informações do quadro"
    submit-btn-label="Salvar edição"
    cancel-btn-label="Cancelar ação"
    @onSubmit="handleSubmitForm(boardFormRef)"
  >
    <div class="drawer-board-content">
      <el-form
        :model="form"
        class="board-form"
        ref="boardFormRef"
        label-position="top"
        :rules="rules"
      >
        <el-form-item label="Nome do quadro" prop="name">
          <el-input v-model="form.name" placeholder="Adicione um nome para o quadro" />
        </el-form-item>
        <el-form-item label="Participantes" prop="users">
          <AppSelect
            class="data-type-select"
            clearable
            multiple
            :options="participantsOptions"
            v-model="form.users"
            placeholder="Atribua os participantes para as atividades deste quadro"
          ></AppSelect>
        </el-form-item>
      </el-form>
    </div>
  </AppDrawer>
</template>

<script setup lang="ts">
  import { reactive, ref, watch } from 'vue'
  import _ from 'lodash'
  import AppDrawer from '@/components/AppDrawer/AppDrawer.vue'
  import AppSelect from '@/components/AppSelect/AppSelect.vue'
  import type { ISelectOption } from '@/interfaces/ISelect'
  import type { FormInstance, FormRules } from 'element-plus'
  import type { IBoardResume, IFormBoard } from '@/interfaces/IBoard'

  type IForm = IFormBoard

  const props = defineProps<{
    show: boolean
    currentBoard: IBoardResume | null
    participantsOptions: Array<ISelectOption>
  }>()

  const emits = defineEmits<{
    onSubmit: [IForm]
  }>()

  const boardFormRef = ref<FormInstance>()
  const initialFormData = ref<IForm>()
  const isModified = ref(false)

  const form = reactive<IForm>({
    name: '',
    users: [],
  })

  const rules = reactive<FormRules<IForm>>({
    name: [{ required: true, message: 'Informe um nome', trigger: 'change' }],
    users: [{ required: true, message: 'Informe ao menos um participante', trigger: 'change' }],
  })

  const handleSubmitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate((valid, fields) => {
      if (valid) {
        emits('onSubmit', { ...form })
      }
    })
  }

  watch(
    () => props.show,
    () => {
      if (boardFormRef.value) {
        boardFormRef.value.resetFields()
      }

      if (props.currentBoard) {
        const initialData = {
          name: props.currentBoard.name,
          users: (props.currentBoard?.users || []).map((user) => user.id),
        }

        initialFormData.value = _.cloneDeep(initialData)

        form.name = initialData.name
        form.users = initialData.users
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
</script>

<style scoped lang="scss" src="./style.scss"></style>
