<template>
  <el-dropdown trigger="click" :disabled="disabled" @command="handleCommand">
    <slot v-bind="{ disabled }"></slot>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="(item, index) of options"
          :key="`dropdown-option-item-${index}`"
          :command="item.command"
          :disabled="item.disabled ?? false"
        >
          <div class="dropdown-item-wrapper">
            <el-icon v-if="item.icon" :color="item.disabled ? undefined : item.color">
              <component :is="item.icon" />
            </el-icon>
            <span :class="`color--${item.disabled ? undefined : item.color}`">{{ item.text }}</span>
          </div>
        </el-dropdown-item>
        <el-dropdown-item v-if="options?.length" divided></el-dropdown-item>
        <el-dropdown-item
          v-for="(item, index) of systemOption"
          :key="`dropdown-system-item-${index}`"
          :command="item.command"
          :disabled="item.disabled ?? false"
        >
          <div class="dropdown-item-wrapper">
            <el-icon v-if="item.icon" :class="`color--${item.disabled ? undefined : item.color}`">
              <component :is="item.icon" />
            </el-icon>
            <span :class="`color--${item.disabled ? undefined : item.color}`">{{ item.text }}</span>
          </div>
        </el-dropdown-item>
        <div v-if="!options?.length && !systemOption.length" class="empty-container">
          <span class="text--md">Sem opções disponíveis</span>
        </div>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
  import type { IDropdownItem } from '@/interfaces/IDropdownItem'

  withDefaults(
    defineProps<{
      disabled?: boolean
      options?: Array<IDropdownItem>
      systemOption: Array<IDropdownItem>
    }>(),
    {
      disabled: false,
    }
  )

  const emits = defineEmits<{
    onCommand: [command: string]
  }>()

  const handleCommand = (command: string): void => {
    emits('onCommand', command)
  }
</script>

<style scoped lang="scss" src="./style.scss"></style>
