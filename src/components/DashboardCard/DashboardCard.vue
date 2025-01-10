<template>
  <div class="dashboard-card">
    <div class="dashboard-card__header ellipsis">
      <span class="title--md bold">{{ title }}</span>
    </div>
    <div class="types-container">
      <span class="text--md">Tipos de dados</span>
      <div class="types-tags-container">
        <el-tag
          class="custom-tag"
          v-for="(item, index) of types"
          :key="`type-tag-${index}`"
          effect="dark"
          round
        >
          {{ item.title }}
        </el-tag>
      </div>
    </div>
    <div v-if="showOptions" class="dashboard-card__footer">
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
  import type { IDashboardDataType } from '@/interfaces/IDashboard'
  import type { IDropdownItem } from '@/interfaces/IDropdownItem'
  import AppDropdown from '@/components/AppDropdown/AppDropdown.vue'

  withDefaults(
    defineProps<{
      title: string
      showOptions: boolean
      types: Array<IDashboardDataType>
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
    { command: 'edit', text: 'Editar dashboard' },
    { command: 'delete', text: 'Excluir dashboard', color: 'danger' },
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
