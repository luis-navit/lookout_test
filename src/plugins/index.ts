import type { App, Plugin } from 'vue'

import router from '@/router'
import pinia from '@/stores/instance'

import ElementPlus from 'element-plus'
//@ts-ignore
import ptBr from 'element-plus/dist/locale/pt-br.mjs'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import VueTheMask from 'vue-the-mask'

const VueTheMaskPlugin = VueTheMask as unknown as Plugin<[]>

export function registerPlugins(app: App) {
  app.use(router).use(pinia).use(ElementPlus, { locale: ptBr }).use(VueTheMaskPlugin)
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }
}
