<template>
  <div class="rule-training" :class="{ 'active-border': isChecked }">
    <div class="rule-training__header">
      <el-radio class="rule-training__radio" :label="radioValue">
        <span class="text--md bold ellipsis">{{ title }}</span>
      </el-radio>
      <el-tooltip content="Expandir gráfico" placement="bottom">
        <el-button link @click="handleExpand">
          <el-icon icon="FullScreen" size="16px">
            <FullScreen />
          </el-icon>
        </el-button>
      </el-tooltip>
    </div>
    <div class="metrics-container" v-if="metrics">
      <div class="metrics-item" v-for="(metric, key) of metrics" :key="metric">
        <span class="text--md bold">{{ key }}: </span>
        <span class="text--md">{{ metric.toFixed(3) }}</span>
      </div>
    </div>

    <iframe class="rule-training__graph" frameborder="0" :srcdoc="iframeSrc"></iframe>
  </div>
</template>

<script setup lang="ts">
  import type { IGraphResult } from '@/interfaces/ITraining'

  defineProps<{
    title: string
    iframeSrc: string
    radioValue: IGraphResult
    isChecked: boolean
    metrics?: Record<string, number>
    model?: string
  }>()

  const emits = defineEmits<{
    onExpand: []
  }>()

  const handleExpand = (): void => {
    emits('onExpand')
  }
</script>

<style scoped lang="scss" src="./style.scss"></style>
