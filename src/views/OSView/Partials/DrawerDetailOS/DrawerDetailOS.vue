<template>
  <AppDrawer title="Detalhes da ordem de serviço" :show="show" :show-footer="false">
    <div class="drawer-os-content">
      <div class="os-details">
        <div class="os-details__item">
          <span class="text--md bold">{{ currentOS?.activity }}</span>
          <span class="text--md">{{ currentOS?.description }}</span>
        </div>
        <div class="os-details__item" v-if="currentOS?.ruleName">
          <span class="text--md bold">Nome da regra: </span>
          <span class="text--md">
            {{ currentOS?.ruleName }}
          </span>
        </div>
        <div class="os-details__item" v-if="currentOS?.modelName">
          <span class="text--md bold">Nome do grupo de regras: </span>
          <span class="text--md">
            {{ currentOS?.modelName }}
          </span>
        </div>
        <div class="os-details__item">
          <span class="text--md bold">Responsáveis: </span>
          <span class="text--md">
            {{ currentOS?.users.map((e) => e.name).join(', ') || 'Nenhum responsável' }}
          </span>
        </div>
        <div class="os-details__item">
          <span class="text--md bold">Data de entrega </span>
          <el-date-picker
            v-if="canManagerOS"
            class="grow"
            v-model="dueDate"
            type="datetime"
            format="DD/MM/YYYY HH:mm:ss"
            placeholder="Informe uma data de expiração da OS"
            range-separator="Até"
            end-placeholder="Data final"
            start-placeholder="Data inicial"
            @change="handleChangeDate"
          />
          <span v-else class="text--md">{{ dueDate || 'Não informada' }}</span>
        </div>
        <div class="os-details__item">
          <OSStatusTag :date="currentOS?.dueDate || ''" />
          <el-checkbox
            @click="handleFinishOs"
            class="finish-os"
            label="Concluir atividade"
            v-model="isDone"
            v-if="isDone === false"
            border
          />
        </div>

        <el-divider></el-divider>

        <div class="os-details__item">
          <span class="text--md bold">Anexos </span>
          <el-upload
            class="custom-upload"
            v-model:file-list="fileList"
            list-type="picture-card"
            :multiple="true"
            :auto-upload="false"
            :onChange="handleUpload"
            drag
          >
            <el-icon>
              <Plus />
            </el-icon>
            <template #file="data">
              <div class="file-list-container">
                <div
                  class="file-image-container"
                  v-if="(data?.file?.raw?.type || data?.file?.name)?.includes('image')"
                >
                  <el-image
                    class="file-image"
                    fit="contain"
                    :src="data?.file.raw"
                    :preview-src-list="[data?.file.raw]"
                    :hide-on-click-modal="true"
                    :teleported="true"
                  >
                    <template #viewer>
                      <span
                        @click="handleDownloadPreviewImage"
                        class="el-image-viewer__btn el-image-viewer__close download-image-btn"
                      >
                        <el-icon size="25" color="white">
                          <Download />
                        </el-icon>
                      </span>
                    </template>
                  </el-image>
                </div>
                <span v-else class="text--md ellipsis">{{ data?.file.name }}</span>
              </div>
              <div class="delete-btn" @click="handleDeleteFile(data)">
                <el-icon color="danger">
                  <DeleteFilled />
                </el-icon>
              </div>
            </template>
          </el-upload>
        </div>
        <el-divider></el-divider>
        <div class="os-details__item">
          <span class="text--md bold">Comentários </span>
          <ul class="comments-container" v-if="currentOS?.comments.length">
            <li v-for="comment of currentOS.comments" :key="comment.id">
              <CommentRow
                :user="
                  authStore.userData.id === comment?.user?.id
                    ? 'Você'
                    : (comment?.user?.name ?? 'Desconhecido')
                "
                :date="comment.createdAt || ''"
                :message="comment.message"
              />
            </li>
          </ul>
          <span class="text--md" v-else>Nenhum comentário</span>
        </div>
        <div v-if="canCommentOS" class="os-details__item">
          <span class="text--md bold">Novo comentário</span>
          <el-input
            v-model="comment"
            :rows="3"
            type="textarea"
            placeholder="Adicione um comentário"
          />
          <el-button type="primary" @click="handleComment">Comentar</el-button>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="drawer-os-details__footer">
        <el-button @click="handleClose">Fechar detalhes</el-button>
        <AppDropdown class="os-options" :systemOption="options" @onCommand="handleCommand">
          <div @click.stop class="os-options__trigger">
            <span class="bold">Gerenciar</span>
            <el-icon color="white">
              <CaretBottom />
            </el-icon>
          </div>
        </AppDropdown>
      </div>
    </template>
  </AppDrawer>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { elMessage } from '@/composables/element'
  import { elementTypesEnum } from '@/enums/elementTypesEnum'
  import { useAuthStore } from '@/stores/authStore'
  import { updateOS } from '@/services/os'
  import type { IDropdownItem } from '@/interfaces/IDropdownItem'
  import type { UploadUserFile } from 'element-plus'
  import type { IOS } from '@/interfaces/IOS'
  import AppDrawer from '@/components/AppDrawer/AppDrawer.vue'
  import AppDropdown from '@/components/AppDropdown/AppDropdown.vue'
  import CommentRow from '@/components/CommentRow/CommentRow.vue'
  import OSStatusTag from '@/components/OSStatusTag/OSStatusTag.vue'

  const props = withDefaults(
    defineProps<{
      show: boolean
      currentOS: IOS | null
      boardId: string
      companyId: string | undefined
      canManagerOS: boolean
      canCommentOS: boolean
    }>(),
    {
      canManagerOS: true,
      canCommentOS: true,
    }
  )

  const emits = defineEmits<{
    onMove: []
    onEdit: []
    onCancel: []
    onDelete: [IOS]
    onUpload: [IOS, any]
    onArchive: [string]
    onDateChange: [IOS, string]
    onComment: [string, string]
    onUpdatePage: []
    'onDelete:archive': [string]
  }>()

  const authStore = useAuthStore()

  const fileList = ref<Array<UploadUserFile>>([])
  const comment = ref<string>('')
  const dueDate = ref<string>('')
  const isDone = ref<boolean>(false)
  const options = ref<Array<IDropdownItem>>([
    {
      text: 'Editar',
      command: 'edit',
    },
    {
      text: 'Mover',
      command: 'move',
    },
    {
      text: 'Arquivar',
      command: 'archive',
    },
    {
      text: 'Excluir',
      color: 'danger',
      command: 'delete',
    },
  ])

  const handleClose = (): void => {
    emits('onCancel')
  }

  const handleComment = (): void => {
    emits('onComment', props.currentOS?.id || '', comment.value)
  }

  const handleChangeDate = (): void => {
    emits('onDateChange', { ...props.currentOS } as IOS, new Date(dueDate.value).toUTCString())
  }

  const handleUpload = (file: any): void => {
    emits('onUpload', { ...props.currentOS } as IOS, file.raw)
  }

  const handleDeleteFile = ({ file }: Record<string, any>): void => {
    emits('onDelete:archive', file.id)
  }

  const handleCommand = (command: string): void => {
    const pattern: Record<string, any> = {
      edit: () => emits('onEdit'),
      move: () => emits('onMove'),
      delete: () => emits('onDelete', props.currentOS as IOS),
      archive: () => emits('onArchive', props.currentOS?.id || ''),
      default: () => elMessage('Recurso não encontrado!', elementTypesEnum.ERROR),
    }

    const handler = pattern[command] || pattern.default
    handler()
  }

  const handleDownloadPreviewImage = () => {
    const imgElement: any = document.getElementsByClassName('el-image-viewer__img')
    const link = document.createElement('a')
    link.href = imgElement[0].src
    link.download = 'imagemOS.jpg'
    link.click()
  }

  const handleFinishOs = async () => {
    try {
      if (props.currentOS) {
        const isDoneState = props.boardId.includes('alerts')

        await updateOS(props.currentOS.id, {
          ...props.currentOS,
          users: props.currentOS.users.map((e) => e.id),
          files: [],
          stateId: `done-state-${isDoneState ? props.companyId : props.boardId}`,
        })

        emits('onUpdatePage')
        handleClose()
        elMessage('Ordem de serviço concluída com sucesso!', elementTypesEnum.SUCCESS)
      }
    } catch (error) {}
  }

  watch(
    () => props.show,
    () => {
      comment.value = ''
      dueDate.value = props.currentOS?.dueDate || ''
      fileList.value = [...(props.currentOS?.files || [])]
    },
    { deep: true }
  )

  watch(
    () => props.currentOS?.files,
    (value) => {
      fileList.value = [...(value || [])]
    },
    { deep: true }
  )

  watch(
    () => props.currentOS?.comments,
    () => {
      comment.value = ''
    },
    { deep: true }
  )

  watch(
    () => props.currentOS?.state,
    (newValue) => {
      if (newValue) {
        isDone.value = newValue.includes('done-state')
      }
    },
    { deep: true }
  )
</script>

<style scoped lang="scss" src="./style.scss"></style>
