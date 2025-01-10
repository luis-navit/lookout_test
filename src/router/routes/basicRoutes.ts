import contextEnum from '@/enums/contextEnum'
import type { RouteRecordRaw } from 'vue-router'
import BasicLayout from '@/layouts/basicLayout/basicLayout.vue'
import HomeView from '@/views/HomeView/HomeView.vue'
import DataView from '@/views/DataView/DataView.vue'
import DataDetailsView from '@/views/DataDetailsView/DataDetailsView.vue'
import LearningView from '@/views/LearningView/LearningView.vue'
import TrainingView from '@/views/TrainingView/TrainingView.vue'
import TrainingGraphView from '@/views/TrainingGraphView/TrainingGraphView.vue'
import TrainingTimeSeriesView from '@/views/TrainingTimeSeriesView/TrainingTimeSeriesView.vue'
import DashboardsView from '@/views/DashboardsView/DashboardsView.vue'
import DashboardView from '@/views/DashboardView/DashboardView.vue'
import RuleGroupsView from '@/views/RuleGroupsView/RuleGroupsView.vue'
import RuleDetailsView from '@/views/RuleDetailsView/RuleDetailsView.vue'
import UsersView from '@/views/UsersView/UsersView.vue'
import CompaniesView from '@/views/CompaniesView/CompaniesView.vue'
import BoardsView from '@/views/BoardsView/BoardsView.vue'
import OSView from '@/views/OSView/OSView.vue'
import PermissionsView from '@/views/PermissionsView/PermissionsView.vue'
import PermissionView from '@/views/PermissionView/PermissionView.vue'
import ConfigView from '@/views/ConfigView/ConfigView.vue'
// import NotFoundView from '@/views/NotFoundView/NotFoundView.vue'

const BasicRoutes: RouteRecordRaw = {
  path: '/',
  component: BasicLayout,
  children: [
    {
      path: '/',
      name: 'HomeView',
      component: HomeView,
      meta: { currentIndex: 'home' },
    },
    {
      path: 'data',
      name: 'DataView',
      component: DataView,
      meta: { currentIndex: 'data', context: contextEnum.DATA },
    },
    {
      path: 'data/details',
      name: 'DataDetailsView',
      component: DataDetailsView,
      meta: { currentIndex: 'data', context: contextEnum.DATA },
    },
    {
      path: 'learning',
      name: 'LearningView',
      component: LearningView,
      meta: { currentIndex: 'learning', context: contextEnum.LEARNING },
    },
    {
      path: 'training',
      name: 'TrainingView',
      component: TrainingView,
      meta: { currentIndex: 'learning', context: contextEnum.LEARNING },
    },
    {
      path: 'training/graphType',
      name: 'TrainingGraphView',
      component: TrainingGraphView,
      meta: { currentIndex: 'learning', context: contextEnum.LEARNING },
    },
    {
      path: 'training/timeSeries',
      name: 'TrainingTimeSeriesView',
      component: TrainingTimeSeriesView,
      meta: { currentIndex: 'learning', context: contextEnum.LEARNING },
    },
    {
      path: 'dashboards',
      name: 'DashboardsView',
      component: DashboardsView,
      meta: { currentIndex: 'dashboard', context: contextEnum.DASHBOARD },
    },
    {
      path: 'dashboard',
      name: 'DashboardView',
      component: DashboardView,
      meta: { currentIndex: 'dashboard', context: contextEnum.DASHBOARD },
    },
    {
      path: 'rule/groups',
      name: 'RuleGroupsView',
      component: RuleGroupsView,
      meta: { currentIndex: 'rule', context: contextEnum.RULES },
    },
    {
      path: 'rule/details',
      name: 'RuleDetailsView',
      component: RuleDetailsView,
      meta: { currentIndex: 'rule', context: contextEnum.RULES },
    },
    {
      path: 'users',
      name: 'UsersView',
      component: UsersView,
      meta: { currentIndex: 'user', context: contextEnum.USERS },
    },
    {
      path: 'companies',
      name: 'CompaniesView',
      component: CompaniesView,
      meta: { currentIndex: 'company', context: contextEnum.COMPANY },
    },
    {
      path: 'os/boards',
      name: 'BoardsView',
      component: BoardsView,
      meta: { currentIndex: 'os', context: contextEnum.SERVICES },
    },
    {
      path: 'os/detail',
      name: 'OSView',
      component: OSView,
      meta: { currentIndex: 'os', context: contextEnum.SERVICES },
    },
    {
      path: 'permissions',
      name: 'PermissionsView',
      component: PermissionsView,
      meta: { currentIndex: 'permission', context: contextEnum.GROUP },
    },
    {
      path: 'permission',
      name: 'PermissionView',
      component: PermissionView,
      meta: { currentIndex: 'permission', context: contextEnum.GROUP },
    },
    {
      path: '/config',
      name: 'ConfigView',
      component: ConfigView,
      meta: { currentIndex: 'theme', context: contextEnum.THEMES },
    },
    {
      path: ':pathMatch(.*)*',
      name: 'NotFoundView',
      component: () => import('@/views/NotFoundView/NotFoundView.vue'),
      meta: { currentIndex: 'notFound' },
    },
  ],
}

export default BasicRoutes
