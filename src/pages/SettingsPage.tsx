import { useNavigate } from 'react-router-dom'
import { useTranslation, type Lang } from '../i18n'
import { useConfig, useUpdateConfig } from '../hooks/useConfig'
import CloudSettings from '../components/settings/CloudSettings'
import LocalSettings from '../components/settings/LocalSettings'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { ArrowLeft } from '../components/ui/icons'

const sectionStyle: React.CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: '20px 22px',
}

export default function SettingsPage() {
  const navigate = useNavigate()
  const { t, lang, setLang } = useTranslation()
  const { data: config, isLoading } = useConfig()
  const update = useUpdateConfig()

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-dim text-[13px]">
        {t('settings.loading')}
      </div>
    )
  }

  if (!config) return null

  const isLocal = config.llm_mode === 'local'

  return (
    <div className="flex-1 overflow-y-auto animate-fade-up">
      <div style={{ maxWidth: 540, margin: '0 auto', padding: '32px 24px' }}>

        {/* Header */}
        <div className="flex items-center gap-3 mb-7">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
            title={t('settings.back')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-[20px] font-semibold text-text tracking-[-0.3px]">
            {t('settings.title')}
          </h1>
        </div>

        <div className="flex flex-col gap-4">
          {/* Language */}
          <section style={sectionStyle}>
            <h2 className="text-[11px] font-mono text-text-dim tracking-[0.06em] uppercase pb-3.5 mb-4 border-b border-border-subtle">
              {t('lang.label')}
            </h2>
            <div className="flex gap-2">
              {(['es', 'en'] as Lang[]).map((l) => (
                <Button
                  key={l}
                  variant={lang === l ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLang(l)}
                  className="px-4"
                >
                  {l === 'es' ? 'Español' : 'English'}
                </Button>
              ))}
            </div>
          </section>

          {/* LLM */}
          <section style={sectionStyle}>
            <h2 className="text-[11px] font-mono text-text-dim tracking-[0.06em] uppercase pb-3.5 mb-4 border-b border-border-subtle">
              {isLocal ? t('settings.modeLocal') : t('settings.modeCloud')}
            </h2>
            {isLocal ? <LocalSettings /> : <CloudSettings />}
          </section>

          {/* RAG */}
          <section style={sectionStyle}>
            <h2 className="text-[11px] font-mono text-text-dim tracking-[0.06em] uppercase pb-3.5 mb-4 border-b border-border-subtle">
              {t('settings.ragTitle')}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('settings.ragThreshold')}</Label>
                <Input
                  type="number"
                  defaultValue={config.rag_threshold_tokens}
                  onBlur={(e) => update.mutate({ rag_threshold_tokens: Number(e.target.value) })}
                  className="font-mono text-[13px]"
                />
                <p className="mt-1.5 text-[11px] font-mono text-text-dim">
                  {t('settings.ragThresholdHint')}
                </p>
              </div>
              <div>
                <Label>{t('settings.ragTopK')}</Label>
                <Input
                  type="number"
                  defaultValue={config.rag_top_k}
                  onBlur={(e) => update.mutate({ rag_top_k: Number(e.target.value) })}
                  className="font-mono text-[13px]"
                />
              </div>
            </div>
          </section>

          {/* History */}
          <section style={sectionStyle}>
            <h2 className="text-[11px] font-mono text-text-dim tracking-[0.06em] uppercase pb-3.5 mb-4 border-b border-border-subtle">
              {t('settings.historyTitle')}
            </h2>
            <div>
              <Label>{t('settings.compactAfter')}</Label>
              <Input
                type="number"
                defaultValue={config.history_compact_after}
                onBlur={(e) => update.mutate({ history_compact_after: Number(e.target.value) })}
                className="max-w-[120px] font-mono text-[13px]"
              />
              <p className="mt-1.5 text-[11px] font-mono text-text-dim">
                {t('settings.compactHint')}
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
