<template>
  <el-divider />
  <div class="archived-item-container">
    <span class="text--md bold">{{ title }}</span>
    <el-button @click="handleClick" plain icon="Back">Mover para o quadro</el-button>
  </div>
</template>

<script setup lang="ts">
  defineProps<{ title: string }>()

  const emits = defineEmits<{
    onClick: []
  }>()

  const handleClick = (): void => {
    emits('onClick')
  }
</script>

<style scoped lang="scss" src="./style.scss"></style>
