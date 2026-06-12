import axios from 'axios'

declare global {
  interface Window {
    __ROOT_PATH__: string
  }
}

// In production the SPA is served at /api/briefscope_xxx/ui/
// window.__ROOT_PATH__ is set in index.html to e.g. /api/briefscope_cloud
// In dev (Vite proxy) ROOT_PATH is empty → hits localhost:8000 directly
const rootPath = window.__ROOT_PATH__ || ''

export const api = axios.create({
  baseURL: `${rootPath}`,
  headers: { 'Content-Type': 'application/json' },
})
