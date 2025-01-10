<template>
  <div class="user-card__wrapper">
    <div class="user-card__info-wrapper">
      <div class="user-card__info">
        <div class="user-card__header">
          <span class="text--lg bold">{{ name }}</span>
        </div>
        <div class="user-card__header">
          <span class="text--md">Visualize as informações e ações da empresa clicando no card</span>
        </div>
        <div class="user-card__body">
          <span class="status-container" :class="active ? 'active' : 'disabled'">
            {{ active ? 'Ativa' : 'Desativada' }}
          </span>
        </div>
      </div>
      <el-avatar
        class="user-avatar"
        size="large"
        shape="square"
        :src="profileImg || emptyImage"
      ></el-avatar>
    </div>
    <div v-if="showOptions" class="user-card__footer">
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
  import { computed } from 'vue'
  import { elMessage } from '@/composables/element'
  import { elementTypesEnum } from '@/enums/elementTypesEnum'
  import emptyImage from '@/assets/emptyUserAvatar.png'
  import type { IDropdownItem } from '@/interfaces/IDropdownItem'
  import AppDropdown from '../AppDropdown/AppDropdown.vue'

  const props = withDefaults(
    defineProps<{
      name: string
      active: boolean
      profileImg: string | null
      showOptions: boolean
    }>(),
    {
      showOptions: true,
    }
  )
  const emits = defineEmits<{
    onEdit: []
    onActivate: []
    onDelete: []
  }>()

  const options = computed(
    (): Array<IDropdownItem> => [
      { command: 'edit', text: 'Editar informações da empresa' },
      { command: 'activate', text: `${props.active ? 'Desativar' : 'Ativar'} empresa` },
      { command: 'delete', text: 'Excluir empresa', color: 'danger' },
    ]
  )

  const handleCommand = (command: string): void => {
    const pattern: Record<string, any> = {
      edit: () => emits('onEdit'),
      activate: () => emits('onActivate'),
      delete: () => emits('onDelete'),
      default: () => elMessage('Recurso não encontrado!', elementTypesEnum.ERROR),
    }

    const handler = pattern[command] || pattern.default
    handler()
  }
</script>

<style scoped lang="scss" src="./style.scss"></style>
