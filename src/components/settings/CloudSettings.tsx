import { useState } from 'react'
import { useConfig, useUpdateConfig } from '../../hooks/useConfig'

const PROVIDERS = [
  { value: 'anthropic', label: 'Anthropic (Claude)' },
  { value: 'openai',    label: 'OpenAI (GPT)' },
  { value: 'google',    label: 'Google (Gemini)' },
]

const MODELS: Record<string, string[]> = {
  anthropic: [
    'claude-opus-4-5',
    'claude-opus-4-0',
    'claude-sonnet-4-5',
    'claude-sonnet-4-0',
    'claude-3-7-sonnet-20250219',
    'claude-3-5-sonnet-20241022',
    'claude-3-5-haiku-20241022',
    'claude-3-haiku-20240307',
    'claude-3-opus-20240229',
    'claude-3-sonnet-20240229',
  ],
  openai: [
    'gpt-4.1',
    'gpt-4.1-mini',
    'gpt-4.1-nano',
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-4o-2024-11-20',
    'gpt-4-turbo',
    'o3',
    'o3-mini',
    'o4-mini',
  ],
  google: [
    'gemini-2.5-pro-preview-06-05',
    'gemini-2.5-flash-preview-05-20',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'gemini-1.5-flash-8b',
    'gemini-2.0-pro-exp',
    'gemini-2.0-flash-thinking-exp',
    'gemini-exp-1206',
  ],
}

const inputStyle = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  color: 'var(--text)',
  borderRadius: 'var(--radius-sm)',
  padding: '7px 12px',
  fontSize: 13.5,
  fontFamily: "'DM Sans', sans-serif",
  width: '100%',
}

export default function CloudSettings() {
  const { data: config } = useConfig()
  const update = useUpdateConfig()
  const [apiKey, setApiKey] = useState('')
  const [saved, setSaved] = useState(false)

  if (!config) return null

  const provider = config.cloud_provider
  const keyLabel = { anthropic: 'Anthropic API Key', openai: 'OpenAI API Key', google: 'Google API Key' }[provider]
  const keySet = { anthropic: config.anthropic_api_key_set, openai: config.openai_api_key_set, google: config.google_api_key_set }[provider]

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
      {/* Provider */}
      <div>
        <label style={{ display: 'block', fontSize: 12, color: 'var(--text-dim)', marginBottom: 6, fontFamily: "'DM Mono', monospace", letterSpacing: '0.04em' }}>
          PROVEEDOR
        </label>
        <select
          value={provider}
          onChange={(e) => update.mutate({ cloud_provider: e.target.value })}
          style={inputStyle}
        >
          {PROVIDERS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      {/* Model */}
      <div>
        <label style={{ display: 'block', fontSize: 12, color: 'var(--text-dim)', marginBottom: 6, fontFamily: "'DM Mono', monospace", letterSpacing: '0.04em' }}>
          MODELO
        </label>
        <select
          value={config.cloud_model}
          onChange={(e) => update.mutate({ cloud_model: e.target.value })}
          style={inputStyle}
        >
          {(MODELS[provider] ?? []).map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {/* API Key */}
      <div>
        <label style={{ display: 'block', fontSize: 12, color: 'var(--text-dim)', marginBottom: 6, fontFamily: "'DM Mono', monospace", letterSpacing: '0.04em' }}>
          {keyLabel?.toUpperCase()}
          {keySet && (
            <span style={{ marginLeft: 8, color: 'var(--ok)', fontWeight: 400 }}>✓ Configurada</span>
          )}
        </label>
        <div className="flex gap-2">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={keySet ? '••••••••• (reemplazar)' : 'sk-...'}
            style={{ ...inputStyle, width: 'auto', flex: 1 }}
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--text-dim)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          />
          <button
            onClick={handleSaveKey}
            disabled={!apiKey.trim() || update.isPending}
            className="transition-colors shrink-0"
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              color: apiKey.trim() ? 'var(--text)' : 'var(--text-dim)',
              borderRadius: 'var(--radius-sm)',
              padding: '7px 16px',
              fontSize: 13.5,
              fontFamily: 'inherit',
              opacity: !apiKey.trim() ? 0.5 : 1,
              cursor: !apiKey.trim() ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={e => { if (apiKey.trim()) e.currentTarget.style.borderColor = 'var(--accent)' }}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            {saved ? '✓ Guardado' : 'Guardar'}
          </button>
        </div>
        {keySet && (
          <button
            onClick={() => update.mutate({ [`${provider}_api_key`]: '' } as object)}
            style={{ marginTop: 6, fontSize: 12, color: 'var(--text-dim)', background: 'none', border: 'none', fontFamily: 'inherit', cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}
          >
            Borrar key
          </button>
        )}
      </div>
    </div>
  )
}
