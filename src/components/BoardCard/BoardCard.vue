<template>
  <div class="board-card" :class="{ 'board-card--default': isDefaultCard }">
    <div class="board-card__header ellipsis">
      <span class="title--md bold" :class="{ 'color--white': isDefaultCard }">{{ title }}</span>
    </div>
    <div class="board-card-content">
      <span class="text--md bold" :class="{ 'color--white': isDefaultCard }">
        {{ `${count} ${count === 1 ? 'lista' : 'listas'} no quadro` }}
      </span>
    </div>
    <div v-if="showOptions" class="board-card__footer">
      <el-tooltip :disabled="!isDefaultCard" content="Esse quadro não pode ser gerenciado">
        <AppDropdown :disabled="isDefaultCard" :systemOption="options" @onCommand="handleCommand">
          <div
            @click.stop
            class="card-options__trigger"
            :class="{ 'card-options__trigger--disabled': isDefaultCard }"
          >
            <span class="bold">Gerenciar</span>
            <el-icon color="white">
              <CaretBottom />
            </el-icon>
          </div>
        </AppDropdown>
      </el-tooltip>
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
      count: number
      showOptions: boolean
      isDefaultCard?: boolean
    }>(),
    {
      showOptions: true,
      isDefaultCard: false,
    }
  )

  const emits = defineEmits<{
    onEdit: []
    onDelete: []
  }>()

  const options = ref<Array<IDropdownItem>>([
    { command: 'edit', text: 'Editar' },
    { command: 'delete', text: 'Excluir', color: 'danger' },
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
