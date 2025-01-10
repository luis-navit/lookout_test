<template>
  <div class="os-detail-view">
    <div class="os-detail__header">
      <div class="os-detail__header-left">
        <el-icon class="back-icon" size="30" @click="handleBack">
          <Back />
        </el-icon>
        <AppSelect v-model="boardSelected" :options="boardsOptions" @change="handleChangeBoard" />
        <AppDropdown
          v-if="canManagerBoard"
          :systemOption="getBoardManagerOptions"
          @onCommand="handleCommand"
        >
          <el-button class="manager-btn" plain type="primary">
            Gerenciar quadro
            <el-icon class="manager-icon">
              <Setting />
            </el-icon>
          </el-button>
        </AppDropdown>
      </div>
      <div class="actions-wrapper">
        <el-input
          class="actions-search"
          v-model="search"
          suffix-icon="Search"
          placeholder="Pesquise uma informação nos cards abaixo "
          clearable
        />
        <el-button v-if="canManagerList" type="primary" icon="Plus" @click="handleOpenDrawerState">
          Nova lista
        </el-button>
      </div>
    </div>
    <draggable
      v-if="states.length"
      id="drag-board-states"
      class="drag-columns os-detail__body"
      group="os-columns"
      itemKey="id"
      :list="getStates"
      @change="handleDragState"
    >
      <template #item="{ element, index }">
        <ul class="states-container">
          <OSBoard
            :title="element.name"
            :boardColumnId="element.id"
            :osGroup="element?.os || []"
            :hasNextState="index !== getStates.length - 1"
            :canManagerOS="canManagerOS"
            :canManagerList="canManagerList"
            :isSystemBoard="element.id.toLowerCase().includes('alerts')"
            :hasDoneState="boardHasDoneStateByDefault"
            @onOS="handleShowOS"
            @onMoveOS="handleSubmitMoveOS"
            @onCreate="handleCreateOS(element)"
            @onEdit="handleEditState(element)"
            @onMove="handleMoveState(element)"
            @onDelete="handleDeleteState(element)"
            @onArchive="handleArchiveState(element)"
          />
        </ul>
      </template>
    </draggable>
    <div class="empty-container" v-else>
      <h2 class="title--md">Nenhuma informação encontrada no momento.</h2>
    </div>
    <DrawerState
      :show="showDrawerState"
      :currentState="currentState"
      @onClose="handleCloseDrawerState"
      @onCancel="handleCloseDrawerState"
      @onSubmit:save="handleSubmitNewState"
      @onSubmit:edit="handleSubmitUpdateState"
    />
    <DrawerMoveState
      :show="showDrawerMove"
      :currentBoard="queryParams.id"
      :currentState="currentState"
      :boardOptions="boardsOptions"
      :allBoards="allBoards"
      @onClose="handleCloseDrawerMove"
      @onCancel="handleCloseDrawerMove"
      @onSubmit="handleSubmitMoveState"
    />
    <DrawerBoard
      :show="showDrawerBoard"
      :currentBoard="boardData"
      :participantsOptions="participantsOptions"
      @onClose="handleCloseDrawerBoard"
      @onCancel="handleCloseDrawerBoard"
      @onSubmit="handleSubmitUpdateBoard"
    />
    <DrawerArchive
      :show="showDrawerArchive"
      :archivedOS="archivedOS"
      :archivedOSState="archivedOSState"
      @onClose="handleCloseDrawerArchive"
      @onCancel="handleCloseDrawerArchive"
      @onSubmit:os="(id) => handleSubmitArchiveOS(id, false)"
      @onSubmit:state="handleSubmitArchiveOSState"
    />
    <DrawerDetailOS
      :show="showDrawerDetailOS"
      :currentOS="currentOS"
      :canManagerOS="canManagerOS"
      :canCommentOS="canCommentOS"
      :boardId="queryParams.id"
      :companyId="boardData?.company"
      @onEdit="handleOpenDrawerCreateOS"
      @onClose="handleCloseDrawerDetailOS"
      @onCancel="handleCloseDrawerDetailOS"
      @onUpload="handleSubmitUploadFiles"
      @onComment="handleSubmitNewComment"
      @onDelete="handleDeleteOS"
      @onArchive="handleArchiveOS"
      @onDateChange="handleSubmitChangeOSDate"
      @onMove="handleOpenDrawerMoveOS"
      @onUpdatePage="handleGetPageData"
      @onDelete:archive="handleDeleteArchive"
    />
    <DrawerCreateOS
      :show="showDrawerCreateOS"
      :currentOS="currentOS"
      :participantsOptions="participantsOptions"
      @onClose="handleCloseDrawerCreateOS"
      @onCancel="handleCloseDrawerCreateOS"
      @onSubmit:save="handleSubmitCreateOS"
      @onSubmit:edit="handleSubmitUpdateOS"
    />
    <DrawerMoveOS
      :show="showDrawerMoveOS"
      :currentBoard="queryParams.id"
      :currentState="currentState"
      :boardOptions="boardsOptions"
      :allBoards="allBoards"
      :currentOS="currentOS"
      @onClose="handleCloseDrawerMoveOS"
      @onCancel="handleCloseDrawerMoveOS"
      @onSubmit="handleSubmitMoveOS"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue'
  import { ElMessageBox, type UploadUserFile } from 'element-plus'
  import { useRoute, useRouter, type RouteLocationNormalizedLoaded } from 'vue-router'
  import { elLoading, elMessage } from '@/composables/element'
  import { handleCheckContext, handleFileToBase64, handleFilterData } from '@/composables/utils'
  import { elementTypesEnum } from '@/enums/elementTypesEnum'
  import type {
    IArchiveOS,
    IArchiveState,
    IBoard,
    IBoardResume,
    IFormBoard,
    IStateOS,
  } from '@/interfaces/IBoard'
  import type { IDropdownItem } from '@/interfaces/IDropdownItem'
  import type { ICreateOS, IOS } from '@/interfaces/IOS'
  import type { ISelectOption } from '@/interfaces/ISelect'
  import { addAttachment, deleteAttachment } from '@/services/attachment'
  import { deleteBoard, getAllBoards, getBoardById, updateBoard } from '@/services/boards'
  import { createComment } from '@/services/comment'
  import { downloadFile, downloadImage } from '@/services/files'
  import {
    createOS,
    deleteOS,
    getAllArchivedOS,
    getOSByBoard,
    getOSById,
    updateArchiveOS,
    updateOS,
  } from '@/services/os'
  import {
    createOSState,
    deleteOSState,
    getAllArchivedOSState,
    updateArchiveOSState,
    updateOSState,
  } from '@/services/osState'
  import { getAllUsersResume } from '@/services/users'
  import AppDropdown from '@/components/AppDropdown/AppDropdown.vue'
  import AppSelect from '@/components/AppSelect/AppSelect.vue'
  import OSBoard from '@/components/OSBoard/OSBoard.vue'
  import DrawerArchive from './Partials/DrawerArchive/DrawerArchive.vue'
  import DrawerBoard from './Partials/DrawerBoard/DrawerBoard.vue'
  import DrawerCreateOS from './Partials/DrawerCreateOS/DrawerCreateOS.vue'
  import DrawerDetailOS from './Partials/DrawerDetailOS/DrawerDetailOS.vue'
  import DrawerMoveOS from './Partials/DrawerMoveOS/DrawerMoveOS.vue'
  import DrawerMoveState from './Partials/DrawerMoveState/DrawerMoveState.vue'
  import DrawerState from './Partials/DrawerState/DrawerState.vue'
  import roleEnum from '@/enums/roleEnum'
  import draggable from 'vuedraggable'

  interface IQueryParams {
    id: string
  }

  const route = useRoute()
  const router = useRouter()

  const states = ref<Array<IStateOS>>([])
  const getStates = ref<Array<IStateOS>>([])
  const search = ref<string>('')
  const boardData = ref<IBoardResume | null>(null)
  const boardSelected = ref<string>('')
  const boardsOptions = ref<Array<ISelectOption>>([])
  const allBoards = ref<Array<IBoard>>([])
  const queryParams = ref<IQueryParams>({ id: '' })
  const archivedOS = ref<Array<IArchiveOS>>([])
  const archivedOSState = ref<Array<IArchiveState>>([])
  const showDrawerState = ref<boolean>(false)
  const showDrawerMove = ref<boolean>(false)
  const showDrawerBoard = ref<boolean>(false)
  const showDrawerArchive = ref<boolean>(false)
  const showDrawerCreateOS = ref<boolean>(false)
  const showDrawerDetailOS = ref<boolean>(false)
  const showDrawerMoveOS = ref<boolean>(false)
  const currentOS = ref<IOS | null>(null)
  const currentState = ref<IStateOS | null>(null)
  const participantsOptions = ref<Array<ISelectOption>>([])
  const boardHasDoneStateByDefault = ref<boolean>(false)

  const handleBack = (): void => {
    router.push({ name: 'BoardsView' })
  }

  const handleCommand = (command: string) => {
    const handler: Record<string, any> = {
      onEdit: () => handleOpenDrawerBoard(),
      onDelete: () => handleDeleteBoard(),
      onArchive: () => handleOpenDrawerArchive(),
      default: () => elMessage('Recurso não encontrado.', elementTypesEnum.ERROR),
    }

    const action = handler[command] || handler.default

    action()
  }

  const handleOpenDrawerState = (): void => {
    showDrawerState.value = true
  }

  const handleCloseDrawerState = (): void => {
    currentState.value = null
    showDrawerState.value = false
  }

  const handleOpenDrawerMove = (): void => {
    showDrawerMove.value = true
  }

  const handleCloseDrawerMove = (): void => {
    currentState.value = null
    showDrawerMove.value = false
  }

  const handleOpenDrawerBoard = (): void => {
    showDrawerBoard.value = true
  }

  const handleCloseDrawerBoard = (): void => {
    showDrawerBoard.value = false
  }

  const handleCloseDrawerArchive = (): void => {
    showDrawerArchive.value = false
  }

  const handleOpenDrawerCreateOS = (): void => {
    showDrawerCreateOS.value = true
  }

  const handleCloseDrawerCreateOS = (): void => {
    showDrawerCreateOS.value = false
  }

  const handleOpenDrawerDetailOS = (): void => {
    showDrawerDetailOS.value = true
  }

  const handleCloseDrawerDetailOS = (): void => {
    showDrawerDetailOS.value = false
  }

  const handleOpenDrawerMoveOS = (): void => {
    showDrawerMoveOS.value = true
  }

  const handleCloseDrawerMoveOS = (): void => {
    showDrawerMoveOS.value = false
  }

  const handleShowOS = async (os: IOS): Promise<void> => {
    await handleGetOSDetail(os)
    handleOpenDrawerDetailOS()
  }

  const handleCreateOS = (state: IStateOS): void => {
    currentState.value = { ...state }
    currentOS.value = null
    showDrawerCreateOS.value = true
  }

  const handleEditState = (state: IStateOS): void => {
    currentState.value = { ...state }
    handleOpenDrawerState()
  }

  const handleMoveState = (state: IStateOS): void => {
    currentState.value = { ...state }
    handleOpenDrawerMove()
  }

  const handleDeleteState = (state: IStateOS): void => {
    ElMessageBox.confirm(
      'Ao excluir a lista, você perderá informações cadastradas! Deseja continuar com a ação de excluir?',
      'Deseja excluir a lista?',
      {
        confirmButtonText: 'Excluir',
        cancelButtonText: 'Cancelar',
        confirmButtonClass: 'danger-btn',
      }
    ).then(() => {
      handleSubmitDeleteState(state)
    })
  }

  const handleChangeBoard = (newBoard: string): void => {
    if (newBoard !== queryParams.value.id) {
      router.push({ query: { id: newBoard } }).then(() => router.go(0))
    }
  }

  const handleQueryData = (): void => {
    const { query } = route as RouteLocationNormalizedLoaded & { query: IQueryParams }
    queryParams.value = query
    boardSelected.value = query.id
  }

  const handleOSDetail = async (id: string): Promise<IOS> => {
    const { data } = await getOSById(id)
    await handleDownloadOSFiles(data)
    return data
  }

  const handleDownloadFile = async (path: string) => {
    const { data } = await downloadFile(path)
    return data
  }

  const handleDownloadImage = async (path: string, fileType: string): Promise<string> => {
    const { data } = await downloadImage(path)

    return handleFileToBase64(data, fileType)
  }

  const handleDownloadOSFiles = async (os: IOS): Promise<void> => {
    os.files = await Promise.all(
      os.attachments.map(async (attachment): Promise<UploadUserFile> => {
        const isImage = attachment.fileType.includes('image')
        let raw = isImage
          ? await handleDownloadImage(attachment.filePath, attachment.fileType)
          : await handleDownloadFile(attachment.filePath)

        return {
          name: isImage ? attachment.fileType : attachment.filePath.split('-').at(-1) || '',
          id: attachment.id,
          raw,
        } as UploadUserFile
      })
    )
  }

  const handleGetBoardData = async (): Promise<void> => {
    const { data } = await getBoardById(queryParams.value.id)
    boardData.value = data
  }

  const handleGetArchivedOS = async (): Promise<void> => {
    const { data } = await getAllArchivedOS(queryParams.value.id)
    archivedOS.value = data
  }

  const handleGetArchivedOSState = async (): Promise<void> => {
    const { data } = await getAllArchivedOSState(queryParams.value.id)
    archivedOSState.value = data
  }

  const handleGetParticipantsOptions = async (): Promise<void> => {
    const { data } = await getAllUsersResume()
    participantsOptions.value = data.map((user) => ({ label: user.name, value: user.id }))
  }

  const handleGetStates = async (): Promise<void> => {
    const { data } = await getOSByBoard(queryParams.value.id)
    states.value = data
  }

  const handleGetBoardsOption = async (): Promise<void> => {
    const { data } = await getAllBoards()
    allBoards.value = data
    boardsOptions.value = data.map((board) => ({ label: board.name, value: board.id }))
  }

  const handleGetPageData = async (): Promise<void> => {
    await Promise.all([
      handleGetBoardData(),
      handleGetBoardsOption(),
      handleGetParticipantsOptions(),
      handleGetStates(),
    ])
  }

  const handleArchiveOS = (id: string): void => {
    handleSubmitArchiveOS(id, true)
    showDrawerDetailOS.value = false
  }

  const handleDeleteOS = (deleteOS: IOS): void => {
    ElMessageBox.confirm(
      'Ao excluir a ordem de serviço, você perderá informações cadastradas! Deseja continuar com a ação?',
      'Excluir a ordem de serviço?',
      {
        confirmButtonText: 'Excluir',
        cancelButtonText: 'Cancelar',
        confirmButtonClass: 'danger-btn',
      }
    ).then(() => {
      handleSubmitDeleteOS(deleteOS)
    })
  }

  const handleDeleteArchive = (archive: string): void => {
    ElMessageBox.confirm('A ação não poderá ser desfeita! Deseja continuar?', 'Excluir Anexo?', {
      confirmButtonText: 'Excluir',
      cancelButtonText: 'Cancelar',
      confirmButtonClass: 'danger-btn',
    }).then(() => {
      handleSubmitDeleteArchive(archive)
    })
  }

  const handleDeleteBoard = (): void => {
    ElMessageBox.confirm(
      'Ao excluir o quadro, você perderá informações cadastradas! Deseja continuar com a ação de excluir?',
      'Deseja excluir o quadro?',
      {
        confirmButtonText: 'Excluir',
        cancelButtonText: 'Cancelar',
        confirmButtonClass: 'danger-btn',
      }
    ).then(() => {
      handleSubmitDeleteBoard()
    })
  }

  const handleOpenDrawerArchive = async (): Promise<void> => {
    const loading = elLoading('Buscando informações arquivadas...')
    try {
      await Promise.all([handleGetArchivedOS(), handleGetArchivedOSState()])
      showDrawerArchive.value = true
    } catch (error: any) {
      elMessage(
        error?.response?.message || 'Erro ao buscar informações arquivadas!',
        elementTypesEnum.ERROR
      )
    } finally {
      loading.close()
    }
  }

  const handleGetOSDetail = async (os: IOS): Promise<void> => {
    const loading = elLoading('Buscando informações da OS...')
    try {
      currentOS.value = await handleOSDetail(os.id)
    } catch (error: any) {
      elMessage(
        error?.response?.message || 'Erro ao buscar informações da OS!',
        elementTypesEnum.ERROR
      )
    } finally {
      loading.close()
    }
  }

  const handleSubmitDeleteOS = async (os: IOS): Promise<void> => {
    const loading = elLoading('Excluindo ordem de serviço...')
    try {
      await deleteOS(os.id)
      await handleGetPageData()
      handleCloseDrawerDetailOS()
    } catch (error: any) {
      elMessage(
        error?.response?.message || 'Erro ao excluir ordem de serviço!',
        elementTypesEnum.ERROR
      )
    } finally {
      loading.close()
    }
  }

  const handleSubmitUpdateOS = async (updatedOS: IOS, id: string): Promise<void> => {
    const loading = elLoading('Atualizando OS...')
    try {
      await updateOS(id, { ...updatedOS, files: [] })
      currentOS.value = await handleOSDetail(updatedOS.id)
      await handleGetPageData()
      handleCloseDrawerCreateOS()
    } catch (error: any) {
      elMessage(error?.response?.message || 'Erro ao atualizar OS!', elementTypesEnum.ERROR)
    } finally {
      loading.close()
    }
  }

  const handleSubmitChangeOSDate = async (updatedOS: IOS, dueDate: string): Promise<void> => {
    const loading = elLoading('Atualizando data de entrega...')
    try {
      await updateOS(updatedOS.id, {
        ...updatedOS,
        users: updatedOS.users.map((e) => e.id),
        dueDate,
        files: [],
      })
      currentOS.value = await handleOSDetail(updatedOS.id)
      await handleGetPageData()
    } catch (error: any) {
      elMessage(
        error?.response?.message || 'Erro ao atualizar data de entrega!',
        elementTypesEnum.ERROR
      )
    } finally {
      loading.close()
    }
  }

  const handleSubmitUploadFiles = async (updatedOS: IOS, file: any): Promise<void> => {
    const loading = elLoading('Adicionando anexos...')
    try {
      await addAttachment(updatedOS.id, file)
    } catch (error: any) {
      elMessage(
        error?.response?.data?.message || 'Erro ao anexar arquivos!',
        elementTypesEnum.ERROR
      )
    } finally {
      currentOS.value = await handleOSDetail(updatedOS.id)
      loading.close()
    }
  }

  const handleSubmitNewComment = async (osId: string, comment: string): Promise<void> => {
    const loading = elLoading('Excluindo quadro...')
    try {
      await createComment(osId, comment)
      currentOS.value = await handleOSDetail(osId)
    } catch (error: any) {
      elMessage(error?.response?.message || 'Erro ao excluir quadro!', elementTypesEnum.ERROR)
    } finally {
      loading.close()
    }
  }

  const handleSubmitDeleteBoard = async (): Promise<void> => {
    const loading = elLoading('Excluindo quadro...')
    try {
      await deleteBoard(queryParams.value.id)
      handleBack()
    } catch (error: any) {
      elMessage(error?.response?.message || 'Erro ao excluir quadro!', elementTypesEnum.ERROR)
    } finally {
      loading.close()
    }
  }

  const handleSubmitDeleteArchive = async (id: string): Promise<void> => {
    const loading = elLoading('Excluindo anexo...')
    try {
      await deleteAttachment(id)
      await handleGetPageData()
      currentOS.value = await handleOSDetail(currentOS.value?.id || '')
    } catch (error: any) {
      elMessage(error?.response?.message || 'Erro ao excluir anexo!', elementTypesEnum.ERROR)
    } finally {
      loading.close()
    }
  }

  const handleSubmitCreateOS = async (os: ICreateOS): Promise<void> => {
    const loading = elLoading('Criando OS...')
    try {
      await createOS(os, currentState.value?.id || '')
      await handleGetPageData()
      handleCloseDrawerCreateOS()
    } catch (error: any) {
      elMessage(error?.response?.message || 'Erro ao criar OS!', elementTypesEnum.ERROR)
    } finally {
      loading.close()
    }
  }

  const handleSubmitArchiveOSState = async (id: string): Promise<void> => {
    const loading = elLoading('Desarquivando quadro...')
    try {
      await updateArchiveOSState(id, queryParams.value.id, false)
      await handleGetPageData()
      handleCloseDrawerArchive()
    } catch (error: any) {
      elMessage(error?.response?.message || 'Erro ao desarquivar quadro!', elementTypesEnum.ERROR)
    } finally {
      loading.close()
    }
  }

  const handleSubmitArchiveOS = async (id: string, state: boolean): Promise<void> => {
    const loading = elLoading(`${state ? 'Arquivando' : 'Desarquivando'} ordem de serviço...`)

    try {
      await updateArchiveOS(id, state)
      await handleGetPageData()
      handleCloseDrawerArchive()
    } catch (error: any) {
      elMessage(
        error?.response?.message ||
          `Erro ao ${state ? 'arquivar' : 'desarquivar'} ordem de serviço!`,
        elementTypesEnum.ERROR
      )
    } finally {
      loading.close()
    }
  }

  const handleSubmitUpdateBoard = async (board: IFormBoard): Promise<void> => {
    const loading = elLoading('Editando quadro...')
    try {
      await updateBoard(board, boardData.value?.id || '')
      await handleGetPageData()
      handleCloseDrawerBoard()
      elMessage('Quadro editado com sucesso!', elementTypesEnum.SUCCESS)
    } catch (error: any) {
      elMessage(error?.response?.message || 'Erro editar quadro!', elementTypesEnum.ERROR)
    } finally {
      loading.close()
    }
  }

  const handleSubmitNewState = async (name: string): Promise<void> => {
    const loading = elLoading('Criando nova lista...')
    try {
      await createOSState(name, queryParams.value.id, (states.value.at(-1)?.stage || 0) + 1)
      await handleGetPageData()
      handleCloseDrawerState()
      elMessage('Nova lista criada!', elementTypesEnum.SUCCESS)
    } catch (error: any) {
      elMessage(error?.response?.message || 'Erro ao criar nova lista!', elementTypesEnum.ERROR)
    } finally {
      loading.close()
    }
  }

  const handleSubmitUpdateState = async (updatedState: IStateOS): Promise<void> => {
    const loading = elLoading('Editando lista...')
    try {
      await updateOSState(
        updatedState.name,
        updatedState.id,
        queryParams.value.id,
        updatedState.stage
      )
      await handleGetPageData()
      handleCloseDrawerState()
      elMessage('Lista editada!', elementTypesEnum.SUCCESS)
    } catch (error: any) {
      elMessage(error?.response?.message || 'Erro ao editar lista!', elementTypesEnum.ERROR)
    } finally {
      loading.close()
    }
  }

  const handleSubmitMoveOS = async (updatedOS: IOS): Promise<void> => {
    const loading = elLoading('Movendo ordem de serviço...')
    try {
      await updateOS(updatedOS.id, {
        ...updatedOS,
        users: updatedOS.users.map((e) => e.id),
        files: [],
      })
      await handleGetPageData()
      handleCloseDrawerDetailOS()
      handleCloseDrawerMoveOS()
      elMessage('Ordem de serviço movida!', elementTypesEnum.SUCCESS)
    } catch (error: any) {
      elMessage(error?.response?.message || 'Erro ao mover lista!', elementTypesEnum.ERROR)
    } finally {
      loading.close()
    }
  }

  const handleSubmitMoveState = async (updatedState: IStateOS, boardId: string): Promise<void> => {
    const loading = elLoading('Movendo lista...')
    try {
      await updateOSState(updatedState.name, updatedState.id, boardId, updatedState.stage)
      await handleGetPageData()
      handleCloseDrawerMove()
      elMessage('Lista movida!', elementTypesEnum.SUCCESS)
    } catch (error: any) {
      elMessage(error?.response?.message || 'Erro ao mover lista!', elementTypesEnum.ERROR)
    } finally {
      loading.close()
    }
  }

  const handleDragState = (event: any) => {
    const eventData = event?.moved
    const boardId = boardData.value?.id

    if (eventData && boardId) {
      const updatedState = { ...event?.moved?.element, stage: event?.moved?.newIndex + 1 }
      handleSubmitMoveState(updatedState, boardId)
    }
  }

  const handleArchiveState = async (archiveState: IStateOS): Promise<void> => {
    const loading = elLoading('Arquivando lista...')
    try {
      await updateOSState(
        archiveState.name,
        archiveState.id,
        queryParams.value.id,
        archiveState.stage,
        true
      )
      await handleGetPageData()
      elMessage('Lista arquivada!', elementTypesEnum.SUCCESS)
    } catch (error: any) {
      elMessage(error?.response?.message || 'Erro ao arquivar lista!', elementTypesEnum.ERROR)
    } finally {
      loading.close()
    }
  }

  const handleSubmitDeleteState = async (deleteState: IStateOS): Promise<void> => {
    const loading = elLoading('Excluindo lista...')
    try {
      await deleteOSState(deleteState.id)
      await handleGetPageData()
      elMessage('Lista excluída!', elementTypesEnum.SUCCESS)
    } catch (error: any) {
      elMessage(error?.response?.message || 'Erro ao excluir lista!', elementTypesEnum.ERROR)
    } finally {
      loading.close()
    }
  }

  const handleGetInitialData = async (): Promise<void> => {
    const loading = elLoading('Buscando dados...')
    try {
      handleQueryData()
      await handleGetPageData()
    } catch (error: any) {
      elMessage(error?.response?.message || 'Erro ao buscar dados!', elementTypesEnum.ERROR)
    } finally {
      loading.close()
    }
  }

  const handleFilterOs = (osList: Array<IOS>) => {
    return handleFilterData<IOS>(osList, ['activity', 'description'], search.value)
  }

  const canManagerBoard = computed<boolean>(() => {
    return handleCheckContext(route.meta.context || '', roleEnum.MANAGER_BOARD)
  })

  const canManagerList = computed<boolean>(() => {
    return handleCheckContext(route.meta.context || '', roleEnum.MANAGER_LIST)
  })

  const canManagerOS = computed<boolean>(() => {
    return handleCheckContext(route.meta.context || '', roleEnum.MANAGER_OS)
  })

  const canCommentOS = computed<boolean>(() => {
    return handleCheckContext(route.meta.context || '', roleEnum.COMMENT_OS)
  })

  const isSystemBoard = computed<boolean>(() => {
    return queryParams.value.id.toLowerCase().includes('alerts')
  })

  const getBoardManagerOptions = computed<Array<IDropdownItem>>(() => {
    return [
      {
        text: 'Editar quadro',
        command: 'onEdit',
        disabled: isSystemBoard.value,
      },
      {
        text: 'Itens arquivados',
        command: 'onArchive',
      },
      {
        text: 'Excluir quadro',
        color: 'danger',
        command: 'onDelete',
        disabled: isSystemBoard.value,
      },
    ]
  })

  watch(
    () => states.value,
    (newValue) => {
      getStates.value = newValue.map((state) => {
        return { ...state, os: handleFilterOs(state.os || []) }
      })

      const hasDoneStateColumn = newValue.find((state) => state.id.includes('done-state'))

      if (hasDoneStateColumn) {
        boardHasDoneStateByDefault.value = true
      }
    }
  )

  onMounted(() => handleGetInitialData())
</script>

<style scoped lang="scss" src="./style.scss"></style>
