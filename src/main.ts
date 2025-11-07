import { createApp } from 'vue'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

// Components
import App from './App.vue'

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi', // This is already the default value - only for display purposes
  },
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: {
        colors: {
          // Neutrals (Nord Polar Night + Snow Storm)
          background: '#2E3440',
          'on-background': '#ECEFF4',
          surface: '#3B4252',
          'on-surface': '#E5E9F0',
          'surface-1': '#3B4252',
          'surface-2': '#434C5E',
          'surface-3': '#4C566A',
          'surface-4': '#2E3440',
          'surface-5': '#252B36',
          outline: '#434C5E',
          'outline-variant': '#4C566A',

          // Primary (Nord Frost #88C0D0)
          primary: '#88C0D0',
          'primary-50': '#F1F7FA',
          'primary-100': '#DCECF3',
          'primary-200': '#C2DEE9',
          'primary-300': '#A7CFDE',
          'primary-400': '#95C5D7',
          'primary-500': '#88C0D0',
          'primary-600': '#6FA6B7',
          'primary-700': '#5B8C9D',
          'primary-800': '#4A7382',
          'primary-900': '#3B5A68',
          'on-primary': '#0B141A',
          'primary-container': '#2A4651',
          'on-primary-container': '#CFEAF1',

          // Secondary (Nord Frost #81A1C1)
          secondary: '#81A1C1',
          'secondary-50': '#F0F4FA',
          'secondary-100': '#DEE8F4',
          'secondary-200': '#C4D4E7',
          'secondary-300': '#A9BFD9',
          'secondary-400': '#95AFCE',
          'secondary-500': '#81A1C1',
          'secondary-600': '#6A89A8',
          'secondary-700': '#57728F',
          'secondary-800': '#455B75',
          'secondary-900': '#36465D',
          'on-secondary': '#0C1219',
          'secondary-container': '#27364A',
          'on-secondary-container': '#DCE7F5',

          // Accent (Nord Frost #8FBCBB)
          accent: '#8FBCBB',
          'accent-50': '#EFF8F7',
          'accent-100': '#DBEFEE',
          'accent-200': '#C1E1E0',
          'accent-300': '#A7D3D1',
          'accent-400': '#97C9C7',
          'accent-500': '#8FBCBB',
          'accent-600': '#76A3A2',
          'accent-700': '#628B8A',
          'accent-800': '#4F7271',
          'accent-900': '#3D5959',
          'on-accent': '#0B1413',
          'accent-container': '#244845',
          'on-accent-container': '#D7EEED',

          // Info (Nord Frost #5E81AC)
          info: '#5E81AC',
          'info-50': '#EFF3FA',
          'info-100': '#DCE6F3',
          'info-200': '#C1D3E8',
          'info-300': '#A6BFDB',
          'info-400': '#90AFD1',
          'info-500': '#5E81AC',
          'info-600': '#4B6B92',
          'info-700': '#3E5878',
          'info-800': '#324660',
          'info-900': '#28384C',
          'on-info': '#0A1118',
          'info-container': '#1B2C40',
          'on-info-container': '#DCE7F7',

          // Error (Nord Aurora #BF616A)
          error: '#BF616A',
          'error-50': '#FBEDEE',
          'error-100': '#F5D6D8',
          'error-200': '#EBAFB3',
          'error-300': '#DF888E',
          'error-400': '#D56D74',
          'error-500': '#BF616A',
          'error-600': '#A65158',
          'error-700': '#8D434A',
          'error-800': '#73373E',
          'error-900': '#5A2B31',
          'on-error': '#130708',
          'error-container': '#5A1F25',
          'on-error-container': '#FFDAD6',

          // Success (Nord Aurora #A3BE8C)
          success: '#A3BE8C',
          'success-50': '#F2F7ED',
          'success-100': '#E3EFD8',
          'success-200': '#CBE2B7',
          'success-300': '#B1D397',
          'success-400': '#9FC882',
          'success-500': '#A3BE8C',
          'success-600': '#89A674',
          'success-700': '#718B60',
          'success-800': '#5B724C',
          'success-900': '#495A3D',
          'on-success': '#0C1209',
          'success-container': '#253A25',
          'on-success-container': '#DDF0D9',

          // Warning (Nord Aurora #EBCB8B)
          warning: '#EBCB8B',
          'warning-50': '#FFF8EA',
          'warning-100': '#FDEFD0',
          'warning-200': '#F8E0A8',
          'warning-300': '#F0CD7F',
          'warning-400': '#E6BC63',
          'warning-500': '#EBCB8B',
          'warning-600': '#D3B476',
          'warning-700': '#B89861',
          'warning-800': '#997B4C',
          'warning-900': '#7A613B',
          'on-warning': '#141006',
          'warning-container': '#3E2F0C',
          'on-warning-container': '#FFEEC5',
        },
      },
    },
  },
})

createApp(App).use(vuetify).mount('#app')
