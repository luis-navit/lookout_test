<template>
  <el-dialog
    class="modal-container"
    top="5vh"
    :width="modalWidth"
    :model-value="show"
    :modalClass="modalClass"
    :alignCenter="alignCenter"
    style="border-radius: 16px"
    destroy-on-close
    @Close="handleClose"
  >
    <template #header>
      <div class="modal-container__header">
        <div class="modal-container__header-wrapper">
          <div class="modal-container__header-titles">
            <span class="title--md">{{ title }}</span>
            <span class="subtitle--md">{{ subtitle }}</span>
          </div>
          <slot name="modal-header"></slot>
        </div>
      </div>
    </template>
    <div class="modal-container__inner">
      <slot></slot>
    </div>
    <template #footer>
      <div class="footer">
        <slot name="modal-footer"></slot>
        <span class="text--md">{{ footerText }}</span>
        <div v-if="showFooterButtons">
          <el-button @Click="handleClose" v-if="showCancelButton" type="info" plain>
            {{ cancelBtnLabel }}
          </el-button>
          <el-button @Click="handleSubmit" type="primary">
            {{ primaryBtnLabel }}
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  withDefaults(
    defineProps<{
      title?: string
      subtitle?: string
      modalClass?: string
      modalWidth?: string
      footerText?: string
      cancelBtnLabel?: string
      primaryBtnLabel?: string
      show?: boolean
      alignCenter?: boolean
      showCancelButton?: boolean
      showFooterButtons?: boolean
    }>(),
    {
      title: '',
      subtitle: '',
      footerText: '',
      modalClass: '',
      modalWidth: '70%',
      primaryBtnLabel: 'Salvar',
      cancelBtnLabel: 'Cancelar',
      show: false,
      alignCenter: false,
      showCancelButton: true,
      showFooterButtons: true,
    }
  )

  const emits = defineEmits<{
    'on-close': []
    'on-submit': []
  }>()

  const handleClose = () => {
    emits('on-close')
  }

  const handleSubmit = () => {
    emits('on-submit')
  }
</script>

<style src="./style.scss" lang="scss" scoped></style>
