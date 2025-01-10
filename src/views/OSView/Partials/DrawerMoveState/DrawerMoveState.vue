<template>
  <AppDrawer
    :show="show"
    :isFormModified="isModified"
    title="Mover Lista"
    submit-btn-label="Mover lista"
    cancel-btn-label="Cancelar ação"
    @onSubmit="handleSubmitForm(moveStateFormRef)"
  >
    <div class="drawer-state-content">
      <el-form :model="form" ref="moveStateFormRef" label-position="top" :rules="rules">
        <el-form-item label="Posição" prop="stage">
          <AppSelect
            class="data-type-select"
            v-model="form.stage"
            :options="stageOptions"
            placeholder="Atribua uma posição para essa lista"
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
  import type { IBoard, IStateOS } from '@/interfaces/IBoard'
  import type { ISelectOption } from '@/interfaces/ISelect'

  interface IForm {
    stage: string
    board: string
  }

  const props = defineProps<{
    show: boolean
    currentBoard: string
    currentState: IStateOS | null
    allBoards: Array<IBoard>
    boardOptions: Array<ISelectOption>
  }>()

  const emits = defineEmits<{
    onSubmit: [IStateOS, string]
  }>()

  const moveStateFormRef = ref<FormInstance>()
  const stageOptions = ref<Array<ISelectOption>>([])
  const initialFormData = ref<IForm>()
  const isModified = ref(false)
  const form = reactive<IForm>({
    stage: '',
    board: '',
  })

  const rules = reactive<FormRules<IForm>>({
    stage: [{ required: true, message: 'Informe uma posição', trigger: 'change' }],
    board: [{ required: true, message: 'Informe um quadro', trigger: 'change' }],
  })

  const handleChangeBoard = (): void => {
    handleStageOptions()
    form.stage = stageOptions.value[0].value
  }

  const handleSubmitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate((valid, fields) => {
      if (valid) {
        emits(
          'onSubmit',
          { ...props.currentState, stage: parseInt(form.stage) } as IStateOS,
          form.board
        )
      }
    })
  }

  const handleStageOptions = (): void => {
    const foundBoard = props.allBoards.find((board) => board.id === form.board)

    const options = (foundBoard?.states || [])
      .filter((state) => !state.id.startsWith('done-state'))
      .map((state, index) => ({
        label: `Item ${index + 1}`,
        // ? Stage value will always be index + 2
        value: state.stage.toString(),
      }))

    stageOptions.value = options.length > 0 ? options : [{ label: 'Item 1', value: '1' }]
  }

  watch(
    () => form.stage,
    (newStage) => {
      stageOptions.value = stageOptions.value.map((stage) => ({
        ...stage,
        disabled: newStage === stage.value,
      }))
    }
  )

  watch(
    () => props.show,
    () => {
      if (moveStateFormRef.value) {
        moveStateFormRef.value.resetFields()
      }

      const initialData = {
        stage: (props.currentState?.stage || '').toString(),
        board: props.currentBoard,
      }

      initialFormData.value = _.cloneDeep(initialData)

      form.stage = initialData.stage
      form.board = initialData.board

      handleStageOptions()
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
