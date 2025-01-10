<template>
  <AppDrawer :show="show" :showFooter="false" title="Itens arquivados">
    <div class="drawer-content">
      <div class="info__header">
        <el-radio-group v-model="context">
          <el-radio-button label="OS"></el-radio-button>
          <el-radio-button label="Listas"></el-radio-button>
        </el-radio-group>
      </div>
      <div class="info-container">
        <div class="list__wrapper" v-show="context === 'OS'">
          <ul class="list-container" v-if="archivedOS.length">
            <li v-for="os of archivedOS" :key="os.id">
              <ArchivedItem :title="os.activity" @onClick="handleOSClick(os)" />
            </li>
            <el-divider />
          </ul>
          <div class="empty-container" v-else>
            <span class="text--md">Sem itens arquivados</span>
          </div>
        </div>
        <div class="list__wrapper" v-show="context === 'Listas'">
          <ul class="list-container" v-if="archivedOSState.length">
            <li v-for="state of archivedOSState" :key="state.id">
              <ArchivedItem :title="state.name" @onClick="handleStateClick(state)" />
            </li>
            <el-divider />
          </ul>
          <div class="empty-container" v-else>
            <span class="text--md">Sem itens arquivados</span>
          </div>
        </div>
      </div>
    </div>
  </AppDrawer>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import AppDrawer from '@/components/AppDrawer/AppDrawer.vue'
  import type { IArchiveOS, IArchiveState } from '@/interfaces/IBoard'
  import ArchivedItem from '@/components/ArchivedItem/ArchivedItem.vue'

  defineProps<{
    show: boolean
    archivedOS: Array<IArchiveOS>
    archivedOSState: Array<IArchiveState>
  }>()

  const emits = defineEmits<{
    'onSubmit:os': [string]
    'onSubmit:state': [string]
  }>()

  const context = ref<string>('OS')

  const handleOSClick = (os: IArchiveOS): void => {
    emits('onSubmit:os', os.id)
  }
  const handleStateClick = (state: IArchiveState): void => {
    emits('onSubmit:state', state.id)
  }
</script>

<style scoped lang="scss" src="./style.scss"></style>
