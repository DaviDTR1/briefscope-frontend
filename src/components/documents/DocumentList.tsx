import { useRef } from 'react'
import { useTranslation } from '../../i18n'
import { useDocuments, useUploadDocument, useDeleteDocument } from '../../hooks/useDocuments'

interface Props { projectId: number }

function fmtTokens(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k tokens` : `${n} tokens`
}

export default function DocumentList({ projectId }: Props) {
  const { t } = useTranslation()
  const { data: docs = [], isLoading } = useDocuments(projectId)
  const upload = useUploadDocument(projectId)
  const remove = useDeleteDocument(projectId)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach((f) => upload.mutate(f))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-card)' }}>
      {/* Header */}
      <div
        className="px-4 py-3 shrink-0"
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          fontSize: 12,
          fontFamily: "'DM Mono', monospace",
          color: 'var(--text-dim)',
          letterSpacing: '0.04em',
        }}
      >
        {t('docs.header')} ({docs.length})
      </div>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="mx-3 mt-3 shrink-0 cursor-pointer transition-colors"
        style={{
          border: '1px dashed var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: '10px',
          textAlign: 'center',
          fontSize: 12,
          color: 'var(--text-dim)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'var(--accent)'
          e.currentTarget.style.color = 'var(--text-muted)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--border)'
          e.currentTarget.style.color = 'var(--text-dim)'
        }}
      >
        {upload.isPending ? (
          <span style={{ color: 'var(--text-muted)' }}>{t('docs.uploading')}</span>
        ) : (
          t('docs.dropFilesOrClick')
        )}
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          accept=".pdf,.txt,.md,.docx,.xlsx,.csv"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* List */}
      <ul className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        {isLoading && (
          <li style={{ fontSize: 12, color: 'var(--text-dim)', padding: '8px 2px' }}>
            {t('common.loading')}
          </li>
        )}
        {docs.map((doc) => (
          <li
            key={doc.id}
            className="flex items-center justify-between group px-3 py-2 rounded-[7px] transition-colors"
            style={{ background: 'transparent' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <div className="min-w-0">
              <p
                className="truncate"
                style={{ fontSize: 13, color: 'var(--text)', fontWeight: 400 }}
              >
                {doc.filename}
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: "'DM Mono', monospace" }}>
                {fmtTokens(doc.token_count)}
              </p>
            </div>
            <button
              onClick={() => remove.mutate(doc.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0"
              style={{ fontSize: 11, color: 'var(--text-dim)', background: 'none', border: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}
            >
              ✕
            </button>
          </li>
        ))}
        {!isLoading && docs.length === 0 && (
          <li style={{ fontSize: 12, color: 'var(--text-dim)', textAlign: 'center', padding: '16px 0' }}>
            {t('docs.emptyShort')}
          </li>
        )}
      </ul>
    </div>
  )
}
