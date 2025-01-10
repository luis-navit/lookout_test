<template>
  <div class="user-card__wrapper">
    <div class="user-card__info-wrapper">
      <div class="user-card__info">
        <div class="user-card__header">
          <span class="text--lg bold">{{ name }}</span>
        </div>
        <div class="user-card__body">
          <span class="text--md ellipsis">
            Email:
            <strong class="bold">{{ email }}</strong>
          </span>
          <span class="text--md ellipsis">
            Permissão:
            <strong class="bold">{{ profile }}</strong>
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
  import emptyImage from '@/assets/emptyUserAvatar.png'
  import type { IDropdownItem } from '@/interfaces/IDropdownItem'
  import AppDropdown from '../AppDropdown/AppDropdown.vue'

  withDefaults(
    defineProps<{
      name: string
      email: string
      profile: string
      profileImg: string | null
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
    { command: 'edit', text: 'Editar usuário' },
    { command: 'delete', text: 'Excluir usuário', color: 'danger' },
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
