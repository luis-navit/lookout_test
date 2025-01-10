<template>
  <AppDrawer
    :show="show"
    :title="`${isNewBoard ? 'Novo' : 'Editar informações do'} quadro`"
    :submit-btn-label="`Salvar ${isNewBoard ? 'quadro' : 'edição'}`"
    :isFormModified="isModified"
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
          <el-input
            v-model="form.name"
            placeholder="Adicione um nome para o quadro"
            maxlength="250"
          />
        </el-form-item>
        <el-form-item label="Participantes" prop="users">
          <el-select
            v-model="form.users"
            class="select-container custom-select data-type-select"
            no-data-text="Sem opções"
            clearable
            multiple
            placeholder="Atribua os participantes para as atividades deste quadro"
          >
            <el-option
              v-for="(option, index) of usersOptions"
              :key="`option-${option.label}-${index}`"
              :value="option.value"
              :label="option.label"
              :disabled="handleDisableOption(option.value)"
            >
              <span class="label">{{ option.label }}</span>
              <span class="sub-label" v-if="option.subLabel?.length">{{ option.subLabel }}</span>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </div>
  </AppDrawer>
</template>

<script setup lang="ts">
  import { reactive, ref, watch } from 'vue'
  import _ from 'lodash'
  import AppDrawer from '@/components/AppDrawer/AppDrawer.vue'
  import type { ISelectOption } from '@/interfaces/ISelect'
  import type { FormInstance, FormRules } from 'element-plus'
  import type { IBoard, IFormBoard } from '@/interfaces/IBoard'

  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface IForm extends IFormBoard {}

  const props = defineProps<{
    show: boolean
    currentUserId: string
    currentBoard: IBoard | null
    usersOptions: Array<ISelectOption>
  }>()

  const emits = defineEmits<{
    'onSubmit:edit': [IForm, string]
    'onSubmit:save': [IForm]
  }>()

  const editId = ref<string>('')
  const isNewBoard = ref<boolean>(true)
  const boardFormRef = ref<FormInstance>()
  const initialFormData = ref<IForm>()
  const isModified = ref(false)

  const form = reactive<IFormBoard>({
    name: '',
    users: [],
  })

  const rules = reactive<FormRules<IForm>>({
    name: [{ required: true, message: 'Informe um nome', trigger: 'change' }],
    users: [{ required: true, message: 'Informe ao menos um participante', trigger: 'change' }],
  })

  const handleSubmitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate((valid) => {
      if (valid) {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        isNewBoard.value
          ? emits('onSubmit:save', { ...form })
          : emits('onSubmit:edit', { ...form }, editId.value)
      }
    })
  }

  const handleDisableOption = (id: string): boolean => {
    return isNewBoard.value ? id === props.currentUserId : false
  }

  watch(
    () => props.show,
    () => {
      isNewBoard.value = !props.currentBoard

      if (boardFormRef.value) {
        form.users = []
        form.name = ''
        boardFormRef.value.resetFields()
        return
      }

      if (isNewBoard.value) form.users = [props.currentUserId]

      if (props.currentBoard) {
        const initialData = {
          name: props.currentBoard.name,
          users: (props.currentBoard.users || []).map((user) => user.id),
        }

        form.name = initialData.name
        form.users = initialData.users

        editId.value = props.currentBoard.id

        initialFormData.value = _.cloneDeep(initialData)

        return
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
