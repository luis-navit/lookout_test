<template>
  <el-collapse class="collapse-wrapper">
    <el-collapse-item class="custom-collapse-item">
      <template #title>
        <div class="item__title">
          <slot name="title"></slot>
        </div>
      </template>
      <div class="item__wrapper">
        <slot></slot>
      </div>
    </el-collapse-item>
  </el-collapse>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss" src="./style.scss"></style>
