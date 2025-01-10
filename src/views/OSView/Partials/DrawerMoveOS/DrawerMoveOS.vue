<template>
  <AppDrawer
    :show="show"
    :isFormModified="isModified"
    title="Mover Lista"
    submit-btn-label="Mover lista"
    cancel-btn-label="Cancelar ação"
    @onSubmit="handleSubmitForm(moveOSFormRef)"
  >
    <div class="drawer-state-content">
      <el-form :model="form" ref="moveOSFormRef" label-position="top" :rules="rules">
        <el-form-item label="Lista" prop="state">
          <AppSelect
            class="data-type-select"
            v-model="form.state"
            :options="stateOptions"
            placeholder="Atribua uma lista para essa ordem de serviço "
          ></AppSelect>
        </el-form-item>
        <el-form-item label="Quadro" prop="board">
          <AppSelect
            class="data-type-select"
            v-model="form.board"
            :options="boardOptions"
            placeholder="Atribua um quadro para essa lista"
            @change="handleChangeBoard"
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
  import type { FormInstance, FormRules } from 'element-plus'
  import type { ISelectOption } from '@/interfaces/ISelect'
  import type { IBoard } from '@/interfaces/IBoard'
  import type { IOS } from '@/interfaces/IOS'

  interface IForm {
    state: string
    board: string
  }

  const props = defineProps<{
    show: boolean
    currentOS: IOS | null
    currentBoard: string
    allBoards: Array<IBoard>
    boardOptions: Array<ISelectOption>
  }>()

  const emits = defineEmits<{
    onSubmit: [IOS]
  }>()

  const moveOSFormRef = ref<FormInstance>()
  const stateOptions = ref<Array<ISelectOption>>([])
  const initialFormData = ref<IForm>()
  const isModified = ref(false)

  const form = reactive<IForm>({
    state: '',
    board: '',
  })

  const rules = reactive<FormRules<IForm>>({
    state: [{ required: true, message: 'Informe uma posição', trigger: 'change' }],
    board: [{ required: true, message: 'Informe um quadro', trigger: 'change' }],
  })

  const handleChangeBoard = (): void => {
    handleStateOptions()
    form.state = stateOptions.value[0]?.value || null
  }

  const handleSubmitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate((valid, fields) => {
      if (valid) {
        emits('onSubmit', { ...props.currentOS, stateId: form.state } as IOS)
      }
    })
  }

  const handleStateOptions = (): void => {
    const foundBoard = props.allBoards.find((board) => board.id === form.board)

    stateOptions.value = (foundBoard?.states || []).map((state, index) => ({
      label: state.name,
      value: state.id,
    }))
  }

  watch(
    () => props.show,
    () => {
      if (moveOSFormRef.value) {
        moveOSFormRef.value.resetFields()
      }

      const initialData = {
        state: (props.currentOS?.state || '').toString(),
        board: props.currentBoard,
      }

      initialFormData.value = _.cloneDeep(initialData)

      form.state = initialData.state
      form.board = initialData.board

      handleStateOptions()
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
