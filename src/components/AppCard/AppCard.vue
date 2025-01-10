<template>
  <div class="card" @click.stop="handleClick">
    <div class="card-header-wrapper">
      <div class="card-header">
        <span class="title--md card-title">{{ title }}</span>
        <span class="text--md card-text">{{ subtitle }}</span>
      </div>
      <el-icon class="card-icon" v-if="icon" size="24px">
        <component :is="icon" />
      </el-icon>
    </div>
    <span class="text--md bold card-text" v-if="bodyText">{{ bodyText }}</span>
  </div>
</template>

<script setup lang="ts">
  defineProps<{
    title: string
    subtitle: string
    icon?: string
    bodyText?: string
  }>()

  const emits = defineEmits<{
    onClick: []
  }>()

  const handleClick = (): void => {
    emits('onClick')
  }
</script>

<style scoped lang="scss" src="./style.scss"></style>
