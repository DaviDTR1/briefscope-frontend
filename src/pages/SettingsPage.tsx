import { useConfig, useUpdateConfig } from '../hooks/useConfig'
import CloudSettings from '../components/settings/CloudSettings'
import LocalSettings from '../components/settings/LocalSettings'

const sectionStyle = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: '20px 22px',
}

const sectionTitleStyle = {
  fontSize: 12,
  fontFamily: "'DM Mono', monospace",
  color: 'var(--text-dim)',
  letterSpacing: '0.04em',
  paddingBottom: 14,
  marginBottom: 18,
  borderBottom: '1px solid var(--border-subtle)',
}

const numInputStyle = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  color: 'var(--text)',
  borderRadius: 'var(--radius-sm)',
  padding: '6px 10px',
  fontSize: 13.5,
  fontFamily: "'DM Mono', monospace",
  width: '100%',
}

export default function SettingsPage() {
  const { data: config, isLoading } = useConfig()
  const update = useUpdateConfig()

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ color: 'var(--text-dim)', fontSize: 13 }}>
        Cargando configuración…
      </div>
    )
  }

  if (!config) return null

  const isLocal = config.llm_mode === 'local'

  return (
    <div className="flex-1 overflow-y-auto p-8 animate-fade-up">
      <div style={{ maxWidth: 540, margin: '0 auto' }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.3px', color: 'var(--text)', marginBottom: 24 }}>
          Configuración
        </h1>

        <div className="flex flex-col gap-4">
          {/* LLM */}
          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>
              {isLocal ? 'MODO LOCAL — OLLAMA' : 'MODO CLOUD'}
            </h2>
            {isLocal ? <LocalSettings /> : <CloudSettings />}
          </section>

          {/* RAG */}
          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>RAG — BÚSQUEDA EN DOCUMENTOS</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-dim)', fontFamily: "'DM Mono', monospace", letterSpacing: '0.04em', marginBottom: 6 }}>
                  UMBRAL TOKENS
                </label>
                <input
                  type="number"
                  defaultValue={config.rag_threshold_tokens}
                  onBlur={(e) => {
                    update.mutate({ rag_threshold_tokens: Number(e.target.value) })
                    e.currentTarget.style.borderColor = 'var(--border)'
                  }}
                  style={numInputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--text-dim)')}
                />
                <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 5, fontFamily: "'DM Mono', monospace" }}>
                  Activar RAG sobre este límite
                </p>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-dim)', fontFamily: "'DM Mono', monospace", letterSpacing: '0.04em', marginBottom: 6 }}>
                  TOP-K RESULTADOS
                </label>
                <input
                  type="number"
                  defaultValue={config.rag_top_k}
                  onBlur={(e) => update.mutate({ rag_top_k: Number(e.target.value) })}
                  style={numInputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--text-dim)')}
                />
              </div>
            </div>
          </section>

          {/* History */}
          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>HISTORIAL Y MEMORIA</h2>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-dim)', fontFamily: "'DM Mono', monospace", letterSpacing: '0.04em', marginBottom: 6 }}>
                COMPACTAR TRAS N TURNOS
              </label>
              <input
                type="number"
                defaultValue={config.history_compact_after}
                onBlur={(e) => update.mutate({ history_compact_after: Number(e.target.value) })}
                style={{ ...numInputStyle, maxWidth: 120 }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--text-dim)')}
              />
              <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 5, fontFamily: "'DM Mono', monospace" }}>
                El historial antiguo se resume para ahorrar tokens.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
