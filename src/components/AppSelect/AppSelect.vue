<template>
  <el-select class="select-container custom-select" :no-data-text="noDataText">
    <el-option
      v-for="(option, index) of options"
      :key="`option-${option.label}-${index}`"
      :value="option.value"
      :label="option.label"
      :disabled="option?.disabled"
    >
      <span class="label">{{ option.label }}</span>
      <span class="sub-label" v-if="option.subLabel?.length">{{ option.subLabel }}</span>
    </el-option>
  </el-select>
</template>

<script setup lang="ts">
import type { ISelectOption } from '@/interfaces/ISelect'

withDefaults(defineProps<{ options: Array<ISelectOption>; noDataText?: string }>(), {
  noDataText: 'Sem opções',
})
</script>

<style scoped lang="scss" src="./style.scss"></style>
