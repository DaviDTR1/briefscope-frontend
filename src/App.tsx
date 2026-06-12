import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AppShell from './components/layout/AppShell'
import HomePage from './pages/HomePage'
import ProjectPage from './pages/ProjectPage'
import SettingsPage from './pages/SettingsPage'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 10_000 } },
})

// The SPA is always mounted at /ui (optionally prefixed by ROOT_PATH from the proxy).
// basename = ROOT_PATH + "/ui"  →  "/ui" locally, "/api/briefscope_cloud/ui" in QueAI
declare global { interface Window { __ROOT_PATH__: string } }
const basename = (window.__ROOT_PATH__ || '') + '/ui'

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={basename}>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<HomePage />} />
            <Route path="projects/:id" element={<ProjectPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
