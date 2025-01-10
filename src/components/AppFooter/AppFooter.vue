<template>
  <footer class="footer-container">
    <span class="text--md footer-text">{{ footerText }}</span>
    <span class="text--md footer-text">{{ appVersion }}</span>
  </footer>
</template>

<script setup lang="ts">
  defineProps<{
    appVersion: string
    footerText: string
  }>()
</script>

<style scoped lang="scss" src="./style.scss"></style>
