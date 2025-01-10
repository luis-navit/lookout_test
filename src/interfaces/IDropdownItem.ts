interface IDropdownItem {
  text: string
  command: string
  color?: string
  icon?: string
  disabled?: boolean
}

interface IShortOption extends IDropdownItem {
  permission: string
}

export type { IDropdownItem, IShortOption }
