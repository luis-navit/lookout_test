import contextEnum from '@/enums/contextEnum'
import type { INavbarItem } from '@/interfaces/INavbarItem'

const navbarByProfile: Record<string, Record<string, Array<INavbarItem>>> = {
  head: {
    options: [
      {
        icon: 'House',
        text: 'Home',
        index: 'home',
        command: 'home',
        permission: '',
      },
      {
        icon: 'PieChart',
        text: 'Gerenciar gráficos',
        index: 'chart',
        command: 'charts',
        permission: contextEnum.MANAGE_DASHBOARDS,
      },
      {
        icon: 'OfficeBuilding',
        text: 'Empresas',
        index: 'company',
        command: 'companies',
        permission: contextEnum.COMPANY,
      },
    ],
    systemOptions: [
      {
        icon: 'User',
        text: 'Usuários',
        index: 'user',
        command: 'users',
        permission: contextEnum.USERS,
      },
      {
        icon: 'Key',
        text: 'Permissões',
        index: 'permission',
        command: 'permissions',
        permission: contextEnum.GROUP,
      },
    ],
  },
  admin: {
    options: [
      {
        icon: 'House',
        text: 'Home',
        index: 'home',
        command: 'home',
        permission: '',
      },
      {
        icon: 'PieChart',
        text: 'Gerenciar gráficos',
        index: 'chart',
        command: 'charts',
        permission: contextEnum.MANAGE_DASHBOARDS,
      },
      {
        icon: 'Histogram',
        text: 'Dados',
        index: 'data',
        command: 'data',
        permission: contextEnum.DATA,
      },
      {
        icon: 'DataAnalysis',
        text: 'Dashboard',
        index: 'dashboard',
        command: 'dashboard',
        permission: contextEnum.DASHBOARD,
      },
      {
        icon: 'SetUp',
        text: 'Aprendizagem de máquina',
        index: 'learning',
        command: 'learning',
        permission: contextEnum.LEARNING,
      },
      {
        icon: 'Folder',
        text: 'Grupos de regras',
        index: 'rule',
        command: 'rules',
        permission: contextEnum.RULES,
      },
      {
        icon: 'List',
        text: 'Ordem de serviços',
        index: 'os',
        command: 'services',
        permission: contextEnum.SERVICES,
      },
    ],
    systemOptions: [
      {
        icon: 'User',
        text: 'Usuários',
        index: 'user',
        command: 'users',
        permission: contextEnum.USERS,
      },
      {
        icon: 'Key',
        text: 'Permissões',
        index: 'permission',
        command: 'permissions',
        permission: contextEnum.GROUP,
      },
    ],
  },
  office: {
    options: [
      {
        icon: 'House',
        text: 'Home',
        index: 'home',
        command: 'home',
        permission: '',
      },
    ],
    systemOptions: [
      {
        icon: 'Histogram',
        text: 'Dados',
        index: 'data',
        command: 'data',
        permission: contextEnum.DATA,
      },
      {
        icon: 'PieChart',
        text: 'Gerenciar gráficos',
        index: 'chart',
        command: 'charts',
        permission: contextEnum.MANAGE_DASHBOARDS,
      },
      {
        icon: 'DataAnalysis',
        text: 'Dashboard',
        index: 'dashboard',
        command: 'dashboard',
        permission: contextEnum.DASHBOARD,
      },
      {
        icon: 'SetUp',
        text: 'Aprendizagem de máquina',
        index: 'learning',
        command: 'learning',
        permission: contextEnum.LEARNING,
      },
      {
        icon: 'Folder',
        text: 'Grupos de regras',
        index: 'rule',
        command: 'rules',
        permission: contextEnum.RULES,
      },
      {
        icon: 'List',
        text: 'Ordem de serviços',
        index: 'os',
        command: 'services',
        permission: contextEnum.SERVICES,
      },
    ],
  },
}

export { navbarByProfile }
