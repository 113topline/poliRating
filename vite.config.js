import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  // Para GitHub Pages: ajuste o base para o nome do seu repositório.
  // Se o repo se chamar "meu-site", use base: '/meu-site/'
  // Se for um domínio raiz (github.io ou domínio customizado), use base: '/'
  base: process.env.VITE_BASE_URL || '/',
})
