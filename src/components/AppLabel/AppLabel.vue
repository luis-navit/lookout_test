<template>
  <div class="label-container">
    <span class="text--md" :class="{ bold: bold, 'flex-line': isHorizontal }">{{ label }}</span>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
  withDefaults(defineProps<{ label: string; bold?: boolean; isHorizontal?: boolean }>(), {
    bold: true,
    isHorizontal: true,
  })
</script>

<style scoped lang="scss" src="./style.scss"></style>
