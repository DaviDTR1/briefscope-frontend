import { useRef, useState } from 'react'
import { useDocuments, useUploadDocument, useDeleteDocument } from '../../hooks/useDocuments'
import { api } from '../../api/client'

interface Props { projectId: number }

type Tab = 'docs' | 'files'

function fileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase()
  if (ext === 'pdf') return '📄'
  if (ext === 'xlsx' || ext === 'csv') return '📊'
  if (ext === 'docx' || ext === 'doc') return '📝'
  if (ext === 'md') return '📋'
  return '📃'
}

function fmtTokens(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k tk` : `${n} tk`
}

export default function DocumentPanel({ projectId }: Props) {
  const { data: docs = [], isLoading } = useDocuments(projectId)
  const upload = useUploadDocument(projectId)
  const remove = useDeleteDocument(projectId)
  const inputRef = useRef<HTMLInputElement>(null)
  const [tab, setTab] = useState<Tab>('docs')
  const [generatedFiles, setGeneratedFiles] = useState<string[]>([])

  // Expose a way to add generated files (called from ChatPanel via event)
  const handleFiles = (files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach((f) => upload.mutate(f))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }

  const handleDownload = (filename: string) => {
    const url = `${api.defaults.baseURL}/files/${encodeURIComponent(filename)}`
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
  }

  // Listen for file_ready events from ChatPanel
  const prevGeneratedRef = useRef<string[]>([])
  // Use storage event or custom event; here we use a simple window listener
  useState(() => {
    const handler = (e: Event) => {
      const filename = (e as CustomEvent<string>).detail
      setGeneratedFiles(prev => {
        if (prev.includes(filename)) return prev
        return [filename, ...prev]
      })
      setTab('files')
    }
    window.addEventListener('briefscope:file_ready', handler)
    return () => window.removeEventListener('briefscope:file_ready', handler)
  })

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '8px 0',
    fontSize: 11,
    fontFamily: "'DM Mono', monospace",
    letterSpacing: '0.04em',
    background: 'none',
    border: 'none',
    borderBottom: active ? '2px solid var(--text)' : '2px solid transparent',
    color: active ? 'var(--text)' : 'var(--text-dim)',
    cursor: 'pointer',
    transition: 'color 0.15s',
  })

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: 'var(--bg-card)', width: 280, minWidth: 280 }}
    >
      {/* Header */}
      <div
        style={{
          padding: '0 16px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          flexShrink: 0,
        }}
      >
        <button style={tabStyle(tab === 'docs')} onClick={() => setTab('docs')}>
          DOCUMENTOS {docs.length > 0 && `(${docs.length})`}
        </button>
        <button style={tabStyle(tab === 'files')} onClick={() => setTab('files')}>
          ARCHIVOS {generatedFiles.length > 0 && `(${generatedFiles.length})`}
        </button>
      </div>

      {tab === 'docs' && (
        <>
          {/* Upload zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
            style={{
              margin: '12px 12px 8px',
              border: '1px dashed var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 12px',
              textAlign: 'center',
              fontSize: 12,
              color: upload.isPending ? 'var(--text-muted)' : 'var(--text-dim)',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'border-color 0.15s, color 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--accent)'
              e.currentTarget.style.color = 'var(--text-muted)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.color = upload.isPending ? 'var(--text-muted)' : 'var(--text-dim)'
            }}
          >
            {upload.isPending ? 'Subiendo…' : 'Arrastra o haz clic para subir'}
            <input
              ref={inputRef}
              type="file"
              multiple
              className="hidden"
              accept=".pdf,.txt,.md,.docx,.xlsx,.csv"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>

          {/* Document list */}
          <ul style={{ flex: 1, overflowY: 'auto', padding: '0 8px 8px', margin: 0, listStyle: 'none' }}>
            {isLoading && (
              <li style={{ fontSize: 12, color: 'var(--text-dim)', padding: '10px 8px' }}>Cargando…</li>
            )}
            {!isLoading && docs.length === 0 && (
              <li style={{ fontSize: 12, color: 'var(--text-dim)', textAlign: 'center', padding: '24px 8px' }}>
                Sin documentos.<br />
                <span style={{ opacity: 0.6 }}>Sube archivos para analizar.</span>
              </li>
            )}
            {docs.map((doc) => (
              <li
                key={doc.id}
                className="group"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 8px',
                  borderRadius: 8,
                  cursor: 'default',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Icon */}
                <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1 }}>{fileIcon(doc.filename)}</span>

                {/* Name + tokens */}
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p
                    style={{
                      fontSize: 13,
                      color: 'var(--text)',
                      fontWeight: 400,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={doc.filename}
                  >
                    {doc.filename}
                  </p>
                  <p style={{ fontSize: 10.5, color: 'var(--text-dim)', fontFamily: "'DM Mono', monospace", marginTop: 1 }}>
                    {fmtTokens(doc.token_count)}
                  </p>
                </div>

                {/* Delete */}
                <button
                  onClick={() => remove.mutate(doc.id)}
                  title="Eliminar"
                  style={{
                    opacity: 0,
                    fontSize: 11,
                    color: 'var(--text-dim)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'color 0.12s',
                  }}
                  className="group-hover:opacity-100"
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {tab === 'files' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {generatedFiles.length === 0 && (
            <p style={{ fontSize: 12, color: 'var(--text-dim)', textAlign: 'center', padding: '24px 8px' }}>
              Los archivos generados por el agente<br />aparecerán aquí.
            </p>
          )}
          {generatedFiles.map((filename) => {
            const ext = filename.split('.').pop()?.toLowerCase() ?? ''
            const icon = ext === 'pdf' ? '📄' : ext === 'xlsx' ? '📊' : ext === 'md' ? '📋' : '📃'
            return (
              <div
                key={filename}
                className="group"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 8px',
                  borderRadius: 8,
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: 13,
                      color: 'var(--text)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={filename}
                  >
                    {filename}
                  </p>
                  <p style={{ fontSize: 10.5, color: 'var(--text-dim)', fontFamily: "'DM Mono', monospace", marginTop: 1 }}>
                    {ext.toUpperCase()}
                  </p>
                </div>
                <button
                  onClick={() => handleDownload(filename)}
                  title="Descargar"
                  style={{
                    fontSize: 15,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-dim)',
                    flexShrink: 0,
                    transition: 'color 0.12s',
                    opacity: 0,
                  }}
                  className="group-hover:opacity-100"
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}
                >
                  ↓
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
