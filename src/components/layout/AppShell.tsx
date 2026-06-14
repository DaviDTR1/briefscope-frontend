import { Outlet, Link } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useTranslation } from '../../i18n'
import { useConfig } from '../../hooks/useConfig'

export default function AppShell() {
  const { t } = useTranslation()
  const { data: config } = useConfig()

  return (
    <div className="flex h-screen" style={{ background: 'var(--bg)' }}>
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Setup banner */}
        {config && config.llm_mode === 'cloud' && !config.cloud_ready && (
          <div
            className="flex items-center gap-2.5 px-5 py-2.5"
            style={{
              background: 'rgba(212,160,86,0.08)',
              borderBottom: '1px solid rgba(212,160,86,0.22)',
              color: 'var(--warn)',
              fontSize: 13,
            }}
          >
            <span>!</span>
            <span>
              {t('banner.configurePre')}
              <Link
                to="/settings"
                style={{ color: 'var(--warn)', textDecoration: 'underline', fontWeight: 500 }}
              >
                {t('banner.configureLink')}
              </Link>
              {t('banner.configurePost')}
            </span>
          </div>
        )}
        <Outlet />
      </main>
    </div>
  )
}
