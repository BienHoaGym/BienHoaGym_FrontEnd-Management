// src/main.js
import './assets/main.css'
import './style.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

import { setupGlobalErrorCapture } from '@/composables/useApiErrorHandler'
import VueApexCharts from "vue3-apexcharts";

const app = createApp(App)
app.use(createPinia())
app.use(VueApexCharts);

// Initialize Global AI Error Capture
setupGlobalErrorCapture()

app.use(router)
app.use(vuetify)
app.component('ConfirmDialog', ConfirmDialog)
app.config.errorHandler = (err, instance, info) => { console.error('Global error:', err, info) }
app.mount('#app')