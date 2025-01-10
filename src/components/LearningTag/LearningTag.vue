<template>
  <el-tag :class="{ 'learning-tag': status === '' }" round effect="dark" :type="handleType()">
    {{ handleLabel() }}
  </el-tag>
</template>

<script setup lang="ts">
  import type { learningStatusEnum } from '@/enums/learningEnums'

  const props = defineProps<{ status: learningStatusEnum }>()

  const handleType = (): string => {
    const pattern: Record<string, string> = {
      success: 'success',
      exception: 'danger',
      default: '',
    }

    return pattern[props.status] || pattern.default
  }

  const handleLabel = (): string => {
    const pattern: Record<string, string> = {
      success: 'Concluído',
      exception: 'Erro',
      default: 'Em treinamento',
    }

    return pattern[props.status] || pattern.default
  }
</script>

<style scoped lang="scss" src="./style.scss"></style>
