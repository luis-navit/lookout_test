import { Buffer } from 'buffer'
import { ptBR } from 'date-fns/locale'
import { differenceInHours, format, formatRelative } from 'date-fns'
import pinia from '@/stores/instance'
import { useAuthStore } from '@/stores/authStore'
import { osStatusEnum } from '@/enums/osStatusEnum'
import { profileEnum } from '@/enums/profileEnum'
import type { PermissionsType } from '@/types/PermissionsType'
import type { IPermission } from '@/interfaces/IGroupPermission'
import type { ICompany } from '@/interfaces/ICompany'
import type { RGB } from '@/types/rgb'

const authStore = useAuthStore(pinia)

function handleNormalizeText(text: string) {
  return text
    ?.trim()
    ?.toLowerCase()
    ?.normalize('NFD')
    ?.replace(/[\u0300-\u036f]/g, '')
}

function handleFilterData<T>(
  data: Array<T>,
  searchFields: Array<string>,
  searchText: string
): Array<T> {
  if (!searchText.length) return data

  const search = handleNormalizeText(searchText)

  return data.filter((item: any) =>
    searchFields.some((field) => handleNormalizeText(String(item[field]))?.includes(search))
  )
}

function handlePageSizes(maxLength: number, sizesInterval: number): Array<number> {
  if (maxLength < sizesInterval) return [maxLength]

  const envMaxValue = parseInt(import.meta.env.VITE_APP_MAX_PAGINATION_VALUE)

  const maxPageSize = maxLength < envMaxValue ? maxLength : envMaxValue

  return Array.from(
    { length: Math.floor(maxPageSize / sizesInterval) },
    (_, index) => (index + 1) * sizesInterval
  )
}

function handleBlobToFile(blob: Blob, fileName: string): File {
  return new File([blob as any], fileName, {
    type: blob.type,
  })
}

function handleFileToBase64(fileData: any, fileType = 'image/png'): string {
  const imgBase64 = Buffer.from(fileData, 'binary').toString('base64')

  return `data:/${fileType};base64,${imgBase64}`
}

function handleOSStatusByDate(
  relativeDate: string,
  hasNextState: boolean,
  isClosed: boolean
): osStatusEnum {
  const difference = differenceInHours(new Date(relativeDate).getTime(), new Date().getTime())

  if (!relativeDate || difference > 48) return osStatusEnum.DEFAULT

  if (!hasNextState || isClosed) return osStatusEnum.SUCCESS

  return difference < 24 ? osStatusEnum.DANGER : osStatusEnum.WARNING
}

const formatRelativeLocale: any = {
  lastWeek: "'Última' EEEE 'às' HH:mm",
  yesterday: "'Ontem às' HH:mm",
  today: "'Hoje às' HH:mm",
  tomorrow: "'Amanhã às' HH:mm",
  nextWeek: "EEEE 'às' HH:mm",
  other: "dd/MM/yyyy 'às' HH:mm",
}

const handleRelativeDate = (date: string): string => {
  return formatRelative(new Date(date), new Date(), {
    locale: {
      ...ptBR,
      formatRelative: (token) => formatRelativeLocale[token],
    },
  })
}

const handleFormatDate = (date: string): string => {
  return format(new Date(date), 'dd/MM/yyyy')
}

const handlePermissions = (permissions: Array<Array<string>>): PermissionsType => {
  return permissions.reduce((acc: PermissionsType, curr: Array<string>) => {
    const [resource, action] = curr
    const [resourceKey] = resource.split('|')
    const formattedKey = resourceKey.replace('[^/]*$', '')

    if (!acc[formattedKey]) acc[formattedKey] = []

    acc[formattedKey].push(action)

    return acc
  }, {})
}

const handleFormatModelText = (model: string): Record<string, string> => {
  const regex = /\(([^)]+)\)/
  const modelData = model.match(regex)?.pop() || ''

  return modelData.split(',').reduce<Record<string, string>>((acc, curr) => {
    const [key, value] = curr.trim().split('=')
    acc[key] = value

    return acc
  }, {})
}

const handleProfile = (group: IPermission | null, company: ICompany): profileEnum => {
  if (company.name.toLowerCase() === import.meta.env.VITE_APP_HEAD_GROUP) return profileEnum.HEAD
  if (!group) return profileEnum.OFFICE

  return group.admin ? profileEnum.ADMIN : profileEnum.OFFICE
}

const handleDownloadFile = (fileData: any, fileName: string): void => {
  let FILE = window.URL.createObjectURL(new Blob([fileData]))
  let docURL = document.createElement('a')
  docURL.href = FILE
  docURL.setAttribute('download', fileName)
  document.body.appendChild(docURL)
  docURL.click()
}

const handleFormatString = (value: string): string => {
  return value.length ? value : '-'
}

const handleFormatNumber = (value: number): string => {
  return Number.isInteger(value)
    ? value.toString()
    : value.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
}

const handleFormatBoolean = (value: boolean): string => {
  return value ? 'true' : 'false'
}

const handleFormatObject = (value: object): string => {
  return Object.values(value).join(' ,')
}

const handleFormatArray = (value: Array<any>): string => {
  return value.join(' ,')
}

const handleFormatGenericValue = (value: any): string => {
  const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/

  if (typeof value === 'string' && dateRegex.test(value)) return handleFormatDate(value)

  const types: Record<string, () => string> = {
    '[object String]': () => handleFormatString(value),
    '[object Number]': () => handleFormatNumber(value),
    '[object Boolean]': () => handleFormatBoolean(value),
    '[object Object]': () => handleFormatObject(value),
    '[object Array]': () => handleFormatArray(value),
  }

  return types[Object.prototype.toString.call(value)]
    ? types[Object.prototype.toString.call(value)]()
    : '-'
}

const handleCheckContext = (context: string, role: string): boolean => {
  return authStore.userData.roles[context].includes(role)
}

const handleHexToRGB = (hex: string): RGB => {
  const bigint = parseInt(hex.slice(1), 16)
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  }
}

const handleRgbToHex = (rgb: RGB): string => {
  return `#${((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1).toUpperCase()}`
}

const handleGenerateSecondaryColorFromPrimary = (primaryColorHex: string): string => {
  const originalPrimaryColor: RGB = handleHexToRGB('#153c78')
  const originalSecondaryColor: RGB = handleHexToRGB('#457dd2')
  const primaryColor: RGB = handleHexToRGB(primaryColorHex)

  const fixedDiff = {
    r: originalSecondaryColor.r - originalPrimaryColor.r,
    g: originalSecondaryColor.g - originalPrimaryColor.g,
    b: originalSecondaryColor.b - originalPrimaryColor.b,
  }

  const secondaryColor: RGB = {
    r: Math.min(255, Math.max(0, primaryColor.r + fixedDiff.r)),
    g: Math.min(255, Math.max(0, primaryColor.g + fixedDiff.g)),
    b: Math.min(255, Math.max(0, primaryColor.b + fixedDiff.b)),
  }

  return handleRgbToHex(secondaryColor)
}

export {
  handleBlobToFile,
  handleCheckContext,
  handleDownloadFile,
  handleFileToBase64,
  handleFilterData,
  handleFormatDate,
  handleFormatModelText,
  handleNormalizeText,
  handleOSStatusByDate,
  handlePageSizes,
  handlePermissions,
  handleProfile,
  handleFormatGenericValue,
  handleRelativeDate,
  handleHexToRGB,
  handleRgbToHex,
  handleGenerateSecondaryColorFromPrimary,
}
