import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'src-js/main.ts',
      name: 'Main',
      fileName: (format) => `main.js`,
      formats: ['iife']
    },
    outDir: 'dist',
    emptyOutDir: false
  }
})
