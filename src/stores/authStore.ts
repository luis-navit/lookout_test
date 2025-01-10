import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useLocalStore } from './localStore'
import { useSessionStore } from './sessionStore'
import type { IUser } from '@/interfaces/IUser'
import type { ILogin } from '@/interfaces/ILogin'
import type { profileEnum } from '@/enums/profileEnum'
import type { PermissionsType } from '@/types/PermissionsType'

export const useAuthStore = defineStore('authStore', () => {
  const localStore = useLocalStore()
  const sessionStore = useSessionStore()
  const token = ref<string>(
    localStore.getDataFromStore('token') || sessionStore.getDataFromStore('token') || ''
  )
  const refreshToken = ref<string>(localStore.getDataFromStore('refreshToken') || '')
  const userData = ref<IUser>(localStore.getDataFromStore('userData'))
  const userProfile = ref<string>(localStore.getDataFromStore('userProfile') || '')
  const permissions = ref<PermissionsType>(localStore.getDataFromStore('permissions') || {})
  const userProfileImage = ref<string>(localStore.getDataFromStore('userProfileImage') || '')
  const userProfileLogoMark = ref<string>(localStore.getDataFromStore('userProfileLogoMark') || '')
  const countImage = ref<number>(0)
  const countLogoMark = ref<number>(0)

  const updateUserImage = (incomingProfileImage: string): void => {
    userProfileImage.value = incomingProfileImage
    countImage.value++
    localStore.saveDataOnStore('userProfileImage', incomingProfileImage)
  }

  const updateUserLogoMark = (incomingProfileImage: string): void => {
    userProfileLogoMark.value = incomingProfileImage
    countLogoMark.value++
    localStore.saveDataOnStore('userProfileLogoMark', incomingProfileImage)
  }

  const updateUserData = (incomingUserData: ILogin) => {
    userData.value = incomingUserData.user
    token.value = incomingUserData.token
    refreshToken.value = incomingUserData.refreshToken
    userProfileLogoMark.value = incomingUserData.user?.company?.theme?.logoMarkPath || ''

    const localToken = localStore.getDataFromStore('token')

    localStore.saveDataOnStore('userData', incomingUserData.user)
    localStore.saveDataOnStore('refreshToken', incomingUserData.refreshToken)
    localStore.saveDataOnStore(
      'userProfileLogoMark',
      incomingUserData.user?.company?.theme?.logoMarkPath
    )
    if (localToken) {
      localStore.saveDataOnStore('token', incomingUserData.token)
    } else {
      sessionStore.saveDataOnStore('token', incomingUserData.token)
    }
  }

  const login = (
    loginData: ILogin,
    incomingProfile: profileEnum,
    incomingPermissions: PermissionsType,
    rememberMe: boolean
  ): void => {
    token.value = loginData.token
    userData.value = loginData.user
    userProfile.value = incomingProfile
    permissions.value = incomingPermissions
    refreshToken.value = loginData.refreshToken

    if (rememberMe) {
      localStore.saveDataOnStore('token', loginData.token)
    } else {
      sessionStore.saveDataOnStore('token', loginData.token)
    }

    localStore.saveDataOnStore('userData', loginData.user)
    localStore.saveDataOnStore('userProfile', incomingProfile)
    localStore.saveDataOnStore('permissions', incomingPermissions)
    localStore.saveDataOnStore('refreshToken', loginData.refreshToken)
  }

  const logout = (): void => {
    token.value = ''
    userData.value = {
      email: '',
      id: '',
      name: '',
      group: {
        id: '',
        name: '',
        admin: false,
        rolesCount: 0,
        createdAt: '',
        updatedAt: '',
      },
      permissions: [[]],
      roles: {},
      os: [],
      systemResources: [],
    }
    userProfile.value = ''
    permissions.value = {}
    refreshToken.value = ''
    sessionStore.removeDataOfStore('token')
    localStore.removeDataOfStore('token')
    localStore.removeDataOfStore('userData')
    localStore.removeDataOfStore('userProfile')
    localStore.removeDataOfStore('permissions')
    localStore.removeDataOfStore('refreshToken')
    localStore.removeDataOfStore('userProfileImage')
  }

  const canViewThemeCard = computed(() => {
    const hasThemesPermission =
      Object.keys(permissions.value).filter((permission) => permission.includes(`/theme`)).length >
      0

    const isMasterOrHead = !(userProfile.value === 'office')

    return hasThemesPermission && isMasterOrHead
  })

  const isCompanyAdmin = computed(() => {
    const groupName = userData.value.group.name

    return groupName === 'ADMIN'
  })

  return {
    token,
    userData,
    userProfile,
    userProfileImage,
    permissions,
    refreshToken,
    login,
    logout,
    updateUserImage,
    updateUserLogoMark,
    updateUserData,
    countImage,
    userProfileLogoMark,
    countLogoMark,
    canViewThemeCard,
    isCompanyAdmin,
  }
})
