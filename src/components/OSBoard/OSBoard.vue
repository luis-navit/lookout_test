<template>
  <li class="board-container" :class="{ 'board-collapse': isCollapse }">
    <div class="board__header" :class="{ 'collapsed-align': isCollapse }">
      <div class="title-container" @click="handleChangeCollapse">
        <el-icon :icon="isCollapse ? 'CaretRight' : 'CaretBottom'">
          <component :is="isCollapse ? 'CaretRight' : 'CaretBottom'" />
        </el-icon>
        <span class="title--md">{{ title }}</span>
      </div>
      <div class="board-actions-container">
        <div class="groups-count">
          <el-icon class="files-icon">
            <Files />
          </el-icon>
          <span class="text--md">{{ osGroup.length }}</span>
        </div>

        <div v-show="!isCollapse">
          <el-button-group>
            <el-tooltip
              v-if="canManagerOS"
              content="Adicionar nova OS"
              placement="top"
              :show-after="300"
              :hide-after="300"
            >
              <el-button type="primary" icon="Plus" @click="handleCreateOS"></el-button>
            </el-tooltip>
            <el-tooltip
              v-if="canManagerList"
              content="Gerenciar lista"
              placement="top"
              :show-after="300"
              :hide-after="300"
            >
              <AppDropdown
                :disabled="isDoneState"
                :systemOption="getSettingOptions"
                @onCommand="handleCommand"
              >
                <el-button
                  type="primary"
                  :class="{ disabled: isDoneState }"
                  icon="Setting"
                ></el-button>
              </AppDropdown>
            </el-tooltip>
          </el-button-group>
        </div>
      </div>
    </div>
    <div class="board__body" :class="{ 'collapse-items': isCollapse }">
      <draggable
        class="drag-list"
        :id="props.boardColumnId"
        :list="osGroup"
        group="os-states"
        @end="handleMoveCard"
        itemKey="id"
      >
        <template #item="{ element }">
          <ul class="board-os-list">
            <li class="board-os-item">
              <OsItem
                :os="element"
                :hasNextState="hasNextState"
                :hasDoneState="hasDoneState"
                :isInsideDoneState="isDoneState"
                @click="handleOSClick(element)"
              />
            </li>
          </ul>
        </template>
      </draggable>
    </div>
  </li>
</template>

<script setup lang="ts">
  import AppDropdown from '@/components/AppDropdown/AppDropdown.vue'
  import OsItem from '@/components/OsItem/OsItem.vue'
  import draggable from 'vuedraggable'
  import { computed, ref } from 'vue'
  import { elMessage } from '@/composables/element'
  import { elementTypesEnum } from '@/enums/elementTypesEnum'
  import type { IDropdownItem } from '@/interfaces/IDropdownItem'
  import type { IOS } from '@/interfaces/IOS'

  const props = withDefaults(
    defineProps<{
      title: string
      boardColumnId: string
      osGroup: Array<IOS>
      hasNextState: boolean
      canManagerOS: boolean
      canManagerList: boolean
      isSystemBoard: boolean
      hasDoneState: boolean
    }>(),
    {
      canManagerOS: true,
      canManagerList: true,
      isSystemBoard: false,
      isDoneBoard: false,
    }
  )

  const emits = defineEmits<{
    onOS: [IOS]
    onEdit: []
    onMove: []
    onArchive: []
    onDelete: []
    onCreate: []
    onMoveOS: [IOS]
  }>()

  const isCollapse = ref<boolean>(false)
  const isDoneState = ref<boolean>(props.boardColumnId.includes('done-state'))

  const handleMoveCard = (event: any) => {
    const boardColumnId = event?.to?.getAttribute('id')
    const newIndex = event?.newIndex
    const cardData = event?.item?.__draggable_context?.element

    const formattedData: IOS = {
      ...cardData,
      stateId: boardColumnId,
      position: newIndex + 1,
    }

    emits('onMoveOS', formattedData)
  }

  const handleCreateOS = (): void => {
    emits('onCreate')
  }

  const handleOSClick = (os: IOS): void => {
    emits('onOS', os)
  }

  const handleCommand = (command: string) => {
    const handler: Record<string, any> = {
      onEdit: () => emits('onEdit'),
      onMove: () => emits('onMove'),
      onDelete: () => emits('onDelete'),
      onArchive: () => emits('onArchive'),
      default: () => elMessage('Recurso não encontrado.', elementTypesEnum.ERROR),
    }

    const action = handler[command] || handler.default

    action()
  }

  const handleChangeCollapse = (): void => {
    isCollapse.value = !isCollapse.value
  }

  const getSettingOptions = computed<Array<IDropdownItem>>(() => {
    return [
      {
        text: 'Editar',
        command: 'onEdit',
        disabled: props.isSystemBoard,
      },
      {
        text: 'Mover',
        command: 'onMove',
        disabled: props.isSystemBoard,
      },
      {
        text: 'Arquivar',
        command: 'onArchive',
        disabled: props.isSystemBoard,
      },
      {
        text: 'Excluir',
        color: 'danger',
        command: 'onDelete',
        disabled: props.isSystemBoard,
      },
    ]
  })
</script>

<style scoped lang="scss" src="./style.scss"></style>
