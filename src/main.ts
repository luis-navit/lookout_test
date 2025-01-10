import { createApp } from 'vue'
import App from './App.vue'
import { registerPlugins } from './plugins'
import 'element-plus/theme-chalk/dark/css-vars.css'

const app = createApp(App)

registerPlugins(app)

app.mount('#app')
