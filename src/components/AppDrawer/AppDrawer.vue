<template>
  <el-drawer
    :model-value="show"
    :direction="direction"
    :close-on-click-modal="false"
    destroy-on-close
    @close="handleClose"
  >
    <template #header>
      <span class="title--md">{{ title }}</span>
    </template>

    <div class="drawer-content">
      <slot />
    </div>
    <template #footer>
      <slot name="footer"></slot>
      <div class="drawer__footer" v-if="showFooter">
        <el-button type="" @click="handleCancel">{{ cancelBtnLabel }}</el-button>
        <el-button type="primary" :disabled="!isFormModified" @click="handleSubmit">{{
          submitBtnLabel
        }}</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
  import { elementDrawerDirectionEnum } from '@/enums/elementTypesEnum'
  import type { IDrawer } from '@/interfaces/IDrawer'

  withDefaults(defineProps<IDrawer>(), {
    show: false,
    showFooter: true,
    submitBtnLabel: 'confirmar',
    cancelBtnLabel: 'cancelar',
    direction: elementDrawerDirectionEnum.RIGHT_TO_LEFT,
  })

  const emits = defineEmits<{ onClose: []; onCancel: []; onSubmit: [] }>()

  const handleClose = (): void => {
    emits('onClose')
  }

  const handleCancel = (): void => {
    emits('onCancel')
  }

  const handleSubmit = (): void => {
    emits('onSubmit')
  }
</script>

<style scoped lang="scss" src="./style.scss"></style>
