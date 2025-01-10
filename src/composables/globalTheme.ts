import { useCssVar } from '@vueuse/core'
import { handleGenerateSecondaryColorFromPrimary } from './utils'

const handleChangeGlobalTheme = (primaryColor?: string) => {
  const globalPrimaryColor = useCssVar('--el-color-primary', document.documentElement)
  const globalSecondaryColor = useCssVar('--el-color-secondary', document.documentElement)
  const globalButtonPrimaryHoverColor = useCssVar(
    // '--el-button-hover-bg-color',
    '--el-color-primary-light-3',
    document.documentElement
  )

  const secondaryColor = handleGenerateSecondaryColorFromPrimary(primaryColor || '#153c78')

  globalPrimaryColor.value = primaryColor
  globalSecondaryColor.value = secondaryColor
  globalButtonPrimaryHoverColor.value = secondaryColor
}

export { handleChangeGlobalTheme }
