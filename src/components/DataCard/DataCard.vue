<template>
  <div class="data-card" @click="handleClick">
    <div class="data-card-header ellipsis">
      <span class="title--md">{{ title }}</span>
    </div>
    <el-tag class="state-tag processed-tag" v-if="state === 'processed'" round effect="dark">
      Processado
    </el-tag>
    <el-tag class="state-tag" v-else round effect="dark" type="info"> Não processado </el-tag>
  </div>
</template>

<script setup lang="ts">
  import type { IDataCard } from '@/interfaces/IDataCard'

  defineProps<IDataCard>()

  const emits = defineEmits<{
    onClick: []
  }>()

  const handleClick = (): void => {
    emits('onClick')
  }
</script>

<style scoped lang="scss" src="./style.scss"></style>
