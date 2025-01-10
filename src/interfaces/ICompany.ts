interface ICompany {
  id: string
  name: string
  types: Array<any>
  theme: {
    id: string
    color: string
    logoMarkPath: string
  }
  createdAt: string
  updatedAt: string
  deletedAt: null | string
  cnpj: string
  master: {
    id: string
    managedCompany: string
    name: string
    email: string
  }
  active: boolean
}

interface INewCompanyResponse {
  id: string
  name: string
  cnpj: string
  active: true
  createdAt: string
  updatedAt: string
  master: {
    id: string
    email: string
    company: string
    name: string
    group: {
      id: string
      name: string
      company: string
      admin: true
      createdAt: string
      updatedAt: string
    }
    createdAt: string
    updatedAt: string
  }
}

interface INewCompany {
  name: string
  cnpj: string
  master: {
    email: string
    password?: string
  }
}

interface IUpdateCompany extends INewCompany {
  active: boolean
}

interface IUpdateCompanyResponse {
  count: number
}

export type { ICompany, INewCompany, IUpdateCompany }
