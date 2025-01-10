import api from '../instance'
import api2 from '../updatePasswordInstance'
import type { INewUser, IUpdateUser, IUser, IUserResume } from '@/interfaces/IUser'

export function getAllUsers() {
  return api.get<Array<IUser>>('/users/')
}

export function getAllUsersResume() {
  return api.get<Array<IUserResume>>('/users/public')
}

export function createNewUser(newUser: INewUser) {
  const formData = new FormData()

  Object.entries(newUser).forEach(([key, value]) => {
    formData.append(key, value)
  })

  return api.post('/users/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export function updateUser(id: string, updateUser: IUpdateUser) {
  const formData = new FormData()

  Object.entries(updateUser).forEach(([key, value]) => {
    formData.append(key, value)
  })

  return api2.put(`/users/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export function deleteUser(id: string) {
  return api.delete(`/users/${id}`)
}
