<template>
  <div class="permissions-view">
    <div class="permissions-view__header">
      <HeaderBackTitle
        title="Grupos de permissões"
        subtitle="Visualize e gerencie as permissões do sistema"
        @onBack="handleBack"
      />
      <div class="header-actions">
        <el-input
          class="actions-search"
          v-model="search"
          suffix-icon="Search"
          placeholder="Pesquise uma informação na lista abaixo "
          clearable
        />
        <el-button v-if="canManager" type="primary" icon="Plus" @click="handleCreatePermission">
          Novo grupo de permissões
        </el-button>
      </div>
    </div>
    <div class="permissions-view__body">
      <ul class="permissions-list">
        <li
          v-for="(permission, index) of getPermissions"
          :key="`permission-${index}-${permission.name}`"
          class="permissions-list__item"
          :class="{ 'without-options': !canManager }"
        >
          <PermissionCard
            :title="permission.name"
            :isAdmin="permission.admin"
            :permissionsCount="permission.rolesCount"
            :showOptions="canManager"
            @onEdit="handleEditPermission(permission)"
            @onDelete="handleDeletePermission(permission)"
          />
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
  import HeaderBackTitle from '@/components/HeaderBackTitle/HeaderBackTitle.vue'
  import PermissionCard from '@/components/PermissionCard/PermissionCard.vue'
  import { elLoading, elMessage } from '@/composables/element'
  import { handleCheckContext, handleFilterData } from '@/composables/utils'
  import { elementTypesEnum } from '@/enums/elementTypesEnum'
  import roleEnum from '@/enums/roleEnum'
  import type { IPermission } from '@/interfaces/IGroupPermission'
  import { deleteGroup, getAllGroups } from '@/services/group'
  import { ElMessageBox } from 'element-plus'
  import { computed, onMounted, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'

  const route = useRoute()
  const router = useRouter()
  const search = ref<string>('')
  const permissions = ref<Array<IPermission>>([])

  const handleBack = (): void => {
    router.push({ name: 'HomeView' })
  }

  const handleDeletePermission = (permission: IPermission): void => {
    ElMessageBox.confirm(
      'Ao excluir o grupo de permissões, você perderá informações cadastradas! Deseja continuar com a ação de excluir?',
      'Deseja excluir o grupo de permissões?',
      {
        confirmButtonText: 'Excluir',
        cancelButtonText: 'Cancelar',
        confirmButtonClass: 'danger-btn',
      }
    ).then(() => {
      handleDeleteSubmitPermission(permission)
    })
  }

  const handleEditPermission = (permission: IPermission): void => {
    router.push({
      name: 'PermissionView',
      query: {
        id: permission.id,
        state: 'edit',
      },
    })
  }

  const handleCreatePermission = (): void => {
    router.push({
      name: 'PermissionView',
      query: {
        state: 'new',
      },
    })
  }

  const handleGetPermissions = async (): Promise<void> => {
    const { data } = await getAllGroups()
    permissions.value = data
  }

  const handleDeleteSubmitPermission = async (permission: IPermission): Promise<void> => {
    const loading = elLoading('Excluindo grupo de permissões...')
    try {
      await deleteGroup(permission.id)
      await handleGetPermissions()
    } catch (error: any) {
      elMessage(
        error?.response?.message || 'Erro ao excluir grupo de permissões!',
        elementTypesEnum.ERROR
      )
    } finally {
      loading.close()
    }
  }

  const handleGetInitialData = async (): Promise<void> => {
    const loading = elLoading('Buscando dados...')
    try {
      await handleGetPermissions()
    } catch (error: any) {
      elMessage(error?.response?.message || 'Erro ao buscar dados!', elementTypesEnum.ERROR)
    } finally {
      loading.close()
    }
  }

  const getPermissions = computed<Array<IPermission>>((): Array<IPermission> => {
    return handleFilterData<IPermission>(permissions.value, ['name'], search.value)
  })

  const canManager = computed<boolean>(() => {
    return handleCheckContext(route.meta.context || '', roleEnum.MANAGER)
  })

  onMounted(() => {
    handleGetInitialData()
  })
</script>

<style scoped lang="scss" src="./style.scss"></style>
