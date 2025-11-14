// vite.config.ts
import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'PluginDevServer',
      fileName: (format) => `index.${format}.js`,
      formats: ['cjs', 'es']
    },
    rollupOptions: {
      external: ['express', 'path', 'fs'],
      output: {
        globals: {
          express: 'express',
          path: 'path',
          fs: 'fs'
        }
      }
    }
  }
});