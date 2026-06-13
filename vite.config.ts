import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Relative base so the built assets work under ANY plugin prefix
  // (/api/<plugin>/ui/...) without rebuilding per variant. index.html injects a
  // runtime <base href> so relative URLs also resolve correctly on deep routes.
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/briefscope[^/]*/, ''),
      },
    },
  },
})
