<template>
  <el-menu class="menu-container" :default-active="activeItem" :collapse="isCollapse">
    <div v-if="showShortActions" class="short-action-wrapper">
      <el-tooltip :disabled="!isCollapse" effect="dark" placement="right" content="Ações rápidas">
        <AppDropdown
          class="short-action-item-wrapper"
          :systemOption="shortActions"
          @onCommand="handleShortCommand"
        >
          <el-menu-item class="short-action-item">
            <el-icon class="bold" :class="{ 'short-action-icon': isCollapse }">
              <FolderAdd />
            </el-icon>
            <span class="text--md color--white" v-if="!isCollapse">Ações rápidas</span>
          </el-menu-item>
        </AppDropdown>
      </el-tooltip>
    </div>
    <el-divider class="divider" />
    <div v-if="options?.length">
      <div v-for="(item, index) of options" :key="`menu-item-${index}`">
        <el-tooltip effect="dark" placement="right" :disabled="!isCollapse" :content="item.text">
          <el-menu-item
            class="menu-item"
            :index="item.index"
            @click="handleMenuSelect(item.command)"
          >
            <el-icon :icon="item.icon">
              <component :is="item.icon" />
            </el-icon>
            <span class="menu-item__label" v-if="!isCollapse">{{ item.text }}</span>
          </el-menu-item>
        </el-tooltip>
      </div>
      <el-divider class="divider divider-bottom" />
    </div>
    <div v-if="systemOptions.length">
      <div v-for="(item, index) of systemOptions" :key="`menu-system-item-${index}`">
        <el-tooltip effect="dark" placement="right" :disabled="!isCollapse" :content="item.text">
          <el-menu-item
            class="menu-item"
            :index="item.index"
            @click="handleMenuSelect(item.command)"
          >
            <el-icon>
              <component :is="item.icon" />
            </el-icon>
            <span v-if="!isCollapse">{{ item.text }}</span>
          </el-menu-item>
        </el-tooltip>
      </div>
      <div v-if="authStore.canViewThemeCard">
        <el-tooltip
          effect="dark"
          placement="right"
          :disabled="!isCollapse"
          :content="themeNavbarInfo.text"
        >
          <el-menu-item class="menu-item" @click="handleMenuSelect(themeNavbarInfo.command)">
            <el-icon>
              <component :is="themeNavbarInfo.icon" />
            </el-icon>
            <span v-if="!isCollapse">{{ themeNavbarInfo.text }}</span>
          </el-menu-item>
        </el-tooltip>
      </div>
      <el-divider class="divider divider-bottom" />
    </div>

    <div class="expand-container" @click="handleToggleMenu">
      <el-icon>
        <component :is="isCollapse ? 'ArrowRight' : 'ArrowLeft'" />
      </el-icon>
    </div>
  </el-menu>
</template>

<script setup lang="ts">
  import { useAuthStore } from '@/stores/authStore'
  import AppDropdown from '../AppDropdown/AppDropdown.vue'
  import type { INavbarItem } from '@/interfaces/INavbarItem'
  import type { IDropdownItem } from '@/interfaces/IDropdownItem'

  defineProps<{
    activeItem: string
    isCollapse: boolean
    showShortActions: boolean
    shortActions: Array<IDropdownItem>
    options?: Array<INavbarItem>
    systemOptions: Array<INavbarItem>
  }>()

  const authStore = useAuthStore()

  const themeNavbarInfo = {
    icon: 'Brush',
    text: 'Temas',
    index: 'theme',
    command: 'themes',
  }

  const emits = defineEmits<{
    onToggle: []
    onCommand: [command: string]
    onShortCommand: [command: string]
  }>()

  const handleShortCommand = (command: string): void => {
    emits('onShortCommand', command)
  }

  const handleMenuSelect = (command: string): void => {
    emits('onCommand', command)
  }

  const handleToggleMenu = (): void => {
    emits('onToggle')
  }
</script>

<style scoped lang="scss" src="./style.scss"></style>
