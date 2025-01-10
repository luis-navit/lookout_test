<template>
  <div class="users-view">
    <div class="users-view__header">
      <HeaderBackTitle
        class="page-title"
        title="Empresas"
        subtitle="Acesse as funcionalidades clicando nos cards"
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
          Nova empresa
        </el-button>
      </div>
    </div>
    <section class="users-view__section">
      <ul class="users-list-container" v-if="companies.length">
        <li
          v-for="(company, index) of getCompanies"
          class="users-list-item"
          :class="{ 'without-options': !canManager }"
          :key="`user-card-${index}-${company.name}`"
        >
          <CompanyCard
            :key="`company-card-${index}-${company.name}-${company.cnpj}`"
            :name="company.name"
            :active="company.active"
            :profileImg="null"
            :showOptions="true"
            @onDelete="handleDeleteCompany(company)"
            @onEdit="handleEdit(company)"
            @onActivate="handleActivateCompany(company)"
          />
        </li>
      </ul>
    </section>
    <DrawerCompany
      :show="showDrawer"
      :currentCompany="currentCompany"
      :permissionOptions="groupOptions"
      @onSubmit:edit="handleSubmitUpdateCompany"
      @onSubmit:save="handleSubmitCreateCompany"
      @onCancel="handleCloseDrawer"
      @onClose="handleCloseDrawer"
    />
  </div>
</template>

