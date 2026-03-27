// src/plugins/vuetify.js
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import { vi } from 'vuetify/locale'
import '@mdi/font/css/materialdesignicons.css'

const vuetify = createVuetify({
  components,
  directives,
  locale: {
    locale: 'vi',
    fallback: 'vi',
    messages: { vi },
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#b91c1c', // Darker Red (red-700)
          secondary: '#171717',
          accent: '#dc2626', // Brighter Red (red-600)
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FB8C00',
          background: '#f5f5f5',
          surface: '#ffffff',
        },
        variables: {
          'font-family': '"Be Vietnam Pro", sans-serif',
        }
      },
      dark: {
        dark: true,
        colors: {
          primary: '#b91c1c', // Darker Red
          secondary: '#ffffff',
          accent: '#dc2626', // Brighter Red
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FB8C00',
          background: '#171717',
          surface: '#000000',
        },
        variables: {
          'font-family': '"Be Vietnam Pro", sans-serif',
        }
      },
    },
  },
})

export default vuetify