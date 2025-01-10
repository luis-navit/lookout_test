<template>
  <div class="comment-container">
    <span class="text--md">
      <strong class="bold">{{ user }}</strong>
      {{ handleRelativeDate(date) }}
    </span>
    <span class="text--md">{{ message }}</span>
  </div>
</template>

<script setup lang="ts">
  import { handleRelativeDate } from '@/composables/utils'

  defineProps<{
    user: string
    date: string
    message: string
  }>()
</script>

<style scoped lang="scss" src="./style.scss"></style>
