<template>
  <div class="rule-card__wrapper">
    <div class="rule-card__header">
      <span class="text--lg bold">{{ title }}</span>
      <el-switch
        v-if="showOptions"
        class="custom-switch"
        v-model="ruleState"
        @change="handleChangeState"
      ></el-switch>
    </div>
    <div class="rule-card__body">
      <el-tooltip :content="query" placement="bottom" :show-after="300" :hide-after="300">
        <span class="text--md ellipsis">
          <strong class="bold">Regra: </strong>
          {{ query }}
        </span>
      </el-tooltip>
      <el-tooltip :content="message" placement="bottom" :show-after="300" :hide-after="300">
        <span class="text--md ellipsis">
          <strong class="bold">Mensagem: </strong>
          {{ message }}
        </span>
      </el-tooltip>
    </div>
    <div v-if="showOptions" class="rule-card__footer">
      <AppDropdown :systemOption="options" @onCommand="handleCommand">
        <div @click.stop class="card-options__trigger">
          <span class="bold">Gerenciar</span>
          <el-icon icon="CaretBottom" color="white">
            <CaretBottom />
          </el-icon>
        </div>
      </AppDropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { elMessage } from '@/composables/element'
  import { elementTypesEnum } from '@/enums/elementTypesEnum'
  import type { IDropdownItem } from '@/interfaces/IDropdownItem'
  import AppDropdown from '../AppDropdown/AppDropdown.vue'

  const props = withDefaults(
    defineProps<{
      title: string
      query: string
      message: string
      status: boolean
      showOptions: boolean
    }>(),
    {
      showOptions: true,
    }
  )

  const emits = defineEmits<{
    onEdit: []
    onDelete: []
    onChangeState: [newState: boolean]
  }>()

  const ruleState = ref<boolean>(props.status)

  const options = ref<Array<IDropdownItem>>([
    { command: 'edit', text: 'Editar regra' },
    { command: 'delete', text: 'Excluir regra', color: 'danger' },
  ])

  const handleCommand = (command: string): void => {
    const pattern: Record<string, any> = {
      edit: () => emits('onEdit'),
      delete: () => emits('onDelete'),
      default: () => elMessage('Recurso não encontrado!', elementTypesEnum.ERROR),
    }

    const handler = pattern[command] || pattern.default
    handler()
  }

  const handleChangeState = (newState: boolean): void => {
    emits('onChangeState', newState)
  }
</script>

<style scoped lang="scss" src="./style.scss"></style>
