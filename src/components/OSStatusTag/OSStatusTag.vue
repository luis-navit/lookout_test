<template>
  <el-tag class="custom-tag" effect="dark" :type="config.type">
    <div class="tag-content">
      <el-icon color="white" :icon="config.icon">
        <component :is="config.icon" />
      </el-icon>
      <span class="text--md color--white">{{ config.label }}</span>
    </div>
  </el-tag>
</template>

<script setup lang="ts">
  import { handleOSStatusByDate } from '@/composables/utils'
  import { ref, watch } from 'vue'

  interface IConfig {
    icon: string
    label: string
    type: string
  }

  const props = defineProps<{
    date: string
  }>()

  const config = ref<IConfig>({
    icon: 'Warning',
    label: '',
    type: '',
  })

  const handleLabel = (): void => {
    const labels: Record<string, IConfig> = {
      '': { label: 'Baixa prioridade', icon: 'Warning', type: '' },
      success: { label: 'Atividade concluída', icon: 'CircleCheck', type: 'success' },
      warning: { label: 'Média prioridade', icon: 'Warning', type: 'warning' },
      danger: { label: 'Alta prioridade', icon: 'Warning', type: 'danger' },
    }

    config.value = labels[handleOSStatusByDate(props.date, true, false)]
  }

  watch(
    () => props.date,
    () => handleLabel(),
    {
      deep: true,
      immediate: true,
    }
  )
</script>

<style scoped lang="scss" src="./style.scss"></style>
