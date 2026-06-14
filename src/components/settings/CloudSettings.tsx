import { useState } from 'react'
import { useTranslation } from '../../i18n'
import { useConfig, useUpdateConfig } from '../../hooks/useConfig'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { SimpleSelect } from '../ui/select'

const PROVIDER_LABELS: Record<string, string> = {
  anthropic: 'Anthropic (Claude)',
  openai:    'OpenAI (GPT)',
  google:    'Google (Gemini)',
}

const MODELS: Record<string, string[]> = {
  anthropic: [
    'claude-opus-4-8',
    'claude-sonnet-4-6',
    'claude-haiku-4-5-20251001',
    'claude-fable-5',
    'claude-opus-4-5',
    'claude-sonnet-4-5',
    'claude-3-7-sonnet-20250219',
    'claude-3-5-sonnet-20241022',
    'claude-3-5-haiku-20241022',
    'claude-3-opus-20240229',
  ],
  openai: [
    'gpt-5.5',
    'gpt-5.4',
    'gpt-5.2',
    'gpt-5.1',
    'gpt-5.4-mini',
    'gpt-4.1',
    'gpt-4.1-mini',
    'gpt-4o',
    'gpt-4o-mini',
    'o4-mini',
  ],
  google: [
    'gemini-3.5-flash',
    'gemini-3.1-flash-lite',
    'gemini-2.5-pro-preview-06-05',
    'gemini-2.5-flash-preview-05-20',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'gemini-1.5-flash-8b',
    'gemini-2.0-pro-exp',
  ],
}

export default function CloudSettings() {
  const { t } = useTranslation()
  const { data: config } = useConfig()
  const update = useUpdateConfig()
  const [apiKey, setApiKey] = useState('')
  const [saved, setSaved] = useState(false)

  if (!config) return null

  // The LLM provider is LOCKED to this variant's fixed embedding provider
  // (openai → OpenAI, gemini → Google). It cannot be switched in the UI; the
  // backend ignores any attempt to change it.
  const provider = config.embedding_provider ?? config.cloud_provider

  const keyLabel: Record<string, string> = {
    anthropic: 'Anthropic API Key',
    openai:    'OpenAI API Key',
    google:    'Google API Key',
  }
  const keySet: Record<string, boolean> = {
    anthropic: config.anthropic_api_key_set,
    openai:    config.openai_api_key_set,
    google:    config.google_api_key_set,
  }

  const handleSaveKey = async () => {
    if (!apiKey.trim()) return
    const field = `${provider}_api_key` as 'anthropic_api_key' | 'openai_api_key' | 'google_api_key'
    await update.mutateAsync({ [field]: apiKey.trim() })
    setApiKey('')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Provider — locked to the variant's provider */}
      <div>
        <Label>{t('cloud.provider')}</Label>
        <div
          className="flex items-center justify-between rounded-sm px-3 py-2 text-[13px]"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <span className="text-text">{PROVIDER_LABELS[provider] ?? provider}</span>
          <span className="text-[11px] font-mono text-text-dim">{t('cloud.locked')}</span>
        </div>
        <p className="mt-1.5 text-[11px] font-mono text-text-dim">
          {t('cloud.providerHint', { provider: PROVIDER_LABELS[provider] ?? provider })}
        </p>
      </div>

      {/* Model */}
      <div>
        <Label>{t('cloud.model')}</Label>
        <SimpleSelect
          value={config.cloud_model}
          onValueChange={(val) => update.mutate({ cloud_model: val })}
          options={(MODELS[provider] ?? []).map((m) => ({ value: m }))}
        />
      </div>

      {/* API Key */}
      <div>
        <Label>
          {keyLabel[provider] ?? t('cloud.apiKey')}
          {keySet[provider] && (
            <span className="ml-2 text-ok normal-case font-sans tracking-normal font-normal">
              {t('cloud.configured')}
            </span>
          )}
        </Label>
        <div className="flex gap-2">
          <Input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={keySet[provider] ? t('cloud.keyPlaceholderReplace') : 'sk-…'}
            className="flex-1 w-auto"
            onKeyDown={(e) => { if (e.key === 'Enter') handleSaveKey() }}
          />
          <Button
            variant="outline"
            onClick={handleSaveKey}
            disabled={!apiKey.trim() || update.isPending}
            className="shrink-0"
          >
            {saved ? t('common.saved') : t('common.save')}
          </Button>
        </div>

        {keySet[provider] && (
          <Button
            variant="danger"
            size="sm"
            className="mt-2 px-0"
            onClick={() => update.mutate({ [`${provider}_api_key`]: '' } as object)}
          >
            {t('cloud.deleteKey')}
          </Button>
        )}
      </div>
    </div>
  )
}
