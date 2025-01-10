<template>
  <div class="users-view">
    <div class="users-view__header">
      <HeaderBackTitle
        class="page-title"
        title="Usuários"
        subtitle="Visualize e gerencie os usuários"
        @onBack="handleBack"
      />
      <div class="actions-wrapper">
        <el-input
          class="actions-search"
          v-model="search"
          suffix-icon="Search"
          placeholder="Pesquise uma informação na lista abaixo "
          clearable
        />
        <el-button v-if="canManager" @click="handleOpenDrawer" type="primary" icon="Plus">
          Novo usuário
        </el-button>
      </div>
    </div>
    <section class="users-view__section">
      <ul class="users-list-container" v-if="users.length">
        <li
          v-for="(user, index) of getUsers"
          class="users-list-item"
          :class="{ 'without-options': !canManager }"
          :key="`user-card-${index}-${user.name}-${user.email}-${user.group.name}-${user.profileImage}`"
        >
          <UserCard
            :name="user.name"
            :email="user.email"
            :profile="user?.group?.name ? user.group.name : 'Nenhum grupo '"
            :profileImg="user?.profileImage || null"
            :showOptions="canManager"
            @onDelete="handleDeleteUser(user)"
            @onEdit="handleEdit(user)"
          />
        </li>
      </ul>
    </section>
    <DrawerUser
      :show="showDrawer"
      :currentUser="currentUser"
      :permissionOptions="groupOptions"
      @onSubmit:edit="handleSubmitUpdateUser"
      @onSubmit:save="handleSubmitCreateUser"
      @onCancel="handleCloseDrawer"
      @onClose="handleCloseDrawer"
    />
  </div>
</template>

<script setup lang="ts">
  import HeaderBackTitle from '@/components/HeaderBackTitle/HeaderBackTitle.vue'
  import UserCard from '@/components/UserCard/UserCard.vue'
  import { elLoading, elMessage } from '@/composables/element'
  import { handleCheckContext, handleFileToBase64, handleFilterData } from '@/composables/utils'
  import { elementTypesEnum } from '@/enums/elementTypesEnum'
  import roleEnum from '@/enums/roleEnum'
  import type { IPermission } from '@/interfaces/IGroupPermission'
  import type { ISelectOption } from '@/interfaces/ISelect'
  import type { INewUser, IUpdateUser, IUser } from '@/interfaces/IUser'
  import { downloadImage } from '@/services/files'
  import { getAllGroups } from '@/services/group'
  import { createNewUser, deleteUser, getAllUsers, updateUser } from '@/services/users'
  import { ElMessageBox } from 'element-plus'
  import { computed, onMounted, ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import DrawerUser from './Partials/DrawerUser/DrawerUser.vue'

  const route = useRoute()
  const router = useRouter()
  const search = ref<string>('')
  const users = ref<Array<IUser>>([])
  const currentUser = ref<IUser | null>(null)
  const showDrawer = ref<boolean>(false)
  const groupOptions = ref<Array<ISelectOption>>([])

  const handleBack = (): void => {
    router.push({ name: 'HomeView' })
  }

  const handleOpenDrawer = (): void => {
    showDrawer.value = true
  }

  const handleCloseDrawer = (): void => {
    currentUser.value = null
    showDrawer.value = false
  }

  const handleEdit = (user: IUser): void => {
    currentUser.value = user
    handleOpenDrawer()
  }

  const handleFormatGroups = (groups: Array<IPermission>): Array<ISelectOption> => {
    return groups.map((group) => ({ label: group.name, value: group.id }))
  }

  const handleFormatUsers = (users: Array<IUser>): Array<IUser> => {
    return users.map((user) => ({ ...user, permission: user.group.name }))
  }

  const handleDeleteUser = (user: IUser): void => {
    ElMessageBox.confirm(
      'Ao excluir o usuário, você perderá informações cadastradas! Deseja continuar com a ação de excluir?',
      `Deseja excluir o usuário: ${user.name}?`,
      {
        confirmButtonText: 'Excluir',
        cancelButtonText: 'Cancelar',
        confirmButtonClass: 'danger-btn',
      }
    ).then(() => {
      handleSubmitDeleteUser(user.id)
    })
  }

  const handleDownloadFile = async (path: string): Promise<string> => {
    const { data, headers } = await downloadImage(path)
    const fileType = headers['Content-Type'] as string

    return handleFileToBase64(data, fileType)
  }

  const handleGetUsersAndFormat = async (): Promise<void> => {
    users.value = await handleGetAllUsers()

    Promise.all(
      users.value.map(async (user) => {
        if (user.picturePath) user.profileImage = await handleDownloadFile(user.picturePath)
      })
    )
  }

  const handleGetAllUsers = async (): Promise<Array<IUser>> => {
    const { data } = await getAllUsers()
    return handleFormatUsers(data)
  }

  const handleGetAllGroups = async (): Promise<Array<ISelectOption>> => {
    const { data } = await getAllGroups()
    return handleFormatGroups(data)
  }

  const handleSubmitDeleteUser = async (userId: string): Promise<void> => {
    const loading = elLoading('Excluindo usuário...')
    try {
      await deleteUser(userId)
      await handleGetUsersAndFormat()
    } catch (error: any) {
      elMessage(error?.response?.message || 'Erro ao excluir usuário!', elementTypesEnum.ERROR)
    } finally {
      loading.close()
    }
  }

  const handleSubmitCreateUser = async (newUser: INewUser): Promise<void> => {
    const loading = elLoading('Adicionando novo usuário...')
    try {
      await createNewUser(newUser)
      handleCloseDrawer()
      await handleGetUsersAndFormat()
    } catch (error: any) {
      elMessage(
        error?.response?.message || error?.message || 'Erro ao adicionar novo usuário!',
        elementTypesEnum.ERROR
      )
    } finally {
      loading.close()
    }
  }

  const handleSubmitUpdateUser = async (userId: string, updateData: IUpdateUser): Promise<void> => {
    const loading = elLoading('Atualizando usuário...')
    try {
      await updateUser(userId, updateData)
      handleCloseDrawer()
      await handleGetUsersAndFormat()
    } catch (error: any) {
      elMessage(
        error?.response?.message || error?.message || 'Erro ao atualizar usuário!',
        elementTypesEnum.ERROR
      )
    } finally {
      loading.close()
    }
  }

  const handleGetInitialData = async (): Promise<void> => {
    const loading = elLoading('Buscando dados...')
    try {
      await handleGetUsersAndFormat()
      groupOptions.value = await handleGetAllGroups()
    } catch (error: any) {
      elMessage(error?.response?.message || 'Erro ao buscar dados!', elementTypesEnum.ERROR)
    } finally {
      loading.close()
    }
  }

  const getUsers = computed<Array<IUser>>((): Array<IUser> => {
    return handleFilterData<IUser>(users.value, ['name', 'email', 'permission'], search.value)
  })

  const canManager = computed<boolean>(() => {
    return handleCheckContext(route.meta.context || '', roleEnum.MANAGER)
  })

  onMounted(() => handleGetInitialData())
</script>

<style scoped lang="scss" src="./style.scss"></style>
