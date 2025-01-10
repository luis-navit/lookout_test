<template>
  <div class="boards-view-container">
    <div class="boards-view__header">
      <HeaderBackTitle
        class="title-container"
        title="Ordens de serviço"
        subtitle="Gerencie os quadros e as ordens de serviço do Lookout."
        @onBack="handleBack"
      />
      <div class="actions-wrapper">
        <el-input
          class="actions-search"
          v-model="search"
          suffix-icon="Search"
          placeholder="Pesquise uma informação nos cards abaixo "
          clearable
          maxlength="250"
        />
        <el-button v-if="canManager" type="primary" icon="Plus" @click="handleOpenDrawer">
          Novo quadro
        </el-button>
      </div>
    </div>
    <section class="boards-view__body">
      <ul class="boards-cards-container" v-if="getBoards.length">
        <li
          v-for="board of getBoards"
          class="boards-cards-item"
          :class="{ 'without-options': !canManager }"
          :key="board.id"
        >
          <BoardCard
            v-if="board"
            :title="board.name"
            :count="board.states.length"
            :showOptions="canManager"
            :isDefaultCard="board.id.toLowerCase().includes('alerts')"
            @onEdit="handleEditBoard(board)"
            @onDelete="handleDeleteBoard(board)"
            @click="handleBoardClick(board)"
          />
        </li>
      </ul>
      <div class="empty-container" v-else>
        <h2 class="title--md">Nenhuma informação encontrada no momento</h2>
      </div>
    </section>
    <DrawerBoards
      :show="showDrawer"
      :currentBoard="currentBoard"
      :usersOptions="participantsOptions"
      :currentUserId="auth.userData.id"
      @onClose="handleCloseDrawer"
      @onCancel="handleCloseDrawer"
      @onSubmit:save="handleSubmitSaveBoard"
      @onSubmit:edit="handleSubmitUpdateBoard"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessageBox } from 'element-plus'
  import { useRoute } from 'vue-router'
  import { handleCheckContext, handleFilterData } from '@/composables/utils'
  import { elLoading, elMessage } from '@/composables/element'
  import { getAllUsersResume } from '@/services/users'
  import { getAllBoards, createBoard, updateBoard, deleteBoard } from '@/services/boards'
  import { elementTypesEnum } from '@/enums/elementTypesEnum'
  import { useAuthStore } from '@/stores/authStore'
  import type { IBoard, IFormBoard } from '@/interfaces/IBoard'
  import type { ISelectOption } from '@/interfaces/ISelect'
  import BoardCard from '@/components/BoardCard/BoardCard.vue'
  import HeaderBackTitle from '@/components/HeaderBackTitle/HeaderBackTitle.vue'
  import DrawerBoards from './Partials/DrawerBoards/DrawerBoards.vue'
  import roleEnum from '@/enums/roleEnum'

  const auth = useAuthStore()
  const route = useRoute()
  const router = useRouter()
  const search = ref<string>('')
  const boards = ref<Array<IBoard>>([])
  const showDrawer = ref<boolean>(false)
  const currentBoard = ref<IBoard | null>(null)
  const participantsOptions = ref<Array<ISelectOption>>([])

  const handleBack = (): void => {
    router.push({ name: 'HomeView' })
  }

  const handleOpenDrawer = (): void => {
    showDrawer.value = true
  }

  const handleCloseDrawer = (): void => {
    currentBoard.value = null
    showDrawer.value = false
  }

  const handleEditBoard = (board: IBoard): void => {
    currentBoard.value = board
    showDrawer.value = true
  }

  const handleBoardClick = (board: IBoard): void => {
    router.push({
      name: 'OSView',
      query: { id: board.id },
    })
  }

  const handleDeleteBoard = (board: IBoard): void => {
    ElMessageBox.confirm(
      'Ao excluir o quadro, você perderá informações cadastradas! Deseja continuar com a ação de excluir?',
      'Deseja excluir o quadro?',
      {
        confirmButtonText: 'Excluir',
        cancelButtonText: 'Cancelar',
        confirmButtonClass: 'danger-btn',
      }
    ).then(() => {
      handleSubmitDeleteBoard(board)
    })
  }

  const handleGetAllBoards = async (): Promise<void> => {
    const { data } = await getAllBoards()
    const alertBoardIdx = data.findIndex((e) => e.id.toLowerCase().includes('alerts'))

    if (alertBoardIdx) data.unshift(data.splice(alertBoardIdx, 1)[0])

    boards.value = data
  }

  const handleGetParticipantsOptions = async (): Promise<Array<ISelectOption>> => {
    const { data } = await getAllUsersResume()
    return data.map((user) => ({ label: user.name, value: user.id }))
  }

  const handleSubmitSaveBoard = async (newBoard: IFormBoard): Promise<void> => {
    const loading = elLoading('Salvando novo quadro...')
    try {
      await createBoard(newBoard)
      await handleGetAllBoards()
      handleCloseDrawer()
    } catch (error: any) {
      const duplicatedName =
        error?.response?.data?.message === 'Violação de chave única: name, "companyId"' &&
        'Já existe um quadro de ações com este nome'

      elMessage(
        error?.response?.message || duplicatedName || 'Erro ao salvar novo quadro!',
        elementTypesEnum.ERROR
      )
    } finally {
      loading.close()
    }
  }

  const handleSubmitUpdateBoard = async (board: IFormBoard, boardId: string): Promise<void> => {
    const loading = elLoading('Editando quadro...')
    try {
      await updateBoard(board, boardId)
      await handleGetAllBoards()
      handleCloseDrawer()
    } catch (error: any) {
      elMessage(error?.response?.message || 'Erro ao editar quadro!', elementTypesEnum.ERROR)
    } finally {
      loading.close()
    }
  }

  const handleSubmitDeleteBoard = async (board: IBoard): Promise<void> => {
    const loading = elLoading('Excluindo quadro...')
    try {
      await deleteBoard(board.id)
      await handleGetAllBoards()
      handleCloseDrawer()
    } catch (error: any) {
      elMessage(error?.response?.message || 'Erro ao Excluir quadro!', elementTypesEnum.ERROR)
    } finally {
      loading.close()
    }
  }

  const getInitialData = async (): Promise<void> => {
    const loading = elLoading('Buscando dados...')
    try {
      await handleGetAllBoards()
      participantsOptions.value = await handleGetParticipantsOptions()
    } catch (error: any) {
      elMessage(error?.response?.message || 'Erro ao buscar dados!', elementTypesEnum.ERROR)
    } finally {
      loading.close()
    }
  }

  const getBoards = computed<Array<IBoard>>((): Array<IBoard> => {
    return handleFilterData<IBoard>(boards.value, ['name'], search.value)
  })

  const canManager = computed<boolean>(() => {
    return handleCheckContext(route.meta.context || '', roleEnum.MANAGER_BOARD)
  })

  onMounted(() => getInitialData())
</script>

<style scoped lang="scss" src="./style.scss"></style>
