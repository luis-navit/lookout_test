import type { ICompany, INewCompany, IUpdateCompany } from '@/interfaces/ICompany'
import api from '../instance'
import api2 from '../updatePasswordInstance'

export function getAllCompanies() {
  return api.get<Array<ICompany>>('/company/')
}

export function createNewCompany(newCompany: INewCompany) {
  return api.post('/company/', newCompany)
}

export function updateCompany(id: string, updateCompany: IUpdateCompany) {
  return api2.put(`/company/${id}`, updateCompany)
}

export function deleteCompany(id: string) {
  return api.delete(`/company/${id}`)
}