<script setup lang="ts">
  import HeaderBackTitle from '@/components/HeaderBackTitle/HeaderBackTitle.vue'
  import CompanyCard from '@/components/CompanyCard/CompanyCard.vue'
  import roleEnum from '@/enums/roleEnum'
  import DrawerCompany from './Partials/DrawerCompany/DrawerCompany.vue'
  import { ElMessageBox } from 'element-plus'
  import { useRoute, useRouter } from 'vue-router'
  import { computed, onMounted, ref } from 'vue'
  import { elLoading, elMessage } from '@/composables/element'
  import { handleCheckContext, handleFileToBase64, handleFilterData } from '@/composables/utils'
  import { elementTypesEnum } from '@/enums/elementTypesEnum'
  import { downloadImage } from '@/services/files'
  import { getAllGroups } from '@/services/group'
  import type { IPermission } from '@/interfaces/IGroupPermission'
  import type { ISelectOption } from '@/interfaces/ISelect'
  import type { ICompany, INewCompany, IUpdateCompany } from '@/interfaces/ICompany'
  import {
    createNewCompany,
    deleteCompany,
    getAllCompanies,
    updateCompany,
  } from '@/services/company'

  const route = useRoute()
  const router = useRouter()
  const search = ref<string>('')
  const companies = ref<Array<ICompany>>([])
  const currentCompany = ref<ICompany | null>(null)
  const showDrawer = ref<boolean>(false)
  const groupOptions = ref<Array<ISelectOption>>([])

  const handleBack = (): void => {
    router.push({ name: 'HomeView' })
  }

  const handleOpenDrawer = (): void => {
    showDrawer.value = true
  }

  const handleCloseDrawer = (): void => {
    currentCompany.value = null
    showDrawer.value = false
  }

  const handleEdit = (user: ICompany): void => {
    currentCompany.value = user
    handleOpenDrawer()
  }

  const handleFormatGroups = (groups: Array<IPermission>): Array<ISelectOption> => {
    return groups.map((group) => ({ label: group.name, value: group.id }))
  }

  const handleFormatCompanies = (companies: Array<ICompany>): Array<ICompany> => {
    return companies.map((company) => ({ ...company }))
  }

  const handleDeleteCompany = (company: ICompany): void => {
    ElMessageBox.confirm(
      'Ao excluir esta empresa você perderá informações cadastradas! Deseja continuar com a ação de excluir?',
      `Deseja excluir a empresa: ${company.name}?`,
      {
        confirmButtonText: 'Excluir',
        cancelButtonText: 'Cancelar',
        confirmButtonClass: 'danger-btn',
      }
    ).then(() => {
      handleSubmitDeleteUser(company.id)
    })
  }

  const handleActivateCompany = (company: ICompany): void => {
    const disableMessage = `Desativar a empresa resultará na revogação do acesso ao sistema para os usuários cadastrados nessa empresa.
      Você tem certeza que deseja prosseguir com essa ação?`

    const activateMessage = `Ativar a empresa resultará na renovação do acesso ao sistema para os usuários cadastrados nessa empresa.`

    const selectedMessage = company.active ? disableMessage : activateMessage
    const buttonText = company.active ? 'Desativar' : 'Ativar'

    ElMessageBox.confirm(
      `${selectedMessage} Você tem certeza de que deseja prosseguir com essa ação?`,
      `Deseja ${buttonText.toLocaleLowerCase()} a empresa: ${company.name}?`,
      {
        confirmButtonText: buttonText,
        cancelButtonText: 'Cancelar',
      }
    ).then(() => {
      handleUpdateCompanyActiveStatus(company)
    })
  }

  const handleDownloadFile = async (path: string): Promise<string> => {
    const { data, headers } = await downloadImage(path)
    const fileType = headers['Content-Type'] as string

    return handleFileToBase64(data, fileType)
  }

  const handleGetCompaniesAndFormat = async (): Promise<void> => {
    companies.value = await handleGetAllCompanies()
  }

  const handleGetAllCompanies = async (): Promise<Array<ICompany>> => {
    const { data } = await getAllCompanies()
    return handleFormatCompanies(data)
  }

  const handleGetAllGroups = async (): Promise<Array<ISelectOption>> => {
    const { data } = await getAllGroups()
    return handleFormatGroups(data)
  }

  const handleSubmitDeleteUser = async (companyId: string): Promise<void> => {
    const loading = elLoading('Excluindo empresa...')
    try {
      await deleteCompany(companyId)
      await handleGetCompaniesAndFormat()
    } catch (error: any) {
      elMessage(error?.response?.message || 'Erro ao excluir empresa!', elementTypesEnum.ERROR)
    } finally {
      loading.close()
    }
  }

  const handleUpdateCompanyActiveStatus = async (company: ICompany): Promise<void> => {
    const loading = elLoading('Excluindo empresa...')
    try {
      await updateCompany(company.id, {
        name: company.name,
        cnpj: company.cnpj,
        active: !company.active,
        master: {
          email: company.master.email,
        },
      } as IUpdateCompany)
      await handleGetCompaniesAndFormat()
    } catch (error: any) {
      elMessage(
        error?.response?.message || 'Erro ao atualizar o status da empresa!',
        elementTypesEnum.ERROR
      )
    } finally {
      loading.close()
    }
  }

  const handleSubmitCreateCompany = async (newCompany: INewCompany): Promise<void> => {
    const loading = elLoading('Adicionando nova empresa...')
    try {
      await createNewCompany(newCompany)
      handleCloseDrawer()
      await handleGetCompaniesAndFormat()
    } catch (error: any) {
      elMessage(
        error?.response?.message || 'Erro ao adicionar nova empresa!',
        elementTypesEnum.ERROR
      )
    } finally {
      loading.close()
    }
  }

  const handleSubmitUpdateCompany = async (
    companyId: string,
    updateData: IUpdateCompany
  ): Promise<void> => {
    const loading = elLoading('Atualizando empresa...')
    try {
      await updateCompany(companyId, updateData)
      handleCloseDrawer()
      await handleGetCompaniesAndFormat()
    } catch (error: any) {
      elMessage(error?.response?.message || 'Erro ao atualizar empresa!', elementTypesEnum.ERROR)
    } finally {
      loading.close()
    }
  }

  const handleGetInitialData = async (): Promise<void> => {
    const loading = elLoading('Buscando dados...')
    try {
      await handleGetCompaniesAndFormat()
      groupOptions.value = await handleGetAllGroups()
    } catch (error: any) {
      elMessage(error?.response?.message || 'Erro ao buscar dados!', elementTypesEnum.ERROR)
    } finally {
      loading.close()
    }
  }

  const getCompanies = computed<Array<ICompany>>((): Array<ICompany> => {
    return handleFilterData<ICompany>(companies.value, ['name', 'cnpj'], search.value)
  })

  const canManager = computed<boolean>(() => {
    return handleCheckContext(route.meta.context || '', roleEnum.MANAGER)
  })

  onMounted(() => handleGetInitialData())
</script>

<style scoped lang="scss" src="./style.scss"></style>
