import { useState, useEffect } from 'react'
import { useConfig, useUpdateConfig } from '../../hooks/useConfig'
import { getOllamaModels } from '../../api/config'

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

const labelStyle = {
  display: 'block',
  fontSize: 12,
  color: 'var(--text-dim)',
  marginBottom: 6,
  fontFamily: "'DM Mono', monospace",
  letterSpacing: '0.04em' as const,
}

export default function LocalSettings() {
  const { data: config } = useConfig()
  const update = useUpdateConfig()
  const [models, setModels] = useState<string[]>([])
  const [loadingModels, setLoadingModels] = useState(false)
  const [ollamaHost, setOllamaHost] = useState('')

  useEffect(() => {
    if (config) setOllamaHost(config.ollama_host ?? '')
  }, [config])

  const fetchModels = async () => {
    setLoadingModels(true)
    try {
      const m = await getOllamaModels()
      setModels(m)
    } catch {
      setModels([])
    } finally {
      setLoadingModels(false)
    }
  }

  if (!config) return null

  return (
    <div className="flex flex-col gap-5">
      {/* Ollama host */}
      <div>
        <label style={labelStyle}>OLLAMA HOST</label>
        <div className="flex gap-2">
          <input
            value={ollamaHost}
            onChange={(e) => setOllamaHost(e.target.value)}
            style={{ ...inputStyle, width: 'auto', flex: 1, fontFamily: "'DM Mono', monospace", fontSize: 13 }}
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--text-dim)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          />
          <button
            onClick={() => update.mutate({ ollama_host: ollamaHost })}
            className="shrink-0 transition-colors"
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
              borderRadius: 'var(--radius-sm)',
              padding: '7px 16px',
              fontSize: 13.5,
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            Guardar
          </button>
        </div>
      </div>

      {/* Model */}
      <div>
        <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>MODELO ACTIVO</label>
          <button
            onClick={fetchModels}
            disabled={loadingModels}
            style={{
              fontSize: 11,
              color: loadingModels ? 'var(--text-dim)' : 'var(--text-muted)',
              background: 'none',
              border: 'none',
              fontFamily: "'DM Mono', monospace",
              cursor: loadingModels ? 'wait' : 'pointer',
              letterSpacing: '0.02em',
            }}
            onMouseEnter={e => { if (!loadingModels) e.currentTarget.style.color = 'var(--text)' }}
            onMouseLeave={e => (e.currentTarget.style.color = loadingModels ? 'var(--text-dim)' : 'var(--text-muted)')}
          >
            {loadingModels ? 'Cargando…' : '↻ Actualizar'}
          </button>
        </div>

        {models.length > 0 ? (
          <select
            value={config.ollama_model}
            onChange={(e) => update.mutate({ ollama_model: e.target.value })}
            style={inputStyle}
          >
            {models.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        ) : (
          <input
            value={config.ollama_model ?? ''}
            onChange={(e) => update.mutate({ ollama_model: e.target.value })}
            placeholder="llama3.2"
            style={{ ...inputStyle, fontFamily: "'DM Mono', monospace", fontSize: 13 }}
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--text-dim)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          />
        )}
        <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 6, fontFamily: "'DM Mono', monospace" }}>
          El modelo se descarga automáticamente si no está instalado.
        </p>
      </div>
    </div>
  )
}
