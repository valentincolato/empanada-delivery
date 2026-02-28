import { defineConfig } from 'vite'
import RubyPlugin from 'vite-plugin-ruby'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [
    RubyPlugin(),
    react(),
  ],
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, 'app/javascript/components'),
      '@utils': path.resolve(__dirname, 'app/javascript/utils'),
    },
  },
})
