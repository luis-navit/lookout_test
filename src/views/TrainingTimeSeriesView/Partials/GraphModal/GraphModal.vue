<template>
  <AppModal :show="show" :show-footer-buttons="false" :title="title">
    <div class="modal-content">
      <iframe class="modal-graph" frameborder="0" :srcdoc="graph"></iframe>
    </div>
  </AppModal>
</template>

<script setup lang="ts">
  import AppModal from '@/components/AppModal/AppModal.vue'

  defineProps<{
    show: boolean
    graph: string
    title: string
  }>()
</script>

<style scoped lang="scss" src="./style.scss"></style>
