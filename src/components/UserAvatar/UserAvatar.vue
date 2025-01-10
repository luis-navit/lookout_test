<template>
  <div class="user-avatar-container">
    <el-avatar class="user-avatar" :src="image || emptyImage"></el-avatar>
    <span class="text--md color--white bold color-toggle">{{ name }}</span>
  </div>
</template>

<script setup lang="ts">
  import emptyImage from '@/assets/emptyUserAvatar.png'

  defineProps<{ image?: string; name: string }>()
</script>
<style scoped lang="scss" src="./style.scss"></style>
