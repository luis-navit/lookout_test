<template>
  <div class="iframe-card">
    <div class="iframe-card__header">
      <span class="text--md bold ellipsis">{{ title }}</span>
      <el-tooltip content="Expandir gráfico" placement="bottom">
        <el-button link @click="handleExpand">
          <el-icon size="16px">
            <FullScreen />
          </el-icon>
        </el-button>
      </el-tooltip>
    </div>
    <iframe class="iframe-card__content" frameborder="0" :srcdoc="iframeSrc"></iframe>
  </div>
</template>

<script setup lang="ts">
  defineProps<{
    title: string
    iframeSrc: string
  }>()

  const emits = defineEmits<{
    onExpand: []
  }>()

  const handleExpand = (): void => {
    emits('onExpand')
  }
</script>

<style scoped lang="scss" src="./style.scss"></style>
