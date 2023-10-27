import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './main.css'

Object.defineProperty(globalThis, 'CESIUM_BASE_URL', {
  value: import.meta.env.VITE_CESIUM_BASE_URL
})

createApp(App)
  .use(createPinia())
  .mount('#app')
