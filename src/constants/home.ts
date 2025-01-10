import type { ICard } from '@/interfaces/ICard'
import contextEnum from '@/enums/contextEnum'

const homeCards: Record<string, Array<ICard>> = {
  head: [
    {
      icon: 'OfficeBuilding',
      title: 'Empresas',
      subtitle: 'Visualize e gerencie as empresas cadastradas no sistema',
      permission: contextEnum.COMPANY,
      bodyText: (count: number) =>
        `${count} ${count > 1 ? 'empresas cadastradas' : 'empresa cadastrada'}`,
      viewName: 'CompaniesView',
    },
    {
      icon: 'PieChart',
      title: 'Gerenciar gráficos',
      subtitle: 'Gerencie os gráficos para construir os dashboards',
      permission: contextEnum.MANAGE_DASHBOARDS,
      viewName: 'ChartsView',
    },
    {
      icon: 'User',
      title: 'Usuários',
      subtitle: 'Visualize e gerencie os usuários cadastrados no sistema',
      permission: contextEnum.USERS,
      bodyText: (count: number) =>
        `${count} ${count > 1 ? 'usuários cadastrados' : 'usuário cadastrado'}`,

      viewName: 'UsersView',
    },
    {
      icon: 'Key',
      title: 'Grupos de permissões',
      subtitle: 'Visualize e gerencie as permissões do sistema',
      permission: contextEnum.GROUP,
      bodyText: (count: number) =>
        `${count} ${
          count > 1 ? 'grupos de permissão cadastrados' : 'grupo de permissão cadastrado'
        }`,
      viewName: 'PermissionsView',
    },
  ],
  admin: [
    {
      icon: 'Histogram',
      title: 'Dados',
      subtitle: 'Visualize os dados cadastrados no sistema',
      permission: contextEnum.DATA,
      bodyText: (count: number) =>
        `${count} ${count > 1 ? 'tipos de dados cadastrados' : 'tipo de dado cadastrado'}`,
      viewName: 'DataView',
    },
    {
      icon: 'PieChart',
      title: 'Gerenciar gráficos',
      subtitle: 'Gerencie os gráficos para construir os dashboards',
      permission: contextEnum.MANAGE_DASHBOARDS,
      viewName: 'ChartsView',
    },
    {
      icon: 'DataAnalysis',
      title: 'Dashboards',
      subtitle: 'Visualize os dashboards cadastrados no sistema',
      permission: contextEnum.DASHBOARD,
      bodyText: (count: number) =>
        `${count} ${count > 1 ? 'dashboards cadastrados' : 'dashboard cadastrado'}`,
      viewName: 'DashboardsView',
    },
    {
      icon: 'SetUp',
      title: 'Aprendizagem de máquina',
      subtitle: 'Utilize aprendizagem de máquina para gerar conjuntos de regras',
      permission: contextEnum.LEARNING,
      bodyText: (count: number) =>
        `${count} ${count > 1 ? 'treinamentos em andamento' : 'treinamento em andamento'}`,
      viewName: 'LearningView',
    },
    {
      icon: 'Folder',
      title: 'Grupos de regras',
      subtitle: 'Gerenciar regras de processamento',
      permission: contextEnum.RULES,
      bodyText: (count: number) =>
        `${count} ${
          count > 1 ? 'conjuntos de regras cadastrados' : 'conjunto de regras cadastrado'
        }`,
      viewName: 'RuleGroupsView',
    },
    {
      icon: 'List',
      title: 'Ordens de serviço',
      subtitle: 'Visualize e gerencie notificações e ordens de serviços',
      permission: contextEnum.SERVICES,
      bodyText: (count: number) =>
        `${count} ${count > 1 ? 'novas notificações' : 'nova notificação'}`,
      viewName: 'BoardsView',
    },
    {
      icon: 'User',
      title: 'Usuários',
      subtitle: 'Visualize e gerencie os usuários cadastrados no sistema',
      permission: contextEnum.USERS,
      bodyText: (count: number) =>
        `${count} ${count > 1 ? 'usuários cadastrados' : 'usuário cadastrado'}`,
      viewName: 'UsersView',
    },
    {
      icon: 'key',
      title: 'Grupos de permissões',
      subtitle: 'Visualize e gerencie as permissões do sistema',
      permission: contextEnum.GROUP,
      bodyText: (count: number) =>
        `${count} ${
          count > 1 ? 'grupos de permissão cadastrados' : 'grupo de permissão cadastrado'
        }`,
      viewName: 'PermissionsView',
    },
  ],
  office: [
    {
      icon: 'Histogram',
      title: 'Dados',
      subtitle: 'Visualize os dados cadastrados no sistema',
      permission: contextEnum.DATA,
      bodyText: (count: number) =>
        `${count} ${count > 1 ? 'tipos de dados cadastrados' : 'tipos de dado cadastrado'}`,
      viewName: 'DataView',
    },
    {
      icon: 'PieChart',
      title: 'Gerenciar gráficos',
      subtitle: 'Gerencie os gráficos para construir os dashboards',
      permission: contextEnum.MANAGE_DASHBOARDS,
      viewName: 'ChartsView',
    },
    {
      icon: 'DataAnalysis',
      title: 'Dashboards',
      subtitle: 'Visualize os dashboards cadastrados no sistema',
      permission: contextEnum.DASHBOARD,
      bodyText: (count: number) =>
        `${count} ${count > 1 ? 'dashboards cadastrados' : 'dashboard cadastrado'}`,
      viewName: 'DashboardsView',
    },
    {
      icon: 'SetUp',
      title: 'Aprendizagem de máquina',
      subtitle: 'Utilize aprendizagem de máquina para gerar conjuntos de regras',
      permission: contextEnum.LEARNING,
      bodyText: (count: number) =>
        `${count} ${count > 1 ? 'treinamentos em andamento' : 'treinamento em andamento'}`,
      viewName: 'LearningView',
    },
    {
      icon: 'Folder',
      title: 'Grupos de regras',
      subtitle: 'Gerenciar regras de processamento',
      permission: contextEnum.RULES,
      bodyText: (count: number) =>
        `${count} ${
          count > 1 ? 'conjuntos de regras cadastrados' : 'conjunto de regras cadastrado'
        }`,
      viewName: 'RuleGroupsView',
    },
    {
      icon: 'List',
      title: 'Ordens de serviço',
      subtitle: 'Visualize e gerencie notificações e ordens de serviços',
      permission: contextEnum.SERVICES,
      bodyText: (count: number) =>
        `${count} ${count > 1 ? 'novas notificações' : 'nova notificação'}`,
      viewName: 'BoardsView',
    },
    {
      icon: 'Brush',
      title: 'Temas',
      subtitle: 'Visualize e gerencie o tema do sistema',
      permission: contextEnum.THEMES,
      viewName: 'ConfigView',
    },
  ],
}

export { homeCards }
