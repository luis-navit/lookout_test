<template>
  <div class="learning-card" @click="handleClick">
    <div class="learning-card-header-wrapper">
      <span class="title--md custom-title">{{ title }}</span>
    </div>
    <div class="status-wrapper">
      <span class="text--md">Status</span>
      <LearningTag class="state-tag" :status="status" />
    </div>
    <span class="text--md">
      Data de criação:
      <strong class="bold">{{ createdAt }}</strong>
    </span>
    <el-progress
      class="progress-bar"
      :class="{ 'without-percent': !status?.length, 'custom-progress': !status }"
      :percentage="!status?.length ? 100 : percentage"
      :indeterminate="!status?.length"
      :format="format"
      :status="status"
      :duration="3"
      :show-text="!!status?.length"
    />
  </div>
</template>

<script setup lang="ts">
  import LearningTag from '@/components/LearningTag/LearningTag.vue'
  import type { ILearningCard } from '@/interfaces/ILearningCard'

  defineProps<ILearningCard>()

  const emits = defineEmits<{
    onClick: []
  }>()

  const format = (percentage: number) => (percentage === 100 ? 'Full' : `${percentage}%`)

  const handleClick = (): void => {
    emits('onClick')
  }
</script>

<style scoped lang="scss" src="./style.scss"></style>
