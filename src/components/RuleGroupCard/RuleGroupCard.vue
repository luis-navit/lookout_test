<template>
  <div class="rule-group-card">
    <div class="rule-group-card__header ellipsis">
      <span class="title--md bold">{{ title }}</span>
    </div>
    <div class="rule-group-card-content">
      <span class="text--md"><strong class="bold">Técnica utilizada: </strong>{{ technique }}</span>
      <span class="text--md">
        <strong class="bold">Modelo utilizado: </strong>{{ algorithmName }}
      </span>
    </div>
    <div v-if="showOptions" class="rule-group-card__footer">
      <AppDropdown :systemOption="options" @onCommand="handleCommand">
        <div @click.stop class="card-options__trigger">
          <span class="bold">Gerenciar</span>
          <el-icon color="white">
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
  import AppDropdown from '@/components/AppDropdown/AppDropdown.vue'

  withDefaults(
    defineProps<{
      title: string
      technique: string
      algorithmName: string
      showOptions: boolean
    }>(),
    {
      showOptions: true,
    }
  )

  const emits = defineEmits<{
    onEdit: []
    onDelete: []
  }>()

  const options = ref<Array<IDropdownItem>>([
    { command: 'edit', text: 'Editar informações do conjunto de regras' },
    { command: 'delete', text: 'Excluir conjunto de regras', color: 'danger' },
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
</script>

<style scoped lang="scss" src="./style.scss"></style>
