<template>
  <div class="app-container">
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useLocalStore } from './stores/localStore'
import { handleChangeGlobalTheme } from './composables/globalTheme'

const { getDataFromStore } = useLocalStore()

onMounted(() => {
  const userData = getDataFromStore('userData')
  const color = userData?.company?.theme?.color

  handleChangeGlobalTheme(color)
})
</script>

<style src="./index.scss" lang="scss"></style>
