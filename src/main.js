// src/main.js
import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'



const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

// Initialize Auth
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore(pinia)
authStore.initializeAuth()
app.use(router)
app.use(vuetify)
app.component('ConfirmDialog', ConfirmDialog)
app.config.errorHandler = (err, instance, info) => { console.error('Global error:', err, info) }
app.mount('#app')