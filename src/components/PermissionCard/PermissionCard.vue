<template>
  <div class="permission-card">
    <div class="permission-card__header ellipsis">
      <span class="title--md bold">{{ title }}</span>
      <el-tag class="state-tag master-tag" v-if="isAdmin" round effect="dark"> Master </el-tag>
      <el-tag class="state-tag" v-else round effect="dark" type="info"> Padrão </el-tag>
    </div>
    <div class="permission-card-content">
      <span class="text--md">
        Permissões:
        <strong class="bold">
          {{ `${permissionsCount} ${permissionsCount > 1 ? 'permissões' : 'permissão'}` }}
        </strong>
      </span>
    </div>
    <div v-if="showOptions" class="permission-card__footer">
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
      isAdmin: boolean
      permissionsCount: number
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
    { command: 'edit', text: 'Editar grupo de permissões' },
    { command: 'delete', text: 'Excluir grupo de permissões', color: 'danger' },
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
