<template>
  <RouterView class="app-container__view" v-slot="{ Component }">
    <div class="page-wrapper">
      <transition name="slide" mode="out-in">
        <component :is="Component" :key="$route.path" />
      </transition>
    </div>
  </RouterView>
</template>

<script setup lang="ts">
  import { RouterView } from 'vue-router'
</script>

<style scoped lang="scss" src="./index.scss"></style>
