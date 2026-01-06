import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@tensorflow/tfjs', '@tensorflow-models/deeplab'],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  },
  resolve: {
    alias: {
      './runtimeConfig': './runtimeConfig.browser'
    }
  }
})
