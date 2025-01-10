<template>
  <AppModal :show="show" :show-footer-buttons="false" :title="result?.algorithmName">
    <div class="modal-content">
      <div class="metrics-container" v-if="result?.metrics">
        <div class="metrics-item" v-for="(metric, key) of result?.metrics">
          <span class="text--md bold">{{ key }}: </span>
          <span class="text--md">{{ metric.toFixed(3) }}</span>
        </div>
      </div>
      <div class="model-container" v-else-if="result?.model">
        <div class="model-item" v-for="(value, key) of handleFormatModelText(result.model)">
          <span class="text--md bold">{{ key }}: </span>
          <span class="text--md">{{ value }}</span>
        </div>
      </div>
      <iframe class="modal-graph" frameborder="0" :srcdoc="result?.graphSrc"></iframe>
    </div>
  </AppModal>
</template>

<script setup lang="ts">
  import AppModal from '@/components/AppModal/AppModal.vue'
  import { handleFormatModelText } from '@/composables/utils'
  import type { IGraphResult } from '@/interfaces/ITraining'

  defineProps<{
    show: boolean
    result: IGraphResult | null
  }>()
</script>

<style scoped lang="scss" src="./style.scss"></style>
