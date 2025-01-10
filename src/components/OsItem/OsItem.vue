<template>
  <div class="os-container">
    <el-icon class="alert-icon" :class="`alert-icon--${verifyIfIsInDoneState}`" size="2.5vh">
      <WarningFilled />
    </el-icon>
    <div class="os-content">
      <span class="text--md bold">{{ os.activity }}</span>
      <span class="text--md">{{ os.description }}</span>
      <span class="text--md">{{ handleRelativeDate(os.createdAt) }}</span>
    </div>
    <el-tooltip placement="top" content="Nº DE ALERTAS" :show-after="300" :hide-after="300">
      <div class="os-count-container">
        <el-icon icon="BellFilled" size="12" class="os-bell-icon">
          <BellFilled />
        </el-icon>
        <h4 class="os-count">{{ os.count }}</h4>
      </div>
    </el-tooltip>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { handleOSStatusByDate, handleRelativeDate } from '@/composables/utils'
  import { osStatusEnum } from '@/enums/osStatusEnum'
  import type { IOS } from '@/interfaces/IOS'

  const props = defineProps<{
    os: IOS
    hasNextState: boolean
    isInsideDoneState: boolean
    hasDoneState: boolean
  }>()

  const verifyIfIsInDoneState = computed(() => {
    if (props.isInsideDoneState) {
      return osStatusEnum.SUCCESS
    } else {
      if (props.hasDoneState) {
        return handleOSStatusByDate(props.os.dueDate, true, props.os.closed)
      } else {
        return handleOSStatusByDate(props.os.dueDate, props.hasNextState, props.os.closed)
      }
    }
  })
</script>

<style scoped lang="scss" src="./style.scss"></style>
