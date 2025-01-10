<template>
  <div class="permission-view">
    <div class="permission-view__header">
      <HeaderBackTitle
        :title="`${isNew ? 'Novo grupo de permissão' : 'Editar grupo de permissão'}`"
        :subtitle="`${isNew ? 'Visualize e gerencie' : 'Edite'} as permissões do sistema`"
        @onBack="handleBack"
      />
      <el-button
        type="primary"
        :disabled="!isModified"
        @click="handleSubmitForm(permissionFormRef)"
      >
        {{ `Salvar ${isNew ? 'permissões' : 'edição'}` }}
      </el-button>
    </div>
    <div class="permission-view__body">
      <div class="permission-view__form">
        <el-form inline :model="form" ref="permissionFormRef" label-position="top" :rules="rules">
          <el-form-item class="input-name" label="Nome do grupo de permissões" prop="name">
            <el-input
              v-model="form.name"
              placeholder="Adicione um título para o grupo de permissões"
            />
          </el-form-item>
          <el-form-item label="Tipo do usuário" prop="admin">
            <el-radio-group v-model="form.admin">
              <el-radio border :label="false"><span>Usuário Padrão</span></el-radio>
              <el-radio border :label="true"><span>Usuário Master</span></el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </div>
      <span class="text--md bold">Gerencie as permissões</span>
      <ul class="permissions-list">
        <li
          class="permissions-list-item"
          v-for="(roles, key) of allPermissions"
          :key="`permission-${key}`"
        >
          <PermissionRolesCard v-model="form.roles[key]" :title="key" :roles="roles" />
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, reactive, ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { getAllRoles } from '@/services/role'
  import { getGroupById, createGroup, updateGroup } from '@/services/group'
  import { elLoading, elMessage } from '@/composables/element'
  import { elementTypesEnum } from '@/enums/elementTypesEnum'
  import type { FormInstance, FormRules } from 'element-plus'
  import type { RouteLocationNormalizedLoaded } from 'vue-router'
  import type { IPermissionDetail, IRole } from '@/interfaces/IGroupPermission'
  import _ from 'lodash'
  import HeaderBackTitle from '@/components/HeaderBackTitle/HeaderBackTitle.vue'
  import PermissionRolesCard from '@/components/PermissionRolesCard/PermissionRolesCard.vue'

  interface IQueryParams {
    id: string
    state: 'new' | 'edit'
  }

  interface IForm {
    name: string
    admin: boolean | null
    roles: Record<string, Array<string>>
  }

  const route = useRoute()
  const router = useRouter()
  const queryParams = ref<IQueryParams>({ id: '', state: 'new' })
  const permission = ref<IPermissionDetail | null>()
  const allPermissions = ref<Record<string, Array<IRole>> | null>(null)
  const permissionFormRef = ref<FormInstance>()
  const initialFormData = ref<IForm>()
  const isModified = ref(false)
  const form = reactive<IForm>({
    name: '',
    admin: null,
    roles: {},
  })

  const rules = reactive<FormRules<IForm>>({
    name: [{ required: true, message: 'Informe um título para o grupo', trigger: 'change' }],
    admin: [{ required: true, message: 'Informe o tipo de usuário', trigger: 'change' }],
  })

  const handleBack = (): void => {
    router.push({
      name: 'PermissionsView',
    })
  }

  const handleSubmitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate((valid) => {
      if (valid) {
        const sendData = {
          ...form,
          roles: Object.values(form.roles).flat(),
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        isNew.value ? handleSubmitCreate(sendData) : handleSubmitEdit(sendData)
      }
    })
  }

  const handleQueryData = (): void => {
    const { query } = route as RouteLocationNormalizedLoaded & { query: IQueryParams }
    queryParams.value = { ...query, id: query.id ?? '' }
  }

  const handleGetPermission = async (): Promise<void> => {
    const { data } = await getGroupById(queryParams.value.id)
    permission.value = data

    const initialData = {
      name: data.name,
      admin: data.admin,
      roles: Object.entries(data.roles).reduce<Record<string, Array<string>>>(
        (acc, [key, value]) => {
          acc[key] = value.map((v) => v.id)
          return acc
        },
        {}
      ),
    }

    initialFormData.value = _.cloneDeep(initialData)

    form.name = initialData.name
    form.admin = initialData.admin
    form.roles = initialData.roles
  }

  const handleGetAllPermissions = async (): Promise<void> => {
    const { data } = await getAllRoles()
    allPermissions.value = data
  }

  const handleSubmitCreate = async (sendData: Record<string, any>): Promise<void> => {
    const loading = elLoading('Criando grupo de permissões...')
    try {
      await createGroup(sendData)
      handleBack()
    } catch (error: any) {
      elMessage(
        error?.response?.message || 'Erro ao criar grupo de permissões!',
        elementTypesEnum.ERROR
      )
    } finally {
      loading.close()
    }
  }

  const handleSubmitEdit = async (sendData: Record<string, any>): Promise<void> => {
    const loading = elLoading('Editando grupo de permissões...')
    try {
      await updateGroup(queryParams.value.id, sendData)
      handleBack()
    } catch (error: any) {
      elMessage(
        error?.response?.message || 'Erro ao editar grupo de permissões!',
        elementTypesEnum.ERROR
      )
    } finally {
      loading.close()
    }
  }

  const handleGetInitialData = async (): Promise<void> => {
    const loading = elLoading('Buscando dados...')
    try {
      handleQueryData()
      await handleGetAllPermissions()
      if (!isNew.value) await handleGetPermission()
    } catch (error: any) {
      elMessage(error?.response?.message || 'Erro ao buscar dados!', elementTypesEnum.ERROR)
    } finally {
      loading.close()
    }
  }

  const isNew = computed<boolean>((): boolean => {
    return queryParams.value.state === 'new' ? true : false
  })

  watch(
    form,
    (newFormData) => {
      isModified.value = !_.isEqual(newFormData, initialFormData.value)
    },
    { deep: true }
  )

  onMounted(handleGetInitialData)
</script>

<style scoped lang="scss" src="./style.scss"></style>
