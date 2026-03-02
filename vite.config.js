import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import {ElementPlusResolver} from 'unplugin-vue-components/resolvers'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'

// https://vite.dev/config/
export default defineConfig({
    base: '/ai-agent_vue_version/',
  plugins: [
    vue(),//Vue3支持
    vueDevTools(),//Vue支持工具
    AutoImport({
      resolvers:[ElementPlusResolver()],//自动导入Element Plus的API
    }),
    Components({
      resolvers:[ElementPlusResolver()],//自动导入Element Plus的组件
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))//将@映射到src目录
    },
  }
})
