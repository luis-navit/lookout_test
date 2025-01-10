<template>
  <div class="permission-rules-card">
    <div class="permission-rules-card__header ellipsis">
      <span class="title--md bold">{{ title }}</span>
    </div>
    <div class="permission-rules-card-content">
      <span class="text--md bold">Permissões</span>
      <AppSelect
        v-model="permissions"
        multiple
        clearable
        collapse-tags
        collapse-tags-tooltip
        placeholder="Selecione uma ou mais permissões"
        :max-collapse-tags="2"
        :options="options"
      ></AppSelect>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import type { IRole } from '@/interfaces/IGroupPermission'
  import type { ISelectOption } from '@/interfaces/ISelect'
  import AppSelect from '@/components/AppSelect/AppSelect.vue'

  const props = defineProps<{
    title: string
    roles: Array<IRole>
  }>()

  const permissions = defineModel<Array<string>>()
  const options = ref<Array<ISelectOption>>([])

  watch(
    () => props.roles,
    (value) => {
      options.value = value.map((role) => ({ label: role.name, value: role.id }))
    },
    {
      deep: true,
      immediate: true,
    }
  )
</script>

<style scoped lang="scss" src="./style.scss"></style>
