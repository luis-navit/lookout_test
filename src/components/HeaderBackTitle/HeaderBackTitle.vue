<template>
  <div class="header-back-title-wrapper">
    <el-icon class="back-icon" v-if="showBackIcon" size="30" @click="handleBack">
      <Back />
    </el-icon>
    <div class="title-wrapper">
      <h1 class="title--lg">{{ title }}</h1>
      <span class="subtitle--lg">{{ subtitle }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
  withDefaults(defineProps<{ title: string; subtitle: string; showBackIcon?: boolean }>(), {
    showBackIcon: true,
  })

  const emits = defineEmits<{ onBack: [] }>()

  const handleBack = (): void => {
    emits('onBack')
  }
</script>

<style scoped lang="scss" src="./style.scss"></style>
